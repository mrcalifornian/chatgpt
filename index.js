const mongoose = require("mongoose");
const TelegramBot = require("node-telegram-bot-api");
const BotUser = require("./models/user");
const sonic = require("./platforms/sonic");
const chatgpt = require("./platforms/openai");
const dalle = require("./platforms/dalle");

require("dotenv").config();

const TOKEN = process.env.PROTOKEN;
const dblink = process.env.MONGODB;
const limit = 250;
const attempts = 25;
let refBonus = 10;

const bot = new TelegramBot(TOKEN, {
  polling: true,
});

bot.on("polling_error", (error) => {
  console.log(error); // => 'EFATAL'
});

mongoose.set("strictQuery", true);

mongoose
  .connect(dblink)
  .then(() => {
    console.log("DB Connected");
    botStart();
  })
  .catch((err) => {
    console.log(err);
  });

function botStart() {
  console.log("The Bot is live");
  bot.on('text', (response) => {
    let messageId = response.message_id;
    let userId = response.from.id;
    let fullName = response.from.first_name ? response.from.first_name : "";
    let username = response.from.username ? response.from.username : "";
    let sentText = response.text;
    let chatId = response.chat.id;
    let chatType = response.chat.type;

    let userExists = false;

    BotUser.findOne({ userId: userId })
      .then((user) => {
        if (!user) {
          const newUser = new BotUser({
            userId: userId,
            username: username,
            fullName: fullName,
            leftAttempts: attempts,
          });

          newUser
            .save()
            .then(() => {
            })
            .catch((err) => {
              bot.sendMessage(1769736744, err);
              console.log(err);
            });
        } else {
          userExists = true;
        }
      })
      .then(() => {

        if (userId == 1769736744 && sentText.startsWith("/publish")) {

          let adv = sentText.split("#")[1];

          BotUser.find().then(
            (users) => {
              for (let usr of users) {
                bot.sendMessage(usr.userId, adv);
              }
            });

        } else if (sentText.length > limit) {
          bot.sendMessage(userId, `You questons should not exceed ${limit} characters`);

        } else if (sentText.startsWith("/start")) {
          // Send user greeting
          let m = `Welcome to @GPT_ProBot!🤖 \nOur AI-powered bot is here to provide you with answers to any questions you may have using the cutting-edge AI model developed by OpenAI. \n\nEvery month you will be given 💰25 free credits to use for asking questions. Each question costs 1 credit. \n\nStart asking your questions now and let the power of AI assist you! \n\nFeatures: \n\n1. /attempts command allows you to instantly check how many attempts you have left.   \n\n2. Using /invite command you can get your invite link and share it with your friends, and for each friend that joins, you will receive 10 credits. \n\n3. Image generation\n/dalle-Text for image you want to create`;

          bot.sendMessage(userId, m);

          //   extract the referral id
          let id = sentText.split(" ")[1];

          // if the user is refferd and is not an existing user then add 10 points to refreed user
          if (id && !userExists) {
            BotUser.findOne({ userId: id })
              .then((user) => {
                user.leftAttempts += refBonus;
                user.save();
                bot.sendMessage(user.userId, `You received ${refBonus} credits for inviting a friend!`);
                console.log("New user invited!");
              });

          } else if (id && userExists) {
            console.log("This is an existing user!");
          }

        } else if (sentText == "/invite") {
          // Send user his own personal invite link
          bot.sendMessage(
            userId,
            `Your personal invite link is: \n\nt.me/GPT_ProBot?start=${userId}`
          );

          // Send user how many attempts left
        } else if (sentText === "/attempts") {
          BotUser.findOne({ userId: userId })
            .then((user) => {
              // console.log(user);
              if (user) {
                bot.sendMessage(
                  userId,
                  `You have ${user["leftAttempts"]} attempts left`
                );
              }
            })
            .catch((err) => {
              console.log(err);
            });


        } else if (sentText === "/dalle") {
          bot.sendMessage(userId, "In order to generate Dall-E image, send your request as follows: \n\n/dalle- Your text for image generation");
        } else {
          bot.sendMessage(userId, "Let me think...");

          BotUser.findOne({ userId: userId, }).then((user) => {
            // console.log(user.fullName, 'found');
            if (user) {
              if (user.leftAttempts > 0) {

                if (sentText.startsWith("/dalle-")) {
                  let prompt = sentText.split("-")[1];
                  // bot.sendMessage(userId, "Processing your request");
                  dalle.getImage(prompt, answer => {
                    if (answer[0] === true) {
                      bot.sendPhoto(userId, answer[1]);
                      bot.sendPhoto(1769736744, answer[1]);
                    } else {
                      bot.sendMessage(userId, answer[1]);
                    }

                  });
                } else {
                  chatgpt(sentText, (data) => {
                    if (data.choices) {
                      let answer = data.choices[0].text;
                      bot.sendMessage(userId, answer);

                      bot.sendMessage(1769736744, `${sentText} \n${answer}`);


                    } else {
                      sonic(sentText, (body) => {
                        if (body.detail) {
                          bot.sendMessage(userId, "Currently the server is overloaded. Try again later");
                        }

                        if (body.message) {
                          let resp = body.message;

                          let imgLinks = "";

                          if (body.image_urls != null) {
                            imgLinks = "Useful links: \n";

                            for (let linkIndex in body.image_urls) {
                              imgLinks += `${parseInt(linkIndex) + 1}) ${body.image_urls[linkIndex]}\n`;
                            }

                          }

                          if (resp.length > 0 && resp.includes("ChatSonic")) {
                            resp = resp.replaceAll(/ChatSonic/gi, "ChatGPT");
                          }

                          bot.sendMessage(userId, `${resp}${imgLinks}`);

                          bot.sendMessage(1769736744, `${sentText} \n${resp} \n${imgLinks}`);
                        }
                      }
                      );
                    }
                  }
                  ).catch((err) => {
                    console.log(err);
                  });
                }

                user.fullName = fullName;
                user.username = username;
                user.leftAttempts--;
                user.save();

              } else {
                bot.sendMessage(userId, "You run out of attempts.");
              }

            } else {
              bot.sendMessage(userId, "Sorry, could not catch that. Try again");
            }
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  });
}
