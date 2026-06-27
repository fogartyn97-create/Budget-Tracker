'use client';

import { useState, useMemo } from 'react';
import { useApp } from '@/lib/context';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import Modal from '@/components/Modal';
import BudgetForm from '@/components/BudgetForm';
import { Budget } from '@/lib/types';

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

const cardStyle = { backgroundColor: '#1a1d27', border: '1px solid #2a2d3e' };

export default function BudgetsPage() {
  const { budgets, categories, transactions, deleteBudget } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Budget | undefined>();
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'));

  const monthStart = startOfMonth(new Date(month + '-01'));
  const monthEnd = endOfMonth(new Date(month + '-01'));

  const monthBudgets = useMemo(() => budgets.filter(b => b.month === month), [budgets, month]);

  const spent = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'expense' && isWithinInterval(parseISO(t.date), { start: monthStart, end: monthEnd }))
      .forEach(t => { map[t.categoryId] = (map[t.categoryId] ?? 0) + t.amount; });
    return map;
  }, [transactions, month]);

  const totalBudget = monthBudgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = monthBudgets.reduce((s, b) => s + (spent[b.categoryId] ?? 0), 0);
  const overallPct = totalBudget > 0 ? Math.min(100, (totalSpent / totalBudget) * 100) : 0;

  function handleClose() { setShowForm(false); setEditing(undefined); }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Budgets</h1>
          <p className="text-xs text-slate-400 mt-0.5">{format(new Date(month + '-01'), 'MMMM yyyy')}</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ backgroundColor: '#6366f1' }}>
          + Set Budget
        </button>
      </div>

      {/* Month picker */}
      <input type="month" value={month} onChange={e => setMonth(e.target.value)}
        className="rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
        style={{ backgroundColor: '#1a1d27', border: '1px solid #2a2d3e' }} />

      {/* Overall summary */}
      {monthBudgets.length > 0 && (
        <div className="rounded-2xl p-5" style={cardStyle}>
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide">Total Budget</p>
              <p className="text-2xl font-bold text-white mt-0.5">{fmt(totalBudget)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Spent</p>
              <p className={`text-lg font-bold mt-0.5 ${totalSpent > totalBudget ? 'text-red-400' : 'text-white'}`}>{fmt(totalSpent)}</p>
            </div>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#2a2d3e' }}>
            <div className="h-full rounded-full transition-all"
              style={{ width: `${overallPct}%`, backgroundColor: totalSpent > totalBudget ? '#ef4444' : overallPct > 80 ? '#eab308' : '#22c55e' }} />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-slate-400">{overallPct.toFixed(0)}% used</span>
            <span className="text-xs text-slate-400">{fmt(Math.max(0, totalBudget - totalSpent))} remaining</span>
          </div>
        </div>
      )}

      {monthBudgets.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4" style={{ backgroundColor: '#6366f120' }}>◎</div>
          <p className="text-white font-semibold">No budgets for this month</p>
          <p className="text-slate-400 text-sm mt-1">Set spending limits to stay on track.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {monthBudgets.map(b => {
            const cat = categories.find(c => c.id === b.categoryId);
            const spentAmt = spent[b.categoryId] ?? 0;
            const pct = b.amount > 0 ? Math.min(100, (spentAmt / b.amount) * 100) : 0;
            const over = spentAmt > b.amount;
            const warn = !over && pct >= 80;
            const barColor = over ? '#ef4444' : warn ? '#eab308' : (cat?.color ?? '#22c55e');

            return (
              <div key={b.id} className="rounded-2xl p-5" style={cardStyle}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                      style={{ backgroundColor: (cat?.color ?? '#6b7280') + '20' }}>
                      {cat?.icon ?? '📦'}
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{cat?.name}</p>
                      <p className="text-xs text-slate-500">Budget: {fmt(b.amount)}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditing(b); setShowForm(true); }}
                      className="text-xs px-2.5 py-1 rounded-lg text-slate-300 transition-colors"
                      style={{ backgroundColor: '#2a2d3e' }}>Edit</button>
                    <button onClick={() => deleteBudget(b.id)}
                      className="text-xs px-2.5 py-1 rounded-lg text-red-400 transition-colors"
                      style={{ backgroundColor: '#ef444415' }}>Delete</button>
                  </div>
                </div>

                <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ backgroundColor: '#2a2d3e' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: barColor }} />
                </div>

                <div className="flex justify-between">
                  <span className={`text-xs font-medium ${over ? 'text-red-400' : warn ? 'text-yellow-400' : 'text-slate-400'}`}>
                    {fmt(spentAmt)} spent
                  </span>
                  <span className="text-xs text-slate-500">
                    {over ? <span className="text-red-400">Over by {fmt(spentAmt - b.amount)}</span> : `${fmt(b.amount - spentAmt)} left`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <Modal title={editing ? 'Edit Budget' : 'Set Budget'} onClose={handleClose}>
          <BudgetForm onClose={handleClose} existing={editing} />
        </Modal>
      )}
    </div>
  );
}
