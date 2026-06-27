# FactCheck

Trustless web fact verification on [GenLayer](https://genlayer.com). Submit a URL + question, and LLM-validator consensus decides the answer on-chain. No oracles, no APIs, no middlemen.

## How it works

1. A user sends `/check <url> | <question>` to the Telegram bot.
2. The bot submits a transaction to the FactCheck Intelligent Contract on GenLayer.
3. The leader validator fetches the URL via `gl.nondet.web.render()`, prompts an LLM, and proposes an answer.
4. Four other validators independently fetch the same URL, prompt their own LLM, and compare answers via the Equivalence Principle.
5. The final answer is written to contract storage — verifiable by anyone.

## Architecture

```
contracts/FactCheck.py    GenLayer Intelligent Contract (py-genlayer v0.2.5)
bot/                      Telegram bot (node-telegram-bot-api + genlayer-js)
```

## Live deployment

- **Network**: GenLayer StudioNet (testnet)
- **Contract**: `0x9c8618b83Db8BAd204bE26cD02bd7bD382b7a8B4`
- **Explorer**: https://explorer-studio.genlayer.com/address/0x9c8618b83Db8BAd204bE26cD02bd7bD382b7a8B4
- **Bot**: [@genfactcheckbot](https://t.me/genfactcheckbot) on Telegram

## Run locally

```bash
git clone https://github.com/EMMANUEL-SUNMBOLA/FactCheck.git
cd factcheck
npm install
cp .env.example .env   # add your TGTOKEN and PRIVATE_KEY
npm run dev
```

## Deploy contract

Requires `PRIVATE_KEY` in `.env`:

```bash
node contracts/deploy.js
```

## Contract methods

| Method | Type | Description |
|--------|------|-------------|
| `verify` | write | Fetch URL, prompt LLM, store answer. Returns `check_id` |
| `get_result` | view | Read a verification result (`url`, `question`, `answer`) |
| `total_checks` | view | Number of verifications submitted |

## Bot commands

| Command | Description |
|---------|-------------|
| `/check <url> \| <question>` | Submit a verification |
| `/status <id>` | Check if result is finalized |
| `/mychecks` | List your recent checks |
| `/start`, `/help` | Info and usage guide |

## License

MIT
