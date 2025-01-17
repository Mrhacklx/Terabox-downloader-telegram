async function main() {
  const { Telegraf, Markup } = require("telegraf");
  const { getDetails } = require("./api");
  const { sendFile } = require("./utils");
  const express = require("express");

  const bot = new Telegraf(process.env.BOT_TOKEN);


const axios = require("axios");

async function shortenLink(longUrl, alias = "") {
  const apiKey = "4f6e8de9640e8c0e08d0d3ba2f22173caa9f74d4";
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

async function handleMediaMessage(ctx, Markup) {
  let messageText = ctx.message.caption || ctx.message.text || "";

  // Regex to extract URLs
  const linkRegex = /(https?:\/\/[^\s]+)/g;
  const links = messageText.match(linkRegex);

  if (links && links.some((link) => link.includes("/s/"))) {
    const extractedLink = links.find((link) => link.includes("tera") && link.includes("/s/"));
    const link1 = extractedLink.replace(/^.*\/s\//, "/s/");
    const longUrl = link1.replace("/s/", "https://terabis.blogspot.com/?url=");

    try {
      const shortenedLink = await shortenLink(longUrl);

      const responseText1 = `
🔰 𝙁𝙐𝙇𝙇 𝙑𝙄𝘿𝙀𝙊 🎥👇👇 
${shortenedLink}

BACKUP:
https://t.me/+JZHc9IszlWE1Mzhl 

♡   ❍   ⌲ 

Like   React   Share
`;

      if (ctx.message.photo) {
        // If it's a photo
        const photo = ctx.message.photo[ctx.message.photo.length - 1].file_id;
        await ctx.replyWithPhoto(photo, {
          caption: responseText1,
          reply_markup: Markup.inlineKeyboard([
            Markup.button.url("👉 Online Play🎦", shortenedLink),
            Markup.button.url("or Manual Play", "https://terabis.blogspot.com/"),
          ]),
        });
      } else if (ctx.message.video) {
        // If it's a video
        const video = ctx.message.video.file_id;
        await ctx.replyWithVideo(video, {
          caption: responseText1,
          reply_markup: Markup.inlineKeyboard([
            Markup.button.url("👉 Online Play🎦", shortenedLink),
            Markup.button.url("or Manual Play", "https://terabis.blogspot.com/"),
          ]),
        });
      } else {
        // If no media, just reply with the link
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


/**  
  // Function to handle media or text messages
async function handleMediaMessage(ctx, Markup) {
  let messageText = ctx.message.caption || ctx.message.text || "";

  // Regex to extract URLs
  const linkRegex = /(https?:\/\/[^\s]+)/g;
  const links = messageText.match(linkRegex);

  if (links && links.some((link) => link.includes("/s/"))) {
    const extractedLink = links.find((link) => link.includes("tera") && link.includes("/s/"));
    const link1 = extractedLink.replace(/^.*\/s\//, "/s/");
    const link = link1.replace("/s/", "https://terabis.blogspot.com/?url=");

    const responseText1 = `
🔰 𝙁𝙐𝙇𝙇 𝙑𝙄𝘿𝙀𝙊 🎥👇👇 
${link}

BACKUP:
https://t.me/+JZHc9IszlWE1Mzhl 

♡   ❍   ⌲ 

Like   React   Share
`;

    try {
      if (ctx.message.photo) {
        // If it's a photo
        const photo = ctx.message.photo[ctx.message.photo.length - 1].file_id;
        await ctx.replyWithPhoto(photo, {
          caption: responseText1,
          reply_markup: Markup.inlineKeyboard([
            Markup.button.url("👉 Online Play🎦", link),
            Markup.button.url("or Manual Play", "https://terabis.blogspot.com/"),
          ]),
        });
      } else if (ctx.message.video) {
        // If it's a video
        const video = ctx.message.video.file_id;
        await ctx.replyWithVideo(video, {
          caption: responseText1,
          reply_markup: Markup.inlineKeyboard([
            Markup.button.url("👉 Online Play🎦", link),
            Markup.button.url("or Manual Play", "https://terabis.blogspot.com/"),
          ]),
        });
      } else {
        // If no media, just reply with the link
        await ctx.reply(responseText1, Markup.inlineKeyboard([
          Markup.button.url("👉 Online Play🎦", link),
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
} **/
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
    try {
      ctx.reply(
        `Hi ${ctx.message.from.first_name},\n\nSend any terabox link to Watch.`,
        Markup.inlineKeyboard([
          Markup.button.url(" Channel", "https://t.me/Tera_online_play"),
          
        ]),
      );
    } catch (e) {
      console.error(e);
    }
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
  let message = ctx.message.caption || ctx.message.text || "";

if (!(message.startsWith('/'))) {
    await handleMediaMessage(ctx, Markup);
} else{
  
}
});




  const app = express();
  // Set the bot API endpoint
  app.use(await bot.createWebhook({ domain: process.env.WEBHOOK_URL }));

  app.listen(process.env.PORT || 3000, () => console.log("Server Started"));
}

main();
