async function main() {
  const { Telegraf, Markup } = require("telegraf");
  const { getDetails } = require("./api");
  const { sendFile } = require("./utils");
  const { handleMediaMessage } = require("./MediaMessage");
  const express = require("express");

  const bot = new Telegraf(process.env.BOT_TOKEN);

  async function hasJoinedChannel(ctx) {
    const channelUsername = "@Tera_online_play";
    try {
      const member = await ctx.telegram.getChatMember(channelUsername, ctx.from.id);
      return ["member", "administrator", "creator"].includes(member.status);
    } catch (error) {
      console.error("Error checking channel membership:", error);
      return false;
    }
  }
 
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
