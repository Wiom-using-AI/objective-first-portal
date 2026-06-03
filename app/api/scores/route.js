import { NextResponse } from 'next/server';
import getDb from '../../../lib/db';
import { auth, isAdmin } from '../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isAdmin(session.user.email)) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const db = getDb();
  const scores = db.prepare('SELECT * FROM alignment_scores ORDER BY scored_at DESC').all();
  return NextResponse.json(scores);
}
