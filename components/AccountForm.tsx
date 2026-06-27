'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useApp } from '@/lib/context';
import { Account } from '@/lib/types';

const COLORS = ['#1d4ed8', '#16a34a', '#dc2626', '#ea580c', '#0891b2', '#7c3aed', '#0f766e', '#ca8a04'];
const TYPES = ['checking', 'savings', 'credit', 'cash', 'investment'] as const;
const inputCls = "w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";
const labelCls = "block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide";

interface Props { onClose: () => void; existing?: Account; }

export default function AccountForm({ onClose, existing }: Props) {
  const { addAccount, updateAccount } = useApp();
  const [name, setName] = useState(existing?.name ?? '');
  const [type, setType] = useState<Account['type']>(existing?.type ?? 'checking');
  const [balance, setBalance] = useState(existing ? String(existing.balance) : '0');
  const [color, setColor] = useState(existing?.color ?? COLORS[0]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const a: Account = {
      id: existing?.id ?? uuidv4(),
      name, type, balance: parseFloat(balance), color,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };
    existing ? updateAccount(a) : addAccount(a);
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelCls}>Account Name</label>
        <input type="text" required value={name} onChange={e => setName(e.target.value)} className={inputCls} placeholder="e.g. Chase Checking" />
      </div>
      <div>
        <label className={labelCls}>Account Type</label>
        <select value={type} onChange={e => setType(e.target.value as Account['type'])} className={inputCls}>
          {TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>
      </div>
      <div>
        <label className={labelCls}>{existing ? 'Current Balance ($)' : 'Starting Balance ($)'}</label>
        <input type="number" step="0.01" required value={balance} onChange={e => setBalance(e.target.value)} className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Color</label>
        <div className="flex gap-2 flex-wrap mt-1">
          {COLORS.map(c => (
            <button key={c} type="button" onClick={() => setColor(c)}
              className="w-8 h-8 rounded-full transition-all"
              style={{ backgroundColor: c, outline: color === c ? `3px solid ${c}` : '2px solid transparent', outlineOffset: '2px' }} />
          ))}
        </div>
      </div>
      <button type="submit" className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90" style={{ backgroundColor: '#1d4ed8' }}>
        {existing ? 'Update Account' : 'Add Account'}
      </button>
    </form>
  );
}
