'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewObjectiveNote() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    project_name: '', objective_owner: '', objective: '',
    why_now: '', success_metric: '', what_its_not: '', sponsor: '',
  });

  function update(field, value) {
    setForm({ ...form, [field]: value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.project_name.trim() || !form.objective.trim()) return alert('Project name and objective are required.');
    setLoading(true);
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/projects/${data.id}`);
      }
    } finally {
      setLoading(false);
    }
  }

  const fields = [
    { key: 'project_name', label: 'Project Name', placeholder: 'Plain name everyone uses for it.', required: true },
    { key: 'objective_owner', label: 'Objective Owner', placeholder: 'The single accountable person (even if cross-team).' },
    { key: 'objective', label: 'Objective', placeholder: 'The outcome this project exists to create — not the activity. One sentence.', multiline: true, required: true },
    { key: 'why_now', label: 'Why Now / So What', placeholder: 'The business reason. What breaks or is lost if we don\'t do this.', multiline: true },
    { key: 'success_metric', label: 'Success Metric', placeholder: 'The one number that proves the objective was met. Current value → target value.' },
    { key: 'what_its_not', label: 'What This Is NOT', placeholder: 'The tempting-but-out-of-scope work. Prevents objective drift.', multiline: true },
    { key: 'sponsor', label: 'Sponsor', placeholder: 'The Founder / Function Head whose objective this rolls up to.' },
  ];

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <a href="/projects" className="text-sm text-[#E91E63] hover:underline">&larr; Back to Library</a>
        <h1 className="text-2xl font-bold text-[gray-900] mt-2">New Objective Note</h1>
        <p className="text-sm text-[gray-500] mt-1">One page, fixed format — the single source of truth for a project.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
        {fields.map(f => (
          <div key={f.key} className="flex">
            <div className="w-1/3 bg-[pink-50]/50 px-5 py-4 flex flex-col justify-center">
              <label className="text-sm font-semibold text-[gray-900]">{f.label}</label>
              {f.required && <span className="text-xs text-[#A32A2A]">Required</span>}
            </div>
            <div className="w-2/3 px-5 py-4">
              {f.multiline ? (
                <textarea value={form[f.key]} onChange={e => update(f.key, e.target.value)}
                  placeholder={f.placeholder} rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E91E63] focus:border-transparent text-sm" />
              ) : (
                <input type="text" value={form[f.key]} onChange={e => update(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E91E63] focus:border-transparent text-sm" />
              )}
            </div>
          </div>
        ))}
        <div className="px-5 py-4 flex justify-end gap-3">
          <a href="/projects" className="px-4 py-2 border border-gray-300 text-[gray-500] rounded-lg hover:bg-gray-50 text-sm">Cancel</a>
          <button type="submit" disabled={loading} className="px-6 py-2 bg-[gray-900] text-white rounded-lg hover:bg-[#E91E63] transition-colors font-semibold text-sm disabled:opacity-50">
            {loading ? 'Creating...' : 'Create Objective Note'}
          </button>
        </div>
      </form>
    </div>
  );
}
