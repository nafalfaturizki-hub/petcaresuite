import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils';
import InventoryPage from '@/features/inventory/pages/InventoryPage';

const mockCreateItem = { mutate: vi.fn(), isLoading: false } as any;
const mockCreateBatch = { mutate: vi.fn(), isLoading: false } as any;

vi.mock('@/features/inventory/inventory.hooks', () => ({
  useInventoryCategories: () => ({ data: [{ id: 'c1', name: 'Med' }], isLoading: false }),
  useSuppliers: () => ({ data: [], isLoading: false }),
  useInventoryItems: () => ({ data: { items: [], total: 0 }, isLoading: false }),
  useInventoryBatches: () => ({ data: { items: [], total: 0 }, isLoading: false }),
  useStockMovements: () => ({ data: { items: [], total: 0 }, isLoading: false }),
  useLowStockItems: () => ({ data: [], isLoading: false }),
  useExpiringBatches: () => ({ data: [], isLoading: false }),
  useInventoryValue: () => ({ data: [], isLoading: false }),
  useCreateInventoryItem: () => mockCreateItem,
  useCreateInventoryBatch: () => mockCreateBatch
}));

describe('InventoryPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders and creates inventory item', async () => {
    const { findByText, findByLabelText } = renderWithProviders(<InventoryPage />);
    expect(await findByText('Inventory')).toBeTruthy();

    const nameInput = await findByLabelText('Item name');
    fireEvent.change(nameInput, { target: { value: 'Bandage' } });

    const addBtn = await findByText('Add item');
    fireEvent.click(addBtn);
    expect(mockCreateItem.mutate).toHaveBeenCalled();
  });
});

export {};
