# Commit Guide

## How to write a commit message

1. Write a detailed commit message to `commit-message.txt`
2. Stage your changes: `git add .`
3. Commit using the file: `git commit -F commit-message.txt`
4. Push: `git push`

## What to include in commit-message.txt

- First line: short summary (50 chars or less)
- Blank line
- Bullet list of changes grouped by component:
  - `contract:` — GenLayer Intelligent Contract changes
  - `bot:` — Telegram bot changes
  - `infra:` — config, deps, gitignore changes
  - `docs:` — README, COMMIT.md changes

## What NOT to commit

- `.env` — secrets/credentials
- `AGENTS.md` — session scratchpad with credentials
- `PLANS.md` — progress tracking
- `*.db`, `*.db-shm`, `*.db-wal` — local SQLite database
- `node_modules/` — installed dependencies
- `test-contract.mjs` — one-off test scripts
- `commit-message.txt` — temporary commit helper (gitignored)
