'use client';

import { useApp } from '@/lib/context';

export default function Toast() {
  const { postedCount } = useApp();
  if (postedCount === 0) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-[60] animate-[fadeIn_0.2s_ease-out]">
      <div className="flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium"
        style={{ backgroundColor: '#16a34a' }}>
        <span className="text-lg">🔄</span>
        {postedCount} recurring {postedCount === 1 ? 'charge' : 'charges'} posted automatically
      </div>
    </div>
  );
}
