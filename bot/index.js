import TelegramBot from 'node-telegram-bot-api';
import { createClient, createAccount } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import config from './config.js';
import startHandler from './handlers/start.js';
import helpHandler from './handlers/help.js';
import checkHandler from './handlers/check.js';
import statusHandler from './handlers/status.js';
import mychecksHandler from './handlers/mychecks.js';

const bot = new TelegramBot(config.tgToken, { polling: true });

const globalAccount = config.privateKey ? createAccount(config.privateKey) : undefined;

const client = createClient({
  chain: studionet,
  ...(config.rpcUrl && { rpcUrl: config.rpcUrl }),
  ...(globalAccount && { account: globalAccount }),
});

try {
  await client.initializeConsensusSmartContract();
  console.log('GenLayer client initialized');
} catch (err) {
  console.error('Failed to initialize GenLayer client:', err.message);
}

startHandler(bot);
helpHandler(bot);
checkHandler(bot, client);
statusHandler(bot, client);
mychecksHandler(bot);

console.log('FactCheck Bot running...');
