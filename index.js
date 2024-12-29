async function main() {
  const { Telegraf, Markup } = require("telegraf");
  const { getDetails } = require("./api");
  const { sendFile } = require("./utils");
  const express = require("express");

  const bot = new Telegraf(process.env.BOT_TOKEN);

  // Helper function to check if the user has joined the channel
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

  // Start command
  bot.start(async (ctx) => {
    while (!(await hasJoinedChannel(ctx))) {
      await ctx.reply(
        `Hi ${ctx.message.from.first_name},\n\nPlease join our channel first to use the bot:\n👉 @Tera_online_play`,
        Markup.inlineKeyboard([
          Markup.button.url("👉 Join Channel", "https://t.me/Tera_online_play"),
        ])
      );
      return; // Exit after sending the join message to avoid infinite loop
    }

    try {
      ctx.reply(
        `Hi ${ctx.message.from.first_name},\n\nWelcome! Send any Terabox link to play online.`,
        Markup.inlineKeyboard([
          Markup.button.url("💋 For Terabox Link 🔞", "https://t.me/+2bhsx2ti0CsyYmM1"),
        ])
      );
    } catch (e) {
      console.error(e);
    }
  });

  // Handle all messages
  bot.on("message", async (ctx) => {
    while (!(await hasJoinedChannel(ctx))) {
      await ctx.reply(
        `Hi ${ctx.message.from.first_name},\n\nPlease join our channel first to use the bot:\n👉 @Tera_online_play`,
        Markup.inlineKeyboard([
          Markup.button.url("Join Channel", "https://t.me/Tera_online_play"),
        ])
      );
      return; // Exit after sending the join message to avoid infinite loop
    }

    if (ctx.message && ctx.message.text) {
      const messageText = ctx.message.text;
      if (messageText.includes("terabox") && messageText.includes("/s/")) {
        const link1 = await messageText.replace(/^.*\/s\//, "/s/");
        const link = await link1.replace("/s/", "https://terabox.bisgram.com/?url=");

        if (link) {
          try {
            ctx.reply(
              `| How To Watch Video, Click here | \n\n| Join this channel for more Updates\n👉 @Tera_online_play |\n\nYour Video Link 👇👇`,
              Markup.inlineKeyboard([
                Markup.button.url("Online Player🎦", link),
              ])
            );
          } catch (e) {
            console.error(e); // Log the error for debugging
          }
        } else {
          ctx.reply("Something went wrong 🙃");
        }
        console.log(link);
      } else {
        ctx.reply("Please send a valid Terabox link.");
      }
    }
  });

  const app = express();
  // Set the bot API endpoint
  app.use(await bot.createWebhook({ domain: process.env.WEBHOOK_URL }));

  app.listen(process.env.PORT || 3000, () => console.log("Server Started"));
}

main();
