import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils';
import GroomingPage from '@/features/grooming/pages/GroomingPage';

const mockCreateService = { mutate: vi.fn(), isLoading: false } as any;
const mockCreateRecord = { mutate: vi.fn(), isLoading: false } as any;

vi.mock('@/features/grooming/grooming.hooks', () => ({
  useGroomingServices: () => ({ data: [{ id: 's1', name: 'Bath', isActive: true }], isLoading: false }),
  useGroomingRecords: () => ({ data: { items: [], total: 0 }, isLoading: false }),
  useCreateGroomingService: () => mockCreateService,
  useCreateGroomingRecord: () => mockCreateRecord
}));

describe('GroomingPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders and creates service', async () => {
    const { findByText, findByLabelText } = renderWithProviders(<GroomingPage />);
    expect(await findByText('Grooming')).toBeTruthy();

    const nameInput = await findByLabelText('Service name');
    fireEvent.change(nameInput, { target: { value: 'Full groom' } });

    const addBtn = await findByText('Add service');
    fireEvent.click(addBtn);
    expect(mockCreateService.mutate).toHaveBeenCalled();
  });
});

export {};
