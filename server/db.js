import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();
const DB_FILE = process.env.DB_FILE || './database.sqlite';

let db;

export async function getDb() {
  if (!db) {
    db = await open({
      filename: DB_FILE,
      driver: sqlite3.Database
    });
  }
  return db;
}

export async function initDb() {
  const db = await getDb();
  await db.exec('PRAGMA foreign_keys = ON');
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user', -- 'user' or 'admin'
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
  await db.exec(`
    CREATE TABLE IF NOT EXISTS timesheets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      project TEXT NOT NULL,
      hours REAL NOT NULL,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Create a default admin user if none exists
  const row = await db.get('SELECT COUNT(*) as c FROM users');
  if (row.c === 0) {
    const password_hash = await bcrypt.hash('admin123', 10);
    await db.run(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      ['Admin', 'admin@example.com', password_hash, 'admin']
    );
    console.log('Created default admin: admin@example.com / admin123');
  }
}
