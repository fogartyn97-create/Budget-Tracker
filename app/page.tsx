'use client';

import { useMemo, useState } from 'react';
import { useApp } from '@/lib/context';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO, subMonths } from 'date-fns';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import Modal from '@/components/Modal';
import TransactionForm from '@/components/TransactionForm';

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

export default function Dashboard() {
  const { accounts, transactions, categories } = useApp();
  const [showTxForm, setShowTxForm] = useState(false);

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const thisMonthTx = useMemo(() =>
    transactions.filter(t => {
      const d = parseISO(t.date);
      return isWithinInterval(d, { start: monthStart, end: monthEnd });
    }), [transactions]);

  const totalIncome = thisMonthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpenses = thisMonthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const netWorth = accounts.reduce((s, a) => s + a.balance, 0);

  const monthlyData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = subMonths(now, 5 - i);
      const label = format(d, 'MMM');
      const start = startOfMonth(d);
      const end = endOfMonth(d);
      const monthTx = transactions.filter(t => isWithinInterval(parseISO(t.date), { start, end }));
      return {
        month: label,
        income: monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        expenses: monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      };
    });
  }, [transactions]);

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    thisMonthTx.filter(t => t.type === 'expense').forEach(t => {
      map[t.categoryId] = (map[t.categoryId] ?? 0) + t.amount;
    });
    return Object.entries(map)
      .map(([catId, amount]) => {
        const cat = categories.find(c => c.id === catId);
        return { name: cat?.name ?? 'Other', value: amount, color: cat?.color ?? '#6b7280' };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [thisMonthTx, categories]);

  const recentTx = transactions.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">{format(now, 'MMMM yyyy')}</p>
        </div>
        <button
          onClick={() => setShowTxForm(true)}
          disabled={accounts.length === 0}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Add Transaction
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Net Worth', value: netWorth, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Monthly Income', value: totalIncome, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Monthly Expenses', value: totalExpenses, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Savings', value: totalIncome - totalExpenses, color: (totalIncome - totalExpenses) >= 0 ? 'text-blue-600' : 'text-orange-600', bg: (totalIncome - totalExpenses) >= 0 ? 'bg-blue-50' : 'bg-orange-50' },
        ].map(card => (
          <div key={card.label} className={`${card.bg} rounded-2xl p-4`}>
            <p className="text-xs text-gray-500 mb-1">{card.label}</p>
            <p className={`text-xl font-bold ${card.color}`}>{fmt(card.value)}</p>
          </div>
        ))}
      </div>

      {/* Accounts */}
      {accounts.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Accounts</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {accounts.map(a => (
              <div key={a.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: a.color }} />
                  <span className="text-xs text-gray-500 capitalize">{a.type}</span>
                </div>
                <p className="font-semibold text-gray-800 text-sm truncate">{a.name}</p>
                <p className={`text-lg font-bold mt-1 ${a.balance >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                  {fmt(a.balance)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts */}
      {transactions.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h2 className="font-semibold text-gray-700 mb-4">6-Month Overview</h2>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => fmt(Number(v))} />
                <Area type="monotone" dataKey="income" stroke="#22c55e" fill="#dcfce7" name="Income" />
                <Area type="monotone" dataKey="expenses" stroke="#ef4444" fill="#fee2e2" name="Expenses" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {categoryData.length > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h2 className="font-semibold text-gray-700 mb-4">This Month Spending</h2>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                  >
                    {categoryData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(Number(v))} />
                  <Legend formatter={(value) => <span className="text-xs text-gray-600">{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Recent transactions */}
      {recentTx.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-700">Recent Transactions</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {recentTx.map(t => {
              const cat = categories.find(c => c.id === t.categoryId);
              const acc = accounts.find(a => a.id === t.accountId);
              return (
                <div key={t.id} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{cat?.icon ?? '📦'}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{t.description}</p>
                      <p className="text-xs text-gray-400">{format(parseISO(t.date), 'MMM d')} · {acc?.name}</p>
                    </div>
                  </div>
                  <span className={`font-semibold text-sm ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {accounts.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">💳</p>
          <p className="text-lg font-medium text-gray-600">Welcome to BudgetTracker</p>
          <p className="text-sm mt-1">Start by adding an account in the <strong>Accounts</strong> tab, then log your transactions.</p>
        </div>
      )}

      {showTxForm && (
        <Modal title="Add Transaction" onClose={() => setShowTxForm(false)}>
          <TransactionForm onClose={() => setShowTxForm(false)} />
        </Modal>
      )}
    </div>
  );
}
