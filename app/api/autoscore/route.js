import { NextResponse } from 'next/server';
import getDb from '../../../lib/db';
import { detectCrossFlPairs, getUnscoredPairs, scoreObjectivePair } from '../../../lib/autoscore';

export const dynamic = 'force-dynamic';

/**
 * GET: Return all cross-FL pairs and their scores (auto-detected).
 */
export async function GET() {
  const db = getDb();

  const pairs = detectCrossFlPairs(db);
  const scores = db.prepare('SELECT * FROM alignment_scores ORDER BY scored_at DESC').all();

  // Build a lookup of scored pairs
  const scoredMap = {};
  for (const s of scores) {
    scoredMap[`${s.submission_a_id}-${s.submission_b_id}`] = s;
  }

  // Merge pairs with scores
  const results = pairs.map(p => ({
    project_name: p.project_name,
    fl_a: { name: p.a_name, function: p.a_function, objective: p.a_objective, metric: p.a_metric },
    fl_b: { name: p.b_name, function: p.b_function, objective: p.b_objective, metric: p.b_metric },
    submission_a_id: p.a_id,
    submission_b_id: p.b_id,
    score: scoredMap[`${p.a_id}-${p.b_id}`] || null,
  }));

  const totalScored = results.filter(r => r.score).length;
  const totalUnscored = results.filter(r => !r.score).length;

  return NextResponse.json({ pairs: results, totalScored, totalUnscored });
}

/**
 * POST: Trigger auto-scoring for all unscored cross-FL pairs.
 */
export async function POST() {
  const db = getDb();

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });
  }

  const pairs = detectCrossFlPairs(db);
  const unscored = getUnscoredPairs(db, pairs);

  if (unscored.length === 0) {
    return NextResponse.json({ message: 'All pairs already scored', scored: 0 });
  }

  const insert = db.prepare(`
    INSERT INTO alignment_scores (project_name, submission_a_id, submission_b_id,
      fl_a_name, fl_a_function, fl_a_objective, fl_a_metric,
      fl_b_name, fl_b_function, fl_b_objective, fl_b_metric,
      score, rationale)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let scored = 0;
  const results = [];

  for (const p of unscored) {
    try {
      const result = await scoreObjectivePair(
        p.project_name,
        { name: p.a_name, function: p.a_function, objective: p.a_objective, success_metric: p.a_metric },
        { name: p.b_name, function: p.b_function, objective: p.b_objective, success_metric: p.b_metric }
      );

      insert.run(
        p.project_name, p.a_id, p.b_id,
        p.a_name, p.a_function, p.a_objective, p.a_metric,
        p.b_name, p.b_function, p.b_objective, p.b_metric,
        result.score, result.rationale
      );

      results.push({ project: p.project_name, score: result.score, rationale: result.rationale });
      scored++;
    } catch (err) {
      results.push({ project: p.project_name, error: err.message });
    }
  }

  return NextResponse.json({ scored, total: unscored.length, results });
}
