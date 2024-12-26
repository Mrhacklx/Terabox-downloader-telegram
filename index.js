async function main() {
  const { Telegraf, Markup } = require("telegraf");
  const { getDetails } = require("./api");
  const { sendFile } = require("./utils");
  const express = require("express");

  const bot = new Telegraf(process.env.BOT_TOKEN);

  bot.start(async (ctx) => {
    try {
      ctx.reply(
        `Hi ${ctx.message.from.first_name},\n\nOnline play without any app.\n\nSend any terabox link to View.`,
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
      if (
        messageText.includes("terabox.com") ||
        messageText.includes("teraboxapp.com")
      ) {
        //const parts = messageText.split("/");
        //const linkID = parts[parts.length - 1];

        // ctx.reply(linkID)

       // const details = await getDetails(messageText);
        const link1 = await  messageText.replace(/^.*\/s\//, '/s/');
        const link = await link1.replace('/s/', '');
        if (link) {
          try {
            ctx.reply(`Sending Files Please Wait.!!`, 
          Markup.inlineKeyboard([
          Markup.button.url("Play", link),
     
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
