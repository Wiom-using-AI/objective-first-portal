import { NextResponse } from 'next/server';
import getDb from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDb();
  const scores = db.prepare(`
    SELECT a.*, u.name as scored_by_name
    FROM alignment_scores a
    LEFT JOIN users u ON a.scored_by_id = u.id
    ORDER BY a.scored_at DESC
  `).all();
  return NextResponse.json(scores);
}

export async function POST(req) {
  const db = getDb();
  const data = await req.json();
  if (!data.project_name || !data.score) {
    return NextResponse.json({ error: 'project_name and score are required' }, { status: 400 });
  }
  db.prepare(`
    INSERT INTO alignment_scores (project_name, fl_a_name, fl_a_objective, fl_b_name, fl_b_objective, score, gap_note, scored_by_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    data.project_name, data.fl_a_name || '', data.fl_a_objective || '',
    data.fl_b_name || '', data.fl_b_objective || '', data.score, data.gap_note || '', data.scored_by_id || null
  );
  return NextResponse.json({ success: true });
}
