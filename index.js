const fs = require("fs");
const axios = require("axios");
const { Telegraf, Markup } = require("telegraf");
const express = require("express");

const apiKeyFile = "apiKey.json";

// Load API key from file or prompt the user to enter it
async function getApiKey(ctx) {
  if (fs.existsSync(apiKeyFile)) {
    const data = fs.readFileSync(apiKeyFile, "utf-8");
    const { apiKey } = JSON.parse(data);
    return apiKey;
  } else {
    await ctx.reply("Please enter your API key:");
    return new Promise((resolve) => {
      ctx.bot.on("text", (ctx) => {
        const apiKey = ctx.message.text.trim();
        fs.writeFileSync(apiKeyFile, JSON.stringify({ apiKey }, null, 2));
        resolve(apiKey);
      });
    });
  }
}

async function shortenLink(apiKey, longUrl, alias = "") {
  const apiUrl = `https://shortxlinks.com/api?api=${apiKey}&url=${encodeURIComponent(longUrl)}${alias ? `&alias=${encodeURIComponent(alias)}` : ""}`;

  try {
    const response = await axios.get(apiUrl);

    if (response.data && response.data.status === "success" && response.data.shortenedUrl) {
      return response.data.shortenedUrl;
    } else {
      throw new Error("Failed to shorten the link.");
    }
  } catch (error) {
    console.error("Error shortening link:", error);
    throw error;
  }
}

async function handleMediaMessage(ctx, Markup, apiKey) {
  let messageText = ctx.message.caption || ctx.message.text || "";

  // Regex to extract URLs
  const linkRegex = /(https?:\/\/[^\s]+)/g;
  const links = messageText.match(linkRegex);

  if (links && links.some((link) => link.includes("/s/"))) {
    const extractedLink = links.find((link) => link.includes("tera") && link.includes("/s/"));
    const link1 = extractedLink.replace(/^.*\/s\//, "/s/");
    const longUrl = link1.replace("/s/", "https://terabis.blogspot.com/?url=");

    try {
      const shortenedLink = await shortenLink(apiKey, longUrl);

      const responseText1 = `
🔰 𝙁𝙐𝙇𝙇 𝙑𝙄𝘿𝙀𝙊 🎥👇👇 
${shortenedLink}

BACKUP:
https://t.me/+JZHc9IszlWE1Mzhl 

♡   ❍   ⌲ 

Like   React   Share
`;

      if (ctx.message.photo) {
        const photo = ctx.message.photo[ctx.message.photo.length - 1].file_id;
        await ctx.replyWithPhoto(photo, {
          caption: responseText1,
          reply_markup: Markup.inlineKeyboard([
            Markup.button.url("👉 Online Play🎦", shortenedLink),
            Markup.button.url("or Manual Play", "https://terabis.blogspot.com/"),
          ]),
        });
      } else if (ctx.message.video) {
        const video = ctx.message.video.file_id;
        await ctx.replyWithVideo(video, {
          caption: responseText1,
          reply_markup: Markup.inlineKeyboard([
            Markup.button.url("👉 Online Play🎦", shortenedLink),
            Markup.button.url("or Manual Play", "https://terabis.blogspot.com/"),
          ]),
        });
      } else {
        await ctx.reply(responseText1, Markup.inlineKeyboard([
          Markup.button.url("👉 Online Play🎦", shortenedLink),
          Markup.button.url("or Manual Play", "https://terabis.blogspot.com/"),
        ]));
      }
    } catch (error) {
      console.error("Error processing media message:", error);
      ctx.reply("Something went wrong. Please try again later.");
    }
  } else {
    ctx.reply("Please send a valid Terabox link.");
  }
}

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

async function main() {
  const bot = new Telegraf(process.env.BOT_TOKEN);

  bot.start(async (ctx) => {
    const apiKey = await getApiKey(ctx);
    ctx.reply(
      `Hi ${ctx.message.from.first_name},\n\nSend any Terabox link to Watch.`,
      Markup.inlineKeyboard([
        Markup.button.url(" Channel", "https://t.me/Tera_online_play"),
      ])
    );
  });

  bot.command("raj", (ctx) => {
    return ctx.reply("Raj");
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

    const apiKey = JSON.parse(fs.readFileSync(apiKeyFile, "utf-8")).apiKey;
    let message = ctx.message.caption || ctx.message.text || "";

    if (!message.startsWith("/")) {
      await handleMediaMessage(ctx, Markup, apiKey);
    }
  });

  const app = express();
  app.use(await bot.createWebhook({ domain: process.env.WEBHOOK_URL }));

  app.listen(process.env.PORT || 3000, () => console.log("Server Started"));
}

main();
