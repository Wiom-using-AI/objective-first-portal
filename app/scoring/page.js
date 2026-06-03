'use client';

import { useState, useEffect } from 'react';

export default function ScoringPage() {
  const [scores, setScores] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    project_name: '', fl_a_name: '', fl_a_objective: '',
    fl_b_name: '', fl_b_objective: '', score: '', gap_note: '', scored_by_id: '',
  });

  useEffect(() => {
    fetch('/api/scores').then(r => r.json()).then(setScores);
    fetch('/api/users').then(r => r.json()).then(setUsers);
  }, []);

  function update(field, value) {
    setForm({ ...form, [field]: value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.project_name || !form.score) return alert('Project name and score are required.');
    setLoading(true);
    try {
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          scored_by_id: form.scored_by_id ? parseInt(form.scored_by_id) : null,
        }),
      });
      if (res.ok) {
        const updated = await fetch('/api/scores').then(r => r.json());
        setScores(updated);
        setShowForm(false);
        setForm({ project_name: '', fl_a_name: '', fl_a_objective: '', fl_b_name: '', fl_b_objective: '', score: '', gap_note: '', scored_by_id: '' });
      }
    } finally {
      setLoading(false);
    }
  }

  const greenCount = scores.filter(s => s.score === 'green').length;
  const amberCount = scores.filter(s => s.score === 'amber').length;
  const redCount = scores.filter(s => s.score === 'red').length;
  const total = scores.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#102A43]">Alignment Scoring</h1>
          <p className="text-[#555555] mt-1">Compare cross-FL project objectives — score Green / Amber / Red.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-6 py-3 bg-[#102A43] text-white rounded-lg hover:bg-[#1F6FB2] transition-colors font-semibold">
          {showForm ? 'Cancel' : '+ Score a Project'}
        </button>
      </div>

      {/* Scoring Rule */}
      <div className="bg-green-50 border-l-4 border-[#1E7A3C] rounded-r-xl p-5">
        <p className="text-sm font-semibold text-[#1E7A3C] mb-1">SCORING RULE</p>
        <p className="text-sm text-[#102A43]">
          A &quot;match&quot; = same outcome AND same success metric, in substance (not wording).
          Score each pair <strong className="text-[#1E7A3C]">Green</strong> (match) /
          <strong className="text-amber-600"> Amber</strong> (partial — same outcome, different metric, or vice versa) /
          <strong className="text-[#A32A2A]"> Red</strong> (different).
        </p>
      </div>

      {/* Summary */}
      {total > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-[#1E7A3C]">{greenCount}</p>
            <p className="text-sm text-[#1E7A3C] font-medium">Green (match)</p>
            <p className="text-xs text-gray-500">{total > 0 ? Math.round((greenCount / total) * 100) : 0}%</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-amber-600">{amberCount}</p>
            <p className="text-sm text-amber-600 font-medium">Amber (partial)</p>
            <p className="text-xs text-gray-500">{total > 0 ? Math.round((amberCount / total) * 100) : 0}%</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-[#A32A2A]">{redCount}</p>
            <p className="text-sm text-[#A32A2A] font-medium">Red (different)</p>
            <p className="text-xs text-gray-500">{total > 0 ? Math.round((redCount / total) * 100) : 0}%</p>
          </div>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 space-y-4">
          <h3 className="font-bold text-[#102A43] text-lg">Score a Cross-FL Project</h3>
          <div>
            <label className="block text-sm font-medium text-[#555555] mb-1">Cross-FL Project Name</label>
            <input type="text" value={form.project_name} onChange={e => update('project_name', e.target.value)}
              placeholder="Project name" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1F6FB2]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#555555] mb-1">FL A Name</label>
              <input type="text" value={form.fl_a_name} onChange={e => update('fl_a_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1F6FB2]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#555555] mb-1">FL B Name</label>
              <input type="text" value={form.fl_b_name} onChange={e => update('fl_b_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1F6FB2]" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#555555] mb-1">FL A&apos;s Objective</label>
              <textarea value={form.fl_a_objective} onChange={e => update('fl_a_objective', e.target.value)}
                rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1F6FB2]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#555555] mb-1">FL B&apos;s Objective</label>
              <textarea value={form.fl_b_objective} onChange={e => update('fl_b_objective', e.target.value)}
                rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1F6FB2]" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#555555] mb-2">Score</label>
            <div className="flex gap-3">
              {[['green', 'Green — Match', 'bg-[#1E7A3C]'], ['amber', 'Amber — Partial', 'bg-amber-500'], ['red', 'Red — Different', 'bg-[#A32A2A]']].map(([val, label, bg]) => (
                <button key={val} type="button" onClick={() => update('score', val)}
                  className={`flex-1 py-3 rounded-lg font-semibold text-sm transition-all ${form.score === val ? `${bg} text-white shadow-lg scale-105` : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#555555] mb-1">Gap Note (optional)</label>
            <textarea value={form.gap_note} onChange={e => update('gap_note', e.target.value)}
              placeholder="What specifically is different?" rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1F6FB2]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#555555] mb-1">Scored By</label>
            <select value={form.scored_by_id} onChange={e => update('scored_by_id', e.target.value)}
              className="w-full max-w-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1F6FB2]">
              <option value="">Select...</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={loading} className="px-8 py-3 bg-[#102A43] text-white rounded-lg hover:bg-[#1F6FB2] transition-colors font-semibold disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Score'}
            </button>
          </div>
        </form>
      )}

      {/* Scores Table */}
      {scores.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#1F6FB2] text-white">
                <th className="px-4 py-3 text-left text-sm font-semibold">Cross-FL Project</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">FL A Objective</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">FL B Objective</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">G / A / R</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Gap Note</th>
              </tr>
            </thead>
            <tbody>
              {scores.map(s => (
                <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-[#102A43] text-sm">{s.project_name}</td>
                  <td className="px-4 py-3 text-sm text-[#555555]">
                    <span className="font-medium">{s.fl_a_name}:</span> {s.fl_a_objective}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#555555]">
                    <span className="font-medium">{s.fl_b_name}:</span> {s.fl_b_objective}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block w-8 h-8 rounded-full text-white text-xs font-bold flex items-center justify-center ${
                      s.score === 'green' ? 'bg-[#1E7A3C]' : s.score === 'amber' ? 'bg-amber-500' : 'bg-[#A32A2A]'
                    }`}>
                      {s.score[0].toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#555555]">{s.gap_note || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center text-[#555555]">
          No alignment scores yet. Click &quot;Score a Project&quot; to start.
        </div>
      )}
    </div>
  );
}
