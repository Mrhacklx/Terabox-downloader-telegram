import logging
import requests
from telegram import Update
from telegram.ext import Updater, CommandHandler, MessageHandler, Filters, CallbackContext
from pymongo import MongoClient
import os

# Set up logging
logging.basicConfig(format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
                    level=logging.INFO)
logger = logging.getLogger(__name__)

# MongoDB setup
MONGO_URI = "mongodb://localhost:27017"  # Replace with your MongoDB connection URI
DATABASE_NAME = "terabis_bot"
COLLECTION_NAME = "users"

client = MongoClient(MONGO_URI)
db = client[DATABASE_NAME]
users_collection = db[COLLECTION_NAME]

# Function to validate API key
def validate_api_key(api_key: str) -> bool:
    try:
        test_url = "https://example.com"  # Replace with a valid URL for testing
        api_url = f"https://bisgram.com/api?api={api_key}&url={test_url}"
        response = requests.get(api_url)
        return response.json().get("status") == "success"
    except Exception as e:
        logger.error(f"Error validating API key: {e}")
        return False

# Handle /start command
def start(update: Update, context: CallbackContext):
    user_id = update.message.from_user.id
    user_data = users_collection.find_one({"user_id": user_id})

    if user_data:
        update.message.reply_text(f"📮 Hello {update.message.from_user.first_name},\nYou are now successfully connected to our Terabis platform.\n\nSend Tearbox link for converting.")
    else:
        update.message.reply_text(f"""
📮 Hello {update.message.from_user.first_name},

🌟 I am a bot to Convert Your Terabox link to Your Links Directly to your Bisgram.com Account.

You can login to your account by clicking on the button below, and entering your API key.

💠 You can find your API key at https://bisgram.com/member/tools/api

ℹ Send me /help to get How to Use the Bot Guide.

🎬 Check out Video for Tutorial: https://t.me/terabis/9
""")

# Handle /connect command
def connect(update: Update, context: CallbackContext):
    if len(context.args) < 1:
        update.message.reply_text("Please provide your API key. Example: /connect YOUR_API_KEY")
        return

    api_key = context.args[0]
    user_id = update.message.from_user.id

    if validate_api_key(api_key):
        users_collection.update_one(
            {"user_id": user_id},
            {"$set": {"api_key": api_key}},
            upsert=True
        )
        update.message.reply_text("✅ API key connected successfully! Send Tearbox link for converting.")
    else:
        update.message.reply_text("❌ Invalid API key. Please try again.\n\nHow to connect /help")

# Handle /disconnect command
def disconnect(update: Update, context: CallbackContext):
    user_id = update.message.from_user.id
    result = users_collection.delete_one({"user_id": user_id})

    if result.deleted_count > 0:
        update.message.reply_text("✅ Your API key has been disconnected successfully.")
    else:
        update.message.reply_text("⚠️ You have not connected an API key yet.")

# Handle /help command
def help(update: Update, context: CallbackContext):
    update.message.reply_text("""
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
    """)

# Handle /view command
def view(update: Update, context: CallbackContext):
    user_id = update.message.from_user.id
    user_data = users_collection.find_one({"user_id": user_id})

    if user_data and user_data.get("api_key"):
        update.message.reply_text(f"✅ Your connected API key: `{user_data['api_key']}`", parse_mode="Markdown")
    else:
        update.message.reply_text("⚠️ No API key is connected. Use /connect to link one.")

# Handle message command for shortening links
def handle_message(update: Update, context: CallbackContext):
    user_id = update.message.from_user.id
    user_data = users_collection.find_one({"user_id": user_id})

    if not user_data or not user_data.get("api_key"):
        await update.message.reply_text("⚠️ You haven't connected your API key yet. Please use /connect [API_KEY].")
        return

    api_key = user_data["api_key"]
    message_text = update.message.caption or update.message.text or ""

    link_regex = r"(https?://[^\s]+)"
    links = re.findall(link_regex, message_text)

    if not links:
        await update.message.reply_text("Please send a valid link to shorten.")
        return

    for link in links:
        if "/s/" in link:
            long_url = link.replace("/s/", "https://terabis.blogspot.com/?url=")

            # Shorten the link using the user's API key
            api_url = f"https://bisgram.com/api?api={api_key}&url={long_url}"
            response = await requests.get(api_url)

            if response.json().get("status") == "success":
                shortened_url = response.json().get("shortenedUrl")
                res_text = f"🔰 𝙁𝙐𝙇𝙇 𝙑𝙄𝘿𝙀𝙊 🎥\n\nLink 👇👇\n{shortened_url}\n\n♡     ❍     ⌲ \nLike React Share"
                
                if update.message.photo:
                    await update.message.reply_photo(update.message.photo[-1].file_id, caption=res_text)
                elif update.message.video:
                    await update.message.reply_video(update.message.video.file_id, caption=res_text)
                elif update.message.document:
                    await update.message.reply_document(update.message.document.file_id, caption=res_text)
                else:
                    await update.message.reply_text(res_text)
            else:
                await update.message.reply_text("❌ Failed to shorten the link.")
        else:
            await update.message.reply_text("Please send a valid Terabox link.")

# Main function to start the bot
def main():
    # Get the bot token from environment variable
    bot_token = os.getenv('BOT_TOKEN')

    updater = Updater(bot_token)

    # Add command handlers
    updater.dispatcher.add_handler(CommandHandler('start', start))
    updater.dispatcher.add_handler(CommandHandler('connect', connect))
    updater.dispatcher.add_handler(CommandHandler('disconnect', disconnect))
    updater.dispatcher.add_handler(CommandHandler('help', help))
    updater.dispatcher.add_handler(CommandHandler('view', view))
    updater.dispatcher.add_handler(MessageHandler(Filters.text | Filters.photo | Filters.video | Filters.document, handle_message))

    # Start the bot
    updater.start_polling()
    updater.idle()

if __name__ == '__main__':
    main()
