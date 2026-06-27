# FactCheck

Trustless web fact verification on GenLayer. Submit a URL + question, and a GenLayer Intelligent Contract reads the page, uses LLM consensus to answer via the Equivalence Principle, and stores the result on-chain. No oracles, no APIs, no middlemen.

**Bot:** [@genfactcheckbot](https://t.me/genfactcheckbot) on Telegram

## How it works

1. Send `/check <url> | <question>` to the Telegram bot
2. Bot submits a transaction to the FactCheck Intelligent Contract on GenLayer
3. The contract fetches the URL using `gl.nondet.web.render(url, mode="text")` — native web access, no oracles
4. Validators independently read the page, answer via LLM, and compare results using the Equivalence Principle
5. Answer is stored on-chain — verifiable by anyone on the [GenLayer Explorer](https://explorer-studio.genlayer.com/)

## Architecture

```
Telegram Bot → genlayer-js SDK → FactCheck Contract (GenLayer)
                                     │
                          gl.nondet.web.render(url, mode="text")
                                     │
                          gl.nondet.exec_prompt(prompt)
                                     │
                     gl.vm.run_nondet_unsafe(leader_fn, validator_fn)
                                     │
                          On-chain result (JSON)
```

## Contract

**Deployed at:** `0x9c8618b83Db8BAd204bE26cD02bd7bD382b7a8B4` (StudioNet testnet)

### Methods

| Method | Type | Description |
|---|---|---|
| `verify(url, question)` | write | Fetches URL, prompts LLM, stores answer. Returns `check_id` |
| `get_result(check_id)` | view | Returns JSON `{url, question, answer}` |
| `total_checks()` | view | Total verifications submitted |

### Equivalence Principle

The contract uses `gl.vm.run_nondet_unsafe` with a validator function that:
1. Independently fetches the same URL
2. Independently prompts an LLM with the same question
3. Compares leader's answer vs. own answer via a second LLM prompt
4. Returns `TRUE` if answers convey the same factual information

This ensures consensus even when different LLMs produce differently-worded answers.

## Bot Commands

```
/start               — welcome + instructions
/check <url> | <q>   — submit a verification
/status <id>         — check if result is finalized
/mychecks            — list your recent checks
/help                — usage guide
```

## Running locally

```bash
git clone https://github.com/EMMANUEL-SUNMBOLA/FactCheck.git
cd factcheck

cp .env.example .env
# Fill in TGTOKEN, PRIVATE_KEY (optional), CONTRACT_ADDRESS

npm install
npm run dev
```

### Deploying the contract

```bash
node contracts/deploy.js
```

Updates `CONTRACT_ADDRESS` in `.env` with the new deployment.

## Why GenLayer?

| Requirement | Traditional approach | GenLayer approach |
|---|---|---|
| Read web content | Chainlink + API provider + backend | `gl.nondet.web.render()` — native |
| AI reasoning | Off-chain LLM, centralized | On-chain LLM consensus |
| Verifiability | Trust the oracle provider | On-chain Equivalence Principle |
| Appeals | None | Built-in Finality Window with appeal rounds |

## Built for GenLayer

This project was built for the GenLayer hackathon to demonstrate GenLayer's unique differentiator: Intelligent Contracts that can natively read the web and reach subjective consensus via diverse LLM validators.
