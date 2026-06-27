'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useApp } from '@/lib/context';
import { Budget } from '@/lib/types';
import { format } from 'date-fns';

const inputClass = "w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all";
const inputStyle = { backgroundColor: '#0f1117', border: '1px solid #2a2d3e' };
const labelClass = "block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide";

interface Props {
  onClose: () => void;
  existing?: Budget;
}

export default function BudgetForm({ onClose, existing }: Props) {
  const { categories, addBudget, updateBudget } = useApp();
  const expenseCategories = categories.filter(c => c.type === 'expense');
  const [categoryId, setCategoryId] = useState(existing?.categoryId ?? '');
  const [amount, setAmount] = useState(existing ? String(existing.amount) : '');
  const [month, setMonth] = useState(existing?.month ?? format(new Date(), 'yyyy-MM'));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const b: Budget = {
      id: existing?.id ?? uuidv4(),
      categoryId, amount: parseFloat(amount), month,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };
    existing ? updateBudget(b) : addBudget(b);
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass}>Category</label>
        <select required value={categoryId} onChange={e => setCategoryId(e.target.value)}
          className={inputClass} style={{ ...inputStyle, appearance: 'none' }}>
          <option value="">Select category</option>
          {expenseCategories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
      </div>

      <div>
        <label className={labelClass}>Monthly Budget ($)</label>
        <input type="number" min="1" step="1" required value={amount}
          onChange={e => setAmount(e.target.value)}
          className={inputClass} style={inputStyle} placeholder="500" />
      </div>

      <div>
        <label className={labelClass}>Month</label>
        <input type="month" required value={month} onChange={e => setMonth(e.target.value)}
          className={inputClass} style={inputStyle} />
      </div>

      <button type="submit"
        className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 mt-2"
        style={{ backgroundColor: '#6366f1' }}>
        {existing ? 'Update Budget' : 'Set Budget'}
      </button>
    </form>
  );
}
