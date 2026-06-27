'use client';

import { useState, useMemo } from 'react';
import { useApp } from '@/lib/context';
import { format, parseISO } from 'date-fns';
import Modal from '@/components/Modal';
import TransactionForm from '@/components/TransactionForm';
import { Transaction } from '@/lib/types';

function fmtFull(n: number) { return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' }); }

const card = "bg-white rounded-2xl border border-slate-200 shadow-sm";

export default function TransactionsPage() {
  const { transactions, categories, accounts, deleteTransaction } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Transaction | undefined>();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState('');

  const filtered = useMemo(() => transactions.filter(t => {
    const cat = categories.find(c => c.id === t.categoryId);
    return (t.description.toLowerCase().includes(search.toLowerCase()) || cat?.name.toLowerCase().includes(search.toLowerCase())) &&
      (filterType === 'all' || t.type === filterType) &&
      (!filterCategory || t.categoryId === filterCategory);
  }), [transactions, search, filterType, filterCategory, categories]);

  const totalIn = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalOut = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  function handleClose() { setShowForm(false); setEditing(undefined); }

  const inputCls = "border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Transactions</h1>
        <button onClick={() => setShowForm(true)} disabled={accounts.length === 0}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#1d4ed8' }}>
          + Add
        </button>
      </div>

      {/* Summary */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Transactions', value: `${filtered.length}`, color: '#1e293b' },
            { label: 'Total In', value: fmtFull(totalIn), color: '#16a34a' },
            { label: 'Total Out', value: fmtFull(totalOut), color: '#dc2626' },
          ].map(s => (
            <div key={s.label} className={`${card} p-4`}>
              <p className="text-xs text-slate-400 font-medium">{s.label}</p>
              <p className="text-lg font-bold mt-0.5" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <input type="text" placeholder="Search transactions..." value={search}
          onChange={e => setSearch(e.target.value)} className={`${inputCls} flex-1`} />
        <select value={filterType} onChange={e => setFilterType(e.target.value as 'all' | 'income' | 'expense')} className={inputCls}>
          <option value="all">All types</option>
          <option value="income">Income only</option>
          <option value="expense">Expenses only</option>
        </select>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className={inputCls}>
          <option value="">All categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl mx-auto mb-4">💳</div>
          <p className="font-bold text-slate-700">{transactions.length === 0 ? 'No transactions yet' : 'No results'}</p>
          <p className="text-slate-400 text-sm mt-1">{transactions.length === 0 ? 'Add your first transaction above.' : 'Try adjusting your filters.'}</p>
        </div>
      ) : (
        <div className={`${card} overflow-hidden`}>
          {filtered.map((t, i) => {
            const cat = categories.find(c => c.id === t.categoryId);
            const acc = accounts.find(a => a.id === t.accountId);
            return (
              <div key={t.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors group"
                style={i < filtered.length - 1 ? { borderBottom: '1px solid #f8fafc' } : {}}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                    style={{ backgroundColor: (cat?.color ?? '#64748b') + '18' }}>
                    {cat?.icon ?? '📦'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{t.description}</p>
                    <p className="text-xs text-slate-400">{format(parseISO(t.date), 'MMM d, yyyy')} · {acc?.name} · {cat?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <span className={`text-sm font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'income' ? '+' : '-'}{fmtFull(t.amount)}
                  </span>
                  <div className="hidden group-hover:flex gap-1">
                    <button onClick={() => { setEditing(t); setShowForm(true); }}
                      className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors font-medium">Edit</button>
                    <button onClick={() => deleteTransaction(t.id)}
                      className="text-xs px-2.5 py-1 rounded-lg text-red-600 transition-colors font-medium"
                      style={{ backgroundColor: '#fee2e2' }}>Delete</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <Modal title={editing ? 'Edit Transaction' : 'New Transaction'} onClose={handleClose}>
          <TransactionForm onClose={handleClose} existing={editing} />
        </Modal>
      )}
    </div>
  );
}
