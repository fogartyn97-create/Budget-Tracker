'use client';

import { useState, useMemo } from 'react';
import { useApp } from '@/lib/context';
import { format, parseISO } from 'date-fns';
import Modal from '@/components/Modal';
import TransactionForm from '@/components/TransactionForm';
import { Transaction } from '@/lib/types';

function fmtFull(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

const cardStyle = { backgroundColor: '#1a1d27', border: '1px solid #2a2d3e' };

export default function TransactionsPage() {
  const { transactions, categories, accounts, deleteTransaction } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Transaction | undefined>();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState('');

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      const cat = categories.find(c => c.id === t.categoryId);
      const matchSearch = t.description.toLowerCase().includes(search.toLowerCase()) ||
        cat?.name.toLowerCase().includes(search.toLowerCase());
      const matchType = filterType === 'all' || t.type === filterType;
      const matchCat = !filterCategory || t.categoryId === filterCategory;
      return matchSearch && matchType && matchCat;
    });
  }, [transactions, search, filterType, filterCategory, categories]);

  const totalFiltered = filtered.reduce((s, t) => t.type === 'income' ? s + t.amount : s - t.amount, 0);

  function handleClose() { setShowForm(false); setEditing(undefined); }

  const inputStyle = { backgroundColor: '#0f1117', border: '1px solid #2a2d3e', color: '#f1f5f9' };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Transactions</h1>
          {filtered.length > 0 && (
            <p className="text-xs text-slate-400 mt-0.5">{filtered.length} transactions · Net: <span className={totalFiltered >= 0 ? 'text-green-400' : 'text-red-400'}>{fmtFull(totalFiltered)}</span></p>
          )}
        </div>
        <button
          onClick={() => setShowForm(true)}
          disabled={accounts.length === 0}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#6366f1' }}
        >
          + Add
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="Search transactions..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 rounded-xl px-4 py-2.5 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          style={inputStyle}
        />
        <select value={filterType} onChange={e => setFilterType(e.target.value as 'all' | 'income' | 'expense')}
          className="rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          style={{ ...inputStyle, appearance: 'none' }}>
          <option value="all">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
          className="rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          style={{ ...inputStyle, appearance: 'none' }}>
          <option value="">All categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4" style={{ backgroundColor: '#6366f120' }}>↕</div>
          <p className="text-white font-semibold">{transactions.length === 0 ? 'No transactions yet' : 'No results'}</p>
          <p className="text-slate-400 text-sm mt-1">{transactions.length === 0 ? 'Add your first transaction above' : 'Try adjusting your filters'}</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={cardStyle}>
          {filtered.map((t, i) => {
            const cat = categories.find(c => c.id === t.categoryId);
            const acc = accounts.find(a => a.id === t.accountId);
            return (
              <div key={t.id}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition-colors group"
                style={i < filtered.length - 1 ? { borderBottom: '1px solid #2a2d3e' } : {}}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                    style={{ backgroundColor: (cat?.color ?? '#6b7280') + '20' }}>
                    {cat?.icon ?? '📦'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{t.description}</p>
                    <p className="text-xs text-slate-500">{format(parseISO(t.date), 'MMM d, yyyy')} · {acc?.name} · {cat?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <span className={`font-semibold text-sm ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                    {t.type === 'income' ? '+' : '-'}{fmtFull(t.amount)}
                  </span>
                  <div className="hidden group-hover:flex gap-1">
                    <button onClick={() => { setEditing(t); setShowForm(true); }}
                      className="text-xs px-2.5 py-1 rounded-lg text-slate-300 transition-colors"
                      style={{ backgroundColor: '#2a2d3e' }}>Edit</button>
                    <button onClick={() => deleteTransaction(t.id)}
                      className="text-xs px-2.5 py-1 rounded-lg text-red-400 transition-colors"
                      style={{ backgroundColor: '#ef444415' }}>Delete</button>
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
