'use server';

import getDb from './db';

// ── Users ──
export async function getUsers() {
  const db = getDb();
  return db.prepare('SELECT * FROM users ORDER BY name').all();
}

export async function addUser(formData) {
  const db = getDb();
  const name = formData.get('name');
  const role = formData.get('role') || 'team_member';
  const department = formData.get('department') || '';
  db.prepare('INSERT INTO users (name, role, department) VALUES (?, ?, ?)').run(name, role, department);
}

// ── Blind Submissions (Template 1) ──
export async function submitProjects(userId, projects) {
  const db = getDb();
  const insert = db.prepare(
    'INSERT INTO submissions (user_id, project_name, objective, success_metric, is_cross_fl, cross_fl_who) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const insertMany = db.transaction((list) => {
    for (const p of list) {
      insert.run(userId, p.project_name, p.objective, p.success_metric, p.is_cross_fl ? 1 : 0, p.cross_fl_who || '');
    }
  });
  insertMany(projects);
  return { success: true };
}

export async function getSubmissions() {
  const db = getDb();
  return db.prepare(`
    SELECT s.*, u.name as user_name, u.department
    FROM submissions s
    JOIN users u ON s.user_id = u.id
    ORDER BY s.submitted_at DESC
  `).all();
}

export async function getSubmissionsByUser(userId) {
  const db = getDb();
  return db.prepare('SELECT * FROM submissions WHERE user_id = ? ORDER BY submitted_at DESC').all(userId);
}

// ── Objective Notes (Template 3) ──
export async function createObjectiveNote(data) {
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO objective_notes (project_name, objective_owner_id, objective, why_now, success_metric, what_its_not, sponsor_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    data.project_name,
    data.objective_owner_id || null,
    data.objective,
    data.why_now || '',
    data.success_metric || '',
    data.what_its_not || '',
    data.sponsor_id || null
  );
  return { id: result.lastInsertRowid };
}

export async function getObjectiveNotes() {
  const db = getDb();
  return db.prepare(`
    SELECT n.*,
      o.name as owner_name, o.department as owner_department,
      s.name as sponsor_name
    FROM objective_notes n
    LEFT JOIN users o ON n.objective_owner_id = o.id
    LEFT JOIN users s ON n.sponsor_id = s.id
    ORDER BY n.last_updated DESC
  `).all();
}

export async function getObjectiveNote(id) {
  const db = getDb();
  return db.prepare(`
    SELECT n.*,
      o.name as owner_name, o.department as owner_department,
      s.name as sponsor_name
    FROM objective_notes n
    LEFT JOIN users o ON n.objective_owner_id = o.id
    LEFT JOIN users s ON n.sponsor_id = s.id
    WHERE n.id = ?
  `).get(id);
}

export async function updateObjectiveNote(id, data) {
  const db = getDb();
  db.prepare(`
    UPDATE objective_notes
    SET project_name = ?, objective_owner_id = ?, objective = ?, why_now = ?,
        success_metric = ?, what_its_not = ?, sponsor_id = ?, last_updated = datetime('now')
    WHERE id = ?
  `).run(
    data.project_name, data.objective_owner_id || null, data.objective,
    data.why_now || '', data.success_metric || '', data.what_its_not || '',
    data.sponsor_id || null, id
  );
}

// ── Alignment Scoring (Template 2) ──
export async function createAlignmentScore(data) {
  const db = getDb();
  db.prepare(`
    INSERT INTO alignment_scores (project_name, fl_a_name, fl_a_objective, fl_b_name, fl_b_objective, score, gap_note, scored_by_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    data.project_name, data.fl_a_name, data.fl_a_objective,
    data.fl_b_name, data.fl_b_objective, data.score, data.gap_note || '', data.scored_by_id || null
  );
}

export async function getAlignmentScores() {
  const db = getDb();
  return db.prepare(`
    SELECT a.*, u.name as scored_by_name
    FROM alignment_scores a
    LEFT JOIN users u ON a.scored_by_id = u.id
    ORDER BY a.scored_at DESC
  `).all();
}

// ── Dashboard Metrics ──
export async function getDashboardMetrics() {
  const db = getDb();

  const totalNotes = db.prepare('SELECT COUNT(*) as c FROM objective_notes WHERE status = ?').get('active');
  const totalSubmissions = db.prepare('SELECT COUNT(DISTINCT user_id) as c FROM submissions').get();
  const totalProjects = db.prepare('SELECT COUNT(*) as c FROM submissions').get();

  const scores = db.prepare('SELECT score, COUNT(*) as c FROM alignment_scores GROUP BY score').all();
  const scoreMap = { green: 0, amber: 0, red: 0 };
  for (const s of scores) scoreMap[s.score] = s.c;
  const totalScored = scoreMap.green + scoreMap.amber + scoreMap.red;

  return {
    activeNotes: totalNotes.c,
    flsSubmitted: totalSubmissions.c,
    totalProjectSubmissions: totalProjects.c,
    alignmentScores: scoreMap,
    totalScored,
    lateralAlignmentPct: totalScored > 0 ? Math.round((scoreMap.green / totalScored) * 100) : null,
  };
}
