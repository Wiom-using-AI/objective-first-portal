import { NextResponse } from 'next/server';
import getDb from '../../../lib/db';
import { auth, isAdmin } from '../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();

  if (isAdmin(session.user.email)) {
    // Admin sees everything
    const subs = db.prepare('SELECT * FROM submissions ORDER BY submitted_at DESC').all();
    return NextResponse.json(subs);
  } else {
    // Non-admin only sees their own submissions
    const subs = db.prepare('SELECT * FROM submissions WHERE submitter_email = ? ORDER BY submitted_at DESC').all(session.user.email);
    return NextResponse.json(subs);
  }
}

export async function POST(req) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const { name, email, role, function: func, projects } = await req.json();
  if (!name || !projects || !projects.length) {
    return NextResponse.json({ error: 'name and projects are required' }, { status: 400 });
  }

  const insert = db.prepare(
    'INSERT INTO submissions (submitter_name, submitter_email, submitter_role, submitter_function, project_name, objective, success_metric, is_cross_fl, cross_fl_who) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );
  const insertMany = db.transaction((list) => {
    for (const p of list) {
      insert.run(name, email || '', role || '', func || '', p.project_name, p.objective, p.success_metric || '', p.is_cross_fl ? 1 : 0, p.cross_fl_who || '');
    }
  });
  insertMany(projects);
  return NextResponse.json({ success: true, count: projects.length });
}
