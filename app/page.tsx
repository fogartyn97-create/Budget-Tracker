'use client';

import { useMemo, useState } from 'react';
import { useApp } from '@/lib/context';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO, subMonths } from 'date-fns';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar,
} from 'recharts';
import Modal from '@/components/Modal';
import TransactionForm from '@/components/TransactionForm';

function fmt(n: number) { return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }); }
function fmtFull(n: number) { return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' }); }

const card = "bg-white rounded-2xl border border-slate-200 shadow-sm";

export default function Dashboard() {
  const { accounts, transactions, categories, recurring } = useApp();
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

  const monthlyData = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => {
      const d = subMonths(now, 5 - i);
      const start = startOfMonth(d);
      const end = endOfMonth(d);
      const tx = transactions.filter(t => isWithinInterval(parseISO(t.date), { start, end }));
      return {
        month: format(d, 'MMM'),
        Income: tx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        Expenses: tx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      };
    }), [transactions]);

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    thisMonthTx.filter(t => t.type === 'expense').forEach(t => {
      map[t.categoryId] = (map[t.categoryId] ?? 0) + t.amount;
    });
    return Object.entries(map)
      .map(([catId, amount]) => {
        const cat = categories.find(c => c.id === catId);
        return { name: cat?.name ?? 'Other', value: amount, color: cat?.color ?? '#64748b' };
      })
      .sort((a, b) => b.value - a.value).slice(0, 6);
  }, [thisMonthTx, categories]);

  const monthlyBarData = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => {
      const d = subMonths(now, 5 - i);
      const start = startOfMonth(d);
      const end = endOfMonth(d);
      const tx = transactions.filter(t => isWithinInterval(parseISO(t.date), { start, end }) && t.type === 'expense');
      const catMap: Record<string, number> = {};
      tx.forEach(t => { catMap[t.categoryId] = (catMap[t.categoryId] ?? 0) + t.amount; });
      return { month: format(d, 'MMM'), ...catMap };
    }), [transactions]);

  const recentTx = transactions.slice(0, 6);
  const upcomingRecurring = recurring.filter(r => r.active).slice(0, 4);
  const monthlyRecurringCost = recurring.filter(r => r.active && r.type === 'expense').reduce((s, r) => {
    if (r.frequency === 'weekly') return s + r.amount * 4.33;
    if (r.frequency === 'yearly') return s + r.amount / 12;
    return s + r.amount;
  }, 0);

  const tooltip = { backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '12px', color: '#1e293b' };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{format(now, 'EEEE, MMMM d, yyyy')}</p>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5">Financial Overview</h1>
        </div>
        <button onClick={() => setShowTxForm(true)} disabled={accounts.length === 0}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          style={{ backgroundColor: '#1d4ed8' }}>
          + Add Transaction
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Net Worth', value: netWorth, color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
          { label: 'Monthly Income', value: totalIncome, color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
          { label: 'Monthly Expenses', value: totalExpenses, color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
          { label: 'Net Savings', value: savings, color: savings >= 0 ? '#0891b2' : '#ea580c', bg: savings >= 0 ? '#f0f9ff' : '#fff7ed', border: savings >= 0 ? '#bae6fd' : '#fed7aa' },
        ].map(c => (
          <div key={c.label} className="rounded-2xl p-5 border" style={{ backgroundColor: c.bg, borderColor: c.border }}>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{c.label}</p>
            <p className="text-2xl font-bold mt-1.5" style={{ color: c.color }}>{fmt(c.value)}</p>
          </div>
        ))}
      </div>

      {/* Accounts strip */}
      {accounts.length > 0 && (
        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Your Accounts</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {accounts.map(a => (
              <div key={a.id} className={`${card} p-4`}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: a.color }} />
                  <span className="text-xs text-slate-400 capitalize font-medium">{a.type}</span>
                </div>
                <p className="text-sm font-semibold text-slate-700 truncate">{a.name}</p>
                <p className={`text-xl font-bold mt-1 ${a.balance >= 0 ? 'text-slate-900' : 'text-red-600'}`}>{fmt(a.balance)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts row */}
      {transactions.length > 0 && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Area chart */}
            <div className={`${card} p-5 lg:col-span-2`}>
              <h2 className="font-semibold text-slate-800">Cash Flow</h2>
              <p className="text-xs text-slate-400 mt-0.5 mb-4">Income vs Expenses — last 6 months</p>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="ig" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="eg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#dc2626" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={tooltip} formatter={(v) => fmt(Number(v))} />
                  <Area type="monotone" dataKey="Income" stroke="#16a34a" strokeWidth={2} fill="url(#ig)" />
                  <Area type="monotone" dataKey="Expenses" stroke="#dc2626" strokeWidth={2} fill="url(#eg)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Pie chart */}
            {categoryData.length > 0 && (
              <div className={`${card} p-5`}>
                <h2 className="font-semibold text-slate-800">Spending Breakdown</h2>
                <p className="text-xs text-slate-400 mt-0.5 mb-2">This month by category</p>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="45%" innerRadius={45} outerRadius={70} paddingAngle={3}>
                      {categoryData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltip} formatter={(v) => fmtFull(Number(v))} />
                    <Legend formatter={(v) => <span style={{ fontSize: '11px', color: '#64748b' }}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Bar chart */}
          <div className={`${card} p-5`}>
            <h2 className="font-semibold text-slate-800">Monthly Expenses by Category</h2>
            <p className="text-xs text-slate-400 mt-0.5 mb-4">Last 6 months breakdown</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={tooltip} formatter={(v) => fmt(Number(v))} />
                {categories.filter(c => c.type === 'expense').map(c => (
                  <Bar key={c.id} dataKey={c.id} name={c.name} stackId="a" fill={c.color} radius={[0, 0, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* Bottom row: recent + recurring */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {recentTx.length > 0 && (
          <div className={`${card} overflow-hidden`}>
            <div className="px-5 py-4 flex justify-between items-center" style={{ borderBottom: '1px solid #f1f5f9' }}>
              <h2 className="font-semibold text-slate-800">Recent Transactions</h2>
              <a href="/transactions" className="text-xs font-medium" style={{ color: '#1d4ed8' }}>View all →</a>
            </div>
            {recentTx.map((t, i) => {
              const cat = categories.find(c => c.id === t.categoryId);
              const acc = accounts.find(a => a.id === t.accountId);
              return (
                <div key={t.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors"
                  style={i < recentTx.length - 1 ? { borderBottom: '1px solid #f8fafc' } : {}}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base" style={{ backgroundColor: (cat?.color ?? '#64748b') + '18' }}>
                      {cat?.icon ?? '📦'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{t.description}</p>
                      <p className="text-xs text-slate-400">{format(parseISO(t.date), 'MMM d')} · {acc?.name}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'income' ? '+' : '-'}{fmtFull(t.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {upcomingRecurring.length > 0 && (
          <div className={`${card} overflow-hidden`}>
            <div className="px-5 py-4 flex justify-between items-center" style={{ borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <h2 className="font-semibold text-slate-800">Recurring Charges</h2>
                <p className="text-xs text-slate-400 mt-0.5">{fmt(monthlyRecurringCost)}/mo estimated</p>
              </div>
              <a href="/recurring" className="text-xs font-medium" style={{ color: '#1d4ed8' }}>Manage →</a>
            </div>
            {upcomingRecurring.map((r, i) => {
              const cat = categories.find(c => c.id === r.categoryId);
              return (
                <div key={r.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors"
                  style={i < upcomingRecurring.length - 1 ? { borderBottom: '1px solid #f8fafc' } : {}}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base" style={{ backgroundColor: (cat?.color ?? '#64748b') + '18' }}>
                      {cat?.icon ?? '🔄'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{r.description}</p>
                      <p className="text-xs text-slate-400 capitalize">{r.frequency} · Next: {format(parseISO(r.nextDate), 'MMM d')}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold ${r.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {r.type === 'income' ? '+' : '-'}{fmtFull(r.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {accounts.length === 0 && (
        <div className="text-center py-24">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl mx-auto mb-4">🏦</div>
          <p className="text-lg font-bold text-slate-800">Welcome to BudgetTracker</p>
          <p className="text-slate-500 text-sm mt-2">Start by adding an account in the <a href="/accounts" className="text-blue-600 font-medium">Accounts</a> tab.</p>
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
