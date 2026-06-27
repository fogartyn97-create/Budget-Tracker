import { Account, Budget, Category, Transaction, RecurringTransaction } from './types';

const KEYS = {
  accounts: 'bt_accounts',
  categories: 'bt_categories',
  transactions: 'bt_transactions',
  budgets: 'bt_budgets',
  recurring: 'bt_recurring',
};

function load<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getAccounts(): Account[] { return load<Account[]>(KEYS.accounts, []); }
export function saveAccounts(a: Account[]): void { save(KEYS.accounts, a); }

export function getCategories(): Category[] { return load<Category[]>(KEYS.categories, DEFAULT_CATEGORIES); }
export function saveCategories(c: Category[]): void { save(KEYS.categories, c); }

export function getTransactions(): Transaction[] { return load<Transaction[]>(KEYS.transactions, []); }
export function saveTransactions(t: Transaction[]): void { save(KEYS.transactions, t); }

export function getBudgets(): Budget[] { return load<Budget[]>(KEYS.budgets, []); }
export function saveBudgets(b: Budget[]): void { save(KEYS.budgets, b); }

export function getRecurring(): RecurringTransaction[] { return load<RecurringTransaction[]>(KEYS.recurring, []); }
export function saveRecurring(r: RecurringTransaction[]): void { save(KEYS.recurring, r); }

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'c1', name: 'Salary', color: '#16a34a', icon: '💼', type: 'income' },
  { id: 'c2', name: 'Freelance', color: '#2563eb', icon: '💻', type: 'income' },
  { id: 'c3', name: 'Investments', color: '#7c3aed', icon: '📈', type: 'income' },
  { id: 'c4', name: 'Housing', color: '#dc2626', icon: '🏠', type: 'expense' },
  { id: 'c5', name: 'Food & Dining', color: '#ea580c', icon: '🍔', type: 'expense' },
  { id: 'c6', name: 'Transport', color: '#ca8a04', icon: '🚗', type: 'expense' },
  { id: 'c7', name: 'Entertainment', color: '#db2777', icon: '🎬', type: 'expense' },
  { id: 'c8', name: 'Health', color: '#0891b2', icon: '🏥', type: 'expense' },
  { id: 'c9', name: 'Shopping', color: '#7c3aed', icon: '🛍️', type: 'expense' },
  { id: 'c10', name: 'Utilities', color: '#475569', icon: '⚡', type: 'expense' },
  { id: 'c11', name: 'Education', color: '#0284c7', icon: '📚', type: 'expense' },
  { id: 'c12', name: 'Subscriptions', color: '#0f766e', icon: '🔄', type: 'expense' },
  { id: 'c13', name: 'Other', color: '#64748b', icon: '📦', type: 'expense' },
];
