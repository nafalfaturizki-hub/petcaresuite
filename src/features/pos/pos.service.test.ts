import { describe, it, expect, vi, beforeEach } from 'vitest';
import { posService } from './pos.service';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn()
  }
}));

let supabaseMock: any;

describe('posService', () => {
  beforeEach(async () => {
    const mod = await import('@/lib/supabase');
    supabaseMock = mod.supabase;
    supabaseMock.from = vi.fn();
  });

  it('searchProducts returns mapped product variants', async () => {
    const limit = vi.fn().mockResolvedValue({ data: [{ id: 'p1', variant_name: 'Large', price: '12000', stock: '5', products: { name: 'Dog Food' } }], error: null });
    const ilike = vi.fn(() => ({ limit }));
    const select = vi.fn(() => ({ ilike }));
    supabaseMock.from.mockReturnValue({ select });

    const result = await posService.searchProducts('food');

    expect(supabaseMock.from).toHaveBeenCalledWith('product_variants');
    expect(select).toHaveBeenCalled();
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Dog Food Large');
    expect(result[0].price).toBe(12000);
  });

  it('searchServices returns matched services', async () => {
    const limit = vi.fn().mockResolvedValue({ data: [{ id: 's1', name: 'Grooming', price: '85000', category: 'Care' }], error: null });
    const ilike = vi.fn(() => ({ limit }));
    const select = vi.fn(() => ({ ilike }));
    supabaseMock.from.mockReturnValue({ select });

    const result = await posService.searchServices('groom');

    expect(supabaseMock.from).toHaveBeenCalledWith('services');
    expect(result[0].name).toBe('Grooming');
    expect(result[0].price).toBe(85000);
  });

  it('getInvoiceById returns invoice with items', async () => {
    const single = vi.fn().mockResolvedValue({ data: { id: 'inv1', total: 900, invoice_items: [] }, error: null });
    const eq = vi.fn(() => ({ single }));
    const select = vi.fn(() => ({ eq }));
    supabaseMock.from.mockReturnValue({ select });

    const result = await posService.getInvoiceById('inv1');

    expect(supabaseMock.from).toHaveBeenCalledWith('invoices');
    expect(eq).toHaveBeenCalledWith('id', 'inv1');
    expect(result.id).toBe('inv1');
    expect(result.total).toBe(900);
  });

  it('processRefund inserts refund and updates invoice status', async () => {
    const single = vi.fn().mockResolvedValue({ data: { id: 'r1', invoice_id: 'inv1', amount: 500, reason: 'Customer return' }, error: null });
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));
    const eq = vi.fn(() => ({ }));
    const update = vi.fn(() => ({ eq }));

    supabaseMock.from.mockReturnValueOnce({ insert }).mockReturnValueOnce({ update });

    const result = await posService.processRefund({ invoiceId: 'inv1', amount: 500, reason: 'Customer return', processedBy: 'staff' });

    expect(supabaseMock.from.mock.calls[0][0]).toBe('refunds');
    expect(insert).toHaveBeenCalledWith({ invoice_id: 'inv1', amount: 500, reason: 'Customer return', processed_by: 'staff' });
    expect(supabaseMock.from.mock.calls[1][0]).toBe('invoices');
    expect(update).toHaveBeenCalledWith({ status: 'refunded' });
    expect(eq).toHaveBeenCalledWith('id', 'inv1');
    expect(result.id).toBe('r1');
  });
});
