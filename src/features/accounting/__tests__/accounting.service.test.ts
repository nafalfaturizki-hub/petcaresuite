import { describe, it, expect, vi, beforeEach } from 'vitest';
import { accountingService } from '../accounting.service';

vi.mock('@/lib/supabase', () => {
  const from = vi.fn();
  return { supabase: { from } };
});

describe('accountingService', () => {
  let supabaseMock: any;

  beforeEach(async () => {
    const mod = await import('@/lib/supabase');
    supabaseMock = mod.supabase;
    supabaseMock.from = vi.fn();
  });

  describe('getAccounts', () => {
    it('returns active accounts', async () => {
      const order = vi.fn().mockResolvedValue({
        data: [{ id: 'a1', name: 'Cash', type: 'asset', description: 'Cash account', is_active: true, created_at: '2026-01-01' }],
        error: null
      });
      const eq = vi.fn(() => ({ order }));
      supabaseMock.from.mockReturnValue({ select: vi.fn(() => ({ eq })) });

      const result = await accountingService.getAccounts();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Cash');
    });

    it('throws on error', async () => {
      const order = vi.fn().mockResolvedValue({ data: null, error: { message: 'Error', code: 'UNKNOWN' } });
      const eq = vi.fn(() => ({ order }));
      supabaseMock.from.mockReturnValue({ select: vi.fn(() => ({ eq })) });

      await expect(accountingService.getAccounts()).rejects.toThrow();
    });
  });

  describe('createAccount', () => {
    it('creates account successfully', async () => {
      const single = vi.fn().mockResolvedValue({
        data: { id: 'a1', name: 'New Account', type: 'revenue', description: 'Test', is_active: true, created_at: '2026-01-01' },
        error: null
      });
      const select = vi.fn(() => ({ single }));
      const insert = vi.fn(() => ({ select }));
      supabaseMock.from.mockReturnValue({ insert });

      const result = await accountingService.createAccount({ name: 'New Account', type: 'revenue' });
      expect(result.name).toBe('New Account');
    });

    it('throws on creation error', async () => {
      const single = vi.fn().mockResolvedValue({ data: null, error: { message: 'Failed', code: 'UNKNOWN' } });
      const select = vi.fn(() => ({ single }));
      const insert = vi.fn(() => ({ select }));
      supabaseMock.from.mockReturnValue({ insert });

      await expect(accountingService.createAccount({ name: 'Test', type: 'expense' })).rejects.toThrow();
    });
  });

  describe('getTransactions', () => {
    it('returns paginated transactions', async () => {
      const range = vi.fn().mockResolvedValue({
        data: [{ id: 't1', account_id: 'a1', type: 'credit', amount: 100000, description: 'Sale', transaction_date: '2026-01-01', created_at: '2026-01-01', accounts: { name: 'Revenue' } }],
        count: 1, error: null
      });
      const order = vi.fn(() => ({ range }));
      supabaseMock.from.mockReturnValue({ select: vi.fn(() => ({ order })) });

      const result = await accountingService.getTransactions({ page: 1 });
      expect(result.items).toHaveLength(1);
    });

    it('filters by type', async () => {
      const range = vi.fn().mockResolvedValue({ data: [], count: 0, error: null });
      const eq = vi.fn(() => ({ range }));
      const order = vi.fn(() => ({ eq }));
      supabaseMock.from.mockReturnValue({ select: vi.fn(() => ({ order })) });

      const result = await accountingService.getTransactions({ type: 'debit' });
      expect(result.items).toEqual([]);
    });
  });

  describe('createTransaction', () => {
    it('creates transaction successfully', async () => {
      const single = vi.fn().mockResolvedValue({
        data: { id: 't1', account_id: 'a1', type: 'credit', amount: 50000, description: 'Test', transaction_date: '2026-01-01', created_at: '2026-01-01', accounts: { name: 'Revenue' } },
        error: null
      });
      const select = vi.fn(() => ({ single }));
      const insert = vi.fn(() => ({ select }));
      supabaseMock.from.mockReturnValue({ insert });

      const result = await accountingService.createTransaction({ accountId: 'a1', type: 'credit', amount: 50000, description: 'Test' });
      expect(result.amount).toBe(50000);
    });
  });

  describe('getIncomeByPeriod', () => {
    it('returns grouped income', async () => {
      const lte = vi.fn().mockResolvedValue({
        data: [{ transaction_date: '2026-01-01', amount: 100000 }, { transaction_date: '2026-01-01', amount: 50000 }],
        error: null
      });
      const gte = vi.fn(() => ({ lte }));
      const eq = vi.fn(() => ({ gte }));
      supabaseMock.from.mockReturnValue({ select: vi.fn(() => ({ eq })) });

      const result = await accountingService.getIncomeByPeriod('2026-01-01', '2026-01-31');
      expect(result).toHaveLength(1);
      expect(result[0].amount).toBe(150000);
    });
  });

  describe('getExpenseByPeriod', () => {
    it('returns grouped expenses', async () => {
      const lte = vi.fn().mockResolvedValue({
        data: [{ transaction_date: '2026-01-01', amount: 30000 }],
        error: null
      });
      const gte = vi.fn(() => ({ lte }));
      const eq = vi.fn(() => ({ gte }));
      supabaseMock.from.mockReturnValue({ select: vi.fn(() => ({ eq })) });

      const result = await accountingService.getExpenseByPeriod('2026-01-01', '2026-01-31');
      expect(result).toHaveLength(1);
    });
  });

  describe('getProfitLoss', () => {
    it('returns profit/loss summary', async () => {
      const lte = vi.fn().mockResolvedValue({ data: [{ amount: 500000 }], error: null });
      const gte = vi.fn(() => ({ lte }));
      const eq = vi.fn(() => ({ gte }));
      const group = vi.fn().mockResolvedValue({ data: [], error: null });
      supabaseMock.from.mockReturnValue({ select: vi.fn(() => ({ eq, group })) });

      const result = await accountingService.getProfitLoss(1, 2026);
      expect(result.income).toBe(500000);
      expect(result.expenses).toBe(500000);
    });
  });

  describe('getCashFlow', () => {
    it('returns 12 months cash flow', async () => {
      const lte = vi.fn().mockResolvedValue({ data: [], error: null });
      const gte = vi.fn(() => ({ lte }));
      const eq = vi.fn(() => ({ gte }));
      supabaseMock.from.mockReturnValue({ select: vi.fn(() => ({ eq })) });

      const result = await accountingService.getCashFlow(2026);
      expect(result).toHaveLength(12);
    });
  });
});