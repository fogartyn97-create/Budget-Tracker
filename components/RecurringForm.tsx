'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useApp } from '@/lib/context';
import { RecurringTransaction, RecurringFrequency } from '@/lib/types';
import { format } from 'date-fns';

const inputCls = "w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";
const labelCls = "block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide";

interface Props { onClose: () => void; existing?: RecurringTransaction; }

export default function RecurringForm({ onClose, existing }: Props) {
  const { accounts, categories, addRecurring, updateRecurring } = useApp();
  const [type, setType] = useState<'income' | 'expense'>(existing?.type ?? 'expense');
  const [amount, setAmount] = useState(existing ? String(existing.amount) : '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [accountId, setAccountId] = useState(existing?.accountId ?? accounts[0]?.id ?? '');
  const [categoryId, setCategoryId] = useState(existing?.categoryId ?? '');
  const [frequency, setFrequency] = useState<RecurringFrequency>(existing?.frequency ?? 'monthly');
  const [nextDate, setNextDate] = useState(existing?.nextDate ?? format(new Date(), 'yyyy-MM-dd'));

  const filteredCategories = categories.filter(c => c.type === type);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r: RecurringTransaction = {
      id: existing?.id ?? uuidv4(),
      accountId, categoryId, amount: parseFloat(amount),
      type, description, frequency, nextDate,
      active: existing?.active ?? true,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };
    existing ? updateRecurring(r) : addRecurring(r);
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex rounded-xl overflow-hidden border border-slate-200">
        {(['expense', 'income'] as const).map(t => (
          <button key={t} type="button" onClick={() => { setType(t); setCategoryId(''); }}
            className="flex-1 py-2.5 text-sm font-semibold transition-all"
            style={type === t
              ? { backgroundColor: t === 'expense' ? '#fee2e2' : '#dcfce7', color: t === 'expense' ? '#dc2626' : '#16a34a' }
              : { backgroundColor: '#f8fafc', color: '#94a3b8' }}>
            {t === 'expense' ? '↑ Expense' : '↓ Income'}
          </button>
        ))}
      </div>

      <div>
        <label className={labelCls}>Description</label>
        <input type="text" required value={description}
          onChange={e => setDescription(e.target.value)} className={inputCls} placeholder="e.g. Netflix, Rent, Gym..." />
      </div>
      <div>
        <label className={labelCls}>Amount ($)</label>
        <input type="number" min="0.01" step="0.01" required value={amount}
          onChange={e => setAmount(e.target.value)} className={inputCls} placeholder="0.00" />
      </div>
      <div>
        <label className={labelCls}>Frequency</label>
        <select value={frequency} onChange={e => setFrequency(e.target.value as RecurringFrequency)} className={inputCls}>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>
      <div>
        <label className={labelCls}>Next Date</label>
        <input type="date" required value={nextDate} onChange={e => setNextDate(e.target.value)} className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Account</label>
        <select required value={accountId} onChange={e => setAccountId(e.target.value)} className={inputCls}>
          <option value="">Select account</option>
          {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </div>
      <div>
        <label className={labelCls}>Category</label>
        <select required value={categoryId} onChange={e => setCategoryId(e.target.value)} className={inputCls}>
          <option value="">Select category</option>
          {filteredCategories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
      </div>
      <button type="submit" className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90" style={{ backgroundColor: '#1d4ed8' }}>
        {existing ? 'Update' : 'Add Recurring'}
      </button>
    </form>
  );
}
