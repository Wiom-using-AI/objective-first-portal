import { NextResponse } from 'next/server';
import getDb from '../../../lib/db';
import { auth, isAdmin } from '../../../lib/auth';
import { detectAllPairs, getUnscoredPairs, scoreObjectivePair } from '../../../lib/autoscore';

export const dynamic = 'force-dynamic';

/**
 * GET: Return all cross-functional pairs and scores. Admin only.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isAdmin(session.user.email)) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const db = getDb();

  const pairs = await detectAllPairs(db);
  const scores = db.prepare('SELECT * FROM alignment_scores ORDER BY scored_at DESC').all();

  const scoredMap = {};
  for (const s of scores) {
    scoredMap[`${s.submission_a_id}-${s.submission_b_id}`] = s;
  }

  const results = pairs.map(p => ({
    project_name: p.a_project === p.b_project
      ? p.a_project
      : `${p.a_project} / ${p.b_project}`,
    fl_a: { name: p.a_name, function: p.a_function, objective: p.a_objective, metric: p.a_metric, project: p.a_project },
    fl_b: { name: p.b_name, function: p.b_function, objective: p.b_objective, metric: p.b_metric, project: p.b_project },
    submission_a_id: p.a_id,
    submission_b_id: p.b_id,
    fuzzy: (p.a_project || '').toLowerCase().trim() !== (p.b_project || '').toLowerCase().trim(),
    score: scoredMap[`${p.a_id}-${p.b_id}`] || null,
  }));

  const totalScored = results.filter(r => r.score).length;
  const totalUnscored = results.filter(r => !r.score).length;

  return NextResponse.json({ pairs: results, totalScored, totalUnscored });
}

/**
 * POST: Trigger auto-scoring. Admin only.
 */
export async function POST() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isAdmin(session.user.email)) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const db = getDb();

  if (!process.env.WIOM_PORTAL_ANTHROPIC_KEY && !process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'WIOM_PORTAL_ANTHROPIC_KEY not configured' }, { status: 500 });
  }

  const pairs = await detectAllPairs(db);
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
    const displayName = (p.a_project || '').toLowerCase().trim() === (p.b_project || '').toLowerCase().trim()
      ? p.a_project
      : `${p.a_project} / ${p.b_project}`;

    try {
      const result = await scoreObjectivePair(
        p.a_project, p.b_project,
        { name: p.a_name, function: p.a_function, objective: p.a_objective, success_metric: p.a_metric },
        { name: p.b_name, function: p.b_function, objective: p.b_objective, success_metric: p.b_metric }
      );

      insert.run(
        displayName, p.a_id, p.b_id,
        p.a_name, p.a_function, p.a_objective, p.a_metric,
        p.b_name, p.b_function, p.b_objective, p.b_metric,
        result.score, result.rationale
      );

      results.push({ project: displayName, score: result.score, rationale: result.rationale });
      scored++;
    } catch (err) {
      results.push({ project: displayName, error: err.message });
    }
  }

  return NextResponse.json({ scored, total: unscored.length, results });
}
