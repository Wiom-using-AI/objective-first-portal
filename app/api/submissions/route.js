import { NextResponse } from 'next/server';
import getDb from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const db = getDb();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (userId) {
    const subs = db.prepare('SELECT * FROM submissions WHERE user_id = ? ORDER BY submitted_at DESC').all(parseInt(userId));
    return NextResponse.json(subs);
  }

  const subs = db.prepare(`
    SELECT s.*, u.name as user_name, u.department
    FROM submissions s
    JOIN users u ON s.user_id = u.id
    ORDER BY s.submitted_at DESC
  `).all();
  return NextResponse.json(subs);
}

export async function POST(req) {
  const db = getDb();
  const { userId, projects } = await req.json();
  if (!userId || !projects || !projects.length) {
    return NextResponse.json({ error: 'userId and projects are required' }, { status: 400 });
  }

  const insert = db.prepare(
    'INSERT INTO submissions (user_id, project_name, objective, success_metric, is_cross_fl, cross_fl_who) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const insertMany = db.transaction((list) => {
    for (const p of list) {
      insert.run(userId, p.project_name, p.objective, p.success_metric || '', p.is_cross_fl ? 1 : 0, p.cross_fl_who || '');
    }
  });
  insertMany(projects);
  return NextResponse.json({ success: true, count: projects.length });
}
