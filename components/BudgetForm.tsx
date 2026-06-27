'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useApp } from '@/lib/context';
import { Budget } from '@/lib/types';
import { format } from 'date-fns';

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
      categoryId,
      amount: parseFloat(amount),
      month,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };
    existing ? updateBudget(b) : addBudget(b);
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select
          required
          value={categoryId}
          onChange={e => setCategoryId(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">Select category</option>
          {expenseCategories.map(c => (
            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Budget ($)</label>
        <input
          type="number"
          min="1"
          step="1"
          required
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
        <input
          type="month"
          required
          value={month}
          onChange={e => setMonth(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors"
      >
        {existing ? 'Update Budget' : 'Set Budget'}
      </button>
    </form>
  );
}
