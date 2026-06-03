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
    migrate();
  }
  return db;
}

function migrate() {
  const d = db;

  // Check if we need to reset the schema
  const tableInfo = d.prepare("PRAGMA table_info(submissions)").all();
  const hasOldSchema = tableInfo.length > 0 && (
    tableInfo.some(c => c.name === 'user_id') ||
    !tableInfo.some(c => c.name === 'submitter_email')
  );

  if (hasOldSchema) {
    d.exec(`
      DROP TABLE IF EXISTS alignment_scores;
      DROP TABLE IF EXISTS submissions;
      DROP TABLE IF EXISTS objective_notes;
      DROP TABLE IF EXISTS users;
    `);
  }

  d.exec(`
    CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      submitter_name TEXT NOT NULL,
      submitter_email TEXT,
      submitter_role TEXT,
      submitter_function TEXT,
      project_name TEXT NOT NULL,
      objective TEXT NOT NULL,
      success_metric TEXT,
      is_cross_fl INTEGER DEFAULT 0,
      cross_fl_who TEXT,
      submitted_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS objective_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_name TEXT NOT NULL,
      objective_owner TEXT,
      objective TEXT NOT NULL,
      why_now TEXT,
      success_metric TEXT,
      what_its_not TEXT,
      sponsor TEXT,
      status TEXT DEFAULT 'active',
      last_updated TEXT DEFAULT (datetime('now')),
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS alignment_scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_name TEXT NOT NULL,
      submission_a_id INTEGER,
      submission_b_id INTEGER,
      fl_a_name TEXT,
      fl_a_function TEXT,
      fl_a_objective TEXT,
      fl_a_metric TEXT,
      fl_b_name TEXT,
      fl_b_function TEXT,
      fl_b_objective TEXT,
      fl_b_metric TEXT,
      score TEXT CHECK(score IN ('green', 'amber', 'red')),
      rationale TEXT,
      scored_at TEXT DEFAULT (datetime('now'))
    );
  `);
}

export default getDb;
