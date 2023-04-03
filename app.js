const { Telegraf } = require('telegraf');
const mongoose = require('mongoose');
require('dotenv').config();

const messageController = require('./data/messages');
const messages = require('./data/messages').messsages;
const userController = require('./controllers/user');
const ADMIN = process.env.ADMIN;

const bot = new Telegraf(process.env.PROTOKEN);

bot.telegram.setMyCommands([
    { command: 'start', description: 'Botni ishga tushirish / Initiate the bot ' },
    { command: 'dalle', description: 'Dall-E orqali rasm yaratish / Generate an image via Dall-E' },
    { command: 'attempts', description: 'Mavjud urinishlaringiz / Your existing attempts' },
    { command: 'invite', description: `Ko'proq bonuslarga ega bo'ling / Invite and get more bonuses` }
]);


bot.start(async ctx => {
    let message = ctx.update.message;
    let lang = messageController.lang(message.from.language_code);
    try {
        let invitee = message.text.split(' ')[1];
        let user = await userController.getUserData(message.from.id);
        if (user) {
            ctx.reply(messages[lang].restart(user.fullName));
        } else {
            user = await userController.createNewUser(message.from.id, message.from.username, message.from.first_name);
            ctx.reply(messages[lang].greet(user.fullName));
            let invm = await userController.referralInvited(invitee);
            if (invm) {
                bot.telegram.sendMessage(invitee, messages[lang].invited)
            }
        }
    } catch (error) {
        ctx.reply(messages[lang].error);
        console.log(error);
    }
});


bot.command('dalle', async (ctx) => {
    let message = ctx.update.message;
    let lang = messageController.lang(message.from.language_code);
    try {
        let text = message.text;
        if (text.length < 8 || !text.includes('-')) {
            ctx.reply(messages[lang].dalle);
        } else {
            let prompt = text.split('-')[1];
            ctx.reply('Generating your image...')
            let imageResp = await userController.sendMessage('image', message.from.id, prompt);
            if (imageResp[0] == true) {
                ctx.sendPhoto(imageResp[1], {
                    caption: prompt
                });
            } else {
                ctx.reply(imageResp[1]);
            }
        }
    } catch (error) {
        ctx.reply(messages[lang].error);
        console.log(error);
    }

});


bot.command('attempts', async ctx => {
    let message = ctx.update.message;
    let lang = messageController.lang(message.from.language_code);
    try {
        let atts = await userController.checkAttempts(message.from.id);
        ctx.reply(messages[lang].attempts(atts.daily, atts.total));
    } catch (error) {
        ctx.reply(messages[lang].error);
        console.log(error);
    }
});


bot.command('invite', async (ctx) => {
    let message = ctx.update.message;
    let lang = messageController.lang(message.from.language_code);
    let botname = ctx.botInfo.username;
    let userId = ctx.update.message.from.id;
    let msg = messages[lang].invite(botname, userId);
    ctx.reply(msg);
});

bot.command('help', ctx => {
    let message = ctx.update.message;
    let lang = messageController.lang(message.from.language_code);
    ctx.reply(messages[lang].help);
})

bot.on('text', async ctx => {
    let message = ctx.update.message;
    let lang = messageController.lang(message.from.language_code);
    try {
        if (message.text.length > 250) {
            ctx.reply(`${messages[lang].limit}\n(${message.text.length})`);
        } else {
            ctx.reply('Let me think...')
            let reply = await userController.sendMessage('text', message.from.id, message.text);
            if (reply === false) {
                ctx.reply(messages[lang].noattempts)
            } else {
                ctx.reply(reply);
            }
        }

    } catch (error) {
        ctx.reply(messages[lang].error);
        console.log(error);
    }
});

bot.on('photo', async ctx => {
    let message = ctx.update.message;
    if (message.from.id == ADMIN) {
        let sentTo = 0;
        let blocked = 0;
        let photo = message.photo[2].file_id;
        let caption = message.caption;
        let msgs = messageController.news(caption);
        let lang = messageController.lang(message.from.language_code);

        let users = await userController.getAllUsers();

        for (let usr of users) {
            try {
                await bot.telegram.sendPhoto(usr.userId, photo, {
                    caption: msgs[lang],
                });

                sentTo++;
            } catch (error) {
                blocked++;
            }
        }

        ctx.reply(`${sentTo} received \n${blocked} blocked`);
    } else {
        ctx.reply('🤷‍♂️')
    }
});

bot.on('video', async ctx => {
    let sentTo = 0;
    let blocked = 0;
    let message = ctx.update.message;
    if (message.from.id == ADMIN) {
        let photo = message.video.file_id;
        let caption = message.caption;
        let msgs = messageController.news(caption);
        let lang = messageController.lang(message.from.language_code);

        let users = await userController.getAllUsers();

        for (let usr of users) {
            try {
                await bot.telegram.sendVideo(usr.userId, photo, {
                    caption: msgs[lang],
                });
                sentTo++;
            } catch (error) {
                blocked++;
            }
        }

        ctx.reply(`${sentTo} received \n${blocked} blocked`);
    } else {
        ctx.reply('🤷‍♂️')
    }
});

bot.on('animation', async ctx => {
    let sentTo = 0;
    let blocked = 0;
    let message = ctx.update.message;
    if (message.from.id == ADMIN) {
        let photo = message.animation.file_id;
        let caption = message.caption;
        let msgs = messageController.news(caption);
        let lang = messageController.lang(message.from.language_code);

        let users = await userController.getAllUsers();

        for (let usr of users) {
            try {
                await bot.telegram.sendVideo(usr.userId, photo, {
                    caption: msgs[lang],
                });
                sentTo++;
            } catch (error) {
                blocked++;
            }
        }

        ctx.reply(`${sentTo} received \n${blocked} blocked`);
    } else {
        ctx.reply('🤷‍♂️')
    }
});

mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGODB)
    .then(() => {
        console.log('DB Connected');
        bot.launch();
        console.log("Bot's launched!");
    })
    .catch(err => {
        console.log(err);
    });