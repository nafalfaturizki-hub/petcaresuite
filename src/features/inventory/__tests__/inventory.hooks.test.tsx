import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useInventoryCategories, useSuppliers, useInventoryItems, useInventoryBatches, useStockMovements, useLowStockItems, useExpiringBatches, useInventoryValue, useCreateInventoryItem, useCreateInventoryBatch } from '../inventory.hooks';

vi.mock('@/lib/supabase', () => ({ supabase: { from: vi.fn() } }));

vi.mock('../inventory.service', () => ({
  inventoryService: {
    getCategories: vi.fn(),
    getSuppliers: vi.fn(),
    getInventoryItems: vi.fn(),
    getInventoryBatches: vi.fn(),
    getStockMovements: vi.fn(),
    getLowStockItems: vi.fn(),
    getExpiringItems: vi.fn(),
    getInventoryValue: vi.fn(),
    createItem: vi.fn(),
    addBatch: vi.fn()
  }
}));

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('inventory hooks', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('useInventoryCategories returns categories', async () => {
    const { inventoryService } = await import('../inventory.service');
    (inventoryService.getCategories as any).mockResolvedValue([{ id: 'cat1', name: 'Medicine' }]);
    const { result } = renderHook(() => useInventoryCategories(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });

  it('useSuppliers returns suppliers', async () => {
    const { inventoryService } = await import('../inventory.service');
    (inventoryService.getSuppliers as any).mockResolvedValue([{ id: 's1', name: 'Supplier A' }]);
    const { result } = renderHook(() => useSuppliers(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });

  it('useInventoryItems returns items', async () => {
    const { inventoryService } = await import('../inventory.service');
    (inventoryService.getInventoryItems as any).mockResolvedValue({ items: [{ id: 'i1' }], total: 1 });
    const { result } = renderHook(() => useInventoryItems({ page: 1 }), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.items).toHaveLength(1);
  });

  it('useInventoryBatches returns batches', async () => {
    const { inventoryService } = await import('../inventory.service');
    (inventoryService.getInventoryBatches as any).mockResolvedValue({ items: [{ id: 'b1' }], total: 1 });
    const { result } = renderHook(() => useInventoryBatches(1), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.items).toHaveLength(1);
  });

  it('useStockMovements returns movements', async () => {
    const { inventoryService } = await import('../inventory.service');
    (inventoryService.getStockMovements as any).mockResolvedValue({ items: [{ id: 'm1' }], total: 1 });
    const { result } = renderHook(() => useStockMovements({}), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.items).toHaveLength(1);
  });

  it('useLowStockItems returns low stock items', async () => {
    const { inventoryService } = await import('../inventory.service');
    (inventoryService.getLowStockItems as any).mockResolvedValue([{ id: 'i1', name: 'Low' }]);
    const { result } = renderHook(() => useLowStockItems(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });

  it('useExpiringBatches returns expiring batches', async () => {
    const { inventoryService } = await import('../inventory.service');
    (inventoryService.getExpiringItems as any).mockResolvedValue([{ id: 'b1' }]);
    const { result } = renderHook(() => useExpiringBatches(30), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });

  it('useInventoryValue returns value', async () => {
    const { inventoryService } = await import('../inventory.service');
    (inventoryService.getInventoryValue as any).mockResolvedValue([{ categoryId: 'cat1', totalValue: 100000 }]);
    const { result } = renderHook(() => useInventoryValue(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });

  it('useCreateInventoryItem creates item', async () => {
    const { inventoryService } = await import('../inventory.service');
    (inventoryService.createItem as any).mockResolvedValue({ id: 'i1' });
    const { result } = renderHook(() => useCreateInventoryItem(), { wrapper: createWrapper() });
    await act(async () => { await result.current.mutateAsync({ name: 'Test' }); });
    expect(result.current.isSuccess).toBe(true);
  });

  it('useCreateInventoryBatch creates batch', async () => {
    const { inventoryService } = await import('../inventory.service');
    (inventoryService.addBatch as any).mockResolvedValue({ id: 'b1' });
    const { result } = renderHook(() => useCreateInventoryBatch(), { wrapper: createWrapper() });
    await act(async () => { await result.current.mutateAsync({ itemId: 'i1', supplierId: 's1', batchNumber: 'B001', quantity: 10, expiryDate: '2027-01-01', purchasePrice: 5000 }); });
    expect(result.current.isSuccess).toBe(true);
  });
});