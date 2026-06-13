import { describe, it, expect, vi, beforeEach } from 'vitest';
import { inventoryService } from '../inventory.service';

vi.mock('@/lib/supabase', () => {
  const from = vi.fn();
  return { supabase: { from } };
});

describe('inventoryService', () => {
  let supabaseMock: any;

  beforeEach(async () => {
    const mod = await import('@/lib/supabase');
    supabaseMock = mod.supabase;
    supabaseMock.from = vi.fn();
  });

  describe('getCategories', () => {
    it('returns categories', async () => {
      const order = vi.fn().mockResolvedValue({ data: [{ id: 'cat1', name: 'Medicine', created_at: '2026-01-01' }], error: null });
      supabaseMock.from.mockReturnValue({ select: vi.fn(() => ({ order })) });

      const result = await inventoryService.getCategories();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Medicine');
    });

    it('returns empty array on error', async () => {
      const order = vi.fn().mockResolvedValue({ data: null, error: { message: 'Error', code: 'UNKNOWN' } });
      supabaseMock.from.mockReturnValue({ select: vi.fn(() => ({ order })) });

      await expect(inventoryService.getCategories()).rejects.toThrow();
    });
  });

  describe('getSuppliers', () => {
    it('returns suppliers', async () => {
      const order = vi.fn().mockResolvedValue({ data: [{ id: 's1', name: 'Supplier A', contact: '123' }], error: null });
      supabaseMock.from.mockReturnValue({ select: vi.fn(() => ({ order })) });

      const result = await inventoryService.getSuppliers();
      expect(result).toHaveLength(1);
    });
  });

  describe('getInventoryItems', () => {
    it('returns paginated items', async () => {
      const range = vi.fn().mockResolvedValue({
        data: [{ id: 'i1', name: 'Item A', category_id: 'cat1', unit: 'pcs', min_stock: 5, current_stock: 10, price_per_unit: 50000, is_active: true, created_at: '2026-01-01', updated_at: '2026-01-01' }],
        count: 1, error: null
      });
      const order = vi.fn(() => ({ range }));
      supabaseMock.from.mockReturnValue({ select: vi.fn(() => ({ order })) });

      const result = await inventoryService.getInventoryItems({ page: 1, pageSize: 12 });
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('filters by search', async () => {
      const range = vi.fn().mockResolvedValue({ data: [], count: 0, error: null });
      const ilike = vi.fn(() => ({ range }));
      const order = vi.fn(() => ({ ilike }));
      supabaseMock.from.mockReturnValue({ select: vi.fn(() => ({ order })) });

      const result = await inventoryService.getInventoryItems({ search: 'Item' });
      expect(result.items).toEqual([]);
    });

    it('filters low stock items', async () => {
      const range = vi.fn().mockResolvedValue({
        data: [
          { id: 'i1', name: 'Low Item', category_id: 'cat1', unit: 'pcs', min_stock: 10, current_stock: 3, price_per_unit: 1000, is_active: true, created_at: '2026-01-01', updated_at: '2026-01-01' }
        ],
        count: 1, error: null
      });
      const order = vi.fn(() => ({ range }));
      supabaseMock.from.mockReturnValue({ select: vi.fn(() => ({ order })) });

      const result = await inventoryService.getInventoryItems({ lowStock: true });
      expect(result.items).toHaveLength(1);
    });
  });

  describe('getItemById', () => {
    it('returns item with batches', async () => {
      const single = vi.fn().mockResolvedValue({
        data: { id: 'i1', name: 'Item A', category_id: 'cat1', unit: 'pcs', min_stock: 5, current_stock: 10, price_per_unit: 50000, is_active: true, created_at: '2026-01-01', updated_at: '2026-01-01', inventory_categories: { name: 'Medicine' }, inventory_batches: [] },
        error: null
      });
      const eq = vi.fn(() => ({ single }));
      const select = vi.fn(() => ({ eq }));
      supabaseMock.from.mockReturnValue({ select });

      const result = await inventoryService.getItemById('i1');
      expect(result).not.toBeNull();
      expect(result!.name).toBe('Item A');
    });

    it('returns null when not found', async () => {
      const single = vi.fn().mockResolvedValue({ data: null, error: null });
      const eq = vi.fn(() => ({ single }));
      const select = vi.fn(() => ({ eq }));
      supabaseMock.from.mockReturnValue({ select });

      const result = await inventoryService.getItemById('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('createItem', () => {
    it('creates item successfully', async () => {
      const single = vi.fn().mockResolvedValue({
        data: { id: 'i1', name: 'New Item', category_id: 'cat1', unit: 'pcs', min_stock: 5, current_stock: 0, price_per_unit: 10000, is_active: true, created_at: '2026-01-01', updated_at: '2026-01-01' },
        error: null
      });
      const select = vi.fn(() => ({ single }));
      const insert = vi.fn(() => ({ select }));
      supabaseMock.from.mockReturnValue({ insert });

      const result = await inventoryService.createItem({ name: 'New Item', categoryId: 'cat1', unit: 'pcs', minStock: 5, currentStock: 0, pricePerUnit: 10000 });
      expect(result.name).toBe('New Item');
    });

    it('throws on creation error', async () => {
      const single = vi.fn().mockResolvedValue({ data: null, error: { message: 'Insert failed', code: 'UNKNOWN' } });
      const select = vi.fn(() => ({ single }));
      const insert = vi.fn(() => ({ select }));
      supabaseMock.from.mockReturnValue({ insert });

      await expect(inventoryService.createItem({ name: 'New Item', categoryId: 'cat1', unit: 'pcs', minStock: 5, currentStock: 0, pricePerUnit: 10000 })).rejects.toThrow();
    });
  });

  describe('updateItem', () => {
    it('updates item successfully', async () => {
      const single = vi.fn().mockResolvedValue({
        data: { id: 'i1', name: 'Updated', category_id: 'cat1', unit: 'pcs', min_stock: 10, current_stock: 20, price_per_unit: 15000, is_active: true, created_at: '2026-01-01', updated_at: '2026-01-01' },
        error: null
      });
      const select = vi.fn(() => ({ single }));
      const eq = vi.fn(() => ({ select }));
      const update = vi.fn(() => ({ eq }));
      supabaseMock.from.mockReturnValue({ update });

      const result = await inventoryService.updateItem('i1', { name: 'Updated', minStock: 10 });
      expect(result.name).toBe('Updated');
    });
  });

  describe('addBatch', () => {
    it('adds batch and records movement', async () => {
      const single = vi.fn().mockResolvedValue({
        data: { id: 'b1', item_id: 'i1', supplier_id: 's1', batch_number: 'B001', quantity: 100, expiry_date: '2027-01-01', purchase_price: 5000, received_at: '2026-01-01', created_by: 'u1' },
        error: null
      });
      const select = vi.fn(() => ({ single }));
      const insert = vi.fn(() => ({ select }));
      supabaseMock.from.mockReturnValue({ insert });

      const result = await inventoryService.addBatch({ itemId: 'i1', supplierId: 's1', batchNumber: 'B001', quantity: 100, expiryDate: '2027-01-01', purchasePrice: 5000 });
      expect(result.batchNumber).toBe('B001');
    });
  });

  describe('getLowStockItems', () => {
    it('returns items with stock <= min_stock', async () => {
      const order = vi.fn().mockResolvedValue({
        data: [
          { id: 'i1', name: 'Low Item', category_id: 'cat1', unit: 'pcs', min_stock: 10, current_stock: 3, price_per_unit: 1000, is_active: true, created_at: '2026-01-01', updated_at: '2026-01-01' },
          { id: 'i2', name: 'OK Item', category_id: 'cat1', unit: 'pcs', min_stock: 5, current_stock: 20, price_per_unit: 1000, is_active: true, created_at: '2026-01-01', updated_at: '2026-01-01' }
        ],
        error: null
      });
      supabaseMock.from.mockReturnValue({ select: vi.fn(() => ({ order })) });

      const result = await inventoryService.getLowStockItems();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Low Item');
    });
  });

  describe('getExpiringItems', () => {
    it('returns expiring batches', async () => {
      const order = vi.fn().mockResolvedValue({
        data: [{ id: 'b1', item_id: 'i1', supplier_id: 's1', batch_number: 'B001', quantity: 100, expiry_date: '2026-07-01', purchase_price: 5000, received_at: '2026-01-01', created_by: 'u1' }],
        error: null
      });
      const lte = vi.fn(() => ({ order }));
      supabaseMock.from.mockReturnValue({ select: vi.fn(() => ({ lte })) });

      const result = await inventoryService.getExpiringItems(30);
      expect(result).toHaveLength(1);
    });
  });

  describe('adjustStock', () => {
    it('records stock adjustment', async () => {
      const single = vi.fn().mockResolvedValue({ data: { current_stock: 10 }, error: null });
      const eq = vi.fn(() => ({ single }));
      const select = vi.fn(() => ({ eq }));
      const update = vi.fn(() => ({ eq }));
      supabaseMock.from.mockReturnValue({ select, update });

      const result = await inventoryService.adjustStock('i1', 5, 'Manual adjustment');
      expect(result).toBe(true);
    });
  });
});