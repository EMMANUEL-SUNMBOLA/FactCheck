import config from '../config.js';
import { addCheck, updateCheckStatus } from '../db.js';

const EXPLORER_URL = 'https://explorer-studio.genlayer.com/tx';

function esc(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function txLink(hash, label = 'View on Explorer') {
  return `<a href="${EXPLORER_URL}/${hash}">${esc(label)}</a>`;
}

const URL_REGEX = /https?:\/\/[^\s|]+/;

function parseInput(input) {
  const urlMatch = input.match(URL_REGEX);
  if (!urlMatch) return null;

  const url = urlMatch[0];
  let question = input
    .replace(URL_REGEX, '')
    .replace(/^\s*[|\s]+\s*|\s*[|\s]+\s*$/g, '')
    .trim();

  if (!question) {
    const pipeIdx = input.indexOf('|');
    if (pipeIdx !== -1) {
      question = input.slice(pipeIdx + 1).trim();
    }
  }

  if (!question) return null;
  return { url, question };
}

export default function checkHandler(bot, client) {
  bot.onText(/\/check(?:\s+(.+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from?.id;

    if (!match?.[1]) {
      return bot.sendMessage(chatId, 'Usage: /check <url> | <question>\nExample: /check https://example.com | What is this page about?');
    }

    const parsed = parseInput(match[1]);
    if (!parsed) {
      return bot.sendMessage(chatId, 'Could not parse input. Provide a URL and a question.\nExample: /check https://example.com | What is this page about?');
    }

    const { url, question } = parsed;

    if (!config.privateKey) {
      return bot.sendMessage(chatId, 'Bot is not configured for write operations (no PRIVATE_KEY).');
    }

    try {
      await bot.sendMessage(chatId,
        `⏳ Submitting verification for:\n${esc(url)}\n\nQuestion: ${esc(question)}`,
        { parse_mode: 'HTML' }
      );

      const total = await client.readContract({
        address: config.contractAddress,
        functionName: 'total_checks',
        args: [],
      });

      const predictedId = String(Number(total) + 1);

      const hash = await client.writeContract({
        address: config.contractAddress,
        functionName: 'verify',
        args: [url, question],
        value: 0n,
      });

      addCheck({
        check_id: predictedId,
        user_id: userId,
        chat_id: chatId,
        url,
        question,
        tx_hash: hash,
        status: 'submitted',
      });

      await bot.sendMessage(chatId,
        `✅ Transaction submitted!\n\n` +
        `Check ID: #${predictedId}\n` +
        `${txLink(hash)}\n\n` +
        `Waiting for consensus... (30s max)`,
        { parse_mode: 'HTML' }
      );

      try {
        await client.waitForTransactionReceipt({ hash, status: 'ACCEPTED' });

        const result = await client.readContract({
          address: config.contractAddress,
          functionName: 'get_result',
          args: [predictedId],
        });

        let answer = null;
        if (typeof result === 'string' && result.startsWith('{')) {
          try {
            const parsed = JSON.parse(result);
            answer = parsed.answer || null;
          } catch { /* not json */ }
        } else if (result && typeof result === 'object' && result.answer) {
          answer = result.answer;
        }

        updateCheckStatus({
          check_id: predictedId,
          status: answer ? 'finalized' : 'executed',
          answer: answer || '',
        });

        if (answer) {
          await bot.sendMessage(chatId,
            `✅ Result for #${predictedId}:\n\n${esc(answer)}`,
            { parse_mode: 'HTML' }
          );
        }
      } catch (waitErr) {
        updateCheckStatus({
          check_id: predictedId,
          status: 'submitted',
          answer: '',
        });
      }

    } catch (err) {
      console.error('Check error:', err);
      bot.sendMessage(chatId,
        `❌ Error: ${err.message}` +
        (err.message?.includes('execution failed') ? '\n\nThe contract may have an issue. Check the explorer for details.' : '')
      );
    }
  });
}
