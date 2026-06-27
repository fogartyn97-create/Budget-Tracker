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
  checking: '🏦', savings: '🏧', credit: '💳', cash: '💵', investment: '📈',
};

const cardStyle = { backgroundColor: '#1a1d27', border: '1px solid #2a2d3e' };

export default function AccountsPage() {
  const { accounts, transactions, categories, deleteAccount } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Account | undefined>();
  const [selected, setSelected] = useState<string | null>(null);

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
  const totalAssets = accounts.filter(a => a.balance > 0).reduce((s, a) => s + a.balance, 0);
  const totalDebt = accounts.filter(a => a.balance < 0).reduce((s, a) => s + a.balance, 0);

  function handleClose() { setShowForm(false); setEditing(undefined); }

  const accountTx = selected ? transactions.filter(t => t.accountId === selected).slice(0, 20) : [];
  const selectedAccount = accounts.find(a => a.id === selected);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Accounts</h1>
        <button onClick={() => setShowForm(true)}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ backgroundColor: '#6366f1' }}>
          + Add Account
        </button>
      </div>

      {/* Summary bar */}
      {accounts.length > 0 && (
        <div className="rounded-2xl p-5 grid grid-cols-3 gap-4" style={cardStyle}>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">Net Worth</p>
            <p className={`text-xl font-bold mt-1 ${totalBalance >= 0 ? 'text-white' : 'text-red-400'}`}>{fmt(totalBalance)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">Assets</p>
            <p className="text-xl font-bold text-green-400 mt-1">{fmt(totalAssets)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">Debt</p>
            <p className="text-xl font-bold text-red-400 mt-1">{fmt(Math.abs(totalDebt))}</p>
          </div>
        </div>
      )}

      {accounts.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4" style={{ backgroundColor: '#6366f120' }}>▣</div>
          <p className="text-white font-semibold">No accounts yet</p>
          <p className="text-slate-400 text-sm mt-1">Add your bank accounts, credit cards, or cash.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map(a => (
            <div key={a.id}
              onClick={() => setSelected(selected === a.id ? null : a.id)}
              className="rounded-2xl p-5 cursor-pointer transition-all"
              style={{
                ...cardStyle,
                outline: selected === a.id ? `1px solid ${a.color}` : 'none',
                boxShadow: selected === a.id ? `0 0 0 1px ${a.color}20` : 'none',
              }}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ backgroundColor: a.color + '20' }}>
                    {TYPE_ICONS[a.type] ?? '🏦'}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{a.name}</p>
                    <p className="text-xs text-slate-400 capitalize">{a.type}</p>
                  </div>
                </div>
                <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                  <button onClick={() => { setEditing(a); setShowForm(true); }}
                    className="text-xs px-2.5 py-1 rounded-lg text-slate-300 transition-colors"
                    style={{ backgroundColor: '#2a2d3e' }}>Edit</button>
                  <button onClick={() => { if (confirm(`Delete "${a.name}"?`)) deleteAccount(a.id); }}
                    className="text-xs px-2.5 py-1 rounded-lg text-red-400 transition-colors"
                    style={{ backgroundColor: '#ef444415' }}>Delete</button>
                </div>
              </div>
              <div style={{ borderTop: '1px solid #2a2d3e' }} className="pt-3">
                <p className="text-xs text-slate-400 mb-0.5">Balance</p>
                <p className={`text-2xl font-bold ${a.balance >= 0 ? 'text-white' : 'text-red-400'}`}>{fmt(a.balance)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Transaction panel */}
      {selected && selectedAccount && (
        <div className="rounded-2xl overflow-hidden" style={cardStyle}>
          <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid #2a2d3e' }}>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedAccount.color }} />
            <span className="font-semibold text-white">{selectedAccount.name}</span>
            <span className="text-xs text-slate-400">— recent transactions</span>
          </div>
          {accountTx.length === 0 ? (
            <p className="text-center text-slate-500 py-10 text-sm">No transactions for this account</p>
          ) : (
            <div>
              {accountTx.map((t, i) => {
                const cat = categories.find(c => c.id === t.categoryId);
                return (
                  <div key={t.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
                    style={i < accountTx.length - 1 ? { borderBottom: '1px solid #2a2d3e' } : {}}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                        style={{ backgroundColor: (cat?.color ?? '#6b7280') + '20' }}>
                        {cat?.icon ?? '📦'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{t.description}</p>
                        <p className="text-xs text-slate-500">{format(parseISO(t.date), 'MMM d, yyyy')} · {cat?.name}</p>
                      </div>
                    </div>
                    <span className={`font-semibold text-sm ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
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
