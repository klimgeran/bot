# bot1

To make this code work, you will need to do the following:

Create a Telegram bot and get its API token from the BotFather.
Install the necessary dependencies by running npm install.
Set the API token as an environment variable named TELEGRAM_BOT_TOKEN.
If you want to use the /balance command, set your Gate.io API key and secret as environment variables named GATEIO_API_KEY and GATEIO_API_SECRET, respectively.
If you want to use the /harvest command, set your Symbol node URL and API key as environment variables named SYMBOL_NODE_URL and SYMBOL_API_KEY, respectively.
Set up a PostgreSQL database and create a table named users with the following columns: id (integer, primary key), telegram_id (bigint), symbol_address (text).
Set the connection URL to your PostgreSQL database as an environment variable named DATABASE_URL.
Start the application by running npm start.
