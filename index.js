const TelegramBot = require("node-telegram-bot-api");
const mongoose = require('mongoose');
require("dotenv").config();

const userController = require('./controllers/user');
const messageController = require('./data/messages');
const messages = require('./data/messages').messsages;

const TOKEN = process.env.PROTOKEN;
const dblink = process.env.MONGODB;

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


    if (!sentText.startsWith('/')) {
      try {
        if (sentText.length > 250) {
          await bot.sendMessage(userId, `${messages[lang].limit}\n(${sentText.length})`);
        } else {

          await bot.sendMessage(userId, 'Let me think...')
          // let reply = await 
          let reply = await userController.sendMessage('text', userId, sentText, username, fullName);

          if (reply === false) {
            bot.deleteMessage(userId, messageId + 1);
            await bot.sendMessage(userId, messages[lang].noattempts)
          } else {
            bot.deleteMessage(userId, messageId + 1);
            await bot.sendMessage(userId, reply, {
              reply_to_message_id: messageId
            });

          }
        }

      } catch (error) {
        bot.sendMessage(userId, messages[lang].error);
        console.log(error);
      }
    }


  });
}

module.exports = () => {
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
}