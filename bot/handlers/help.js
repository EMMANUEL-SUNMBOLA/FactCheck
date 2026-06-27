export default function helpHandler(bot) {
  bot.onText(/\/help/, (msg) => {
    bot.sendMessage(msg.chat.id, `How to use FactCheck:

1. Send /check with a URL and question:
   /check https://example.com | What is this page about?

2. You'll receive a check ID (e.g., #42)

3. Use /status 42 to check if the result is ready

4. Once finalized, the verified answer is returned

The contract reads the URL via GenLayer's native http(), asks an LLM to answer, and validators reach consensus using the Equivalence Principle. All results are stored on-chain.

Your checks are stored in your personal history — use /mychecks to view them.`);
  });
}
