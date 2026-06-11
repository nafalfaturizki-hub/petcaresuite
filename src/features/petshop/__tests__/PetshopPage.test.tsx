import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils';
import PetshopPage from '@/features/petshop/pages/PetshopPage';

const mockCreate = { mutate: vi.fn(), isLoading: false } as any;
const mockCreateVariant = { mutate: vi.fn(), isLoading: false } as any;

vi.mock('@/features/petshop/petshop.hooks', () => ({
  useProductCategories: () => ({ data: [{ id: 'c1', name: 'Food' }], isLoading: false }),
  useBrands: () => ({ data: [{ id: 'b1', name: 'Acme' }], isLoading: false }),
  useProducts: () => ({ data: { items: [], total: 0 }, isLoading: false }),
  useCreateProduct: () => mockCreate,
  useCreateProductVariant: () => mockCreateVariant
}));

describe('PetshopPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders and creates product', async () => {
    const { findByText, findByLabelText } = renderWithProviders(<PetshopPage />);

    expect(await findByText('Petshop')).toBeTruthy();

    const nameInput = await findByLabelText('Name');
    fireEvent.change(nameInput, { target: { value: 'Kibble' } });

    const addBtn = await findByText('Add product');
    fireEvent.click(addBtn);

    expect(mockCreate.mutate).toHaveBeenCalled();
  });
});

export {};
