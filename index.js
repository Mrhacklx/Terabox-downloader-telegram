async function main() {
  const { Telegraf, Markup } = require("telegraf");
  const { getDetails } = require("./api");
  const { sendFile } = require("./utils");
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
  
 bot.start(async (ctx) => {
    if (!(await hasJoinedChannel(ctx))) {
      await ctx.reply(
        `Hi ${ctx.message.from.first_name},\n\nPlease join our channel first to use the bot:\n👉 @Tera_online_play`,
        Markup.inlineKeyboard([
          Markup.button.url("👉 Join Channel", "https://t.me/Tera_online_play"),
        ])
      );
      return;
    }
     try {
      ctx.reply(
        `Hi ${ctx.message.from.first_name},\n\nWelcome! Send any Terabox link to play online.`,
        Markup.inlineKeyboard([
          Markup.button.url("💋 For Terabox Link 🔞", "https://t.me/+IrUXA-TijH44MmU1"),
        ])
      );
    } catch (e) {
      console.error("Error sending welcome message:", e);
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

    try {
      let messageText = ctx.message.caption || ctx.message.text || "";

      // Regex to extract URLs
      const linkRegex = /(https?:\/\/[^\s]+)/g;
      const links = messageText.match(linkRegex);

      if (links && links.some((link) => link.includes("/s/"))) {
        const extractedLink = links.find((link) => link.includes("tera") && link.includes("/s/"));
        const link1 = extractedLink.replace(/^.*\/s\//, "/s/");
        const link = link1.replace("/s/", "https://terabis.blogspot.com/?url=");

        const responseText = `| More videos link direct play \n👉 https://t.me/+x4rupH5fazlmYjI1 |\n\nYour Video Link 👇👇\n ${link}`;
        const responseText1 = `🔰𝙁𝙐𝙇𝙇 𝙑𝙄𝘿𝙀𝙊 🎥👇👇 \n${link} \n\nBACKUP:-\nhttps://t.me/+JZHc9IszlWE1Mzhl \n\n♡ ㅤ   ❍ㅤ     ⌲ \n\nLike   React   share`;
        // Check and handle media (photo or video)
        if (ctx.message.photo) {
          const photo = ctx.message.photo[ctx.message.photo.length - 1].file_id;
          await ctx.replyWithPhoto(photo, {
            caption: responseText1,
            reply_markup: Markup.inlineKeyboard([
              Markup.button.url("👉 Online Play🎦", link),
              Markup.button.url("or Manualy Play", "https://terabis.blogspot.com/")
            ])
          });
        } else if (ctx.message.video) {
          const video = ctx.message.video.file_id;
          await ctx.replyWithVideo(video, {
            caption: responseText1,
            reply_markup: Markup.inlineKeyboard([
              Markup.button.url("👉 Online Play🎦", link),
              Markup.button.url("or Manualy Play", "https://terabis.blogspot.com/")
            ])
          });
        } else {
          // If no media, just reply with the link
          await ctx.reply(responseText, Markup.inlineKeyboard([
            Markup.button.url("👉 Online Play🎦", link),
            Markup.button.url("or Manualy Play", "https://terabis.blogspot.com/")
          ]));
        }
      } else {
        ctx.reply("Please send a valid Terabox link.");
      }
    } catch (error) {
      console.error("Error processing message:", error);
      ctx.reply("Something went wrong. Please try again later.");
    }
  });

  const app = express();
  // Set the bot API endpoint
  app.use(await bot.createWebhook({ domain: process.env.WEBHOOK_URL }));

  app.listen(process.env.PORT || 3000, () => console.log("Server Started"));
}

main();
