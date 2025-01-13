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

  
const fs = require("fs");


// Variables to store configuration
let sourceChannel = null;
let targetChannel = null;
let scheduleTimes = [];
let sentMessages = new Set(); // To track already forwarded messages

// Load sent messages from a file (for persistence across bot restarts)
if (fs.existsSync("sentMessages.json")) {
  sentMessages = new Set(JSON.parse(fs.readFileSync("sentMessages.json")));
}

// Helper function to delay execution
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Command to configure source channel
bot.command("setsource", (ctx) => {
  const source = ctx.message.text.split(" ")[1];
  if (!source) {
    return ctx.reply("Please provide the source channel ID or username. Example: /setsource @source_channel");
  }
  sourceChannel = source;
  ctx.reply(`Source channel set to: ${source}`);
});

// Command to configure target channel
bot.command("settarget", (ctx) => {
  const target = ctx.message.text.split(" ")[1];
  if (!target) {
    return ctx.reply("Please provide the target channel ID or username. Example: /settarget @target_channel");
  }
  targetChannel = target;
  ctx.reply(`Target channel set to: ${target}`);
});

// Command to configure schedule times
bot.command("setschedule", (ctx) => {
  const times = ctx.message.text.split(" ").slice(1);
  if (times.length === 0) {
    return ctx.reply("Please provide the schedule times. Example: /setschedule 12:00 18:00 06:00");
  }
  scheduleTimes = times;
  ctx.reply(`Schedule times set to: ${times.join(", ")}`);
});

// Command to display the current configuration
bot.command("status", (ctx) => {
  ctx.reply(`
**Current Configuration:**
- Source Channel: ${sourceChannel || "Not Set"}
- Target Channel: ${targetChannel || "Not Set"}
- Schedule Times: ${scheduleTimes.length > 0 ? scheduleTimes.join(", ") : "Not Set"}
- Messages Forwarded: ${sentMessages.size}
  `);
});

// Command to start forwarding messages
bot.command("forward", async (ctx) => {
  if (!sourceChannel || !targetChannel) {
    return ctx.reply("Please configure the source and target channels first using /setsource and /settarget.");
  }
  if (scheduleTimes.length === 0) {
    return ctx.reply("Please configure schedule times using /setschedule.");
  }

  ctx.reply("Forwarding job scheduled. Messages will be forwarded at the specified times.");

  while (true) {
    const now = new Date();
    const currentTime = `${now.getHours()}:${now.getMinutes().toString().padStart(2, "0")}`;

    if (scheduleTimes.includes(currentTime)) {
      try {
        const updates = await ctx.telegram.getChatHistory(sourceChannel, {
          limit: 50,
        });

        const messagesToSend = updates.messages.filter((msg) => !sentMessages.has(msg.message_id));

        for (const message of messagesToSend) {
          const isMedia = !!(message.photo || message.video);

          if (isMedia) {
            // Handle media messages
            const mediaType = message.photo ? "photo" : "video";
            const fileId = message.photo
              ? message.photo[message.photo.length - 1].file_id
              : message.video.file_id;

            await ctx.telegram.sendMediaGroup(targetChannel, [
              {
                type: mediaType,
                media: fileId,
                caption: message.caption || "",
              },
            ]);
          } else {
            // Handle text messages
            await ctx.telegram.sendMessage(targetChannel, message.text || "No text content");
          }

          sentMessages.add(message.message_id);
        }

        // Save sentMessages to a file for persistence
        fs.writeFileSync("sentMessages.json", JSON.stringify([...sentMessages]));

        ctx.reply(`Forwarded ${messagesToSend.length} messages to ${targetChannel} at ${currentTime}`);
      } catch (error) {
        console.error("Error forwarding messages:", error);
        ctx.reply("An error occurred while forwarding messages.");
      }

      // Wait for 1 minute to avoid re-sending messages in the same minute
      await delay(60000);
    }

    // Delay the loop to avoid excessive CPU usage
    await delay(1000);
  }
});

// Start the bot
bot.launch().then(() => console.log("Bot started"));

// Graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));


  const app = express();
  // Set the bot API endpoint
  app.use(await bot.createWebhook({ domain: process.env.WEBHOOK_URL }));

  app.listen(process.env.PORT || 3000, () => console.log("Server Started"));
}

main();
