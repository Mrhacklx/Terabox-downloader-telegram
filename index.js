const { Telegraf, Markup } = require("telegraf");
const axios = require("axios");
const express = require("express");
const fs = require("fs");

// File to store user data (API keys)
const userDataFile = "user_data.json";

// Load user data from file
let userData = {};
if (fs.existsSync(userDataFile)) {
  userData = JSON.parse(fs.readFileSync(userDataFile));
}

// Save user data to file
function saveUserData() {
  fs.writeFileSync(userDataFile, JSON.stringify(userData));
}

async function main() {
  const bot = new Telegraf(process.env.BOT_TOKEN);

  // Function to validate API Key
  async function validateApiKey(apiKey) {
    try {
      const testUrl = "https://example.com"; // Replace with a valid URL for testing
      const apiUrl = `https://bisgram.com/api?api=${apiKey}&url=${encodeURIComponent(testUrl)}`;
      const response = await axios.get(apiUrl);

      return response.data && response.data.status === "success";
    } catch (error) {
      console.error("Error validating API key:", error);
      return false;
    }
  }

  // Handle /start command
  bot.start(async (ctx) => {
    const userId = ctx.from.id;
    if (userData[userId]) {
       ctx.reply(`📮 Hello ${ctx.message.from.first_name}, \nYou are now successfully connected to our Terabis platform.\n\nsend Tearbox link for converting`);
    }
    else{
    ctx.reply(
      `📮 Hello ${ctx.message.from.first_name} ,

🌟 I am a bot to Convert Your terabox link to Your Links Directly to your Bisgram.com Account.

You can login to your account by clicking on the button below, and entering your api key.

💠 You can find your api key on 
https://bisgram.com/member/tools/api

ℹ Send me /help to get How to Use the Bot Guide.

🎬 Check out Video for Tutorial :
https://t.me/terabis/9`
    );}
  });

  // Handle /connect command
  bot.command("connect", async (ctx) => {
    const messageParts = ctx.message.text.split(" ");
    if (messageParts.length < 2) {
      return ctx.reply("Please provide your API key. Example: /connect YOUR_API_KEY \n\nFor API ID /help");
    }

    const apiKey = messageParts[1];
    const userId = ctx.from.id;

    if (await validateApiKey(apiKey)) {
      userData[userId] = { apiKey };
      saveUserData();
      ctx.reply("✅ API key connected successfully! send Tearbox link for converting");
    } else {
      ctx.reply("❌ Invalid API key. Please try again.\n\nHow to connect /help");
    }
  });

  // Handle /disconnect command
  bot.command("disconnect", (ctx) => {
    const userId = ctx.from.id;

    if (userData[userId]) {
      delete userData[userId];
      saveUserData();
      ctx.reply("✅ Your API key has been disconnected successfully.");
    } else {
      ctx.reply("⚠️ You have not connected an API key yet.");
    }
  });
  
 bot.command("help", (ctx) => {
  ctx.reply(
    `
How to Connect:
1. Go to Bisgram.com
2. Create an Account
3. Click on the menu bar (top left side)
4. Click on *Tools > Developer API*
5. Copy the API token
6. Use this command: /connect YOUR_API_KEY
   Example: /connect 8268d7f25na2c690bk25d4k20fbc63p5p09d6906

🎬 Check out Video for Tutorial: 
   https://t.me/terabis/9

For any confusion or help, contact @ayushx2026_bot
    `);
});




bot.command("commands", (ctx) => {
  ctx.reply(`
🤖 *Link Shortener Bot Commands:*
- /connect [API_KEY] - Connect your API key.
- /disconnect - Disconnect your API key.
- /view - View your connected API key.
- /help - How to connect to website.
`, { parse_mode: "Markdown" });
});


  // Handle /view command to show connected API key
  bot.command("view", (ctx) => {
    const userId = ctx.from.id;
    if (userData[userId]?.apiKey) {
      ctx.reply(`✅ Your connected API key: \`${userData[userId].apiKey}\``, { parse_mode: "Markdown" });
    } else {
      ctx.reply("⚠️ No API key is connected. Use /connect to link one.");
    }
  });


async function handleMediaMessage(ctx, Markup) {
  let messageText = ctx.message.caption || ctx.message.text || "";

  // Regex to extract URLs
  const linkRegex = /(https?:\/\/[^\s]+)/g;
  const links = messageText.match(linkRegex);

  if (links && links.some((link) => link.includes("/s/"))) {
    const extractedLink = links.find((link) => link.includes("tera") && link.includes("/s/"));
    const link1 = extractedLink.replace(/^.*\/s\//, "/s/");
    const longUrl = link1.replace("/s/", "https://terabis.blogspot.com/?url=");

  }else {
    ctx.reply("Please send a valid Terabox link.");
  }
}




 bot.on("message", async (ctx) => {
  const userId = ctx.from.id;

  // Check if the user has connected their API key
  if (!userData[userId] || !userData[userId].apiKey) {
    return ctx.reply(
      "⚠️ You haven't connected your API key yet. Please use /connect [API_KEY] to connect.\n\nFor API ID /help \n🎬 Check out Video for Tutorial : \nhttps://t.me/terabis/9"
    );
  }

  const apiKey = userData[userId].apiKey;
  let messageText = ctx.message.caption || ctx.message.text || "";

  // Regex to extract URLs
  const linkRegex = /(https?:\/\/[^\s]+)/g;
  const links = messageText.match(linkRegex);

  if (!links){ 
    if (ctx.message.photo || ctx.message.video || ctx.message.document) {
      return ctx.reply("Please provide a link in the caption to shorten.");
    }
    return ctx.reply("Please send a valid link to shorten.");
  }

  if (links && links.some((link) => link.includes("/s/"))) {
    const extractedLink = links.find((link) => link.includes("tera") && link.includes("/s/"));
    const link1 = extractedLink.replace(/^.*\/s\//, "/s/");
    const longUrl = link1.replace("/s/", "https://terabis.blogspot.com/?url=");
    
  try {
    // Shorten the link using the user's API key
    const apiUrl = `https://bisgram.com/api?api=${apiKey}&url=${encodeURIComponent(longUrl)}`;
    const response = await axios.get(apiUrl);

    if (response.data && response.data.status === "success") {
      const shortenedLink = response.data.shortenedUrl;
      const resText = 
`🔰 𝙁𝙐𝙇𝙇 𝙑𝙄𝘿𝙀𝙊 🎥

Link 👇👇
${shortenedLink}

♡     ❍     ⌲ 
Like React Share`
;
      if (ctx.message.photo) {
        // Handle photo message
        const photo = ctx.message.photo[ctx.message.photo.length - 1].file_id;
        await ctx.replyWithPhoto(photo, {
          caption: resText,
        });
      } else if (ctx.message.video) {
        // Handle video message
        const video = ctx.message.video.file_id;
        await ctx.replyWithVideo(video, {
          caption: resText,
        });
      } else if (ctx.message.document) {
        // Handle document message
        const document = ctx.message.document.file_id;
        await ctx.replyWithDocument(document, {
          caption: resText,
        });
      } else {
        // If no media, just reply with the link
        await ctx.reply(`${resText}`);
      }
    } else {
      throw new Error("Failed to shorten the link.");
    }
  } catch (error) {
    console.error("Error shortening link:", error);
    ctx.reply("❌ An error occurred while processing your link. Please try again.");
  }
    }else {
    ctx.reply("Please send  valid Terabox link.");
  }
});


  const app = express();
  app.use(await bot.createWebhook({ domain: process.env.WEBHOOK_URL }));
  app.listen(process.env.PORT || 3000, () => console.log("Server Started"));
}

main();
