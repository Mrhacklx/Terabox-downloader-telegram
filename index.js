const { Telegraf, Markup } = require("telegraf");
const axios = require("axios");
const express = require("express");
const { google } = require("googleapis");
const fs = require("fs");

const bot = new Telegraf(process.env.BOT_TOKEN);

// Google Sheets Setup
const sheets = google.sheets("v4");
const auth = new google.auth.GoogleAuth({
  keyFile: "./my-project-60903-1734117699025-635e6cff741f.json", // Replace with the path to your JSON key file
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const SPREADSHEET_ID = "12_lZ9TGlkZbb2tzBHjStwSH65Xco2ctaxXzNdOEc9Fk"; // Replace with your Google Sheets ID

// Store user API keys in memory
const userApiKeys = {};

// Function to shorten a link using the provided API key
async function shortenLink(apiKey, longUrl) {
  const apiUrl = `https://shortxlinks.com/api?api=${apiKey}&url=${encodeURIComponent(longUrl)}`;

  try {
    const response = await axios.get(apiUrl);
    if (response.data && response.data.status === "success" && response.data.shortenedUrl) {
      return response.data.shortenedUrl;
    } else {
      throw new Error("Invalid API key or failed to shorten the link.");
    }
  } catch (error) {
    console.error("Error shortening link:", error);
    throw error;
  }
}

// Function to save user data to Google Sheets
async function saveToGoogleSheets(userId, userName, apiKey) {
  const authClient = await auth.getClient();
  const request = {
    spreadsheetId: SPREADSHEET_ID,
    range: "Sheet1!A:C", // Adjust range based on your sheet structure
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    resource: {
      values: [[userId, userName, apiKey]],
    },
    auth: authClient,
  };

  try {
    await sheets.spreadsheets.values.append(request);
    console.log("Data saved to Google Sheets.");
  } catch (error) {
    console.error("Error saving data to Google Sheets:", error);
  }
}

// Command to set up the API key
bot.command("setup", async (ctx) => {
  await ctx.reply("Please enter your API key:");

  // Listen for the next message from the user
  bot.on("text", async (setupCtx) => {
    const apiKey = setupCtx.message.text;

    try {
      // Test the API key by shortening a test link
      const testUrl = "https://example.com";
      await shortenLink(apiKey, testUrl);

      // Save the API key for the user
      userApiKeys[setupCtx.from.id] = apiKey;
      await setupCtx.reply("You are successfully connected! You can now use the bot.");

      // Save user data to Google Sheets
      const userId = setupCtx.from.id;
      const userName = setupCtx.from.first_name || "Unknown";
      await saveToGoogleSheets(userId, userName, apiKey);
    } catch (error) {
      await setupCtx.reply("Invalid API key. Please try again using /setup.");
    }
  });
});

// Function to check if the user has a valid API key
async function hasValidApiKey(userId) {
  return userApiKeys[userId] ? true : false;
}

// Middleware to enforce API key setup before using the bot
bot.on("message", async (ctx) => {
  if (!(await hasValidApiKey(ctx.from.id))) {
    await ctx.reply("You must set up your API key using the /setup command before using this bot.");
    return;
  }

  // Echo the user's message
  const message = ctx.message.text || "";
  await ctx.reply(`You said: ${message}`);
});

const app = express();
// Set the bot API endpoint
app.use(await bot.createWebhook({ domain: process.env.WEBHOOK_URL }));

app.listen(process.env.PORT || 3000, () => console.log("Server Started"));
