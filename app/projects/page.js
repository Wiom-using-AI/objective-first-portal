import getDb from '../../lib/db';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  const db = getDb();
  const notes = db.prepare("SELECT * FROM objective_notes ORDER BY last_updated DESC").all();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#102A43]">Objective Library</h1>
          <p className="text-sm text-[#555555] mt-1">The index of all Objective Notes — single source of truth per project.</p>
        </div>
        <a href="/projects/new" className="px-5 py-2.5 bg-[#102A43] text-white rounded-lg hover:bg-[#1F6FB2] transition-colors font-semibold text-sm">
          + New Objective Note
        </a>
      </div>

      {notes.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <h3 className="text-base font-semibold text-[#102A43]">No Objective Notes Yet</h3>
          <p className="text-sm text-[#555555] mt-1 mb-4">Every project (thinking-work) needs exactly one Objective Note.</p>
          <a href="/projects/new" className="inline-block px-5 py-2.5 bg-[#1F6FB2] text-white rounded-lg hover:bg-[#102A43] transition-colors font-semibold text-sm">
            Create First Note
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.map(n => (
            <a key={n.id} href={`/projects/${n.id}`} className="bg-white rounded-lg border border-gray-200 p-5 hover:border-[#1F6FB2] transition-colors group">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-[#102A43] text-sm group-hover:text-[#1F6FB2]">{n.project_name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${n.status === 'active' ? 'bg-green-100 text-[#1E7A3C]' : 'bg-gray-100 text-gray-500'}`}>
                  {n.status}
                </span>
              </div>
              <p className="text-sm text-[#555555] line-clamp-2">{n.objective}</p>
              {n.success_metric && (
                <p className="text-xs text-[#1F6FB2] bg-[#EAF1F8] rounded px-2 py-1 mt-2 inline-block">{n.success_metric}</p>
              )}
              <div className="flex gap-4 text-xs text-gray-400 mt-3">
                {n.objective_owner && <span>Owner: {n.objective_owner}</span>}
                <span>{new Date(n.last_updated).toLocaleDateString()}</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
