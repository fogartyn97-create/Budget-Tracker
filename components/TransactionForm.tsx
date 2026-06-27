'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useApp } from '@/lib/context';
import { Transaction } from '@/lib/types';
import { format } from 'date-fns';

interface Props {
  onClose: () => void;
  existing?: Transaction;
}

const inputClass = "w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all";
const inputStyle = { backgroundColor: '#0f1117', border: '1px solid #2a2d3e' };
const labelClass = "block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide";

export default function TransactionForm({ onClose, existing }: Props) {
  const { accounts, categories, addTransaction, updateTransaction } = useApp();
  const [type, setType] = useState<'income' | 'expense'>(existing?.type ?? 'expense');
  const [amount, setAmount] = useState(existing ? String(existing.amount) : '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [date, setDate] = useState(existing?.date ?? format(new Date(), 'yyyy-MM-dd'));
  const [accountId, setAccountId] = useState(existing?.accountId ?? accounts[0]?.id ?? '');
  const [categoryId, setCategoryId] = useState(existing?.categoryId ?? '');

  const filteredCategories = categories.filter(c => c.type === type);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const t: Transaction = {
      id: existing?.id ?? uuidv4(),
      accountId, categoryId,
      amount: parseFloat(amount),
      type, description, date,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };
    existing ? updateTransaction(t) : addTransaction(t);
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div style={{ backgroundColor: '#0f1117', border: '1px solid #2a2d3e' }} className="flex rounded-xl overflow-hidden">
        {(['expense', 'income'] as const).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => { setType(t); setCategoryId(''); }}
            className="flex-1 py-2.5 text-sm font-medium transition-all"
            style={type === t
              ? { backgroundColor: t === 'expense' ? '#ef444420' : '#22c55e20', color: t === 'expense' ? '#ef4444' : '#22c55e' }
              : { color: '#475569' }
            }
          >
            {t === 'expense' ? '↑ Expense' : '↓ Income'}
          </button>
        ))}
      </div>

      <div>
        <label className={labelClass}>Amount ($)</label>
        <input type="number" min="0.01" step="0.01" required value={amount}
          onChange={e => setAmount(e.target.value)}
          className={inputClass} style={inputStyle} placeholder="0.00" />
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <input type="text" required value={description}
          onChange={e => setDescription(e.target.value)}
          className={inputClass} style={inputStyle} placeholder="What was this for?" />
      </div>

      <div>
        <label className={labelClass}>Account</label>
        <select required value={accountId} onChange={e => setAccountId(e.target.value)}
          className={inputClass} style={{ ...inputStyle, appearance: 'none' }}>
          <option value="">Select account</option>
          {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </div>

      <div>
        <label className={labelClass}>Category</label>
        <select required value={categoryId} onChange={e => setCategoryId(e.target.value)}
          className={inputClass} style={{ ...inputStyle, appearance: 'none' }}>
          <option value="">Select category</option>
          {filteredCategories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
      </div>

      <div>
        <label className={labelClass}>Date</label>
        <input type="date" required value={date} onChange={e => setDate(e.target.value)}
          className={inputClass} style={inputStyle} />
      </div>

      <button type="submit"
        className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 mt-2"
        style={{ backgroundColor: '#6366f1' }}>
        {existing ? 'Update Transaction' : 'Add Transaction'}
      </button>
    </form>
  );
}
