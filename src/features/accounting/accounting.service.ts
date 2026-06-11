import { supabase } from '@/lib/supabase';
import type {
  Account,
  Transaction,
  TransactionQueryParams,
  TransactionPayload,
  PeriodSum,
  ProfitLossResult,
  CashFlowMonth
} from './accounting.types';

function mapAccount(record: any): Account {
  return {
    id: record.id,
    name: record.name,
    type: record.type,
    description: record.description,
    isActive: record.is_active,
    createdAt: record.created_at
  };
}

function mapTransaction(record: any): Transaction {
  return {
    id: record.id,
    accountId: record.account_id,
    accountName: record.accounts ? record.accounts.name : record.account_name || undefined,
    invoiceId: record.invoice_id,
    type: record.type,
    amount: Number(record.amount),
    description: record.description,
    reference: record.reference,
    transactionDate: record.transaction_date,
    createdAt: record.created_at
  };
}

export const accountingService = {
  async getAccounts(): Promise<Account[]> {
    const { data, error } = await supabase.from('accounts').select('id, name, type, description, is_active, created_at').eq('is_active', true).order('name');
    if (error) throw new Error(error.message);
    return (data || []).map(mapAccount);
  },

  async createAccount(payload: { name: string; type: Account['type']; description?: string }): Promise<Account> {
    const { data, error } = await supabase.from('accounts').insert({ name: payload.name, type: payload.type, description: payload.description }).select().single();
    if (error || !data) throw new Error(error?.message || 'Unable to create account');
    return mapAccount(data);
  },

  async updateAccount(id: string, payload: Partial<{ name: string; type: Account['type']; description?: string; isActive?: boolean }>): Promise<Account> {
    const { data, error } = await supabase.from('accounts').update(payload).eq('id', id).select().single();
    if (error || !data) throw new Error(error?.message || 'Unable to update account');
    return mapAccount(data);
  },

  async getTransactions(params: TransactionQueryParams = {}): Promise<{ items: Transaction[]; total: number }> {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 12;
    const offset = (page - 1) * pageSize;
    let query: any = supabase
      .from('transactions')
      .select('id, account_id, invoice_id, type, amount, description, reference, transaction_date, created_at, accounts(name)', { count: 'exact' })
      .order('transaction_date', { ascending: false });

    if (params.from) query = query.gte('transaction_date', params.from);
    if (params.to) query = query.lte('transaction_date', params.to);
    if (params.type) query = query.eq('type', params.type);
    if (params.accountId) query = query.eq('account_id', params.accountId);
    if (params.search) query = query.ilike('description', `%${params.search}%`).or(`reference.ilike.%${params.search}%`);

    const res = await query.range(offset, offset + pageSize - 1);
    if (res.error) throw new Error(res.error.message);
    const items = Array.isArray(res.data) ? res.data.map(mapTransaction) : [];
    return { items, total: typeof res.count === 'number' ? res.count : items.length };
  },

  async createTransaction(payload: TransactionPayload): Promise<Transaction> {
    const { data, error } = await supabase.from('transactions').insert({
      account_id: payload.accountId,
      invoice_id: payload.invoiceId || null,
      type: payload.type,
      amount: payload.amount,
      description: payload.description,
      reference: payload.reference,
      transaction_date: payload.transactionDate || new Date().toISOString().slice(0, 10)
    }).select('*, accounts(name)').single();
    if (error || !data) throw new Error(error?.message || 'Unable to create transaction');
    return mapTransaction(data);
  },

  async getIncomeByPeriod(from: string, to: string): Promise<PeriodSum[]> {
    const { data, error } = await supabase.from('transactions').select('transaction_date, amount').gte('transaction_date', from).lte('transaction_date', to).eq('type', 'credit');
    if (error) throw new Error(error.message);
    const grouped: Record<string, number> = {};
    (data || []).forEach((r: any) => { const d = r.transaction_date; grouped[d] = (grouped[d] || 0) + Number(r.amount); });
    return Object.entries(grouped).map(([period, amount]) => ({ period, amount }));
  },

  async getExpenseByPeriod(from: string, to: string): Promise<PeriodSum[]> {
    const { data, error } = await supabase.from('transactions').select('transaction_date, amount').gte('transaction_date', from).lte('transaction_date', to).eq('type', 'debit');
    if (error) throw new Error(error.message);
    const grouped: Record<string, number> = {};
    (data || []).forEach((r: any) => { const d = r.transaction_date; grouped[d] = (grouped[d] || 0) + Number(r.amount); });
    return Object.entries(grouped).map(([period, amount]) => ({ period, amount }));
  },

  async getProfitLoss(month: number, year: number): Promise<ProfitLossResult> {
    const start = new Date(year, month - 1, 1).toISOString().slice(0, 10);
    const end = new Date(year, month, 0).toISOString().slice(0, 10);

    const { data: incomeData, error: incErr } = await supabase.from('transactions').select('amount, account_id').gte('transaction_date', start).lte('transaction_date', end).eq('type', 'credit');
    if (incErr) throw new Error(incErr.message);
    const income = (incomeData || []).reduce((s: number, r: any) => s + Number(r.amount), 0);

    const { data: expenseData, error: expErr } = await supabase.from('transactions').select('amount, account_id').gte('transaction_date', start).lte('transaction_date', end).eq('type', 'debit');
    if (expErr) throw new Error(expErr.message);
    const expenses = (expenseData || []).reduce((s: number, r: any) => s + Number(r.amount), 0);

    const { data: breakdownData, error: brErr } = await supabase.from('transactions').select('account_id, type, sum(amount) as amount').gte('transaction_date', start).lte('transaction_date', end).group('account_id, type');
    if (brErr) throw new Error(brErr.message);

    const breakdown: Array<{ accountName: string; type: 'debit' | 'credit'; amount: number }> = [];
    if (Array.isArray(breakdownData)) {
      for (const row of breakdownData) {
        const { data: acc } = await supabase.from('accounts').select('name').eq('id', row.account_id).single();
        breakdown.push({ accountName: acc?.name || 'Unknown', type: row.type, amount: Number(row.amount) });
      }
    }

    return { income, expenses, netProfit: income - expenses, breakdown };
  },

  async getCashFlow(year: number): Promise<CashFlowMonth[]> {
    const result: CashFlowMonth[] = [];
    for (let m = 0; m < 12; m++) {
      const start = new Date(year, m, 1).toISOString().slice(0, 10);
      const end = new Date(year, m + 1, 0).toISOString().slice(0, 10);
      const { data: inc, error: incErr } = await supabase.from('transactions').select('amount').gte('transaction_date', start).lte('transaction_date', end).eq('type', 'credit');
      if (incErr) throw new Error(incErr.message);
      const income = (inc || []).reduce((s: number, r: any) => s + Number(r.amount), 0);
      const { data: exp, error: expErr } = await supabase.from('transactions').select('amount').gte('transaction_date', start).lte('transaction_date', end).eq('type', 'debit');
      if (expErr) throw new Error(expErr.message);
      const expenses = (exp || []).reduce((s: number, r: any) => s + Number(r.amount), 0);
      result.push({ month: m + 1, income, expenses, net: income - expenses });
    }
    return result;
  }
};
