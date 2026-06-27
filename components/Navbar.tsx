'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Dashboard', icon: '⊞' },
  { href: '/transactions', label: 'Transactions', icon: '↕' },
  { href: '/budgets', label: 'Budgets', icon: '◎' },
  { href: '/accounts', label: 'Accounts', icon: '▣' },
];

export default function Navbar() {
  const path = usePathname();

  return (
    <>
      <header style={{ backgroundColor: '#1a1d27', borderBottom: '1px solid #2a2d3e' }} className="sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div style={{ backgroundColor: '#6366f1' }} className="w-7 h-7 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">B</span>
            </div>
            <span className="font-semibold text-white tracking-tight">BudgetTracker</span>
          </div>

          <nav className="hidden sm:flex items-center gap-1">
            {links.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  path === l.href
                    ? 'text-white'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
                style={path === l.href ? { backgroundColor: '#6366f120', color: '#818cf8' } : {}}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav style={{ backgroundColor: '#1a1d27', borderTop: '1px solid #2a2d3e' }} className="sm:hidden fixed bottom-0 left-0 right-0 z-50 flex">
        {links.map(l => (
          <Link
            key={l.href}
            href={l.href}
            className={`flex-1 flex flex-col items-center py-3 text-xs font-medium transition-colors gap-1 ${
              path === l.href ? 'text-indigo-400' : 'text-slate-500'
            }`}
          >
            <span className="text-base leading-none">{l.icon}</span>
            {l.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
