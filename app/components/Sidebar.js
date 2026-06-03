'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: DashboardIcon },
  { href: '/submit', label: 'Submit Projects', icon: SubmitIcon },
  { href: '/projects', label: 'Objective Library', icon: LibraryIcon },
  { href: '/scoring', label: 'Alignment Scoring', icon: ScoringIcon },
  { href: '/team', label: 'Team', icon: TeamIcon },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside className={`fixed top-0 left-0 h-screen bg-[#1A1A2E] text-white flex flex-col transition-all duration-300 z-40 ${collapsed ? 'w-16' : 'w-60'}`}>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-16 border-b border-white/10 shrink-0">
        <div className="w-8 h-8 bg-[#E91E63] rounded-lg flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-xs">OF</span>
        </div>
        {!collapsed && <span className="font-semibold text-sm whitespace-nowrap">Objective First</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 space-y-0.5 px-2 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <a
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-[#E91E63] text-white font-semibold'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className="w-[18px] h-[18px] shrink-0" />
              {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
            </a>
          );
        })}
      </nav>

      {/* Collapse */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-11 border-t border-white/10 text-white/40 hover:text-white hover:bg-white/5 transition-colors shrink-0"
      >
        <svg className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
      </button>
    </aside>
  );
}

function DashboardIcon({ className }) {
  return (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>);
}
function SubmitIcon({ className }) {
  return (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>);
}
function LibraryIcon({ className }) {
  return (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>);
}
function ScoringIcon({ className }) {
  return (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>);
}
function TeamIcon({ className }) {
  return (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>);
}
