'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useApp } from '@/lib/context';
import { Account } from '@/lib/types';

const COLORS = ['#6366f1', '#22c55e', '#f97316', '#ef4444', '#3b82f6', '#a855f7', '#14b8a6', '#eab308'];
const TYPES = ['checking', 'savings', 'credit', 'cash', 'investment'] as const;

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
      name,
      type,
      balance: parseFloat(balance),
      color,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };
    existing ? updateAccount(a) : addAccount(a);
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
        <input
          type="text"
          required
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="e.g. Chase Checking"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
        <select
          value={type}
          onChange={e => setType(e.target.value as Account['type'])}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          {TYPES.map(t => (
            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {existing ? 'Current Balance ($)' : 'Starting Balance ($)'}
        </label>
        <input
          type="number"
          step="0.01"
          required
          value={balance}
          onChange={e => setBalance(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
        <div className="flex gap-2 flex-wrap">
          {COLORS.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${color === c ? 'border-gray-800 scale-110' : 'border-transparent'}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors"
      >
        {existing ? 'Update Account' : 'Add Account'}
      </button>
    </form>
  );
}
