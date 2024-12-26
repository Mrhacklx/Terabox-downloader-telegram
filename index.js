async function main() {
  const { Telegraf, Markup } = require("telegraf");
  const { getDetails } = require("./api");
  const { sendFile } = require("./utils");
  const express = require("express");

  const bot = new Telegraf(process.env.BOT_TOKEN);

  bot.start(async (ctx) => {
    try {
      ctx.reply(
         photo = 'https://i.ibb.co/2WX4N5g/images-1-5.jpg',
         caption = `Hi ${ctx.message.from.first_name},\n\nOnline play without any app.\n\nSend any terabox link to Play Online.`,
         Markup.inlineKeyboard([
          Markup.button.url("Channel", "https://t.me/Tera_online_play"),
     
        ]),
      );
    } catch (e) {
      console.error(e);
    }
  });

  bot.on("message", async (ctx) => {
    if (ctx.message && ctx.message.text) {
      const messageText = ctx.message.text;
      if ((
        messageText.includes("terabox.com") ||
        messageText.includes("teraboxapp.com") ||
        messageText.includes("1024terabox.com")  ||
        messageText.includes("tera"))  &&
        messageText.includes("/s/") 
      ) {
        //const parts = messageText.split("/");
        //const linkID = parts[parts.length - 1];

        // ctx.reply(linkID)

       // const details = await getDetails(messageText);
        const link1 = await  messageText.replace(/^.*\/s\//, '/s/');
        const link = await link1.replace('/s/', 'https://terabisgram.blogspot.com/?url=');
        if (link) {
          try {
            ctx.reply(
              photo = 'https://i.ibb.co/YWZGgY8/IMG-20241226-163121.jpg',
              caption = `| How To Watch Video, Clck here | \n\n| Join this channel for more Updates\n👉 @Tera_online_play |\n\nYour 📽️video link 👇👇`, 
          Markup.inlineKeyboard([
          Markup.button.url("Online Player🎦", link),
     
        ]),
           );
            
          } catch (e) {
            console.error(e); // Log the error for debugging
          }
        } else {
          ctx.reply('Something went wrong 🙃');
        }
        console.log(link);
      } else {
        ctx.reply("Please send a valid Terabox link.");
      }
    } else {
      //ctx.reply("No message text found.");
    }
  });

  const app = express();
  // Set the bot API endpoint
  app.use(await bot.createWebhook({ domain: process.env.WEBHOOK_URL }));

  app.listen(process.env.PORT || 3000, () => console.log("Server Started"));
}

main();
