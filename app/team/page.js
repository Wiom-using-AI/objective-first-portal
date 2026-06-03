'use client';

import { useState, useEffect } from 'react';

export default function TeamPage() {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', role: 'team_member', department: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/users').then(r => r.json()).then(setUsers);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return alert('Name is required.');
    setLoading(true);
    try {
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const updated = await fetch('/api/users').then(r => r.json());
      setUsers(updated);
      setForm({ name: '', role: 'team_member', department: '' });
      setShowForm(false);
    } finally {
      setLoading(false);
    }
  }

  const roleLabels = { founder: 'Founder', function_head: 'Function Head', fl: 'FL', team_member: 'Team Member' };
  const roleBadge = { founder: 'bg-purple-100 text-purple-700', function_head: 'bg-blue-100 text-[#1F6FB2]', fl: 'bg-blue-100 text-[#1F6FB2]', team_member: 'bg-gray-100 text-gray-600' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#102A43]">Team</h1>
          <p className="text-[#555555] mt-1">Manage the people who participate in the Objective First process.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-6 py-3 bg-[#102A43] text-white rounded-lg hover:bg-[#1F6FB2] transition-colors font-semibold">
          {showForm ? 'Cancel' : '+ Add Person'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#555555] mb-1">Name</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Full name" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1F6FB2]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#555555] mb-1">Role</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1F6FB2]">
                <option value="founder">Founder</option>
                <option value="function_head">Function Head</option>
                <option value="fl">FL (Functional Lead)</option>
                <option value="team_member">Team Member</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#555555] mb-1">Department</label>
              <input type="text" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}
                placeholder="e.g. Product, Engineering" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1F6FB2]" />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={loading} className="px-6 py-2 bg-[#102A43] text-white rounded-lg hover:bg-[#1F6FB2] transition-colors font-semibold disabled:opacity-50">
              {loading ? 'Adding...' : 'Add Person'}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map(u => (
          <div key={u.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#102A43] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <h3 className="font-semibold text-[#102A43]">{u.name}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleBadge[u.role] || roleBadge.team_member}`}>
                    {roleLabels[u.role] || u.role}
                  </span>
                  {u.department && <span className="text-xs text-gray-400">{u.department}</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
