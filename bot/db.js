import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../factcheck.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS checks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    check_id TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    chat_id INTEGER NOT NULL,
    url TEXT NOT NULL,
    question TEXT NOT NULL,
    tx_hash TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    answer TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

const insert = db.prepare(`
  INSERT INTO checks (check_id, user_id, chat_id, url, question, tx_hash, status)
  VALUES (@check_id, @user_id, @chat_id, @url, @question, @tx_hash, @status)
`);

const updateStatus = db.prepare(`
  UPDATE checks SET status = @status, answer = @answer, updated_at = datetime('now')
  WHERE check_id = @check_id
`);

const findByCheckId = db.prepare(`SELECT * FROM checks WHERE check_id = ?`);
const findByUser = db.prepare(`SELECT * FROM checks WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`);
const findByStatus = db.prepare(`SELECT * FROM checks WHERE status = ?`);
const findByTxHash = db.prepare(`SELECT * FROM checks WHERE tx_hash = ?`);

export function addCheck({ check_id, user_id, chat_id, url, question, tx_hash, status }) {
  return insert.run({ check_id, user_id, chat_id, url, question, tx_hash, status });
}

export function updateCheckStatus({ check_id, status, answer }) {
  return updateStatus.run({ check_id, status, answer: answer || null });
}

export function getCheck(check_id) {
  return findByCheckId.get(String(check_id));
}

export function getChecksByUser(user_id, limit = 10) {
  return findByUser.all(user_id, limit);
}

export function getChecksByStatus(status) {
  return findByStatus.all(status);
}

export function getCheckByTxHash(tx_hash) {
  return findByTxHash.get(tx_hash);
}

export default db;
