async function main() {
  const { Telegraf, Markup } = require("telegraf");
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

    let messageText = "";
    const linkRegex = /(https?:\/\/[^\s]+)/g;

    // Check if the message contains text or caption
    if (ctx.message.caption) {
      messageText = ctx.message.caption;
    } else if (ctx.message.text) {
      messageText = ctx.message.text;
    }

    // Extract link from the message
    const links = messageText.match(linkRegex);

    if (links && links.some((link) => link.includes("terabox") && link.includes("/s/"))) {
      const extractedLink = links.find((link) => link.includes("terabox") && link.includes("/s/"));
      const link1 = extractedLink.replace(/^.*\/s\//, "/s/");
      const link = link1.replace("/s/", "https://terabot.bisgram.com/?url=");

      try {
        const responseText = `| How To Watch Video, Click here | \n\n| Join this channel for more Updates\n👉 @Tera_online_play |\n\nYour Video Link 👇👇\n ${link}`;

        // Check if the original message has media and reply accordingly
        if (ctx.message.photo) {
          const photo = ctx.message.photo[ctx.message.photo.length - 1].file_id; // Get the highest resolution photo
          await ctx.replyWithPhoto(photo, {
            caption: responseText,
            reply_markup: Markup.inlineKeyboard([
              Markup.button.url("👉 Online Play🎦", link),
              Markup.button.url("or Manualy Play", "https://terabot.bisgram.com/")
            ])
          });
        } else if (ctx.message.video) {
          const video = ctx.message.video.file_id; // Get the video file ID
          await ctx.replyWithVideo(video, {
            caption: responseText,
            reply_markup: Markup.inlineKeyboard([
              Markup.button.url("👉 Online Play🎦", link),
              Markup.button.url("or Manualy Play", "https://terabot.bisgram.com/")
            ])
          });
        } else {
          // If no media, just reply with the link
          await ctx.reply(responseText, Markup.inlineKeyboard([
            Markup.button.url("👉 Online Play🎦", link),
            Markup.button.url("or Manualy Play", "https://terabot.bisgram.com/")
          ]));
        }
      } catch (e) {
        console.error(e); // Log the error for debugging
        ctx.reply("Something went wrong 🙃");
      }
    } else {
      ctx.reply("Please send a valid Terabox link.");
    }
  });

  const app = express();
  // Set the bot API endpoint
  app.use(await bot.createWebhook({ domain: process.env.WEBHOOK_URL }));

  app.listen(process.env.PORT || 3000, () => console.log("Server Started"));
}

main();
