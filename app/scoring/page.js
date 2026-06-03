'use client';

import { useState, useEffect } from 'react';

export default function ScoringPage() {
  const [scores, setScores] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    project_name: '', fl_a_name: '', fl_a_objective: '',
    fl_b_name: '', fl_b_objective: '', score: '', gap_note: '', scored_by: '',
  });

  useEffect(() => {
    fetch('/api/scores').then(r => r.json()).then(setScores);
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
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const updated = await fetch('/api/scores').then(r => r.json());
        setScores(updated);
        setShowForm(false);
        setForm({ project_name: '', fl_a_name: '', fl_a_objective: '', fl_b_name: '', fl_b_objective: '', score: '', gap_note: '', scored_by: '' });
      }
    } finally {
      setLoading(false);
    }
  }

  const green = scores.filter(s => s.score === 'green').length;
  const amber = scores.filter(s => s.score === 'amber').length;
  const red = scores.filter(s => s.score === 'red').length;
  const total = scores.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#102A43]">Alignment Scoring</h1>
          <p className="text-sm text-[#555555] mt-1">Compare cross-FL project objectives — Green / Amber / Red.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-5 py-2.5 bg-[#102A43] text-white rounded-lg hover:bg-[#1F6FB2] transition-colors font-semibold text-sm">
          {showForm ? 'Cancel' : '+ Score a Project'}
        </button>
      </div>

      {/* Scoring Rule */}
      <div className="bg-green-50 border-l-4 border-[#1E7A3C] rounded-r-lg p-4">
        <p className="text-xs font-semibold text-[#1E7A3C] uppercase tracking-wide mb-1">Scoring Rule</p>
        <p className="text-sm text-[#102A43]">
          A &quot;match&quot; = same outcome AND same success metric, in substance (not wording).
          <strong className="text-[#1E7A3C]"> Green</strong> = match,
          <strong className="text-amber-600"> Amber</strong> = partial,
          <strong className="text-[#A32A2A]"> Red</strong> = different.
        </p>
      </div>

      {/* Summary */}
      {total > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Green', sub: 'Match', count: green, color: 'border-[#1E7A3C] bg-green-50', text: 'text-[#1E7A3C]' },
            { label: 'Amber', sub: 'Partial', count: amber, color: 'border-amber-500 bg-amber-50', text: 'text-amber-600' },
            { label: 'Red', sub: 'Different', count: red, color: 'border-[#A32A2A] bg-red-50', text: 'text-[#A32A2A]' },
          ].map(s => (
            <div key={s.label} className={`rounded-lg border-l-4 p-4 ${s.color}`}>
              <p className={`text-2xl font-bold ${s.text}`}>{s.count}</p>
              <p className={`text-sm font-medium ${s.text}`}>{s.label}</p>
              <p className="text-xs text-gray-500">{total > 0 ? Math.round((s.count / total) * 100) : 0}%</p>
            </div>
          ))}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-[#102A43] uppercase tracking-wide">Score a Cross-FL Project</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-[#555555] mb-1">Cross-FL Project Name</label>
              <input type="text" value={form.project_name} onChange={e => update('project_name', e.target.value)}
                placeholder="Project name" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1F6FB2] text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#555555] mb-1">FL A Name</label>
              <input type="text" value={form.fl_a_name} onChange={e => update('fl_a_name', e.target.value)}
                placeholder="Enter name" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1F6FB2] text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#555555] mb-1">FL B Name</label>
              <input type="text" value={form.fl_b_name} onChange={e => update('fl_b_name', e.target.value)}
                placeholder="Enter name" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1F6FB2] text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#555555] mb-1">FL A&apos;s Objective</label>
              <textarea value={form.fl_a_objective} onChange={e => update('fl_a_objective', e.target.value)}
                rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1F6FB2] text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#555555] mb-1">FL B&apos;s Objective</label>
              <textarea value={form.fl_b_objective} onChange={e => update('fl_b_objective', e.target.value)}
                rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1F6FB2] text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#555555] mb-2">Score</label>
            <div className="flex gap-3">
              {[['green', 'Green — Match', 'bg-[#1E7A3C]'], ['amber', 'Amber — Partial', 'bg-amber-500'], ['red', 'Red — Different', 'bg-[#A32A2A]']].map(([val, label, bg]) => (
                <button key={val} type="button" onClick={() => update('score', val)}
                  className={`flex-1 py-2.5 rounded-lg font-semibold text-xs transition-all ${form.score === val ? `${bg} text-white scale-[1.02]` : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#555555] mb-1">Gap Note (optional)</label>
              <textarea value={form.gap_note} onChange={e => update('gap_note', e.target.value)}
                placeholder="What specifically is different?" rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1F6FB2] text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#555555] mb-1">Scored By</label>
              <input type="text" value={form.scored_by} onChange={e => update('scored_by', e.target.value)}
                placeholder="Your name" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1F6FB2] text-sm" />
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={loading} className="px-6 py-2.5 bg-[#102A43] text-white rounded-lg hover:bg-[#1F6FB2] transition-colors font-semibold text-sm disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Score'}
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      {scores.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#102A43] text-white">
                <th className="px-4 py-3 text-left font-semibold text-xs">Project</th>
                <th className="px-4 py-3 text-left font-semibold text-xs">FL A</th>
                <th className="px-4 py-3 text-left font-semibold text-xs">FL B</th>
                <th className="px-4 py-3 text-center font-semibold text-xs">Score</th>
                <th className="px-4 py-3 text-left font-semibold text-xs">Gap</th>
              </tr>
            </thead>
            <tbody>
              {scores.map(s => (
                <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-[#102A43]">{s.project_name}</td>
                  <td className="px-4 py-3 text-[#555555]">
                    <span className="font-medium text-[#102A43]">{s.fl_a_name}</span>
                    {s.fl_a_objective && <p className="text-xs mt-0.5 line-clamp-2">{s.fl_a_objective}</p>}
                  </td>
                  <td className="px-4 py-3 text-[#555555]">
                    <span className="font-medium text-[#102A43]">{s.fl_b_name}</span>
                    {s.fl_b_objective && <p className="text-xs mt-0.5 line-clamp-2">{s.fl_b_objective}</p>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold text-white ${
                      s.score === 'green' ? 'bg-[#1E7A3C]' : s.score === 'amber' ? 'bg-amber-500' : 'bg-[#A32A2A]'
                    }`}>
                      {s.score[0].toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#555555]">{s.gap_note || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
