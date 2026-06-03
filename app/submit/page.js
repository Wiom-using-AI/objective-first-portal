'use client';

import { useState, useEffect } from 'react';

export default function SubmitPage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [projects, setProjects] = useState([
    { project_name: '', objective: '', success_metric: '', is_cross_fl: false, cross_fl_who: '' },
  ]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [existingSubmissions, setExistingSubmissions] = useState([]);

  useEffect(() => {
    fetch('/api/users').then(r => r.json()).then(setUsers);
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetch(`/api/submissions?userId=${selectedUser}`).then(r => r.json()).then(setExistingSubmissions);
    }
  }, [selectedUser]);

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
    if (!selectedUser) return alert('Please select your name first.');
    const valid = projects.filter(p => p.project_name.trim() && p.objective.trim());
    if (valid.length === 0) return alert('Please add at least one project with a name and objective.');

    setLoading(true);
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: parseInt(selectedUser), projects: valid }),
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="w-16 h-16 bg-[#1E7A3C] rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="text-2xl font-bold text-[#102A43]">Submission Complete</h2>
        <p className="text-[#555555] mt-2">Your projects and objectives have been recorded. Thank you for completing the blind baselining exercise.</p>
        <div className="mt-6 flex gap-4 justify-center">
          <a href="/" className="px-4 py-2 bg-[#102A43] text-white rounded-lg hover:bg-[#1F6FB2] transition-colors">Back to Dashboard</a>
          <button onClick={() => { setSubmitted(false); setProjects([{ project_name: '', objective: '', success_metric: '', is_cross_fl: false, cross_fl_who: '' }]); }} className="px-4 py-2 border border-[#1F6FB2] text-[#1F6FB2] rounded-lg hover:bg-[#EAF1F8] transition-colors">Submit More</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#102A43]">FL Project &amp; Objective Submission</h1>
        <p className="text-[#555555] mt-1">Blind baselining exercise — please complete this independently, without checking with anyone else.</p>
      </div>

      {/* Instructions */}
      <div className="bg-[#EAF1F8] border-l-4 border-[#1F6FB2] rounded-r-xl p-5">
        <p className="text-sm font-semibold text-[#1F6FB2] mb-1">INSTRUCTIONS</p>
        <ol className="text-sm text-[#102A43] space-y-1 list-decimal list-inside">
          <li>List every project/initiative currently on YOUR plate — your own work, not your team&apos;s.</li>
          <li>For each, write the objective in ONE sentence: the outcome it exists to create.</li>
          <li>Add the one number (success metric) that proves it worked or will work.</li>
          <li>Do this alone, without checking with anyone else.</li>
        </ol>
      </div>

      {/* Existing submissions warning */}
      {existingSubmissions.length > 0 && (
        <div className="bg-amber-50 border-l-4 border-amber-500 rounded-r-xl p-4">
          <p className="text-sm font-semibold text-amber-700">You have already submitted {existingSubmissions.length} project(s). New submissions will be added alongside existing ones.</p>
        </div>
      )}

      {/* User selection */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <label className="block text-sm font-semibold text-[#102A43] mb-2">Who are you?</label>
        <select
          value={selectedUser}
          onChange={e => setSelectedUser(e.target.value)}
          className="w-full max-w-sm px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1F6FB2] focus:border-transparent"
        >
          <option value="">Select your name...</option>
          {users.map(u => (
            <option key={u.id} value={u.id}>{u.name} — {u.role} ({u.department})</option>
          ))}
        </select>
      </div>

      {/* Project rows */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {projects.map((p, i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[#102A43]">Project {i + 1}</h3>
              {projects.length > 1 && (
                <button type="button" onClick={() => removeRow(i)} className="text-sm text-[#A32A2A] hover:underline">Remove</button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#555555] mb-1">Project Name</label>
                <input
                  type="text" value={p.project_name} onChange={e => updateRow(i, 'project_name', e.target.value)}
                  placeholder="Plain name everyone uses for it"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1F6FB2] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#555555] mb-1">Success Metric (current &rarr; target)</label>
                <input
                  type="text" value={p.success_metric} onChange={e => updateRow(i, 'success_metric', e.target.value)}
                  placeholder="e.g. Conversion rate 5% → 12%"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1F6FB2] focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#555555] mb-1">Objective (outcome, 1 sentence)</label>
              <textarea
                value={p.objective} onChange={e => updateRow(i, 'objective', e.target.value)}
                placeholder="The outcome this project exists to create — not the activity."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1F6FB2] focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-[#555555]">
                <input type="checkbox" checked={p.is_cross_fl} onChange={e => updateRow(i, 'is_cross_fl', e.target.checked)} className="rounded border-gray-300 text-[#1F6FB2] focus:ring-[#1F6FB2]" />
                Cross-FL project?
              </label>
              {p.is_cross_fl && (
                <input
                  type="text" value={p.cross_fl_who} onChange={e => updateRow(i, 'cross_fl_who', e.target.value)}
                  placeholder="Who else is involved?"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1F6FB2] focus:border-transparent text-sm"
                />
              )}
            </div>
          </div>
        ))}

        <div className="flex items-center justify-between">
          <button type="button" onClick={addRow} className="px-4 py-2 border-2 border-dashed border-[#1F6FB2] text-[#1F6FB2] rounded-lg hover:bg-[#EAF1F8] transition-colors font-medium">
            + Add Another Project
          </button>
          <button
            type="submit" disabled={loading}
            className="px-8 py-3 bg-[#102A43] text-white rounded-lg hover:bg-[#1F6FB2] transition-colors font-semibold disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit All Projects'}
          </button>
        </div>
      </form>
    </div>
  );
}
