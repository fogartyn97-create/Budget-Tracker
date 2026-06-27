'use client';

import { useState } from 'react';
import { useApp } from '@/lib/context';
import { format, parseISO } from 'date-fns';
import Modal from '@/components/Modal';
import AccountForm from '@/components/AccountForm';
import { Account } from '@/lib/types';

function fmt(n: number) { return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' }); }

const TYPE_ICONS: Record<string, string> = { checking: '🏦', savings: '🏧', credit: '💳', cash: '💵', investment: '📈' };
const card = "bg-white rounded-2xl border border-slate-200 shadow-sm";

export default function AccountsPage() {
  const { accounts, transactions, categories, deleteAccount } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Account | undefined>();
  const [selected, setSelected] = useState<string | null>(null);

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
  const totalAssets = accounts.filter(a => a.balance > 0).reduce((s, a) => s + a.balance, 0);
  const totalDebt = Math.abs(accounts.filter(a => a.balance < 0).reduce((s, a) => s + a.balance, 0));

  function handleClose() { setShowForm(false); setEditing(undefined); }

  const accountTx = selected ? transactions.filter(t => t.accountId === selected).slice(0, 20) : [];
  const selectedAccount = accounts.find(a => a.id === selected);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Accounts</h1>
        <button onClick={() => setShowForm(true)}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm hover:opacity-90"
          style={{ backgroundColor: '#1d4ed8' }}>
          + Add Account
        </button>
      </div>

      {accounts.length > 0 && (
        <div className={`${card} p-5 grid grid-cols-3 gap-4`}>
          {[
            { label: 'Net Worth', value: totalBalance, color: totalBalance >= 0 ? '#1d4ed8' : '#dc2626' },
            { label: 'Total Assets', value: totalAssets, color: '#16a34a' },
            { label: 'Total Debt', value: totalDebt, color: '#dc2626' },
          ].map(s => (
            <div key={s.label}>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{s.label}</p>
              <p className="text-xl font-bold mt-1" style={{ color: s.color }}>{fmt(s.value)}</p>
            </div>
          ))}
        </div>
      )}

      {accounts.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl mx-auto mb-4">🏦</div>
          <p className="font-bold text-slate-700">No accounts yet</p>
          <p className="text-slate-400 text-sm mt-1">Add your bank accounts, credit cards, or cash.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map(a => (
            <div key={a.id} onClick={() => setSelected(selected === a.id ? null : a.id)}
              className={`${card} p-5 cursor-pointer transition-all hover:shadow-md`}
              style={selected === a.id ? { outline: `2px solid ${a.color}`, outlineOffset: '2px' } : {}}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
                    style={{ backgroundColor: a.color + '18' }}>
                    {TYPE_ICONS[a.type] ?? '🏦'}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{a.name}</p>
                    <p className="text-xs text-slate-400 capitalize">{a.type}</p>
                  </div>
                </div>
                <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                  <button onClick={() => { setEditing(a); setShowForm(true); }}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium transition-colors">Edit</button>
                  <button onClick={() => { if (confirm(`Delete "${a.name}"?`)) deleteAccount(a.id); }}
                    className="text-xs px-2.5 py-1 rounded-lg text-red-600 font-medium transition-colors"
                    style={{ backgroundColor: '#fee2e2' }}>Delete</button>
                </div>
              </div>
              <div className="pt-3" style={{ borderTop: '1px solid #f1f5f9' }}>
                <p className="text-xs text-slate-400 font-medium">Balance</p>
                <p className={`text-2xl font-bold mt-0.5 ${a.balance >= 0 ? 'text-slate-900' : 'text-red-600'}`}>{fmt(a.balance)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && selectedAccount && (
        <div className={`${card} overflow-hidden`}>
          <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid #f1f5f9' }}>
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedAccount.color }} />
            <span className="font-semibold text-slate-800">{selectedAccount.name}</span>
            <span className="text-xs text-slate-400">— transaction history</span>
          </div>
          {accountTx.length === 0 ? (
            <p className="text-center text-slate-400 py-10 text-sm">No transactions for this account yet.</p>
          ) : accountTx.map((t, i) => {
            const cat = categories.find(c => c.id === t.categoryId);
            return (
              <div key={t.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors"
                style={i < accountTx.length - 1 ? { borderBottom: '1px solid #f8fafc' } : {}}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: (cat?.color ?? '#64748b') + '18' }}>
                    {cat?.icon ?? '📦'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{t.description}</p>
                    <p className="text-xs text-slate-400">{format(parseISO(t.date), 'MMM d, yyyy')} · {cat?.name}</p>
                  </div>
                </div>
                <span className={`text-sm font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                </span>
              </div>
            );
          })}
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
