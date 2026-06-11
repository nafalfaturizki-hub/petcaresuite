import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '@/test/utils';
import ModuleManagerPage from '@/features/settings/pages/ModuleManagerPage';

const mockToggle = { mutate: vi.fn() } as any;

vi.mock('@/features/settings/settings.hooks', () => ({
  useModules: () => ({ data: [
    { key: 'inventory', name: 'Inventory', is_enabled: true },
    { key: 'accounting', name: 'Accounting', is_enabled: false }
  ], isLoading: false }),
  useToggleModule: () => mockToggle
}));

describe('ModuleManagerPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders module cards and toggles module', async () => {
    const { findByText, getAllByRole } = renderWithProviders(<ModuleManagerPage />);

    expect(await findByText('Inventory')).toBeTruthy();
    expect(await findByText('Accounting')).toBeTruthy();

    const switches = getAllByRole('switch');
    expect(switches.length).toBeGreaterThanOrEqual(2);

    // click second switch (accounting) to enable
    switches[1].click();
    expect(mockToggle.mutate).toHaveBeenCalledWith({ key: 'accounting', isEnabled: true }, expect.any(Object));
  });
});

export {};
