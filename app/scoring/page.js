'use client';

import { useState, useEffect } from 'react';

export default function ScoringPage() {
  const [data, setData] = useState({ pairs: [], totalScored: 0, totalUnscored: 0 });
  const [scoring, setScoring] = useState(false);
  const [scoreResult, setScoreResult] = useState(null);

  function load() {
    fetch('/api/autoscore').then(r => r.json()).then(setData);
  }

  useEffect(() => { load(); }, []);

  async function runAutoScore() {
    setScoring(true);
    setScoreResult(null);
    try {
      const res = await fetch('/api/autoscore', { method: 'POST' });
      const result = await res.json();
      setScoreResult(result);
      load(); // refresh
    } catch (err) {
      setScoreResult({ error: err.message });
    } finally {
      setScoring(false);
    }
  }

  const scored = data.pairs.filter(p => p.score);
  const unscored = data.pairs.filter(p => !p.score);
  const green = scored.filter(p => p.score?.score === 'green').length;
  const amber = scored.filter(p => p.score?.score === 'amber').length;
  const red = scored.filter(p => p.score?.score === 'red').length;
  const total = scored.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alignment Scoring</h1>
          <p className="text-sm text-gray-500 mt-1">
            Auto-detected cross-FL project pairs — scored by AI for objective alignment.
          </p>
        </div>
        {unscored.length > 0 && (
          <button onClick={runAutoScore} disabled={scoring}
            className="px-5 py-2.5 bg-[#E91E63] text-white rounded-lg hover:bg-[#C2185B] transition-colors font-semibold text-sm disabled:opacity-50">
            {scoring ? 'Scoring...' : `Score ${unscored.length} Unscored Pair${unscored.length !== 1 ? 's' : ''}`}
          </button>
        )}
      </div>

      {/* Scoring Rule */}
      <div className="bg-pink-50 border-l-4 border-[#E91E63] rounded-r-lg p-4">
        <p className="text-xs font-semibold text-[#E91E63] uppercase tracking-wide mb-1">How It Works</p>
        <p className="text-sm text-gray-700">
          When two or more FLs submit the same project name, the system automatically detects the overlap and uses AI to compare their objectives.
          <strong className="text-[#1E7A3C]"> Green</strong> = same outcome &amp; metric,
          <strong className="text-amber-600"> Amber</strong> = partial match,
          <strong className="text-[#C62828]"> Red</strong> = different objectives.
        </p>
      </div>

      {/* Score result toast */}
      {scoreResult && (
        <div className={`rounded-lg p-4 text-sm ${scoreResult.error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {scoreResult.error
            ? `Error: ${scoreResult.error}`
            : `Scored ${scoreResult.scored} pair${scoreResult.scored !== 1 ? 's' : ''} successfully.`}
        </div>
      )}

      {/* Summary */}
      {total > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Green', sub: 'Match', count: green, border: 'border-[#1E7A3C]', bg: 'bg-green-50', text: 'text-[#1E7A3C]' },
            { label: 'Amber', sub: 'Partial', count: amber, border: 'border-amber-500', bg: 'bg-amber-50', text: 'text-amber-600' },
            { label: 'Red', sub: 'Different', count: red, border: 'border-[#C62828]', bg: 'bg-red-50', text: 'text-[#C62828]' },
          ].map(s => (
            <div key={s.label} className={`rounded-lg border-l-4 p-4 ${s.border} ${s.bg}`}>
              <p className={`text-2xl font-bold ${s.text}`}>{s.count}</p>
              <p className={`text-sm font-medium ${s.text}`}>{s.label} <span className="font-normal text-gray-500">({s.sub})</span></p>
              <p className="text-xs text-gray-400">{total > 0 ? Math.round((s.count / total) * 100) : 0}%</p>
            </div>
          ))}
        </div>
      )}

      {/* No pairs */}
      {data.pairs.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <h3 className="text-base font-semibold text-gray-900">No Cross-FL Pairs Detected</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
            When two or more FLs submit the same project name on the <a href="/submit" className="text-[#E91E63] underline">submission page</a>,
            their objectives will be compared here automatically.
          </p>
        </div>
      )}

      {/* Scored pairs */}
      {scored.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Scored Pairs</h2>
          {scored.map((p, i) => (
            <PairCard key={i} pair={p} />
          ))}
        </div>
      )}

      {/* Unscored pairs */}
      {unscored.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Awaiting Scoring ({unscored.length})</h2>
          {unscored.map((p, i) => (
            <PairCard key={i} pair={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function PairCard({ pair }) {
  const s = pair.score;
  const scoreColor = s ? {
    green: 'bg-[#1E7A3C]', amber: 'bg-amber-500', red: 'bg-[#C62828]',
  }[s.score] : 'bg-gray-300';
  const scoreLabel = s ? s.score.charAt(0).toUpperCase() + s.score.slice(1) : 'Pending';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">{pair.project_name}</h3>
          {pair.fuzzy && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">fuzzy match</span>}
        </div>
        <span className={`text-xs px-3 py-1 rounded-full text-white font-bold ${scoreColor}`}>
          {scoreLabel}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-gray-900">{pair.fl_a.name}</span>
            {pair.fl_a.function && <span className="text-xs bg-pink-100 text-[#E91E63] px-2 py-0.5 rounded">{pair.fl_a.function}</span>}
          </div>
          <p className="text-sm text-gray-700">{pair.fl_a.objective}</p>
          {pair.fl_a.metric && <p className="text-xs text-[#E91E63] mt-1">{pair.fl_a.metric}</p>}
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-gray-900">{pair.fl_b.name}</span>
            {pair.fl_b.function && <span className="text-xs bg-pink-100 text-[#E91E63] px-2 py-0.5 rounded">{pair.fl_b.function}</span>}
          </div>
          <p className="text-sm text-gray-700">{pair.fl_b.objective}</p>
          {pair.fl_b.metric && <p className="text-xs text-[#E91E63] mt-1">{pair.fl_b.metric}</p>}
        </div>
      </div>

      {s?.rationale && (
        <p className="text-xs text-gray-500 mt-3 bg-gray-50 rounded px-3 py-2 italic">{s.rationale}</p>
      )}
    </div>
  );
}
