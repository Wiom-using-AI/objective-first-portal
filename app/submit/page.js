'use client';

import { useState } from 'react';

const FUNCTION_OPTIONS = ['GTM', 'Product', 'Technology', "Founder's Office", 'Founders', 'Operations', 'Finance', 'HR'];

export default function SubmitPage() {
  const [name, setName] = useState('');
  const [func, setFunc] = useState('');
  const [customFunc, setCustomFunc] = useState('');
  const [projects, setProjects] = useState([
    { project_name: '', objective: '', success_metric: '', is_cross_fl: false, cross_fl_who: '' },
  ]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const selectedFunction = func === '__custom__' ? customFunc : func;

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
    if (!name.trim()) return alert('Please enter your name.');
    if (!selectedFunction.trim()) return alert('Please select or enter your function.');
    const valid = projects.filter(p => p.project_name.trim() && p.objective.trim());
    if (valid.length === 0) return alert('Please add at least one project with a name and objective.');

    setLoading(true);
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), function: selectedFunction.trim(), projects: valid }),
      });
      if (res.ok) setSubmitted(true);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="w-16 h-16 bg-[#E91E63] rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Submission Complete</h2>
        <p className="text-gray-500 mt-2 max-w-md mx-auto">
          Thank you, <strong>{name}</strong>. Your {projects.filter(p => p.project_name.trim()).length} project(s) have been recorded for the blind baselining exercise.
        </p>
        <div className="mt-6 flex gap-4 justify-center">
          <a href="/" className="px-4 py-2 bg-[#E91E63] text-white rounded-lg hover:bg-[#C2185B] transition-colors">Back to Dashboard</a>
          <button onClick={() => { setSubmitted(false); setProjects([{ project_name: '', objective: '', success_metric: '', is_cross_fl: false, cross_fl_who: '' }]); }} className="px-4 py-2 border border-[#E91E63] text-[#E91E63] rounded-lg hover:bg-pink-50 transition-colors">Submit More</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Project &amp; Objective Submission</h1>
        <p className="text-sm text-gray-500 mt-1">Blind baselining — complete this independently, without checking with anyone else.</p>
      </div>

      {/* Instructions */}
      <div className="bg-pink-50 border-l-4 border-[#E91E63] rounded-r-lg p-4">
        <p className="text-xs font-semibold text-[#E91E63] uppercase tracking-wide mb-1">Instructions</p>
        <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
          <li>List every project/initiative currently on <strong>your</strong> plate — your own work, not your team&apos;s.</li>
          <li>For each, write the objective in <strong>one sentence</strong>: the outcome it exists to create.</li>
          <li>Add the <strong>success metric</strong> — the one number that proves it worked (current &rarr; target).</li>
          <li>Do this <strong>alone</strong>, without checking with anyone else.</li>
        </ol>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Identity */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">About You</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Your Name</label>
              <input
                type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E91E63] focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Function</label>
              <select
                value={func} onChange={e => setFunc(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E91E63] focus:border-transparent text-sm"
              >
                <option value="">Select your function...</option>
                {FUNCTION_OPTIONS.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
                <option value="__custom__">Other (type below)</option>
              </select>
              {func === '__custom__' && (
                <input
                  type="text" value={customFunc} onChange={e => setCustomFunc(e.target.value)}
                  placeholder="Enter your function"
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E91E63] focus:border-transparent text-sm"
                />
              )}
            </div>
          </div>
        </div>

        {/* Project rows */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-[gray-900] uppercase tracking-wide">Your Projects</h3>

          {projects.map((p, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#E91E63] uppercase tracking-wide">Project {i + 1}</span>
                {projects.length > 1 && (
                  <button type="button" onClick={() => removeRow(i)} className="text-xs text-[#A32A2A] hover:underline">Remove</button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[gray-500] mb-1">Project Name</label>
                  <input
                    type="text" value={p.project_name} onChange={e => updateRow(i, 'project_name', e.target.value)}
                    placeholder="Plain name everyone uses"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E91E63] focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Success Metric (current &rarr; target)</label>
                  <input
                    type="text" value={p.success_metric} onChange={e => updateRow(i, 'success_metric', e.target.value)}
                    placeholder="e.g. Conversion 5% &rarr; 12%"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E91E63] focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[gray-500] mb-1">Objective (outcome, 1 sentence)</label>
                <textarea
                  value={p.objective} onChange={e => updateRow(i, 'objective', e.target.value)}
                  placeholder="The outcome this project exists to create — not the activity."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E91E63] focus:border-transparent text-sm"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-[gray-500]">
                  <input type="checkbox" checked={p.is_cross_fl} onChange={e => updateRow(i, 'is_cross_fl', e.target.checked)} className="rounded border-gray-300 text-[#E91E63] focus:ring-[#E91E63]" />
                  <span className="text-xs">Cross-functional project?</span>
                </label>
                {p.is_cross_fl && (
                  <input
                    type="text" value={p.cross_fl_who} onChange={e => updateRow(i, 'cross_fl_who', e.target.value)}
                    placeholder="Who else is involved?"
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E91E63] focus:border-transparent text-xs"
                  />
                )}
              </div>
            </div>
          ))}

          <button type="button" onClick={addRow} className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg hover:border-[#E91E63] hover:text-[#E91E63] transition-colors text-sm font-medium">
            + Add Another Project
          </button>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit" disabled={loading}
            className="px-8 py-3 bg-[#E91E63] text-white rounded-lg hover:bg-[#C2185B] transition-colors font-semibold text-sm disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit All Projects'}
          </button>
        </div>
      </form>
    </div>
  );
}
