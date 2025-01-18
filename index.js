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
    ctx.reply(
      `Hi ${ctx.message.from.first_name},\n\nWelcome to the Link Shortener Bot! Please connect your API key first using /connect [API_KEY].`
    );
  });

  // Handle /connect command
  bot.command("connect", async (ctx) => {
    const messageParts = ctx.message.text.split(" ");
    if (messageParts.length < 2) {
      return ctx.reply("Please provide your API key. Example: /connect YOUR_API_KEY");
    }

    const apiKey = messageParts[1];
    const userId = ctx.from.id;

    if (await validateApiKey(apiKey)) {
      userData[userId] = { apiKey };
      saveUserData();
      ctx.reply("✅ API key connected successfully! You can now shorten links.");
    } else {
      ctx.reply("❌ Invalid API key. Please try again.");
    }
  });

  // Handle messages (link processing)
  bot.on("message", async (ctx) => {
    const userId = ctx.from.id;

    // Check if the user has connected their API key
    if (!userData[userId] || !userData[userId].apiKey) {
      return ctx.reply(
        "⚠️ You haven't connected your API key yet. Please use /connect [API_KEY] to connect."
      );
    }

    const apiKey = userData[userId].apiKey;
    const messageText = ctx.message.text || "";

    // Regex to extract URLs
    const linkRegex = /(https?:\/\/[^\s]+)/g;
    const links = messageText.match(linkRegex);

    if (!links) {
      return ctx.reply("Please send a valid link to shorten.");
    }

    const longUrl = links[0];

    try {
      // Shorten the link using the user's API key
      const apiUrl = `https://bisgram.com/api?api=${apiKey}&url=${encodeURIComponent(longUrl)}`;
      const response = await axios.get(apiUrl);

      if (response.data && response.data.status === "success") {
        const shortenedLink = response.data.shortenedUrl;
        ctx.reply(`🔗 Shortened Link: ${shortenedLink}`);
      } else {
        throw new Error("Failed to shorten the link.");
      }
    } catch (error) {
      console.error("Error shortening link:", error);
      ctx.reply("❌ An error occurred while processing your link. Please try again.");
    }
  });

  const app = express();
  app.use(await bot.createWebhook({ domain: process.env.WEBHOOK_URL }));
  app.listen(process.env.PORT || 3000, () => console.log("Server Started"));
}

main();
