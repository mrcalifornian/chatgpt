const mongoose = require("mongoose");
const TelegramBot = require("node-telegram-bot-api");
const BotUser = require("./models/user");
const sonic = require("./platforms/sonic");
const chatgpt = require("./platforms/openai");
const user = require("./models/user");
require("dotenv").config();

const TOKEN = process.env.PROTOKEN;
const dblink = process.env.MONGODB;
const limit = 250;
const attempts = 25;

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
  bot.on("message", (response) => {
    let messageId = response.message_id;
    let userId = response.from.id;
    let fullName = response.from
      .first_name
      ? response.from.first_name
      : "";
    let username = response.from
      .username
      ? response.from.username
      : "";
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
              console
                .log
                // "User created"
                ();
              // return;
            })
            .catch((err) => {
              bot.sendMessage(
                1769736744,
                err
              );
              console.log(err);
            });
        } else {
          userExists = true;
        }
      })
      .then(() => {
        if (
          userId == 1769736744 &&
          sentText.startsWith(
            "/publish"
          )
        ) {
          let adv =
            sentText.split("#")[1];

          BotUser.find().then(
            (users) => {
              for (let usr of users) {
                bot.sendMessage(
                  usr.userId,
                  adv
                );
              }
            }
          );
        } else if (
          sentText.length > limit
        ) {
          bot.sendMessage(
            userId,
            `You questons should not exceed ${limit} characters`
          );
        } else if (
          sentText.startsWith("/start")
        ) {
          // Send user greeting
          let m = `Welcome to @GPT_ProBot!🤖 \nOur AI-powered bot is here to provide you with answers to any questions you may have using the cutting-edge AI model developed by OpenAI. \n\n💰 Every month you will be given 25 free credits to use for asking questions. Each question costs 1 credit. \n\nIf you have any further questions or suggestions, please visit our support channel at https://t.me/+XHkWAvn-hsA1YmM6. \nStart asking your questions now and let the power of AI assist you!`;

          bot.sendMessage(userId, m);

          //   extract the referral id
          let id =
            sentText.split(" ")[1];

          // if the user is refferd and is not an existing user then add 10 point to refreed user
          if (id && !userExists) {
            BotUser.findOne({
              userId: id,
            }).then((user) => {
              user.leftAttempts += 10;
              user.save();
              bot.sendMessage(
                user.userId,
                "You received 10 credits for inviting a friend!"
              );
              console.log(
                "New user invited!"
              );
            });
          } else {
            console.log(
              "This is an existing user!"
            );
          }
        } else if (
          sentText == "/invite"
        ) {
          // Send user his own personal invite link
          bot.sendMessage(
            userId,
            `Your personal invite link is: \n\nt.me/GPT_ProBot?start=${userId}`
          );
        } else if (
          // Send user how many attempts left
          sentText === "/attempts"
        ) {
          BotUser.findOne({
            userId: userId,
          })
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
        } else {
          bot.sendMessage(
            userId,
            "Let me think..."
          );

          BotUser.findOne({
            userId: userId,
          }).then((user) => {
            // console.log(user.fullName, 'found');
            if (user) {
              if (
                user.leftAttempts > 0
              ) {
                chatgpt(
                  sentText,
                  (data) => {
                    if (data.choices) {
                      let answer =
                        data.choices[0]
                          .text;
                      bot.sendMessage(
                        userId,
                        answer
                      );
                      bot.sendMessage(
                        1769736744,
                        `${sentText} \n${answer}`
                      );
                    } else {
                      sonic(
                        sentText,
                        (body) => {
                          if (
                            body.detail
                          ) {
                            bot.sendMessage(
                              userId,
                              "Currently the server is overloaded. Try again later"
                            );
                          }

                          if (
                            body.message
                          ) {
                            let resp =
                              body.message;

                            let imgLinks =
                              "";
                            if (
                              body.image_urls !=
                              null
                            ) {
                              imgLinks =
                                "Useful links: \n";
                              for (let linkIndex in body.image_urls) {
                                imgLinks += `${
                                  parseInt(
                                    linkIndex
                                  ) + 1
                                }) ${
                                  body
                                    .image_urls[
                                    linkIndex
                                  ]
                                }\n`;
                              }
                            }

                            if (
                              resp.length >
                                0 &&
                              resp.includes(
                                "ChatSonic"
                              )
                            ) {
                              resp =
                                resp.replaceAll(
                                  /ChatSonic/gi,
                                  "ChatGPT"
                                );
                            }
                            bot.sendMessage(
                              userId,
                              `${resp}${imgLinks}`
                            );
                            bot.sendMessage(
                              1769736744,
                              `${sentText} \n${resp} \n${imgLinks}`
                            );
                          }
                        }
                      );
                    }
                  }
                ).catch((err) => {
                  bot.sendMessage(
                    1769736744,
                    err
                  );
                  console.log(err);
                });

                user.fullName =
                  fullName;
                user.username =
                  username;
                user.leftAttempts--;
                user.save();
              } else {
                bot.sendMessage(
                  userId,
                  "You run out of attempts."
                );
              }
            } else {
              bot.sendMessage(
                userId,
                "Sorry, could not catch that. Try again"
              );
            }
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  });
}
