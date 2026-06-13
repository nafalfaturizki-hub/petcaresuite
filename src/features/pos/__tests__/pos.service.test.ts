import { describe, it, expect, vi, beforeEach } from 'vitest';
import { posService } from '../pos.service';

vi.mock('@/lib/supabase', () => {
  const from = vi.fn();
  return { supabase: { from, raw: vi.fn() } };
});

describe('posService', () => {
  let supabaseMock: any;

  beforeEach(async () => {
    const mod = await import('@/lib/supabase');
    supabaseMock = mod.supabase;
    supabaseMock.from = vi.fn();
    supabaseMock.raw = vi.fn();
  });

  describe('searchProducts', () => {
    it('returns products matching query', async () => {
      const limit = vi.fn().mockResolvedValue({
        data: [{ id: 'p1', variant_name: 'Variant A', price: 50000, stock: 10, products: { name: 'Product' } }],
        error: null
      });
      const ilike = vi.fn(() => ({ limit }));
      supabaseMock.from.mockReturnValue({ select: vi.fn(() => ({ ilike })) });

      const result = await posService.searchProducts('Variant');
      expect(result).toHaveLength(1);
      expect(result[0].name).toContain('Product');
    });

    it('returns empty array on no results', async () => {
      const limit = vi.fn().mockResolvedValue({ data: [], error: null });
      const ilike = vi.fn(() => ({ limit }));
      supabaseMock.from.mockReturnValue({ select: vi.fn(() => ({ ilike })) });

      const result = await posService.searchProducts('Nonexistent');
      expect(result).toEqual([]);
    });
  });

  describe('searchServices', () => {
    it('returns services matching query', async () => {
      const limit = vi.fn().mockResolvedValue({
        data: [{ id: 's1', name: 'Grooming', price: 100000, category: 'service' }],
        error: null
      });
      const ilike = vi.fn(() => ({ limit }));
      supabaseMock.from.mockReturnValue({ select: vi.fn(() => ({ ilike })) });

      const result = await posService.searchServices('Grooming');
      expect(result).toHaveLength(1);
    });
  });

  describe('getInvoices', () => {
    it('returns paginated invoices', async () => {
      const range = vi.fn().mockResolvedValue({ data: [{ id: 'inv1', total: 100000 }], count: 1, error: null });
      const order = vi.fn(() => ({ range }));
      supabaseMock.from.mockReturnValue({ select: vi.fn(() => ({ order })) });

      const result = await posService.getInvoices({ page: 1 });
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('filters by status', async () => {
      const range = vi.fn().mockResolvedValue({ data: [], count: 0, error: null });
      const eq = vi.fn(() => ({ range }));
      const order = vi.fn(() => ({ eq }));
      supabaseMock.from.mockReturnValue({ select: vi.fn(() => ({ order })) });

      const result = await posService.getInvoices({ status: 'paid' });
      expect(result.items).toEqual([]);
    });
  });

  describe('getInvoiceById', () => {
    it('returns invoice with items and refunds', async () => {
      const single = vi.fn().mockResolvedValue({
        data: { id: 'inv1', total: 100000, invoice_items: [], refunds: [] },
        error: null
      });
      const eq = vi.fn(() => ({ single }));
      const select = vi.fn(() => ({ eq }));
      supabaseMock.from.mockReturnValue({ select });

      const result = await posService.getInvoiceById('inv1');
      expect(result).not.toBeNull();
      expect(result!.items).toEqual([]);
    });

    it('returns null when not found', async () => {
      const single = vi.fn().mockResolvedValue({ data: null, error: null });
      const eq = vi.fn(() => ({ single }));
      const select = vi.fn(() => ({ eq }));
      supabaseMock.from.mockReturnValue({ select });

      const result = await posService.getInvoiceById('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('createInvoice', () => {
    it('creates invoice with items', async () => {
      const single = vi.fn().mockResolvedValue({
        data: { id: 'inv1', total: 100000 },
        error: null
      });
      const select = vi.fn(() => ({ single }));
      const insert = vi.fn(() => ({ select }));
      supabaseMock.from.mockReturnValue({ insert });

      const result = await posService.createInvoice({
        subtotal: 100000,
        discount_amount: 0,
        loyalty_points_used: 0,
        loyalty_discount_amount: 0,
        total: 100000,
        payment_method: 'cash',
        paid_amount: 100000,
        change_amount: 0,
        status: 'paid',
        items: []
      });
      expect(result).not.toBeNull();
    });
  });

  describe('processRefund', () => {
    it('creates refund and updates invoice status', async () => {
      const single = vi.fn().mockResolvedValue({ data: { id: 'r1', amount: 50000 }, error: null });
      const select = vi.fn(() => ({ single }));
      const insert = vi.fn(() => ({ select }));
      const eq = vi.fn(() => ({ select }));
      const update = vi.fn(() => ({ eq }));
      supabaseMock.from.mockReturnValue({ insert, update });

      const result = await posService.processRefund({ invoiceId: 'inv1', amount: 50000, reason: 'Damaged', processedBy: 'u1' });
      expect(result.id).toBe('r1');
    });
  });

  describe('validateLoyaltyRedeem', () => {
    it('returns valid when sufficient points', async () => {
      const single = vi.fn().mockResolvedValue({ data: { loyalty_points: 500 }, error: null });
      const eq = vi.fn(() => ({ single }));
      const select = vi.fn(() => ({ eq }));
      supabaseMock.from.mockReturnValue({ select });

      const result = await posService.validateLoyaltyRedeem('c1', 100);
      expect(result.valid).toBe(true);
    });

    it('returns invalid when insufficient points', async () => {
      const single = vi.fn().mockResolvedValue({ data: { loyalty_points: 50 }, error: null });
      const eq = vi.fn(() => ({ single }));
      const select = vi.fn(() => ({ eq }));
      supabaseMock.from.mockReturnValue({ select });

      const result = await posService.validateLoyaltyRedeem('c1', 100);
      expect(result.valid).toBe(false);
    });
  });

  describe('applyLoyaltyRedeem', () => {
    it('deducts loyalty points', async () => {
      const eq = vi.fn().mockResolvedValue({ error: null });
      const update = vi.fn(() => ({ eq }));
      supabaseMock.from.mockReturnValue({ update });

      const result = await posService.applyLoyaltyRedeem('c1', 100);
      expect(result).toBe(true);
    });
  });
});