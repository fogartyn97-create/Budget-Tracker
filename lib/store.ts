import { Account, Budget, Category, Transaction } from './types';

const KEYS = {
  accounts: 'bt_accounts',
  categories: 'bt_categories',
  transactions: 'bt_transactions',
  budgets: 'bt_budgets',
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

// Accounts
export function getAccounts(): Account[] {
  return load<Account[]>(KEYS.accounts, []);
}
export function saveAccounts(accounts: Account[]): void {
  save(KEYS.accounts, accounts);
}

// Categories
export function getCategories(): Category[] {
  return load<Category[]>(KEYS.categories, DEFAULT_CATEGORIES);
}
export function saveCategories(categories: Category[]): void {
  save(KEYS.categories, categories);
}

// Transactions
export function getTransactions(): Transaction[] {
  return load<Transaction[]>(KEYS.transactions, []);
}
export function saveTransactions(transactions: Transaction[]): void {
  save(KEYS.transactions, transactions);
}

// Budgets
export function getBudgets(): Budget[] {
  return load<Budget[]>(KEYS.budgets, []);
}
export function saveBudgets(budgets: Budget[]): void {
  save(KEYS.budgets, budgets);
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'c1', name: 'Salary', color: '#22c55e', icon: '💼', type: 'income' },
  { id: 'c2', name: 'Freelance', color: '#3b82f6', icon: '💻', type: 'income' },
  { id: 'c3', name: 'Investments', color: '#a855f7', icon: '📈', type: 'income' },
  { id: 'c4', name: 'Housing', color: '#ef4444', icon: '🏠', type: 'expense' },
  { id: 'c5', name: 'Food & Dining', color: '#f97316', icon: '🍔', type: 'expense' },
  { id: 'c6', name: 'Transport', color: '#eab308', icon: '🚗', type: 'expense' },
  { id: 'c7', name: 'Entertainment', color: '#ec4899', icon: '🎬', type: 'expense' },
  { id: 'c8', name: 'Health', color: '#14b8a6', icon: '🏥', type: 'expense' },
  { id: 'c9', name: 'Shopping', color: '#8b5cf6', icon: '🛍️', type: 'expense' },
  { id: 'c10', name: 'Utilities', color: '#64748b', icon: '⚡', type: 'expense' },
  { id: 'c11', name: 'Education', color: '#0ea5e9', icon: '📚', type: 'expense' },
  { id: 'c12', name: 'Other', color: '#6b7280', icon: '📦', type: 'expense' },
];
