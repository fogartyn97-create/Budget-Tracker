'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Dashboard', icon: '📊' },
  { href: '/transactions', label: 'Transactions', icon: '💳' },
  { href: '/budgets', label: 'Budgets', icon: '🎯' },
  { href: '/accounts', label: 'Accounts', icon: '🏦' },
];

export default function Navbar() {
  const path = usePathname();

  return (
    <>
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-bold text-lg text-indigo-600">💰 BudgetTracker</span>
          <nav className="hidden sm:flex gap-1">
            {links.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  path === l.href
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {l.icon} {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Bottom mobile nav */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 flex">
        {links.map(l => (
          <Link
            key={l.href}
            href={l.href}
            className={`flex-1 flex flex-col items-center py-2 text-xs transition-colors ${
              path === l.href ? 'text-indigo-600' : 'text-gray-500'
            }`}
          >
            <span className="text-xl">{l.icon}</span>
            {l.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
