import { getObjectiveNotes } from '../../lib/actions';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  const notes = await getObjectiveNotes();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#102A43]">Objective Library</h1>
          <p className="text-[#555555] mt-1">The index of all Objective Notes — the single source of truth for every project.</p>
        </div>
        <a href="/projects/new" className="px-6 py-3 bg-[#102A43] text-white rounded-lg hover:bg-[#1F6FB2] transition-colors font-semibold">
          + New Objective Note
        </a>
      </div>

      {notes.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
          <div className="w-16 h-16 bg-[#EAF1F8] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#1F6FB2]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <h3 className="text-lg font-semibold text-[#102A43]">No Objective Notes Yet</h3>
          <p className="text-[#555555] mt-1 mb-4">Every project (thinking-work) needs exactly one Objective Note.</p>
          <a href="/projects/new" className="inline-block px-6 py-3 bg-[#1F6FB2] text-white rounded-lg hover:bg-[#102A43] transition-colors font-semibold">
            Create First Objective Note
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map(n => (
            <a key={n.id} href={`/projects/${n.id}`} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-[#1F6FB2] transition-all group">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-[#102A43] group-hover:text-[#1F6FB2] transition-colors">{n.project_name}</h3>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${n.status === 'active' ? 'bg-green-100 text-[#1E7A3C]' : 'bg-gray-100 text-gray-500'}`}>
                  {n.status}
                </span>
              </div>

              <p className="text-sm text-[#102A43] mb-3 line-clamp-2">{n.objective}</p>

              {n.success_metric && (
                <div className="text-xs text-[#555555] bg-[#EAF1F8] rounded px-3 py-2 mb-3">
                  <span className="font-semibold">Metric:</span> {n.success_metric}
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
                <span>Owner: {n.owner_name || 'Unassigned'}</span>
                <span>{new Date(n.last_updated).toLocaleDateString()}</span>
              </div>
              {n.sponsor_name && (
                <div className="text-xs text-gray-400 mt-1">Sponsor: {n.sponsor_name}</div>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
