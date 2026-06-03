import { NextResponse } from 'next/server';
import getDb from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDb();
  const notes = db.prepare(`
    SELECT n.*,
      o.name as owner_name, o.department as owner_department,
      s.name as sponsor_name
    FROM objective_notes n
    LEFT JOIN users o ON n.objective_owner_id = o.id
    LEFT JOIN users s ON n.sponsor_id = s.id
    ORDER BY n.last_updated DESC
  `).all();
  return NextResponse.json(notes);
}

export async function POST(req) {
  const db = getDb();
  const data = await req.json();
  if (!data.project_name || !data.objective) {
    return NextResponse.json({ error: 'project_name and objective are required' }, { status: 400 });
  }
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
  return NextResponse.json({ id: result.lastInsertRowid });
}
