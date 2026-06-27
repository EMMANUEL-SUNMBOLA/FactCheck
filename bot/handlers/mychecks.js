import { getChecksByUser } from '../db.js';

export default function mychecksHandler(bot) {
  bot.onText(/\/mychecks/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from?.id;

    const checks = getChecksByUser(userId, 10);

    if (checks.length === 0) {
      return bot.sendMessage(chatId, 'No checks found. Use /check to submit your first verification.');
    }

    const lines = checks.map((c, i) =>
      `${i + 1}. #${c.check_id} — ${c.status}\n   ${c.url.slice(0, 60)}`
    );

    bot.sendMessage(chatId,
      `📋 Your Recent Checks\n\n${lines.join('\n\n')}\n\nUse /status <id> to see details.`);
  });
}
