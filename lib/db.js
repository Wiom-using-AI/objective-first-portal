import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'data', 'portal.db');

// Ensure data directory exists
const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initTables();
    seedUsers();
  }
  return db;
}

function initTables() {
  const d = db;

  d.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'team_member',
      department TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      project_name TEXT NOT NULL,
      objective TEXT NOT NULL,
      success_metric TEXT,
      is_cross_fl INTEGER DEFAULT 0,
      cross_fl_who TEXT,
      submitted_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS objective_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_name TEXT NOT NULL,
      objective_owner_id INTEGER,
      objective TEXT NOT NULL,
      why_now TEXT,
      success_metric TEXT,
      what_its_not TEXT,
      sponsor_id INTEGER,
      status TEXT DEFAULT 'active',
      last_updated TEXT DEFAULT (datetime('now')),
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (objective_owner_id) REFERENCES users(id),
      FOREIGN KEY (sponsor_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS alignment_scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_name TEXT NOT NULL,
      fl_a_name TEXT,
      fl_a_objective TEXT,
      fl_b_name TEXT,
      fl_b_objective TEXT,
      score TEXT CHECK(score IN ('green', 'amber', 'red')),
      gap_note TEXT,
      scored_by_id INTEGER,
      scored_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (scored_by_id) REFERENCES users(id)
    );
  `);
}

function seedUsers() {
  const d = db;
  const count = d.prepare('SELECT COUNT(*) as c FROM users').get();
  if (count.c > 0) return;

  const insert = d.prepare('INSERT INTO users (name, role, department) VALUES (?, ?, ?)');
  const users = [
    ['Harsh Singhal', 'founder', 'Leadership'],
    ['Kashish Ghanghss', 'founder', 'Leadership'],
    ['Guneet SK', 'founder', 'Leadership'],
  ];
  const insertMany = d.transaction((list) => {
    for (const u of list) insert.run(...u);
  });
  insertMany(users);
}

export default getDb;
