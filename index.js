async function main() {
  const { Telegraf, Markup } = require("telegraf");
  const { getDetails } = require("./api");
  const { sendFile } = require("./utils");
  const { MediaMessage } = require("./MediaMessage");
  const express = require("express");

  const bot = new Telegraf(process.env.BOT_TOKEN);

  bot.start(async (ctx) => {
    try {
      ctx.reply(
        `Hi ${ctx.message.from.first_name},\n\nI can Download Files from Terabox.\n\nMade with ❤️ by @botcodes123\n\nSend any terabox link to download.`,
        Markup.inlineKeyboard([
          Markup.button.url(" Channel", "https://t.me/botcodes123"),
          Markup.button.url("Report bug", "https://t.me/Armanidrisi_bot"),
        ]),
      );
    } catch (e) {
      console.error(e);
    }
  });

bot.on("message", async (ctx) => {
  if (!(await hasJoinedChannel(ctx))) {
    await ctx.reply(
      `Hi ${ctx.message.from.first_name},\n\nPlease join our channel first to use the bot:\n👉 @Tera_online_play`,
      Markup.inlineKeyboard([
        Markup.button.url("Join Channel", "https://t.me/Tera_online_play"),
      ])
    );
    return;
  }

  await handleMediaMessage(ctx, Markup);
});


  const app = express();
  // Set the bot API endpoint
  app.use(await bot.createWebhook({ domain: process.env.WEBHOOK_URL }));

  app.listen(process.env.PORT || 3000, () => console.log("Server Started"));
}

main();
