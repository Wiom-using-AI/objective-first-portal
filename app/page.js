import getDb from '../lib/db';
import { auth, isAdmin } from '../lib/auth';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const session = await auth();
  const admin = isAdmin(session?.user?.email);

  if (!admin) {
    return <MemberView email={session?.user?.email} name={session?.user?.name} />;
  }

  return <AdminDashboard />;
}

async function AdminDashboard() {
  const db = getDb();
  const totalSubmitters = db.prepare('SELECT COUNT(DISTINCT submitter_name) as c FROM submissions').get();
  const totalProjects = db.prepare('SELECT COUNT(*) as c FROM submissions').get();
  const totalNotes = db.prepare("SELECT COUNT(*) as c FROM objective_notes WHERE status = 'active'").get();

  const scores = db.prepare('SELECT score, COUNT(*) as c FROM alignment_scores GROUP BY score').all();
  const scoreMap = { green: 0, amber: 0, red: 0 };
  for (const s of scores) scoreMap[s.score] = s.c;
  const totalScored = scoreMap.green + scoreMap.amber + scoreMap.red;

  const recentSubmissions = db.prepare(`
    SELECT submitter_name, submitter_function, submitter_role, COUNT(*) as project_count, MAX(submitted_at) as last_submitted
    FROM submissions GROUP BY submitter_name ORDER BY last_submitted DESC LIMIT 10
  `).all();

  const m = {
    flsSubmitted: totalSubmitters.c,
    totalProjects: totalProjects.c,
    activeNotes: totalNotes.c,
    scoreMap, totalScored,
    lateralPct: totalScored > 0 ? Math.round((scoreMap.green / totalScored) * 100) : null,
    recentSubmissions,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Objective conduction across Wiom — admin view.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard value={m.flsSubmitted} label="Functional Heads Submitted" />
        <StatCard value={m.totalProjects} label="Projects Logged" />
        <StatCard value={m.activeNotes} label="Objective Notes" />
        <StatCard
          value={m.lateralPct !== null ? `${m.lateralPct}%` : '—'}
          label="Lateral Alignment"
          sub={m.totalScored > 0 ? `${m.totalScored} scored` : 'awaiting scores'}
          highlight
        />
      </div>

      {m.totalScored > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Alignment Breakdown</h2>
          <div className="flex gap-6">
            <ScoreBlock color="bg-[#1E7A3C]" label="Green" count={m.scoreMap.green} total={m.totalScored} />
            <ScoreBlock color="bg-amber-500" label="Amber" count={m.scoreMap.amber} total={m.totalScored} />
            <ScoreBlock color="bg-[#C62828]" label="Red" count={m.scoreMap.red} total={m.totalScored} />
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Who Has Submitted</h2>
        {m.recentSubmissions.length === 0 ? (
          <p className="text-sm text-gray-500">No submissions yet.</p>
        ) : (
          <div className="space-y-2">
            {m.recentSubmissions.map((s, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">{s.submitter_name}</span>
                  {s.submitter_role && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{s.submitter_role}</span>}
                  {s.submitter_function && <span className="text-xs bg-pink-50 text-[#E91E63] px-2 py-0.5 rounded">{s.submitter_function}</span>}
                </div>
                <span className="text-xs text-gray-400">{s.project_count} project{s.project_count !== 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MemberView({ email, name }) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {name?.split(' ')[0]}</h1>
        <p className="text-sm text-gray-500 mt-1">Submit your projects and objectives for the blind baselining exercise.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center max-w-lg mx-auto">
        <div className="w-14 h-14 bg-[#E91E63] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        </div>
        <h2 className="text-lg font-bold text-gray-900">Submit Your Projects</h2>
        <p className="text-sm text-gray-500 mt-2 mb-6">
          List your projects and objectives independently. Your submissions are private — only the admin can view all responses.
        </p>
        <a href="/submit" className="inline-block px-6 py-3 bg-[#E91E63] text-white rounded-xl hover:bg-[#C2185B] transition-colors font-semibold text-sm shadow-lg shadow-pink-200">
          Go to Submission Page
        </a>
      </div>
    </div>
  );
}

function StatCard({ value, label, sub, highlight }) {
  return (
    <div className={`rounded-xl border p-5 shadow-sm ${highlight ? 'bg-[#E91E63] border-[#E91E63]' : 'bg-white border-gray-200'}`}>
      <p className={`text-3xl font-bold ${highlight ? 'text-white' : 'text-gray-900'}`}>{value}</p>
      <p className={`text-sm mt-1 ${highlight ? 'text-pink-100' : 'text-gray-500'}`}>{label}</p>
      {sub && <p className={`text-xs mt-0.5 ${highlight ? 'text-pink-200' : 'text-gray-400'}`}>{sub}</p>}
    </div>
  );
}

function ScoreBlock({ color, label, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex-1">
      <div className="flex items-baseline gap-2 mb-1">
        <div className={`w-3 h-3 rounded-full ${color}`} />
        <span className="text-sm font-medium text-gray-900">{label}</span>
      </div>
      <span className="text-2xl font-bold text-gray-900">{count}</span>
      <span className="text-xs text-gray-400 ml-1">{pct}%</span>
      <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
