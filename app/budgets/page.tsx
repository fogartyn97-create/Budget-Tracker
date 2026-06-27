'use client';

import { useState, useMemo } from 'react';
import { useApp } from '@/lib/context';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import Modal from '@/components/Modal';
import BudgetForm from '@/components/BudgetForm';
import { Budget } from '@/lib/types';
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from 'recharts';

function fmt(n: number) { return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }); }

const card = "bg-white rounded-2xl border border-slate-200 shadow-sm";

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
    transactions.filter(t => t.type === 'expense' && isWithinInterval(parseISO(t.date), { start: monthStart, end: monthEnd }))
      .forEach(t => { map[t.categoryId] = (map[t.categoryId] ?? 0) + t.amount; });
    return map;
  }, [transactions, month]);

  const totalBudget = monthBudgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = monthBudgets.reduce((s, b) => s + (spent[b.categoryId] ?? 0), 0);
  const overallPct = totalBudget > 0 ? Math.min(100, (totalSpent / totalBudget) * 100) : 0;

  const radialData = [{ name: 'Spent', value: overallPct, fill: overallPct > 90 ? '#dc2626' : overallPct > 75 ? '#ea580c' : '#1d4ed8' }];

  function handleClose() { setShowForm(false); setEditing(undefined); }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Budgets</h1>
          <p className="text-sm text-slate-400 mt-0.5">{format(new Date(month + '-01'), 'MMMM yyyy')}</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm hover:opacity-90"
          style={{ backgroundColor: '#1d4ed8' }}>
          + Set Budget
        </button>
      </div>

      <input type="month" value={month} onChange={e => setMonth(e.target.value)}
        className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />

      {/* Summary with radial chart */}
      {monthBudgets.length > 0 && (
        <div className={`${card} p-5`}>
          <div className="flex items-center gap-6">
            <div style={{ width: 120, height: 120 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="65%" outerRadius="100%" data={radialData} startAngle={90} endAngle={-270}>
                  <RadialBar dataKey="value" cornerRadius={6} background={{ fill: '#f1f5f9' }} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1">
              <p className="text-3xl font-bold text-slate-900">{overallPct.toFixed(0)}%</p>
              <p className="text-sm text-slate-500 mt-1">of total budget used</p>
              <div className="flex gap-6 mt-3">
                <div>
                  <p className="text-xs text-slate-400 font-medium">Budgeted</p>
                  <p className="text-base font-bold text-slate-800 mt-0.5">{fmt(totalBudget)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Spent</p>
                  <p className={`text-base font-bold mt-0.5 ${totalSpent > totalBudget ? 'text-red-600' : 'text-slate-800'}`}>{fmt(totalSpent)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Remaining</p>
                  <p className={`text-base font-bold mt-0.5 ${totalBudget - totalSpent < 0 ? 'text-red-600' : 'text-green-600'}`}>{fmt(Math.max(0, totalBudget - totalSpent))}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {monthBudgets.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl mx-auto mb-4">🎯</div>
          <p className="font-bold text-slate-700">No budgets for this month</p>
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
            const barColor = over ? '#dc2626' : warn ? '#ea580c' : (cat?.color ?? '#1d4ed8');

            return (
              <div key={b.id} className={`${card} p-5`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                      style={{ backgroundColor: (cat?.color ?? '#1d4ed8') + '18' }}>
                      {cat?.icon ?? '📦'}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{cat?.name}</p>
                      <p className="text-xs text-slate-400">Limit: {fmt(b.amount)}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditing(b); setShowForm(true); }}
                      className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium transition-colors">Edit</button>
                    <button onClick={() => deleteBudget(b.id)}
                      className="text-xs px-2.5 py-1 rounded-lg text-red-600 font-medium transition-colors"
                      style={{ backgroundColor: '#fee2e2' }}>Delete</button>
                  </div>
                </div>

                <div className="h-2 rounded-full overflow-hidden bg-slate-100 mb-2">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: barColor }} />
                </div>
                <div className="flex justify-between">
                  <span className={`text-xs font-semibold ${over ? 'text-red-600' : warn ? 'text-orange-500' : 'text-slate-500'}`}>
                    {fmt(spentAmt)} spent
                  </span>
                  <span className="text-xs text-slate-400">
                    {over ? <span className="text-red-500 font-semibold">Over by {fmt(spentAmt - b.amount)}</span> : `${fmt(b.amount - spentAmt)} left`}
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
