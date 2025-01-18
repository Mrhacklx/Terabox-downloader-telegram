const { Telegraf, Markup } = require("telegraf");
const fs = require("fs");
const axios = require("axios");

const bot = new Telegraf(process.env.BOT_TOKEN);
let userData = {};

// Load user data from a file
if (fs.existsSync("userData.json")) {
  userData = JSON.parse(fs.readFileSync("userData.json"));
}

// Save user data to a file
function saveUserData() {
  fs.writeFileSync("userData.json", JSON.stringify(userData, null, 2));
}

// Validate the API key
async function validateApiKey(apiKey) {
  try {
    const testUrl = "https://example.com"; // Use any valid test URL
    const apiUrl = `https://bisgram.com/api?api=${apiKey}&url=${encodeURIComponent(testUrl)}`;
    const response = await axios.get(apiUrl);
    return response.data && response.data.status === "success";
  } catch (error) {
    return false;
  }
}

// Shorten the link
async function shortenLink(apiKey, longUrl, alias = "") {
  try {
    const apiUrl = `https://bisgram.com/api?api=${apiKey}&url=${encodeURIComponent(longUrl)}${alias ? `&alias=${encodeURIComponent(alias)}` : ""}`;
    const response = await axios.get(apiUrl);

    if (response.data && response.data.status === "success") {
      return response.data.shortenedUrl;
    } else {
      throw new Error("Failed to shorten the link.");
    }
  } catch (error) {
    console.error("Error shortening link:", error);
    throw error;
  }
}

// Connect API key command
bot.command("connect", async (ctx) => {
  const userId = ctx.from.id;
  const messageParts = ctx.message.text.split(" ");

  if (messageParts.length < 2) {
    return ctx.reply("Please provide your API key. Example: /connect [API_KEY]");
  }

  const apiKey = messageParts[1];
  const isValid = await validateApiKey(apiKey);

  if (isValid) {
    userData[userId] = { apiKey, linkCount: 0 };
    saveUserData();
    ctx.reply("✅ API key connected successfully! You can now use the bot.");
  } else {
    ctx.reply("❌ Invalid API key. Please check and try again.");
  }
});

// Disconnect API key command
bot.command("disconnect", (ctx) => {
  const userId = ctx.from.id;

  if (userData[userId]) {
    delete userData[userId];
    saveUserData();
    ctx.reply("✅ API key disconnected successfully.");
  } else {
    ctx.reply("⚠️ No API key is connected.");
  }
});

// View connected API key
bot.command("view", (ctx) => {
  const userId = ctx.from.id;

  if (userData[userId]?.apiKey) {
    ctx.reply(`✅ Your connected API key is: \`${userData[userId].apiKey}\``, { parse_mode: "Markdown" });
  } else {
    ctx.reply("⚠️ No API key is connected. Use /connect to link one.");
  }
});

// View user stats
bot.command("stats", (ctx) => {
  const userId = ctx.from.id;
  const count = userData[userId]?.linkCount || 0;

  ctx.reply(`📊 You have shortened ${count} links.`);
});

// Help command
bot.command("help", (ctx) => {
  ctx.reply(`
🤖 *Link Shortener Bot Commands:*
- /connect [API_KEY] - Connect your API key.
- /disconnect - Disconnect your API key.
- /view - View your connected API key.
- /stats - View your link shortening stats.
- /help - Show this help message.
`, { parse_mode: "Markdown" });
});

// Handle shortening links
bot.on("message", async (ctx) => {
  const userId = ctx.from.id;
  const message = ctx.message.text || "";

  if (!userData[userId]?.apiKey) {
    return ctx.reply("⚠️ You haven't connected your API key. Use /connect [API_KEY].");
  }

  if (message.startsWith("http://") || message.startsWith("https://")) {
    try {
      const apiKey = userData[userId].apiKey;
      const shortenedLink = await shortenLink(apiKey, message);

      // Increment link count
      userData[userId].linkCount = (userData[userId].linkCount || 0) + 1;
      saveUserData();

      ctx.reply(`✅ Shortened Link: ${shortenedLink}`);
    } catch (error) {
      ctx.reply("❌ Failed to shorten the link. Please try again later.");
    }
  } else {
    ctx.reply("⚠️ Please send a valid URL to shorten.");
  }
});

// Start command
bot.start((ctx) => {
  ctx.reply(`
Hi ${ctx.message.from.first_name}, welcome to the Link Shortener Bot! 🤖
Use /help to see all available commands.
  `);
});

// Start the bot
bot.launch();

console.log("Bot is running...");
