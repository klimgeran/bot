import TelegramBot from 'node-telegram-bot-api';
import { Client, AccountHttp, Address } from 'symbol-sdk';
import { filter, first } from 'rxjs/operators';
import axios from 'axios';

// Telegram Bot token
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!, { polling: true });

// Symbol SDK setup
const nodeUrl = 'https://sym-test.opening-line.jp:3001';
const accountHttp = new AccountHttp(nodeUrl);
const client = new Client(nodeUrl);

// Welcome message
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  await bot.sendMessage(chatId, `Welcome to the Symbol Blockchain Bot! This bot provides information on incoming transactions and blocks on the Symbol blockchain.`);
  const devText = `This bot was created by the following developers. It would be great if you could support their Symbol nodes:\n\n`
    + `- Fabrizio (Node Symbol: conrad.symbolnode.ninja)\n`
    + `- Klim (Node Symbol: NIS2.host)\n`
    + `- Angel (Node Symbol: XYM007.host)\n\n`
    + `Support our Symbol nodes!`;
  await bot.sendMessage(chatId, devText);
});

// Help message
bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;
  const helpText = `Available commands:\n\n`
    + `/start - Initiate the bot and link a Symbol wallet address to receive notifications for incoming transactions.\n`
    + `/help - Display the available commands and their functionalities.\n`
    + `/balance - Display the balance in XYM and USDT, taken through the API of the Gate.io exchange.\n`
    + `/harvest - Display harvested count, harvested total, harvested count for the current month, and harvested total for the last month.\n`
    + `/stop - Unsubscribe from receiving notifications for incoming transactions.`;
  await bot.sendMessage(chatId, helpText);
});

// Track incoming transactions for a linked Symbol wallet address
const trackedAddresses = new Set<Address>();
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  await bot.sendMessage(chatId, `Please enter your Symbol wallet address:`);
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text?.trim();

  // Check if the input is a valid Symbol address
  try {
    const address = Address.createFromRawAddress(text!);
    trackedAddresses.add(address);
    await bot.sendMessage(chatId, `Your address ${address.pretty()} has been linked to receive notifications for incoming transactions.`);
  } catch (error) {
    await bot.sendMessage(chatId, `Invalid address. Please enter a valid Symbol wallet address:`);
    return;
  }

  // Track incoming transactions for the address
  client.newTransactions(address).pipe(filter((transaction) => trackedAddresses.has(transaction.recipientAddress)), first()).subscribe(async (transaction) => {
    const incomingTransactionText = `🚀Incoming transaction!🚀\n`
      + `Amount: ${transaction.mosaics[0].amount.compact()} XYM\n`
      + `Transaction hash: ${transaction.transactionInfo!.hash}\n`
      + `Timestamp: ${transaction.transactionInfo!.merkleComponentHash.timestamp.toLocalDate()}\n`;
    await bot.sendMessage(chatId, incomingTransactionText);
  });
});

// Track incoming blocks on the Symbol network
client.newBlock().subscribe(async (block) => {
  const incoming
