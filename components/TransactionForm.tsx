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
      accountId,
      categoryId,
      amount: parseFloat(amount),
      type,
      description,
      date,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };
    existing ? updateTransaction(t) : addTransaction(t);
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type toggle */}
      <div className="flex rounded-lg overflow-hidden border border-gray-200">
        {(['expense', 'income'] as const).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => { setType(t); setCategoryId(''); }}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              type === t
                ? t === 'expense' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t === 'expense' ? '↑ Expense' : '↓ Income'}
          </button>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
        <input
          type="number"
          min="0.01"
          step="0.01"
          required
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="0.00"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <input
          type="text"
          required
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="What was this for?"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Account</label>
        <select
          required
          value={accountId}
          onChange={e => setAccountId(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">Select account</option>
          {accounts.map(a => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select
          required
          value={categoryId}
          onChange={e => setCategoryId(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">Select category</option>
          {filteredCategories.map(c => (
            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
        <input
          type="date"
          required
          value={date}
          onChange={e => setDate(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors"
      >
        {existing ? 'Update Transaction' : 'Add Transaction'}
      </button>
    </form>
  );
}
