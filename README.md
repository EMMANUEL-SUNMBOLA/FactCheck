# FactCheck

A trustless web fact verifier on GenLayer. Submit a URL + question, and a GenLayer Intelligent Contract reads the page, uses LLM consensus to answer, and returns a verified on-chain result.

No oracles, no APIs, no middlemen.

## How it works

1. User sends `/check <url> <question>` to the Telegram bot
2. Bot submits a transaction to the FactCheck Intelligent Contract on GenLayer
3. The contract fetches the URL content natively via `gl.get_webpage()`
4. Validators reach consensus on the answer via the Equivalence Principle (comparative LLM consensus)
5. Result is stored on-chain — verifiable by anyone

## Architecture

```
Telegram Bot → GenLayer Intelligent Contract → Web content + LLM → On-chain result
```

- **Contract:** Python (GenVM) — `contracts/FactCheck.py`
- **Bot:** Node.js + `node-telegram-bot-api`
- **Chain:** GenLayer (StudioNet testnet)

## Contract

Deployed at: `[TBD]`

- `verify(url, question)` — fetches URL, prompts LLM, stores answer, returns `check_id`
- `get_result(check_id)` — reads back a verification result
- `total_checks()` — total verifications submitted

## Commands

```
/start           — welcome
/check <url> <q> — submit a verification
/status <id>     — check if result is finalized
/mychecks        — list your recent checks
/help            — usage guide
```

## Built for GenLayer

GenLayer is the only chain where contracts can natively read the web and reason via LLM consensus. FactCheck demonstrates:

- Native `http()` for direct URL access
- LLM consensus via the Equivalence Principle
- On-chain verifiability of AI-generated results
- Appeal mechanism for incorrect verifications
