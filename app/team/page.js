'use client';

import { useState, useEffect } from 'react';

export default function TeamPage() {
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    fetch('/api/submissions').then(r => r.json()).then(data => {
      // Group by submitter
      const grouped = {};
      for (const s of data) {
        if (!grouped[s.submitter_name]) {
          grouped[s.submitter_name] = { name: s.submitter_name, function: s.submitter_function, projects: [] };
        }
        grouped[s.submitter_name].projects.push(s);
      }
      setSubmissions(Object.values(grouped));
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[gray-900]">Team Submissions</h1>
        <p className="text-sm text-[gray-500] mt-1">Everyone who has submitted their projects and objectives.</p>
      </div>

      {submissions.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <h3 className="text-base font-semibold text-[gray-900]">No Submissions Yet</h3>
          <p className="text-sm text-gray-500 mt-1">Once Functional Heads submit on the <a href="/submit" className="text-[#E91E63] underline">submission page</a>, they will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((person, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-[gray-900] rounded-full flex items-center justify-center text-white font-semibold text-xs">
                  {person.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <span className="font-semibold text-sm text-[gray-900]">{person.name}</span>
                  {person.function && (
                    <span className="ml-2 text-xs bg-[pink-50] text-[#E91E63] px-2 py-0.5 rounded">{person.function}</span>
                  )}
                </div>
                <span className="ml-auto text-xs text-gray-400">{person.projects.length} project{person.projects.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="space-y-2">
                {person.projects.map(p => (
                  <div key={p.id} className="bg-gray-50 rounded px-3 py-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[gray-900]">{p.project_name}</span>
                      {p.is_cross_fl === 1 && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">Cross-functional</span>}
                    </div>
                    <p className="text-xs text-[gray-500] mt-0.5">{p.objective}</p>
                    {p.success_metric && <p className="text-xs text-[#E91E63] mt-0.5">{p.success_metric}</p>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
