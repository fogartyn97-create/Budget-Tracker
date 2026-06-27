'use client';

import { useState, useMemo } from 'react';
import { useApp } from '@/lib/context';
import { format, parseISO } from 'date-fns';
import Modal from '@/components/Modal';
import TransactionForm from '@/components/TransactionForm';
import { Transaction } from '@/lib/types';

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

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

  function handleEdit(t: Transaction) {
    setEditing(t);
    setShowForm(true);
  }

  function handleClose() {
    setShowForm(false);
    setEditing(undefined);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <button
          onClick={() => setShowForm(true)}
          disabled={accounts.length === 0}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Add
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search transactions..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value as 'all' | 'income' | 'expense')}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="all">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">All categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
          ))}
        </select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">💳</p>
          <p className="text-gray-500">{transactions.length === 0 ? 'No transactions yet' : 'No results match your filters'}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-50">
            {filtered.map(t => {
              const cat = categories.find(c => c.id === t.categoryId);
              const acc = accounts.find(a => a.id === t.accountId);
              return (
                <div key={t.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 group">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl shrink-0">{cat?.icon ?? '📦'}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{t.description}</p>
                      <p className="text-xs text-gray-400">
                        {format(parseISO(t.date), 'MMM d, yyyy')} · {acc?.name} · {cat?.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    <span className={`font-semibold text-sm ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                    </span>
                    <div className="hidden group-hover:flex gap-1">
                      <button
                        onClick={() => handleEdit(t)}
                        className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteTransaction(t.id)}
                        className="text-xs px-2 py-1 rounded bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showForm && (
        <Modal title={editing ? 'Edit Transaction' : 'Add Transaction'} onClose={handleClose}>
          <TransactionForm onClose={handleClose} existing={editing} />
        </Modal>
      )}
    </div>
  );
}
