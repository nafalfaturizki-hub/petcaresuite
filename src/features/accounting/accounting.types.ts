export interface LedgerTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  category: string;
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  entryDate: string;
  reference: string;
  description: string;
  debit: number;
  credit: number;
  createdAt: string;
}

export interface AccountBalance {
  account: string;
  balance: number;
}

export interface Account {
  id: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  description?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  accountName?: string;
  invoiceId?: string | null;
  type: 'debit' | 'credit';
  amount: number;
  description?: string | null;
  reference?: string | null;
  transactionDate: string;
  createdAt: string;
}

export interface TransactionQueryParams {
  page?: number;
  pageSize?: number;
  from?: string;
  to?: string;
  type?: 'debit' | 'credit';
  accountId?: string;
  search?: string;
}

export interface TransactionPayload {
  accountId: string;
  invoiceId?: string | null;
  type: 'debit' | 'credit';
  amount: number;
  description?: string;
  reference?: string;
  transactionDate?: string;
}

export interface PeriodSum {
  period: string;
  amount: number;
}

export interface ProfitLossResult {
  income: number;
  expenses: number;
  netProfit: number;
  breakdown: Array<{ accountName: string; type: 'debit' | 'credit'; amount: number }>;
}

export interface CashFlowMonth {
  month: number;
  income: number;
  expenses: number;
  net: number;
}

export interface AccountingQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
}

export interface JournalCreatePayload {
  entryDate: string;
  reference: string;
  description: string;
  debit: number;
  credit: number;
  category: string;
}
