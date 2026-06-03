import { NextResponse } from 'next/server';
import getDb from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDb();
  const users = db.prepare('SELECT * FROM users ORDER BY name').all();
  return NextResponse.json(users);
}

export async function POST(req) {
  const db = getDb();
  const { name, role, department } = await req.json();
  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  const result = db.prepare('INSERT INTO users (name, role, department) VALUES (?, ?, ?)').run(name, role || 'team_member', department || '');
  return NextResponse.json({ id: result.lastInsertRowid });
}
