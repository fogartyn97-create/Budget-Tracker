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

export default function BudgetsPage() {
  const { budgets, categories, transactions, deleteBudget } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Budget | undefined>();
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'));

  const monthStart = startOfMonth(new Date(month + '-01'));
  const monthEnd = endOfMonth(new Date(month + '-01'));

  const monthBudgets = useMemo(() =>
    budgets.filter(b => b.month === month),
    [budgets, month]
  );

  const spent = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'expense' && isWithinInterval(parseISO(t.date), { start: monthStart, end: monthEnd }))
      .forEach(t => { map[t.categoryId] = (map[t.categoryId] ?? 0) + t.amount; });
    return map;
  }, [transactions, month]);

  const totalBudget = monthBudgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = monthBudgets.reduce((s, b) => s + (spent[b.categoryId] ?? 0), 0);

  function handleClose() {
    setShowForm(false);
    setEditing(undefined);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Budgets</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Set Budget
        </button>
      </div>

      {/* Month picker */}
      <div className="flex items-center gap-3">
        <input
          type="month"
          value={month}
          onChange={e => setMonth(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        {monthBudgets.length > 0 && (
          <div className="text-sm text-gray-500">
            <span className="font-medium text-red-600">{fmt(totalSpent)}</span> spent of{' '}
            <span className="font-medium text-gray-700">{fmt(totalBudget)}</span> budgeted
          </div>
        )}
      </div>

      {/* Overall progress */}
      {monthBudgets.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-gray-700">Total Budget Progress</span>
            <span className="text-gray-500">{totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}%</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${totalSpent > totalBudget ? 'bg-red-500' : totalSpent > totalBudget * 0.8 ? 'bg-yellow-500' : 'bg-green-500'}`}
              style={{ width: `${Math.min(100, totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0)}%` }}
            />
          </div>
        </div>
      )}

      {/* Budget cards */}
      {monthBudgets.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">🎯</p>
          <p className="text-gray-500">No budgets set for {format(new Date(month + '-01'), 'MMMM yyyy')}</p>
          <p className="text-sm mt-1">Click &quot;Set Budget&quot; to define spending limits.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {monthBudgets.map(b => {
            const cat = categories.find(c => c.id === b.categoryId);
            const spentAmt = spent[b.categoryId] ?? 0;
            const pct = b.amount > 0 ? Math.min(100, (spentAmt / b.amount) * 100) : 0;
            const over = spentAmt > b.amount;
            const warn = !over && pct >= 80;

            return (
              <div key={b.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{cat?.icon ?? '📦'}</span>
                    <span className="font-medium text-gray-800">{cat?.name}</span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => { setEditing(b); setShowForm(true); }}
                      className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteBudget(b.id)}
                      className="text-xs px-2 py-1 rounded bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="flex justify-between text-sm mb-2">
                  <span className={over ? 'text-red-600 font-semibold' : warn ? 'text-yellow-600 font-semibold' : 'text-gray-600'}>
                    {fmt(spentAmt)} spent
                  </span>
                  <span className="text-gray-400">of {fmt(b.amount)}</span>
                </div>

                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${over ? 'bg-red-500' : warn ? 'bg-yellow-400' : 'bg-green-500'}`}
                    style={{ width: `${pct}%`, backgroundColor: over ? undefined : warn ? undefined : cat?.color }}
                  />
                </div>

                {over && (
                  <p className="text-xs text-red-500 mt-1.5">Over budget by {fmt(spentAmt - b.amount)}</p>
                )}
                {!over && (
                  <p className="text-xs text-gray-400 mt-1.5">{fmt(b.amount - spentAmt)} remaining</p>
                )}
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
