import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils';
import WhatsAppSettingsPage from '@/features/settings/pages/WhatsAppSettingsPage';

const mockSave = { mutate: vi.fn(), isLoading: false } as any;
const mockTest = { mutateAsync: vi.fn(), isLoading: false } as any;

vi.mock('@/features/settings/settings.hooks', () => ({
  useWhatsAppSettings: () => ({ data: { provider: 'fonnte', apiKey: '••••1234', senderNumber: '+6281' }, isLoading: false }),
  useSaveWhatsAppSettings: () => mockSave,
  useTestWhatsApp: () => mockTest
}));

describe('WhatsAppSettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows masked api key and toggles reveal', async () => {
    const { findByPlaceholderText, findByText } = renderWithProviders(<WhatsAppSettingsPage />);

    const apiInput = await findByPlaceholderText('Enter API key');
    expect((apiInput as HTMLInputElement).value).toBe('••••1234');

    const showBtn = await findByText('Show');
    fireEvent.click(showBtn);
    expect(await findByText('Hide')).toBeTruthy();
  });

  it('sends test whatsapp', async () => {
    mockTest.mutateAsync.mockResolvedValue({ success: true, message: 'Sent' });
    const { findByLabelText, findByText, findByPlaceholderText } = renderWithProviders(<WhatsAppSettingsPage />);

    const testNum = await findByPlaceholderText('Recipient phone number');
    fireEvent.change(testNum, { target: { value: '+628999' } });

    const sendBtn = await findByText('Send Test');
    fireEvent.click(sendBtn);

    // mutateAsync is called with the number via onClick handler
    expect(mockTest.mutateAsync).toHaveBeenCalledWith('+628999');
  });
});

export {};
