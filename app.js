const mongoose = require('mongoose');
const TelegramBot = require('node-telegram-bot-api');
const BotUser = require('./models/user');
const sonic = require('./platforms/sonic');
const chatgpt = require('./platforms/openai');
require('dotenv').config();

const TOKEN = process.env.PROTOKEN;
const dblink = process.env.MONGODB;
const limit = 250;
const attempts = 25;

const bot = new TelegramBot(TOKEN, { polling: true });

bot.on('polling_error', (error) => {
    console.log(error);  // => 'EFATAL'
});

mongoose.set('strictQuery', true);
mongoose.connect(dblink).then(() => {
    console.log('DB Connected');

    botStart();

}).catch(err => {
    console.log(err);
});

function botStart() {
    console.log('The Bot is live');
    bot.on('message', response => {
        let messageId = response.message_id;
        let userId = response.from.id;
        let fullName = response.from.first_name ? response.from.first_name : '';
        let username = response.from.username ? response.from.username : '';
        let sentText = response.text;
        let chatId = response.chat.id;
        let chatType = response.chat.type;

        BotUser.findOne({ userId: userId }).then(user => {

            if (!user) {
                const newUser = new BotUser({
                    userId: userId,
                    username: username,
                    fullName: fullName,
                    leftAttempts: attempts
                });

                newUser
                    .save()
                    .catch(err => {
                        bot.sendMessage(1769736744, err);
                        console.log(err);
                    });
            }

        }).then(() => {
            if (sentText.length > limit) {

                bot.sendMessage(userId, `You questons should not exceed ${limit} characters`);

            } else if (sentText === '/start') {
                let m = `Welcome to @GPT_ProBot!🤖 \nOur AI-powered bot is here to provide you with answers to any questions you may have using the cutting-edge AI model developed by OpenAI. \n\n💰 Every month you will be given 25 free credits to use for asking questions. Each question costs 1 credit. \n\nIf you have any further questions or suggestions, please visit our support channel at https://t.me/+XHkWAvn-hsA1YmM6. \nStart asking your questions now and let the power of AI assist you!`

                bot.sendMessage(userId, m);

            } else {
                bot.sendMessage(userId, 'Let me think...');


                BotUser.findOne({ userId: userId })
                    .then(async user => {
                        if (user.leftAttempts > 0) {

                            await chatgpt(sentText, data => {
                                if (data.choices) {
                                    let answer = data.choices[0].text;
                                    bot.sendMessage(userId, answer);
                                    bot.sendMessage(1769736744, `${sentText} \n${answer}`);
                                } else {
                                    sonic(sentText, body => {
                                        if (body.detail) {
                                            bot.sendMessage(userId, 'Currently the server is overloaded. Try again later');
                                        }

                                        if (body.message) {
                                            let resp = body.message;

                                            let imgLinks = '';

                                            if (body.image_urls != null) {
                                                imgLinks = 'Useful links: \n';
                                                for (let linkIndex in body.image_urls) {
                                                    imgLinks += `${parseInt(linkIndex) + 1}) ${body.image_urls[linkIndex]}\n`
                                                }
                                            }

                                            if (resp.length > 0 && resp.includes('ChatSonic')) {
                                                resp = resp.replaceAll(/ChatSonic/gi, "ChatGPT")
                                            }
                                            bot.sendMessage(userId, `${resp}${imgLinks}`);
                                            bot.sendMessage(1769736744, `${sentText} \n${resp} \n${imgLinks}`);
                                        }
                                    });
                                }

                            }).catch(err => {
                                bot.sendMessage(1769736744, err);
                                console.log(err);
                            });

                            user.fullName = fullName;
                            user.username = username;
                            user.leftAttempts--;
                            user.save();
                        } else {
                            bot.sendMessage(userId, 'You run out of attempts.');
                        }
                    });
            }
        });

    });
}