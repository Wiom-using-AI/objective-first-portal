import { NextResponse } from 'next/server';
import getDb from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDb();
  const notes = db.prepare('SELECT * FROM objective_notes ORDER BY last_updated DESC').all();
  return NextResponse.json(notes);
}

export async function POST(req) {
  const db = getDb();
  const data = await req.json();
  if (!data.project_name || !data.objective) {
    return NextResponse.json({ error: 'project_name and objective are required' }, { status: 400 });
  }
  const result = db.prepare(`
    INSERT INTO objective_notes (project_name, objective_owner, objective, why_now, success_metric, what_its_not, sponsor)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    data.project_name, data.objective_owner || '', data.objective,
    data.why_now || '', data.success_metric || '', data.what_its_not || '', data.sponsor || ''
  );
  return NextResponse.json({ id: result.lastInsertRowid });
}
