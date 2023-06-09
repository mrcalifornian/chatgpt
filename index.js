import TelegramBot from "node-telegram-bot-api";
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import * as userController from "./controllers/user.js";
import * as messageController from "./data/messages.js";
const messages = messageController.messages;

const TOKEN = process.env.TOKEN;
const dblink = process.env.MONGODB;
const ADMIN = process.env.ADMIN;

const bot = new TelegramBot(TOKEN, {
  polling: true,
});

bot.on("polling_error", (error) => {
  console.log(error);
});

bot.setMyCommands([
  { command: 'start', description: 'Botni ishga tushirish / Initiate the bot ' },
  { command: 'help', description: "Bot qanday ishlaydi / How the bot works" },
  { command: 'dalle', description: 'Dall-E orqali rasm yaratish / Generate an image via Dall-E' },
  { command: 'attempts', description: 'Mavjud urinishlaringiz / Your existing attempts' },
  { command: 'invite', description: `Ko'proq bonuslarga ega bo'ling / Invite and get more bonuses` }
]);

let botStart = () => {
  console.log("The Bot is live");

  bot.on('text', async (response) => {
    let messageId = response.message_id;
    let userId = response.from.id;
    let fullName = response.from.first_name || "";
    let username = response.from.username || "";
    let lang = messageController.lang(response.from.language_code);
    let sentText = response.text;

    // bot on start
    if (sentText.startsWith('/start')) {
      try {
        let invitee = sentText.split(' ')[1];
        let user = await userController.getUserData(userId);

        if (user) {
          bot.sendMessage(userId, messages[lang].restart(user.fullName));

        } else {
          user = await userController.createNewUser(userId, username, fullName);
          bot.sendMessage(userId, messages[lang].greet(user.fullName));

          if (invitee) {
            let invm = await userController.referralInvited(invitee);
            if (invm) {
              bot.sendMessage(invitee, messages[lang].invited);
            }
          }
        }
      } catch (error) {
        console.log(error);
        bot.sendMessage(userId, messages[lang].error);
      }
    }


    // on dall-e image
    if (sentText.startsWith('/dalle')) {
      try {
        if (sentText.length < 8 || !sentText.includes('-')) {
          bot.sendMessage(userId, messages[lang].dalle);
        } else {
          let prompt = sentText.split('-')[1];
          bot.sendMessage(userId, 'Generating your image...');
          let imageResp = await userController.sendMessage('image', userId, prompt);
          if (imageResp[0] == true) {
            bot.sendPhoto(userId, imageResp[1], {
              caption: prompt
            });
          } else {
            bot.sendMessage(userId, imageResp[1]);
          }
        }
      } catch (error) {
        bot.sendMessage(userId, messages[lang].error);
        console.log(error);
      }
    }


    // on attempts requested
    if (sentText.startsWith('/attempts')) {
      try {
        userController.checkAttempts(userId, atts => {
          bot.sendMessage(userId, messages[lang].attempts(atts.daily, atts.total));
        });

      } catch (error) {
        bot.sendMessage(userId, messages[lang].error);
        console.log(error);
      }
    }


    // bot on invite
    if (sentText.startsWith('/invite')) {
      try {
        let botname = await bot.getMe();
        let msg = messages[lang].invite(botname.username, userId);
        bot.sendMessage(userId, msg);
      } catch (error) {
        bot.sendMessage(userId, messages[lang].error);
        console.log(error);
      }
    }


    // bot on help
    if (sentText.startsWith('/help')) {
      try {
        bot.sendMessage(userId, messages[lang].help);
      } catch (error) {
        bot.sendMessage(userId, messages[lang].error);
        console.log(error);
      }
    }

    // bot on regular prompt
    if (!sentText.startsWith('/')) {
      try {

        await bot.sendMessage(userId, 'Let me think...', {
          reply_to_message_id: messageId
        });
        // let reply = await 
        let reply = await userController.sendMessage('text', userId, sentText, username, fullName, messageId + 1);

        if (reply === false) {
          bot.deleteMessage(userId, messageId + 1);
          await bot.sendMessage(userId, messages[lang].noattempts);
        } else {
          bot.editMessageText(reply, {
            message_id: messageId + 1,
            chat_id: userId
          });

        }

      } catch (error) {
        bot.sendMessage(userId, messages[lang].error);
        console.log(error);
      }
    }


  });

  bot.on('photo', async (response) => {
    try {
      let messageId = response.message_id;
      let userId = response.from.id;
      let fullName = response.from.first_name || "";
      let username = response.from.username || "";
      let lang = messageController.lang(response.from.language_code);
      let fileId = response.photo[1].file_id;
      let caption = response.caption;

      if (userId == ADMIN) {
        let sentTo = 0;
        let blocked = 0;

        let users = await userController.getAllUsers();

        for (let usr of users) {
          try {
            await bot.sendPhoto(usr.userId, fileId, {
              caption: caption || '',
            });

            sentTo++;
          } catch (error) {
            blocked++;
          }
        }

        bot.sendMessage(ADMIN, `${sentTo} received \n${blocked} blocked`);

      } else {
        bot.sendMessage(userId, '🤷‍♂️')
      }
    } catch (error) {
      console.log(error);
    }
  });
}

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


export const ctx = bot;