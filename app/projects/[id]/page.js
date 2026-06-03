import getDb from '../../../lib/db';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ObjectiveNotePage({ params }) {
  const { id } = await params;
  const db = getDb();
  const note = db.prepare('SELECT * FROM objective_notes WHERE id = ?').get(parseInt(id));
  if (!note) return notFound();

  const fields = [
    { label: 'Project Name', value: note.project_name },
    { label: 'Objective Owner', value: note.objective_owner },
    { label: 'Objective', value: note.objective },
    { label: 'Why Now / So What', value: note.why_now },
    { label: 'Success Metric', value: note.success_metric },
    { label: 'What This Is NOT', value: note.what_its_not },
    { label: 'Sponsor', value: note.sponsor },
    { label: 'Last Updated', value: note.last_updated ? new Date(note.last_updated).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '' },
  ];

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <a href="/projects" className="text-sm text-[#E91E63] hover:underline">&larr; Back to Library</a>
        <div className="flex items-center gap-3 mt-2">
          <h1 className="text-2xl font-bold text-[gray-900]">{note.project_name}</h1>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${note.status === 'active' ? 'bg-green-100 text-[#1E7A3C]' : 'bg-gray-100 text-gray-500'}`}>
            {note.status}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
        {fields.map(f => (
          <div key={f.label} className="flex">
            <div className="w-1/3 bg-[pink-50]/50 px-5 py-4">
              <span className="text-sm font-semibold text-[gray-900]">{f.label}</span>
            </div>
            <div className="w-2/3 px-5 py-4">
              <span className="text-sm text-[gray-900]">{f.value || <span className="text-gray-300 italic">Not set</span>}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
