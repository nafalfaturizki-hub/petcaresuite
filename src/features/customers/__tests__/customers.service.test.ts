import { describe, it, expect, vi, beforeEach } from 'vitest';
import { customersService } from '../customers.service';

vi.mock('@/lib/supabase', () => {
  const from = vi.fn();
  return { supabase: { from } };
});

describe('customersService', () => {
  let supabaseMock: any;

  beforeEach(async () => {
    const mod = await import('@/lib/supabase');
    supabaseMock = mod.supabase;
    supabaseMock.from = vi.fn();
  });

  describe('getCustomers', () => {
    it('returns paginated customers', async () => {
      const range = vi.fn().mockResolvedValue({
        data: [{ id: 'c1', full_name: 'Alice', whatsapp: '+62', email: 'a@b.com', status: 'active', loyalty_points: 10, created_at: '2026-01-01' }],
        count: 1, error: null
      });
      const order = vi.fn(() => ({ range }));
      supabaseMock.from.mockReturnValue({ select: vi.fn(() => ({ order })) });

      const result = await customersService.getCustomers({ page: 1 });
      expect(result.items).toHaveLength(1);
      expect(result.items[0].fullName).toBe('Alice');
    });

    it('filters by search', async () => {
      const range = vi.fn().mockResolvedValue({ data: [], count: 0, error: null });
      const ilike = vi.fn(() => ({ range }));
      const order = vi.fn(() => ({ ilike }));
      supabaseMock.from.mockReturnValue({ select: vi.fn(() => ({ order })) });

      const result = await customersService.getCustomers({ search: 'Bob' });
      expect(result.items).toEqual([]);
    });

    it('filters by status', async () => {
      const range = vi.fn().mockResolvedValue({ data: [], count: 0, error: null });
      const eq = vi.fn(() => ({ range }));
      const order = vi.fn(() => ({ eq }));
      supabaseMock.from.mockReturnValue({ select: vi.fn(() => ({ order })) });

      const result = await customersService.getCustomers({ status: 'inactive' });
      expect(result.items).toEqual([]);
    });
  });

  describe('getCustomerById', () => {
    it('returns customer when found', async () => {
      const single = vi.fn().mockResolvedValue({
        data: { id: 'c1', full_name: 'Alice', whatsapp: '+62', email: 'a@b.com', status: 'active', loyalty_points: 10, created_at: '2026-01-01' },
        error: null
      });
      const eq = vi.fn(() => ({ single }));
      const select = vi.fn(() => ({ eq }));
      supabaseMock.from.mockReturnValue({ select });

      const result = await customersService.getCustomerById('c1');
      expect(result).not.toBeNull();
      expect(result!.fullName).toBe('Alice');
    });

    it('returns null when not found', async () => {
      const single = vi.fn().mockResolvedValue({ data: null, error: null });
      const eq = vi.fn(() => ({ single }));
      const select = vi.fn(() => ({ eq }));
      supabaseMock.from.mockReturnValue({ select });

      const result = await customersService.getCustomerById('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('createCustomer', () => {
    it('creates customer successfully', async () => {
      const single = vi.fn().mockResolvedValue({
        data: { id: 'c1', full_name: 'New Customer', whatsapp: null, email: null, status: 'active', loyalty_points: 0, created_at: '2026-01-01' },
        error: null
      });
      const select = vi.fn(() => ({ single }));
      const insert = vi.fn(() => ({ select }));
      supabaseMock.from.mockReturnValue({ insert });

      const result = await customersService.createCustomer({ fullName: 'New Customer' });
      expect(result.fullName).toBe('New Customer');
    });

    it('throws on creation error', async () => {
      const single = vi.fn().mockResolvedValue({ data: null, error: { message: 'Failed', code: 'UNKNOWN' } });
      const select = vi.fn(() => ({ single }));
      const insert = vi.fn(() => ({ select }));
      supabaseMock.from.mockReturnValue({ insert });

      await expect(customersService.createCustomer({ fullName: 'Test' })).rejects.toThrow();
    });
  });

  describe('updateCustomer', () => {
    it('updates customer successfully', async () => {
      const single = vi.fn().mockResolvedValue({
        data: { id: 'c1', full_name: 'Updated', whatsapp: '+62', email: 'u@b.com', status: 'active', loyalty_points: 10, created_at: '2026-01-01' },
        error: null
      });
      const select = vi.fn(() => ({ single }));
      const eq = vi.fn(() => ({ select }));
      const update = vi.fn(() => ({ eq }));
      supabaseMock.from.mockReturnValue({ update });

      const result = await customersService.updateCustomer('c1', { fullName: 'Updated' });
      expect(result.fullName).toBe('Updated');
    });
  });

  describe('updateCustomerStatus', () => {
    it('updates status', async () => {
      const single = vi.fn().mockResolvedValue({
        data: { id: 'c1', full_name: 'Alice', status: 'inactive', loyalty_points: 0, created_at: '2026-01-01' },
        error: null
      });
      const select = vi.fn(() => ({ single }));
      const eq = vi.fn(() => ({ select }));
      const update = vi.fn(() => ({ eq }));
      supabaseMock.from.mockReturnValue({ update });

      const result = await customersService.updateCustomerStatus('c1', 'inactive');
      expect(result.status).toBe('inactive');
    });
  });

  describe('getCustomerPets', () => {
    it('returns customer pets', async () => {
      const order = vi.fn().mockResolvedValue({
        data: [{ id: 'p1', name: 'Max', customer_id: 'c1', species_id: 's1', breed_id: 'b1', gender: 'male', is_active: true, created_at: '2026-01-01', updated_at: '2026-01-01', species: { name: 'Dog' }, breeds: { name: 'Labrador' } }],
        error: null
      });
      const eq = vi.fn(() => ({ order }));
      supabaseMock.from.mockReturnValue({ select: vi.fn(() => ({ eq })) });

      const result = await customersService.getCustomerPets('c1');
      expect(result).toHaveLength(1);
    });
  });

  describe('getCustomerInvoices', () => {
    it('returns customer invoices', async () => {
      const eq = vi.fn().mockResolvedValue({ data: [{ id: 'inv1', total: 100000 }], error: null });
      supabaseMock.from.mockReturnValue({ select: vi.fn(() => ({ eq })) });

      const result = await customersService.getCustomerInvoices('c1');
      expect(result).toHaveLength(1);
    });
  });

  describe('getCustomerActivityLog', () => {
    it('returns activity log', async () => {
      const limit = vi.fn().mockResolvedValue({ data: [{ id: 'log1', action: 'login' }], error: null });
      const order = vi.fn(() => ({ limit }));
      const eq = vi.fn(() => ({ order }));
      supabaseMock.from.mockReturnValue({ select: vi.fn(() => ({ eq })) });

      const result = await customersService.getCustomerActivityLog('c1');
      expect(result).toHaveLength(1);
    });
  });

  describe('adjustLoyaltyPoints', () => {
    it('adjusts loyalty points', async () => {
      const single = vi.fn().mockResolvedValue({
        data: { id: 'lt1', customer_id: 'c1', amount: 100, reason: 'Bonus', created_at: '2026-01-01' },
        error: null
      });
      const select = vi.fn(() => ({ single }));
      const insert = vi.fn(() => ({ select }));
      supabaseMock.from.mockReturnValue({ insert });

      const result = await customersService.adjustLoyaltyPoints('c1', 100, 'Bonus');
      expect(result.amount).toBe(100);
    });
  });
});