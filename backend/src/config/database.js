const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/curry_time.db');

const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER  PRIMARY KEY AUTOINCREMENT,
    first_name    TEXT     NOT NULL,
    last_name     TEXT     NOT NULL,
    email         TEXT     UNIQUE NOT NULL,
    password_hash TEXT     NOT NULL,
    role          TEXT     NOT NULL DEFAULT 'user' CHECK(role IN ('user', 'admin')),
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS reservations (
    id               INTEGER  PRIMARY KEY AUTOINCREMENT,
    user_id          INTEGER  REFERENCES users(id) ON DELETE SET NULL,
    first_name       TEXT     NOT NULL,
    last_name        TEXT     NOT NULL,
    email            TEXT     NOT NULL,
    phone            TEXT,
    date             TEXT     NOT NULL,
    time             TEXT     NOT NULL,
    guests           INTEGER  NOT NULL DEFAULT 2,
    special_requests TEXT,
    status           TEXT     NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'cancelled')),
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS contact_messages (
    id         INTEGER  PRIMARY KEY AUTOINCREMENT,
    first_name TEXT     NOT NULL,
    last_name  TEXT     NOT NULL,
    email      TEXT     NOT NULL,
    phone      TEXT,
    subject    TEXT     NOT NULL,
    message    TEXT     NOT NULL,
    status     TEXT     NOT NULL DEFAULT 'unread' CHECK(status IN ('unread', 'read', 'replied')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_users_email             ON users(email);
  CREATE INDEX IF NOT EXISTS idx_reservations_date       ON reservations(date);
  CREATE INDEX IF NOT EXISTS idx_reservations_email      ON reservations(email);
  CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
`);

module.exports = db;
