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

function fmtFull(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

const cardStyle = { backgroundColor: '#1a1d27', border: '1px solid #2a2d3e' };

export default function Dashboard() {
  const { accounts, transactions, categories } = useApp();
  const [showTxForm, setShowTxForm] = useState(false);

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const thisMonthTx = useMemo(() =>
    transactions.filter(t => isWithinInterval(parseISO(t.date), { start: monthStart, end: monthEnd })),
    [transactions]);

  const totalIncome = thisMonthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpenses = thisMonthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const netWorth = accounts.reduce((s, a) => s + a.balance, 0);
  const savings = totalIncome - totalExpenses;

  const monthlyData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = subMonths(now, 5 - i);
      const start = startOfMonth(d);
      const end = endOfMonth(d);
      const monthTx = transactions.filter(t => isWithinInterval(parseISO(t.date), { start, end }));
      return {
        month: format(d, 'MMM'),
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

  const recentTx = transactions.slice(0, 6);

  const tooltipStyle = {
    backgroundColor: '#1a1d27',
    border: '1px solid #2a2d3e',
    borderRadius: '12px',
    color: '#f1f5f9',
    fontSize: '13px',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm">{format(now, 'EEEE, MMMM d')}</p>
          <h1 className="text-2xl font-bold text-white mt-0.5">Overview</h1>
        </div>
        <button
          onClick={() => setShowTxForm(true)}
          disabled={accounts.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#6366f1' }}
        >
          <span className="text-base leading-none">+</span> Add Transaction
        </button>
      </div>

      {/* Net Worth hero */}
      <div className="rounded-2xl p-6" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}>
        <p className="text-indigo-200 text-sm font-medium">Total Net Worth</p>
        <p className="text-4xl font-bold text-white mt-1">{fmt(netWorth)}</p>
        <div className="flex gap-6 mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.15)' }}>
          <div>
            <p className="text-indigo-200 text-xs">Monthly Income</p>
            <p className="text-white font-semibold mt-0.5">{fmt(totalIncome)}</p>
          </div>
          <div>
            <p className="text-indigo-200 text-xs">Monthly Expenses</p>
            <p className="text-white font-semibold mt-0.5">{fmt(totalExpenses)}</p>
          </div>
          <div>
            <p className="text-indigo-200 text-xs">Savings</p>
            <p className={`font-semibold mt-0.5 ${savings >= 0 ? 'text-green-300' : 'text-red-300'}`}>{fmt(savings)}</p>
          </div>
        </div>
      </div>

      {/* Accounts */}
      {accounts.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Accounts</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {accounts.map(a => (
              <div key={a.id} className="rounded-xl p-4" style={cardStyle}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: a.color }} />
                  <span className="text-xs text-slate-400 capitalize">{a.type}</span>
                </div>
                <p className="text-slate-300 text-sm font-medium truncate">{a.name}</p>
                <p className={`text-lg font-bold mt-1 ${a.balance >= 0 ? 'text-white' : 'text-red-400'}`}>
                  {fmt(a.balance)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts */}
      {transactions.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl p-5" style={cardStyle}>
            <h2 className="font-semibold text-white mb-1">Cash Flow</h2>
            <p className="text-xs text-slate-400 mb-4">Last 6 months</p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => fmt(Number(v))} />
                <Area type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2} fill="url(#incomeGrad)" name="Income" />
                <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} fill="url(#expenseGrad)" name="Expenses" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {categoryData.length > 0 && (
            <div className="rounded-2xl p-5" style={cardStyle}>
              <h2 className="font-semibold text-white mb-1">Spending Breakdown</h2>
              <p className="text-xs text-slate-400 mb-4">This month by category</p>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3}>
                    {categoryData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => fmtFull(Number(v))} />
                  <Legend formatter={(value) => <span style={{ color: '#94a3b8', fontSize: '11px' }}>{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Recent transactions */}
      {recentTx.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={cardStyle}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #2a2d3e' }}>
            <h2 className="font-semibold text-white">Recent Transactions</h2>
            <a href="/transactions" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">View all →</a>
          </div>
          <div>
            {recentTx.map((t, i) => {
              const cat = categories.find(c => c.id === t.categoryId);
              const acc = accounts.find(a => a.id === t.accountId);
              return (
                <div key={t.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
                  style={i < recentTx.length - 1 ? { borderBottom: '1px solid #2a2d3e' } : {}}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                      style={{ backgroundColor: (cat?.color ?? '#6b7280') + '20' }}>
                      {cat?.icon ?? '📦'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{t.description}</p>
                      <p className="text-xs text-slate-500">{format(parseISO(t.date), 'MMM d')} · {acc?.name}</p>
                    </div>
                  </div>
                  <span className={`font-semibold text-sm ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                    {t.type === 'income' ? '+' : '-'}{fmtFull(t.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {accounts.length === 0 && (
        <div className="text-center py-24">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4"
            style={{ backgroundColor: '#6366f120' }}>
            💳
          </div>
          <p className="text-lg font-semibold text-white">Welcome to BudgetTracker</p>
          <p className="text-slate-400 text-sm mt-2">Start by adding an account in the <span className="text-indigo-400">Accounts</span> tab.</p>
        </div>
      )}

      {showTxForm && (
        <Modal title="New Transaction" onClose={() => setShowTxForm(false)}>
          <TransactionForm onClose={() => setShowTxForm(false)} />
        </Modal>
      )}
    </div>
  );
}
