'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewObjectiveNote() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    project_name: '',
    objective_owner_id: '',
    objective: '',
    why_now: '',
    success_metric: '',
    what_its_not: '',
    sponsor_id: '',
  });

  useEffect(() => {
    fetch('/api/users').then(r => r.json()).then(setUsers);
  }, []);

  function update(field, value) {
    setForm({ ...form, [field]: value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.project_name.trim() || !form.objective.trim()) {
      return alert('Project name and objective are required.');
    }
    setLoading(true);
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          objective_owner_id: form.objective_owner_id ? parseInt(form.objective_owner_id) : null,
          sponsor_id: form.sponsor_id ? parseInt(form.sponsor_id) : null,
        }),
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
    { key: 'project_name', label: 'Project Name', placeholder: 'Plain name everyone uses for it.', type: 'text', required: true },
    { key: 'objective_owner_id', label: 'Objective Owner', type: 'select', hint: 'The single accountable person (even if cross-team).' },
    { key: 'objective', label: 'Objective', placeholder: 'The outcome this project exists to create — not the activity. One sentence.', type: 'textarea', required: true },
    { key: 'why_now', label: 'Why Now / So What', placeholder: 'The business reason. What breaks or is lost if we don\'t do this.', type: 'textarea' },
    { key: 'success_metric', label: 'Success Metric', placeholder: 'The one number that proves the objective was met. Current value → target value.', type: 'text' },
    { key: 'what_its_not', label: 'What This Is NOT', placeholder: 'The tempting-but-out-of-scope work. Prevents objective drift.', type: 'textarea' },
    { key: 'sponsor_id', label: 'Sponsor (Founder/Function Head)', type: 'select', hint: 'The Founder / Function Head whose objective this rolls up to.' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#102A43]">New Objective Note</h1>
        <p className="text-[#555555] mt-1">One page, fixed format — the single source of truth for a project.</p>
      </div>

      <div className="bg-[#EAF1F8] border-l-4 border-[#1F6FB2] rounded-r-xl p-5">
        <p className="text-sm font-semibold text-[#1F6FB2] mb-1">REMEMBER</p>
        <p className="text-sm text-[#102A43]">
          Objectives attach to <strong>thinking-work</strong> (projects), not to transactional work.
          The test: does this work require a judgment about WHAT to do, or WHETHER it is worth doing?
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {fields.map((f, i) => (
          <div key={f.key} className={`flex border-b border-gray-100 ${i % 2 === 0 ? '' : ''}`}>
            <div className="w-1/3 bg-[#EAF1F8] px-6 py-4 flex flex-col justify-center">
              <label className="text-sm font-bold text-[#102A43]">{f.label}</label>
              {f.hint && <p className="text-xs text-[#555555] mt-0.5">{f.hint}</p>}
              {f.required && <span className="text-xs text-[#A32A2A] mt-0.5">Required</span>}
            </div>
            <div className="w-2/3 px-6 py-4">
              {f.type === 'select' ? (
                <select
                  value={form[f.key]}
                  onChange={e => update(f.key, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1F6FB2] focus:border-transparent"
                >
                  <option value="">Select...</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              ) : f.type === 'textarea' ? (
                <textarea
                  value={form[f.key]}
                  onChange={e => update(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1F6FB2] focus:border-transparent"
                />
              ) : (
                <input
                  type="text"
                  value={form[f.key]}
                  onChange={e => update(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1F6FB2] focus:border-transparent"
                />
              )}
            </div>
          </div>
        ))}
        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-4">
          <a href="/projects" className="px-4 py-2 border border-gray-300 text-[#555555] rounded-lg hover:bg-gray-100 transition-colors">Cancel</a>
          <button type="submit" disabled={loading} className="px-8 py-2 bg-[#102A43] text-white rounded-lg hover:bg-[#1F6FB2] transition-colors font-semibold disabled:opacity-50">
            {loading ? 'Creating...' : 'Create Objective Note'}
          </button>
        </div>
      </form>
    </div>
  );
}
