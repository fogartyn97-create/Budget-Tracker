'use client';

import { useState, useMemo } from 'react';
import { useApp } from '@/lib/context';
import { format, parseISO } from 'date-fns';
import Modal from '@/components/Modal';
import RecurringForm from '@/components/RecurringForm';
import { RecurringTransaction } from '@/lib/types';

function fmt(n: number) { return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' }); }

const card = "bg-white rounded-2xl border border-slate-200 shadow-sm";

const FREQ_LABEL: Record<string, string> = { weekly: 'Weekly', monthly: 'Monthly', yearly: 'Yearly' };

export default function RecurringPage() {
  const { recurring, categories, accounts, deleteRecurring, updateRecurring } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<RecurringTransaction | undefined>();

  function handleClose() { setShowForm(false); setEditing(undefined); }

  const monthlyTotal = useMemo(() =>
    recurring.filter(r => r.active && r.type === 'expense').reduce((s, r) => {
      if (r.frequency === 'weekly') return s + r.amount * 4.33;
      if (r.frequency === 'yearly') return s + r.amount / 12;
      return s + r.amount;
    }, 0), [recurring]);

  const yearlyTotal = monthlyTotal * 12;
  const active = recurring.filter(r => r.active);
  const paused = recurring.filter(r => !r.active);

  function toggleActive(r: RecurringTransaction) {
    updateRecurring({ ...r, active: !r.active });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Recurring</h1>
          <p className="text-sm text-slate-400 mt-0.5">Subscriptions, bills & regular income</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm hover:opacity-90"
          style={{ backgroundColor: '#1d4ed8' }}>
          + Add Recurring
        </button>
      </div>

      {/* Summary */}
      {recurring.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Monthly Cost', value: fmt(monthlyTotal), color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
            { label: 'Yearly Cost', value: fmt(yearlyTotal), color: '#ea580c', bg: '#fff7ed', border: '#fed7aa' },
            { label: 'Active', value: `${active.length} charges`, color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-4 border" style={{ backgroundColor: s.bg, borderColor: s.border }}>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{s.label}</p>
              <p className="text-xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {recurring.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl mx-auto mb-4">🔄</div>
          <p className="font-bold text-slate-700">No recurring charges yet</p>
          <p className="text-slate-400 text-sm mt-1">Add subscriptions, rent, or any regular bills.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {active.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Active ({active.length})</h2>
              <div className={`${card} overflow-hidden`}>
                {active.map((r, i) => {
                  const cat = categories.find(c => c.id === r.categoryId);
                  const acc = accounts.find(a => a.id === r.accountId);
                  return (
                    <div key={r.id} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors group"
                      style={i < active.length - 1 ? { borderBottom: '1px solid #f8fafc' } : {}}>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                          style={{ backgroundColor: (cat?.color ?? '#64748b') + '18' }}>
                          {cat?.icon ?? '🔄'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800">{r.description}</p>
                          <p className="text-xs text-slate-400">{FREQ_LABEL[r.frequency]} · {acc?.name} · Next: {format(parseISO(r.nextDate), 'MMM d, yyyy')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-3">
                        <span className={`text-sm font-bold ${r.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          {r.type === 'income' ? '+' : '-'}{fmt(r.amount)}
                        </span>
                        <div className="hidden group-hover:flex gap-1">
                          <button onClick={() => toggleActive(r)}
                            className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium transition-colors">Pause</button>
                          <button onClick={() => { setEditing(r); setShowForm(true); }}
                            className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium transition-colors">Edit</button>
                          <button onClick={() => deleteRecurring(r.id)}
                            className="text-xs px-2.5 py-1 rounded-lg text-red-600 font-medium transition-colors"
                            style={{ backgroundColor: '#fee2e2' }}>Delete</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {paused.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Paused ({paused.length})</h2>
              <div className={`${card} overflow-hidden opacity-60`}>
                {paused.map((r, i) => {
                  const cat = categories.find(c => c.id === r.categoryId);
                  return (
                    <div key={r.id} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors group"
                      style={i < paused.length - 1 ? { borderBottom: '1px solid #f8fafc' } : {}}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                          style={{ backgroundColor: (cat?.color ?? '#64748b') + '18' }}>
                          {cat?.icon ?? '🔄'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-600">{r.description}</p>
                          <p className="text-xs text-slate-400 capitalize">{r.frequency} · {fmt(r.amount)}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => toggleActive(r)}
                          className="text-xs px-2.5 py-1 rounded-lg font-medium text-blue-600 transition-colors"
                          style={{ backgroundColor: '#eff6ff' }}>Resume</button>
                        <button onClick={() => deleteRecurring(r.id)}
                          className="text-xs px-2.5 py-1 rounded-lg text-red-600 font-medium transition-colors"
                          style={{ backgroundColor: '#fee2e2' }}>Delete</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <Modal title={editing ? 'Edit Recurring' : 'Add Recurring Charge'} onClose={handleClose}>
          <RecurringForm onClose={handleClose} existing={editing} />
        </Modal>
      )}
    </div>
  );
}
