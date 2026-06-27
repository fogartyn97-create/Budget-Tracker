'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useApp } from '@/lib/context';
import { Account } from '@/lib/types';

const COLORS = ['#6366f1', '#22c55e', '#f97316', '#ef4444', '#3b82f6', '#a855f7', '#14b8a6', '#eab308'];
const TYPES = ['checking', 'savings', 'credit', 'cash', 'investment'] as const;

const inputClass = "w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all";
const inputStyle = { backgroundColor: '#0f1117', border: '1px solid #2a2d3e' };
const labelClass = "block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide";

interface Props {
  onClose: () => void;
  existing?: Account;
}

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
        <label className={labelClass}>Account Name</label>
        <input type="text" required value={name} onChange={e => setName(e.target.value)}
          className={inputClass} style={inputStyle} placeholder="e.g. Chase Checking" />
      </div>

      <div>
        <label className={labelClass}>Account Type</label>
        <select value={type} onChange={e => setType(e.target.value as Account['type'])}
          className={inputClass} style={{ ...inputStyle, appearance: 'none' }}>
          {TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>
      </div>

      <div>
        <label className={labelClass}>{existing ? 'Current Balance ($)' : 'Starting Balance ($)'}</label>
        <input type="number" step="0.01" required value={balance} onChange={e => setBalance(e.target.value)}
          className={inputClass} style={inputStyle} />
      </div>

      <div>
        <label className={labelClass}>Color</label>
        <div className="flex gap-2 flex-wrap mt-1">
          {COLORS.map(c => (
            <button key={c} type="button" onClick={() => setColor(c)}
              className="w-8 h-8 rounded-full transition-all"
              style={{ backgroundColor: c, outline: color === c ? `2px solid ${c}` : 'none', outlineOffset: '2px', opacity: color === c ? 1 : 0.5 }} />
          ))}
        </div>
      </div>

      <button type="submit"
        className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 mt-2"
        style={{ backgroundColor: '#6366f1' }}>
        {existing ? 'Update Account' : 'Add Account'}
      </button>
    </form>
  );
}
