import { getObjectiveNote, getUsers } from '../../../lib/actions';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ObjectiveNotePage({ params }) {
  const { id } = await params;
  const note = await getObjectiveNote(parseInt(id));
  if (!note) return notFound();

  const fields = [
    { label: 'Project Name', value: note.project_name },
    { label: 'Objective Owner', value: note.owner_name || 'Unassigned' },
    { label: 'Objective', value: note.objective },
    { label: 'Why Now / So What', value: note.why_now },
    { label: 'Success Metric', value: note.success_metric },
    { label: 'What This Is NOT', value: note.what_its_not },
    { label: 'Sponsor', value: note.sponsor_name || 'Unassigned' },
    { label: 'Last Updated', value: note.last_updated ? new Date(note.last_updated).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <a href="/projects" className="text-sm text-[#1F6FB2] hover:underline">&larr; Back to Library</a>
          <h1 className="text-3xl font-bold text-[#102A43] mt-2">{note.project_name}</h1>
        </div>
        <span className={`text-sm px-3 py-1 rounded-full font-medium ${note.status === 'active' ? 'bg-green-100 text-[#1E7A3C]' : 'bg-gray-100 text-gray-500'}`}>
          {note.status}
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {fields.map((f, i) => (
          <div key={f.label} className={`flex border-b border-gray-100 last:border-b-0`}>
            <div className="w-1/3 bg-[#EAF1F8] px-6 py-4">
              <span className="text-sm font-bold text-[#102A43]">{f.label}</span>
            </div>
            <div className="w-2/3 px-6 py-4">
              <span className="text-sm text-[#102A43]">{f.value || <span className="text-gray-300 italic">Not set</span>}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <a href={`/projects/${note.id}/edit`} className="px-6 py-2 bg-[#1F6FB2] text-white rounded-lg hover:bg-[#102A43] transition-colors font-medium">
          Edit Note
        </a>
      </div>
    </div>
  );
}
