import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const dbPath = process.env.DB_PATH || path.join(__dirname, 'database.db');

// Ensure directory exists
const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Connect to SQLite database
const db = new Database(dbPath, {
  verbose: console.log
});

// Enable foreign keys
db.pragma('foreign_keys = ON');

export default db;