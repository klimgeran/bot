import TelegramBot, { Message } from "node-telegram-bot-api";
import axios from "axios";

interface Wallet {
  name: string;
  address: string;
  node: string;
  balance: number;
  harvestedBlocks: number;
  totalFeesEarned: number;
}

interface Node {
  name: string;
  domain: string;
}

interface UserWallet {
  [key: string]: Wallet[];
}

interface UserNode {
  [key: string]: Node[];
}

interface Price {
  currentPrice: number;
}

const bot = new TelegramBot("YOUR_TELEGRAM_BOT_TOKEN", { polling: true });

const usersWallets: UserWallet = {};
const usersNodes: UserNode = {};
const prices: Record<string, Price> = {};

const SYMBOL_API_URL = "https://api.symbolnetwork.com";
const SYMBOL_CHAIN_ID = "0x68";
const SYMBOL_WS_API_URL = "wss://api.symbolnetwork.com/ws";

bot.onText(/\/start/, (msg: Message) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    "Welcome to the Symbol Harvesting Bot! Please enter your Symbol wallet address."
  );
});

bot.onText(/\/help/, (msg: Message) => {
  const chatId = msg.chat.id;
  const helpMessage = `
  Here are the available commands for the Symbol Harvesting Bot:

  /help - Displays this help message.
  /add WALLET_ADDRESS WALLET_NAME - Adds a new wallet to your list of tracked wallets.
  /update WALLET_ADDRESS NEW_WALLET_NAME - Updates the name of a wallet in your list of tracked wallets.
  /remove WALLET_ADDRESS - Removes a wallet from your list of tracked wallets.
  /wallets - Displays a list of your tracked wallets.
  /balance WALLET_ADDRESS - Displays the balance of a specific wallet.
  /price - Displays the current price of XYM.
  /alerts - Allows you to set price alerts for XYM.
  /marketdata - Displays current market data for XYM.
  /delegate - Displays current delegated account information.
  `;
  bot.sendMessage(chatId, helpMessage);
});

bot.onText(/\/add (.+) (.+)/, async (msg: Message, match: string[]) => {
  const chatId = msg.chat.id;
  const walletAddress = match[1].toUpperCase();
  const walletName = match[2];
  const { data } = await axios.get(
    `${SYMBOL_API_URL}/accounts/${walletAddress}/names`
  );
  if (data.length) {
    if (!usersWallets[chatId]) {
      usersWallets[chatId] = [];
    }
    usersWallets[chatId].push({
      name: walletName,
      address: walletAddress,
      node: SYMBOL_WS_API_URL,
      balance: 0,
      harvestedBlocks: 0,
      totalFeesEarned: 0,
    });
    bot.sendMessage(chatId, "Wallet added successfully!");
  } else {
    bot.sendMessage(chatId, "The wallet address entered is not valid.");
  }
});

bot.onText(/\/update (.+) (.+) (.+)/, (msg: Message, match: string[]) => {
  const chatId = msg.chat.id;
  const walletAddress = match[1].toUpperCase();
  const newWalletName = match[2];
  if (usersWallets[chatId]) {
    const walletToUpdate = usersWallets[chatId].find(
      (wallet) => wallet.address === walletAddress
    );
    if (walletToUpdate) {
      walletToUpdate.name
