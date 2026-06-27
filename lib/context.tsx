'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Account, Budget, Category, Transaction, RecurringTransaction } from './types';
import {
  getAccounts, saveAccounts, getCategories, saveCategories,
  getTransactions, saveTransactions, getBudgets, saveBudgets,
  getRecurring, saveRecurring,
} from './store';

interface AppContextType {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  recurring: RecurringTransaction[];
  addAccount: (a: Account) => void;
  updateAccount: (a: Account) => void;
  deleteAccount: (id: string) => void;
  addTransaction: (t: Transaction) => void;
  updateTransaction: (t: Transaction) => void;
  deleteTransaction: (id: string) => void;
  addBudget: (b: Budget) => void;
  updateBudget: (b: Budget) => void;
  deleteBudget: (id: string) => void;
  addCategory: (c: Category) => void;
  addRecurring: (r: RecurringTransaction) => void;
  updateRecurring: (r: RecurringTransaction) => void;
  deleteRecurring: (id: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([]);

  useEffect(() => {
    setAccounts(getAccounts());
    setCategories(getCategories());
    setTransactions(getTransactions());
    setBudgets(getBudgets());
    setRecurring(getRecurring());
  }, []);

  const addAccount = useCallback((a: Account) => {
    setAccounts(prev => { const next = [...prev, a]; saveAccounts(next); return next; });
  }, []);

  const updateAccount = useCallback((a: Account) => {
    setAccounts(prev => { const next = prev.map(x => x.id === a.id ? a : x); saveAccounts(next); return next; });
  }, []);

  const deleteAccount = useCallback((id: string) => {
    setAccounts(prev => { const next = prev.filter(x => x.id !== id); saveAccounts(next); return next; });
  }, []);

  const addTransaction = useCallback((t: Transaction) => {
    setTransactions(prev => { const next = [t, ...prev]; saveTransactions(next); return next; });
    setAccounts(prev => {
      const next = prev.map(a => {
        if (a.id !== t.accountId) return a;
        return { ...a, balance: a.balance + (t.type === 'income' ? t.amount : -t.amount) };
      });
      saveAccounts(next);
      return next;
    });
  }, []);

  const updateTransaction = useCallback((t: Transaction) => {
    setTransactions(prev => {
      const old = prev.find(x => x.id === t.id);
      const next = prev.map(x => x.id === t.id ? t : x);
      saveTransactions(next);
      if (old) {
        setAccounts(accs => {
          const updated = accs.map(a => {
            let bal = a.balance;
            if (a.id === old.accountId) bal += old.type === 'income' ? -old.amount : old.amount;
            if (a.id === t.accountId) bal += t.type === 'income' ? t.amount : -t.amount;
            return (a.id === old.accountId || a.id === t.accountId) ? { ...a, balance: bal } : a;
          });
          saveAccounts(updated);
          return updated;
        });
      }
      return next;
    });
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => {
      const old = prev.find(x => x.id === id);
      const next = prev.filter(x => x.id !== id);
      saveTransactions(next);
      if (old) {
        setAccounts(accs => {
          const updated = accs.map(a => a.id !== old.accountId ? a : { ...a, balance: a.balance + (old.type === 'income' ? -old.amount : old.amount) });
          saveAccounts(updated);
          return updated;
        });
      }
      return next;
    });
  }, []);

  const addBudget = useCallback((b: Budget) => {
    setBudgets(prev => { const next = [...prev, b]; saveBudgets(next); return next; });
  }, []);

  const updateBudget = useCallback((b: Budget) => {
    setBudgets(prev => { const next = prev.map(x => x.id === b.id ? b : x); saveBudgets(next); return next; });
  }, []);

  const deleteBudget = useCallback((id: string) => {
    setBudgets(prev => { const next = prev.filter(x => x.id !== id); saveBudgets(next); return next; });
  }, []);

  const addCategory = useCallback((c: Category) => {
    setCategories(prev => { const next = [...prev, c]; saveCategories(next); return next; });
  }, []);

  const addRecurring = useCallback((r: RecurringTransaction) => {
    setRecurring(prev => { const next = [...prev, r]; saveRecurring(next); return next; });
  }, []);

  const updateRecurring = useCallback((r: RecurringTransaction) => {
    setRecurring(prev => { const next = prev.map(x => x.id === r.id ? r : x); saveRecurring(next); return next; });
  }, []);

  const deleteRecurring = useCallback((id: string) => {
    setRecurring(prev => { const next = prev.filter(x => x.id !== id); saveRecurring(next); return next; });
  }, []);

  return (
    <AppContext.Provider value={{
      accounts, categories, transactions, budgets, recurring,
      addAccount, updateAccount, deleteAccount,
      addTransaction, updateTransaction, deleteTransaction,
      addBudget, updateBudget, deleteBudget,
      addCategory,
      addRecurring, updateRecurring, deleteRecurring,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
