'use client';

import { useState } from 'react';

const FUNCTION_OPTIONS = ['GTM', 'Product', 'Technology', "Founder's Office", 'Founders', 'Operations', 'Finance', 'HR'];
const ROLE_OPTIONS = ['Head', 'Member'];

export default function SubmitForm({ userName, userEmail }) {
  const [name] = useState(userName);
  const [role, setRole] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [func, setFunc] = useState('');
  const [customFunc, setCustomFunc] = useState('');
  const [projects, setProjects] = useState([
    { project_name: '', objective: '', success_metric: '', is_cross_fl: false, cross_fl_who: '' },
  ]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const selectedFunction = func === '__custom__' ? customFunc : func;
  const selectedRole = role === '__custom__' ? customRole : role;

  function addRow() {
    setProjects([...projects, { project_name: '', objective: '', success_metric: '', is_cross_fl: false, cross_fl_who: '' }]);
  }

  function removeRow(i) {
    setProjects(projects.filter((_, idx) => idx !== i));
  }

  function updateRow(i, field, value) {
    const updated = [...projects];
    updated[i] = { ...updated[i], [field]: value };
    setProjects(updated);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedFunction.trim()) return alert('Please select or enter your function.');
    if (!selectedRole.trim()) return alert('Please select or enter your role.');
    const valid = projects.filter(p => p.project_name.trim() && p.objective.trim());
    if (valid.length === 0) return alert('Please add at least one project with a name and objective.');

    setLoading(true);
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: userEmail,
          role: selectedRole.trim(),
          function: selectedFunction.trim(),
          projects: valid,
        }),
      });
      if (res.ok) setSubmitted(true);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <div className="w-16 h-16 bg-[#E91E63] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-pink-200">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Submission Complete</h2>
        <p className="text-gray-500 mt-2 max-w-sm mx-auto">
          Thank you, <strong>{name}</strong>. Your {projects.filter(p => p.project_name.trim()).length} project(s) have been recorded.
        </p>
        <div className="mt-8 flex gap-3 justify-center">
          <a href="/" className="px-5 py-2.5 bg-[#E91E63] text-white rounded-lg hover:bg-[#C2185B] transition-colors text-sm font-medium">Dashboard</a>
          <button onClick={() => { setSubmitted(false); setProjects([{ project_name: '', objective: '', success_metric: '', is_cross_fl: false, cross_fl_who: '' }]); }} className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">Submit More</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Project &amp; Objective Submission</h1>
        <p className="text-sm text-gray-500 mt-1">Complete this independently — don&apos;t check with anyone else.</p>
      </div>

      {/* Instructions */}
      <div className="rounded-xl bg-gradient-to-r from-pink-50 to-white border border-pink-100 p-5">
        <div className="flex gap-3">
          <div className="w-8 h-8 bg-[#E91E63] rounded-lg flex items-center justify-center shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-2">How to fill this</p>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>List every project on <strong>your</strong> plate — your work, not your team&apos;s.</li>
              <li>Write the objective in <strong>one sentence</strong> — the outcome, not the activity.</li>
              <li>Add the <strong>success metric</strong> — one number, current &rarr; target.</li>
            </ol>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Identity Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-100">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">About You</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-3 gap-6">
              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Name</label>
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="w-8 h-8 bg-[#E91E63] rounded-full flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-bold">{name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
                    <p className="text-xs text-gray-400 truncate">{userEmail}</p>
                  </div>
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Role</label>
                <div className="flex gap-2">
                  {ROLE_OPTIONS.map(r => (
                    <button key={r} type="button" onClick={() => setRole(r)}
                      className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all border ${
                        role === r
                          ? 'bg-[#E91E63] text-white border-[#E91E63] shadow-sm shadow-pink-200'
                          : 'bg-white text-gray-500 border-gray-200 hover:border-[#E91E63] hover:text-[#E91E63]'
                      }`}>
                      {r}
                    </button>
                  ))}
                  <button type="button" onClick={() => setRole(role === '__custom__' ? '' : '__custom__')}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-all border ${
                      role === '__custom__'
                        ? 'bg-[#E91E63] text-white border-[#E91E63] shadow-sm shadow-pink-200'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-[#E91E63] hover:text-[#E91E63]'
                    }`}>
                    Other
                  </button>
                </div>
                {role === '__custom__' && (
                  <input type="text" value={customRole} onChange={e => setCustomRole(e.target.value)}
                    placeholder="Enter your role" autoFocus
                    className="w-full mt-2 px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E91E63] focus:border-transparent text-sm" />
                )}
              </div>

              {/* Function */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Function</label>
                <select
                  value={func} onChange={e => setFunc(e.target.value)}
                  className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-[#E91E63] focus:border-transparent text-sm ${
                    func ? 'border-[#E91E63] text-gray-900' : 'border-gray-200 text-gray-400'
                  }`}
                >
                  <option value="">Select function...</option>
                  {FUNCTION_OPTIONS.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                  <option value="__custom__">Other...</option>
                </select>
                {func === '__custom__' && (
                  <input type="text" value={customFunc} onChange={e => setCustomFunc(e.target.value)}
                    placeholder="Enter your function" autoFocus
                    className="w-full mt-2 px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E91E63] focus:border-transparent text-sm" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Projects */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Your Projects</h3>
            <span className="text-xs text-gray-400">{projects.length} project{projects.length !== 1 ? 's' : ''}</span>
          </div>

          {projects.map((p, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between bg-gray-50 px-5 py-2.5 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-[#E91E63] rounded-md flex items-center justify-center text-white text-xs font-bold">{i + 1}</span>
                  <span className="text-sm font-medium text-gray-700">{p.project_name || 'Untitled project'}</span>
                </div>
                {projects.length > 1 && (
                  <button type="button" onClick={() => removeRow(i)} className="text-xs text-gray-400 hover:text-red-500 transition-colors">Remove</button>
                )}
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Project Name</label>
                    <input
                      type="text" value={p.project_name} onChange={e => updateRow(i, 'project_name', e.target.value)}
                      placeholder="Plain name everyone uses"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E91E63] focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Success Metric (current &rarr; target)</label>
                    <input
                      type="text" value={p.success_metric} onChange={e => updateRow(i, 'success_metric', e.target.value)}
                      placeholder="e.g. Conversion 5% → 12%"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E91E63] focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Objective (outcome, 1 sentence)</label>
                  <textarea
                    value={p.objective} onChange={e => updateRow(i, 'objective', e.target.value)}
                    placeholder="The outcome this project exists to create — not the activity."
                    rows={2}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E91E63] focus:border-transparent text-sm resize-none"
                  />
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={p.is_cross_fl} onChange={e => updateRow(i, 'is_cross_fl', e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-[#E91E63] focus:ring-[#E91E63]" />
                    <span className="text-xs font-medium text-gray-500">Cross-functional project?</span>
                  </label>
                  {p.is_cross_fl && (
                    <input
                      type="text" value={p.cross_fl_who} onChange={e => updateRow(i, 'cross_fl_who', e.target.value)}
                      placeholder="Who else is involved?"
                      className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E91E63] focus:border-transparent text-xs"
                    />
                  )}
                </div>
              </div>
            </div>
          ))}

          <button type="button" onClick={addRow}
            className="w-full py-4 border-2 border-dashed border-gray-200 text-gray-400 rounded-xl hover:border-[#E91E63] hover:text-[#E91E63] hover:bg-pink-50/50 transition-all text-sm font-medium">
            + Add Another Project
          </button>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pt-2 pb-4">
          <p className="text-xs text-gray-400">All submissions are blind — no one sees your answers until Friday.</p>
          <button
            type="submit" disabled={loading}
            className="px-8 py-3 bg-[#E91E63] text-white rounded-xl hover:bg-[#C2185B] transition-colors font-semibold text-sm disabled:opacity-50 shadow-lg shadow-pink-200 hover:shadow-pink-300"
          >
            {loading ? 'Submitting...' : 'Submit All Projects'}
          </button>
        </div>
      </form>
    </div>
  );
}
