'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useApp } from '@/lib/context';
import { Budget } from '@/lib/types';
import { format } from 'date-fns';

const inputCls = "w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";
const labelCls = "block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide";

interface Props { onClose: () => void; existing?: Budget; }

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
        <label className={labelCls}>Category</label>
        <select required value={categoryId} onChange={e => setCategoryId(e.target.value)} className={inputCls}>
          <option value="">Select category</option>
          {expenseCategories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
      </div>
      <div>
        <label className={labelCls}>Monthly Budget ($)</label>
        <input type="number" min="1" step="1" required value={amount}
          onChange={e => setAmount(e.target.value)} className={inputCls} placeholder="500" />
      </div>
      <div>
        <label className={labelCls}>Month</label>
        <input type="month" required value={month} onChange={e => setMonth(e.target.value)} className={inputCls} />
      </div>
      <button type="submit" className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90" style={{ backgroundColor: '#1d4ed8' }}>
        {existing ? 'Update Budget' : 'Set Budget'}
      </button>
    </form>
  );
}
