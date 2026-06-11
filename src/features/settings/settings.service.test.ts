import { describe, it, expect, vi, beforeEach } from 'vitest';
import { settingsService } from './settings.service';

vi.mock('@/lib/supabase', () => {
  const from = vi.fn();
  const functions = { invoke: vi.fn() };
  return { supabase: { from, functions } };
});

let supabaseMock: any;

describe('settingsService', () => {
  beforeEach(async () => {
    const mod = await import('@/lib/supabase');
    supabaseMock = mod.supabase;
    supabaseMock.from = vi.fn();
    supabaseMock.functions = { invoke: vi.fn() };
  });

  it('getWhatsAppSettings masks apiKey', async () => {
    const returned = { data: { value: { provider: 'fonnte', apiKey: 'abcdef1234', senderNumber: '+6281' } }, error: null };
    const single = vi.fn().mockResolvedValue(returned);
    const eq = vi.fn(() => ({ single }));
    const select = vi.fn(() => ({ eq }));
    supabaseMock.from.mockReturnValue({ select });

    const res = await settingsService.getWhatsAppSettings();

    expect(supabaseMock.from).toHaveBeenCalledWith('settings');
    expect(res).not.toBeNull();
    expect(res?.apiKey).toBe('••••1234');
  });

  it('saveEmailSettings upserts smtp_config', async () => {
    const select = vi.fn().mockResolvedValue({ error: null });
    const upsert = vi.fn(() => ({ select }));
    supabaseMock.from.mockReturnValue({ upsert });

    const cfg = { host: 'smtp.example', port: 587, username: 'a', password: 'secret' } as any;
    const res = await settingsService.saveEmailSettings(cfg);

    expect(supabaseMock.from).toHaveBeenCalledWith('settings');
    expect(upsert).toHaveBeenCalledWith({ key: 'smtp_config', value: cfg });
    expect(res).toBe(true);
  });

  it('toggleModule updates modules table', async () => {
    const select = vi.fn().mockResolvedValue({ error: null });
    const eq = vi.fn(() => ({ select }));
    const update = vi.fn(() => ({ eq }));
    supabaseMock.from.mockReturnValue({ update });

    const res = await settingsService.toggleModule('inventory', true);

    expect(supabaseMock.from).toHaveBeenCalledWith('modules');
    expect(update).toHaveBeenCalledWith({ is_enabled: true });
    expect(res).toBe(true);
  });

  it('testWhatsApp returns success when function invoke ok', async () => {
    supabaseMock.functions.invoke.mockResolvedValue({ error: null });

    const res = await settingsService.testWhatsApp('+628123');

    expect(supabaseMock.functions.invoke).toHaveBeenCalledWith('send-whatsapp', expect.any(Object));
    expect(res.success).toBe(true);
  });

  it('testEmail returns success when function invoke ok', async () => {
    supabaseMock.functions.invoke.mockResolvedValue({ error: null });

    const res = await settingsService.testEmail('a@b.com');

    expect(supabaseMock.functions.invoke).toHaveBeenCalledWith('send-email', expect.any(Object));
    expect(res.success).toBe(true);
  });
});

export {};
