'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Dashboard' },
  { href: '/transactions', label: 'Transactions' },
  { href: '/budgets', label: 'Budgets' },
  { href: '/accounts', label: 'Accounts' },
  { href: '/recurring', label: 'Recurring' },
];

export default function Navbar() {
  const path = usePathname();

  return (
    <>
      <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }} className="sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div style={{ backgroundColor: '#1d4ed8' }} className="w-8 h-8 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">B</span>
              </div>
              <div>
                <span style={{ color: '#0f172a' }} className="font-bold text-base tracking-tight">BudgetTracker</span>
                <span style={{ color: '#94a3b8', fontSize: '11px' }} className="ml-2 hidden sm:inline">Personal Finance</span>
              </div>
            </div>
            <nav className="hidden sm:flex items-center gap-0.5">
              {links.map(l => (
                <Link key={l.href} href={l.href}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={path === l.href
                    ? { backgroundColor: '#eff6ff', color: '#1d4ed8' }
                    : { color: '#64748b' }
                  }>
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <nav style={{ backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0' }} className="sm:hidden fixed bottom-0 left-0 right-0 z-50 flex">
        {links.map(l => (
          <Link key={l.href} href={l.href}
            className="flex-1 flex flex-col items-center py-2.5 text-xs font-medium transition-colors gap-0.5"
            style={path === l.href ? { color: '#1d4ed8' } : { color: '#94a3b8' }}>
            {l.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
