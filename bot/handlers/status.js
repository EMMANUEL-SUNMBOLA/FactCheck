import config from '../config.js';
import { getCheck } from '../db.js';

const EXPLORER_URL = 'https://explorer-studio.genlayer.com/tx';

function esc(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function txLink(hash, label = 'View on Explorer') {
  return `<a href="${EXPLORER_URL}/${hash}">${esc(label)}</a>`;
}

export default function statusHandler(bot, client) {
  bot.onText(/\/status\s+(\w+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const checkId = match[1];

    const row = getCheck(checkId);
    if (!row) {
      return bot.sendMessage(chatId, `Check #${checkId} not found in local database.`);
    }

    try {
      const lines = [
        `📋 Check #${checkId}`,
        '',
        `URL: ${esc(row.url)}`,
        `Question: ${esc(row.question)}`,
      ];

      const isExecuted = row.status === 'executed' || row.status === 'finalized';

      if (!row.tx_hash) {
        lines.push('');
        lines.push('⚠️ No transaction submitted yet.');
      } else {
        lines.push('');
        lines.push(`Tx: ${txLink(row.tx_hash)}`);

        if (isExecuted) {
          lines.push('');
          if (row.answer) {
            lines.push(`Answer: ${esc(row.answer)}`);
            lines.push('');
            lines.push('✅ Result fetched from chain');
          } else {
            lines.push('⏳ Answer stored on chain. Use /check to submit a new verification.');
          }
        } else {
          let receiptStatus = 'UNKNOWN';
          try {
            const receipt = await client.getTransactionReceipt({ hash: row.tx_hash });
            receiptStatus = receipt?.status || 'UNKNOWN';

            if (receiptStatus === 'success') {
              const total = await client.readContract({
                address: config.contractAddress,
                functionName: 'total_checks',
                args: [],
              });
              const totalNum = Number(total || 0);
              if (totalNum >= Number(checkId)) {
                const result = await client.readContract({
                  address: config.contractAddress,
                  functionName: 'get_result',
                  args: [checkId],
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

                if (answer) {
                  lines.push(`Answer: ${esc(answer)}`);
                  lines.push('');
                  lines.push('✅ Finalized');
                } else {
                  lines.push('⚠️ Result stored but could not be read. Check explorer:');
                  lines.push(txLink(row.tx_hash, 'View on Explorer'));
                }
              } else {
                lines.push('⏳ Transaction accepted but result not yet readable.');
                lines.push('Check back later with /status ' + checkId);
              }
            } else {
              lines.push(`⏳ Status: ${receiptStatus}`);
              lines.push('Check back later with /status ' + checkId);
            }
          } catch {
            lines.push('⏳ Pending...');
            lines.push('Check back later with /status ' + checkId);
          }
        }
      }

      bot.sendMessage(chatId, lines.join('\n'), { parse_mode: 'HTML' });

    } catch (err) {
      console.error('Status error:', err);
      bot.sendMessage(chatId, `❌ Error checking status: ${err.message}`);
    }
  });
}
