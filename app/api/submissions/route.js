import { NextResponse } from 'next/server';
import getDb from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDb();
  const subs = db.prepare('SELECT * FROM submissions ORDER BY submitted_at DESC').all();
  return NextResponse.json(subs);
}

export async function POST(req) {
  const db = getDb();
  const { name, function: func, projects } = await req.json();
  if (!name || !projects || !projects.length) {
    return NextResponse.json({ error: 'name and projects are required' }, { status: 400 });
  }

  const insert = db.prepare(
    'INSERT INTO submissions (submitter_name, submitter_function, project_name, objective, success_metric, is_cross_fl, cross_fl_who) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  const insertMany = db.transaction((list) => {
    for (const p of list) {
      insert.run(name, func || '', p.project_name, p.objective, p.success_metric || '', p.is_cross_fl ? 1 : 0, p.cross_fl_who || '');
    }
  });
  insertMany(projects);
  return NextResponse.json({ success: true, count: projects.length });
}
