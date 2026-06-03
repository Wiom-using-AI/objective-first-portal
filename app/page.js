import getDb from '../lib/db';

export const dynamic = 'force-dynamic';

function getMetrics() {
  const db = getDb();
  const totalSubmitters = db.prepare('SELECT COUNT(DISTINCT submitter_name) as c FROM submissions').get();
  const totalProjects = db.prepare('SELECT COUNT(*) as c FROM submissions').get();
  const totalNotes = db.prepare("SELECT COUNT(*) as c FROM objective_notes WHERE status = 'active'").get();
  const crossFlProjects = db.prepare('SELECT COUNT(*) as c FROM submissions WHERE is_cross_fl = 1').get();

  const scores = db.prepare('SELECT score, COUNT(*) as c FROM alignment_scores GROUP BY score').all();
  const scoreMap = { green: 0, amber: 0, red: 0 };
  for (const s of scores) scoreMap[s.score] = s.c;
  const totalScored = scoreMap.green + scoreMap.amber + scoreMap.red;

  const recentSubmissions = db.prepare(`
    SELECT submitter_name, submitter_function, COUNT(*) as project_count, MAX(submitted_at) as last_submitted
    FROM submissions GROUP BY submitter_name ORDER BY last_submitted DESC LIMIT 10
  `).all();

  const recentNotes = db.prepare("SELECT * FROM objective_notes WHERE status = 'active' ORDER BY last_updated DESC LIMIT 5").all();

  return {
    flsSubmitted: totalSubmitters.c,
    totalProjects: totalProjects.c,
    activeNotes: totalNotes.c,
    crossFlProjects: crossFlProjects.c,
    scoreMap,
    totalScored,
    lateralPct: totalScored > 0 ? Math.round((scoreMap.green / totalScored) * 100) : null,
    recentSubmissions,
    recentNotes,
  };
}

export default async function Dashboard() {
  const m = await getMetrics();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#102A43]">Dashboard</h1>
        <p className="text-sm text-[#555555] mt-1">Objective conduction across Wiom — are objectives surviving handoffs?</p>
      </div>

      {/* Key Numbers */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard value={m.flsSubmitted} label="FLs Submitted" />
        <StatCard value={m.totalProjects} label="Projects Logged" />
        <StatCard value={m.activeNotes} label="Objective Notes" />
        <StatCard
          value={m.lateralPct !== null ? `${m.lateralPct}%` : '—'}
          label="Lateral Alignment"
          sub={m.totalScored > 0 ? `${m.totalScored} scored` : 'awaiting scores'}
          highlight={m.lateralPct !== null}
        />
      </div>

      {/* Alignment Scores (if any) */}
      {m.totalScored > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-[#102A43] uppercase tracking-wide mb-4">Alignment Breakdown</h2>
          <div className="flex gap-6">
            <ScoreBlock color="bg-[#1E7A3C]" label="Green" sublabel="Match" count={m.scoreMap.green} total={m.totalScored} />
            <ScoreBlock color="bg-amber-500" label="Amber" sublabel="Partial" count={m.scoreMap.amber} total={m.totalScored} />
            <ScoreBlock color="bg-[#A32A2A]" label="Red" sublabel="Different" count={m.scoreMap.red} total={m.totalScored} />
          </div>
        </div>
      )}

      {/* Two columns: Who submitted + Recent Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submissions */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-[#102A43] uppercase tracking-wide mb-4">Who Has Submitted</h2>
          {m.recentSubmissions.length === 0 ? (
            <p className="text-sm text-[#555555]">No submissions yet. <a href="/submit" className="text-[#1F6FB2] underline">Start here.</a></p>
          ) : (
            <div className="space-y-2">
              {m.recentSubmissions.map((s, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <span className="text-sm font-medium text-[#102A43]">{s.submitter_name}</span>
                    {s.submitter_function && (
                      <span className="ml-2 text-xs bg-[#EAF1F8] text-[#1F6FB2] px-2 py-0.5 rounded">{s.submitter_function}</span>
                    )}
                  </div>
                  <span className="text-xs text-[#555555]">{s.project_count} project{s.project_count !== 1 ? 's' : ''}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Objective Notes */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#102A43] uppercase tracking-wide">Recent Objective Notes</h2>
            <a href="/projects" className="text-xs text-[#1F6FB2] hover:underline">View all</a>
          </div>
          {m.recentNotes.length === 0 ? (
            <p className="text-sm text-[#555555]">No notes yet. <a href="/projects/new" className="text-[#1F6FB2] underline">Create one.</a></p>
          ) : (
            <div className="space-y-2">
              {m.recentNotes.map(n => (
                <a key={n.id} href={`/projects/${n.id}`} className="block py-2 border-b border-gray-50 last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded">
                  <div className="text-sm font-medium text-[#102A43]">{n.project_name}</div>
                  <div className="text-xs text-[#555555] mt-0.5 line-clamp-1">{n.objective}</div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ value, label, sub, highlight }) {
  return (
    <div className={`rounded-lg border p-5 ${highlight ? 'bg-[#102A43] border-[#102A43]' : 'bg-white border-gray-200'}`}>
      <p className={`text-3xl font-bold ${highlight ? 'text-white' : 'text-[#102A43]'}`}>{value}</p>
      <p className={`text-sm mt-1 ${highlight ? 'text-[#EAF1F8]' : 'text-[#555555]'}`}>{label}</p>
      {sub && <p className={`text-xs mt-0.5 ${highlight ? 'text-[#EAF1F8]/60' : 'text-gray-400'}`}>{sub}</p>}
    </div>
  );
}

function ScoreBlock({ color, label, sublabel, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex-1">
      <div className="flex items-baseline gap-2 mb-1">
        <div className={`w-3 h-3 rounded-full ${color}`} />
        <span className="text-sm font-medium text-[#102A43]">{label}</span>
        <span className="text-xs text-[#555555]">{sublabel}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-[#102A43]">{count}</span>
        <span className="text-xs text-gray-400">{pct}%</span>
      </div>
      <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
