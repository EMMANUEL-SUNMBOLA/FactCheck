export default function startHandler(bot) {
  bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, `🔍 FactCheck Bot — Trustless Web Fact Verification

Powered by GenLayer Intelligent Contracts.

Commands:
/check <url> | <question> — Verify a claim
/status <id> — Check verification result
/mychecks — List your recent checks
/help — Usage guide

Submit a URL and a question. The contract reads the content, uses LLM consensus to answer, and stores the result on-chain.`);
  });
}
