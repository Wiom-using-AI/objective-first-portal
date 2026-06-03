import { getDashboardMetrics, getObjectiveNotes, getAlignmentScores } from '../lib/actions';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const metrics = await getDashboardMetrics();
  const recentNotes = await getObjectiveNotes();
  const recentScores = await getAlignmentScores();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#102A43]">Objective First Dashboard</h1>
        <p className="text-[#555555] mt-1">Measuring how objectives flow across Wiom — from source to execution.</p>
      </div>

      {/* Thesis Banner */}
      <div className="bg-[#102A43] text-white rounded-xl p-6 border-l-4 border-[#1F6FB2]">
        <p className="text-sm font-semibold text-[#1F6FB2] mb-1">THESIS</p>
        <p className="text-base leading-relaxed">
          Wiom does not have an objective-generation problem. Wiom has an objective-CONDUCTION problem —
          the objective is clean at the source and decays as it travels across handoffs.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          label="FLs Submitted"
          value={metrics.flsSubmitted}
          sub="unique FLs completed blind submission"
          color="blue"
        />
        <MetricCard
          label="Projects Submitted"
          value={metrics.totalProjectSubmissions}
          sub="total project entries across all FLs"
          color="blue"
        />
        <MetricCard
          label="Active Objective Notes"
          value={metrics.activeNotes}
          sub="projects with a live Objective Note"
          color="green"
        />
        <MetricCard
          label="Lateral Alignment"
          value={metrics.lateralAlignmentPct !== null ? `${metrics.lateralAlignmentPct}%` : '---'}
          sub={metrics.totalScored > 0 ? `${metrics.totalScored} cross-FL projects scored` : 'no scores yet'}
          color={metrics.lateralAlignmentPct >= 70 ? 'green' : metrics.lateralAlignmentPct >= 40 ? 'amber' : 'red'}
        />
      </div>

      {/* Three Decay Scores */}
      <div>
        <h2 className="text-xl font-bold text-[#102A43] mb-4">The Three Decay Scores</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DecayCard
            title="Top-down Fidelity"
            description="Sponsor vs FL objective match"
            lossPoint="Loss point 1"
            status={metrics.lateralAlignmentPct !== null ? 'measuring' : 'awaiting data'}
          />
          <DecayCard
            title="Lateral Alignment"
            description="% of cross-FL projects where FLs' objectives match"
            lossPoint="Loss point 2"
            value={metrics.lateralAlignmentPct}
            scoreBreakdown={metrics.alignmentScores}
            totalScored={metrics.totalScored}
            status={metrics.totalScored > 0 ? 'measuring' : 'awaiting data'}
          />
          <DecayCard
            title="Downstream Fidelity"
            description="FL vs team objective match"
            lossPoint="Loss point 3"
            status="next phase"
          />
        </div>
      </div>

      {/* Alignment Score Breakdown */}
      {metrics.totalScored > 0 && (
        <div>
          <h2 className="text-xl font-bold text-[#102A43] mb-4">Alignment Score Breakdown</h2>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-8">
              <ScoreBar label="Green (match)" count={metrics.alignmentScores.green} total={metrics.totalScored} color="bg-[#1E7A3C]" />
              <ScoreBar label="Amber (partial)" count={metrics.alignmentScores.amber} total={metrics.totalScored} color="bg-amber-500" />
              <ScoreBar label="Red (different)" count={metrics.alignmentScores.red} total={metrics.totalScored} color="bg-[#A32A2A]" />
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-bold text-[#102A43] mb-4">Recent Objective Notes</h2>
          {recentNotes.length === 0 ? (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center text-[#555555]">
              No objective notes yet. <a href="/projects/new" className="text-[#1F6FB2] underline">Create the first one.</a>
            </div>
          ) : (
            <div className="space-y-3">
              {recentNotes.slice(0, 5).map(n => (
                <a key={n.id} href={`/projects/${n.id}`} className="block bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:border-[#1F6FB2] transition-colors">
                  <div className="font-semibold text-[#102A43]">{n.project_name}</div>
                  <p className="text-sm text-[#555555] mt-1 line-clamp-1">{n.objective}</p>
                  <div className="flex gap-4 mt-2 text-xs text-gray-400">
                    <span>Owner: {n.owner_name || 'Unassigned'}</span>
                    <span>Updated: {new Date(n.last_updated).toLocaleDateString()}</span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-bold text-[#102A43] mb-4">Recent Alignment Scores</h2>
          {recentScores.length === 0 ? (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center text-[#555555]">
              No alignment scores yet. <a href="/scoring" className="text-[#1F6FB2] underline">Start scoring.</a>
            </div>
          ) : (
            <div className="space-y-3">
              {recentScores.slice(0, 5).map(s => (
                <div key={s.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#102A43]">{s.project_name}</span>
                    <ScoreBadge score={s.score} />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{s.fl_a_name} vs {s.fl_b_name}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub, color }) {
  const colorMap = {
    blue: 'border-[#1F6FB2] bg-blue-50',
    green: 'border-[#1E7A3C] bg-green-50',
    amber: 'border-amber-500 bg-amber-50',
    red: 'border-[#A32A2A] bg-red-50',
  };
  return (
    <div className={`rounded-xl p-6 border-l-4 ${colorMap[color] || colorMap.blue}`}>
      <p className="text-sm font-medium text-[#555555]">{label}</p>
      <p className="text-3xl font-bold text-[#102A43] mt-1">{value}</p>
      <p className="text-xs text-[#555555] mt-1">{sub}</p>
    </div>
  );
}

function DecayCard({ title, description, lossPoint, value, status }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-[#102A43]">{title}</h3>
          <p className="text-sm text-[#555555] mt-1">{description}</p>
        </div>
        <span className="text-xs bg-[#EAF1F8] text-[#1F6FB2] px-2 py-1 rounded font-medium">{lossPoint}</span>
      </div>
      {value !== undefined && value !== null && (
        <p className="text-4xl font-bold text-[#102A43] mt-4">{value}%</p>
      )}
      <p className={`text-xs mt-3 font-medium ${status === 'measuring' ? 'text-[#1E7A3C]' : status === 'next phase' ? 'text-gray-400' : 'text-amber-600'}`}>
        {status === 'measuring' ? 'Measuring' : status === 'next phase' ? 'Next phase' : 'Awaiting data'}
      </p>
    </div>
  );
}

function ScoreBar({ label, count, total, color }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex-1">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-[#555555]">{label}</span>
        <span className="font-semibold text-[#102A43]">{count}</span>
      </div>
      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function ScoreBadge({ score }) {
  const map = {
    green: 'bg-[#1E7A3C] text-white',
    amber: 'bg-amber-500 text-white',
    red: 'bg-[#A32A2A] text-white',
  };
  return (
    <span className={`text-xs px-2 py-1 rounded-full font-semibold uppercase ${map[score] || 'bg-gray-200'}`}>
      {score}
    </span>
  );
}
