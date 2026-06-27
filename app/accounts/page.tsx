'use client';

import { useState } from 'react';
import { useApp } from '@/lib/context';
import { format, parseISO } from 'date-fns';
import Modal from '@/components/Modal';
import AccountForm from '@/components/AccountForm';
import { Account } from '@/lib/types';

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

const TYPE_ICONS: Record<string, string> = {
  checking: '🏦',
  savings: '🏧',
  credit: '💳',
  cash: '💵',
  investment: '📈',
};

export default function AccountsPage() {
  const { accounts, transactions, categories, deleteAccount } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Account | undefined>();
  const [selected, setSelected] = useState<string | null>(null);

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);

  function handleClose() {
    setShowForm(false);
    setEditing(undefined);
  }

  const selectedAccount = accounts.find(a => a.id === selected);
  const accountTx = selected
    ? transactions.filter(t => t.accountId === selected).slice(0, 20)
    : [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Accounts</h1>
          <p className="text-sm text-gray-500">Total: <span className="font-semibold text-gray-700">{fmt(totalBalance)}</span></p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Add Account
        </button>
      </div>

      {accounts.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">🏦</p>
          <p className="text-gray-500">No accounts yet</p>
          <p className="text-sm mt-1">Add your bank accounts, credit cards, or cash.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map(a => (
            <div
              key={a.id}
              onClick={() => setSelected(selected === a.id ? null : a.id)}
              className={`bg-white rounded-2xl p-5 border shadow-sm cursor-pointer transition-all ${selected === a.id ? 'border-indigo-400 ring-2 ring-indigo-100' : 'border-gray-100 hover:border-gray-300'}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl" style={{ backgroundColor: a.color + '20' }}>
                    {TYPE_ICONS[a.type] ?? '🏦'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{a.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{a.type}</p>
                  </div>
                </div>
                <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => { setEditing(a); setShowForm(true); }}
                    className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => { if (confirm(`Delete "${a.name}"?`)) deleteAccount(a.id); }}
                    className="text-xs px-2 py-1 rounded bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Balance</p>
                  <p className={`text-2xl font-bold ${a.balance >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                    {fmt(a.balance)}
                  </p>
                </div>
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: a.color }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Transaction detail panel */}
      {selected && selectedAccount && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
            <span className="font-semibold text-gray-700">{selectedAccount.name}</span>
            <span className="text-xs text-gray-400">— recent transactions</span>
          </div>
          {accountTx.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">No transactions for this account</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {accountTx.map(t => {
                const cat = categories.find(c => c.id === t.categoryId);
                return (
                  <div key={t.id} className="flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{cat?.icon ?? '📦'}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{t.description}</p>
                        <p className="text-xs text-gray-400">{format(parseISO(t.date), 'MMM d, yyyy')} · {cat?.name}</p>
                      </div>
                    </div>
                    <span className={`font-semibold text-sm ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {showForm && (
        <Modal title={editing ? 'Edit Account' : 'Add Account'} onClose={handleClose}>
          <AccountForm onClose={handleClose} existing={editing} />
        </Modal>
      )}
    </div>
  );
}
