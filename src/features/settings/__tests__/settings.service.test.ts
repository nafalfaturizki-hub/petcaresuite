import { describe, it, expect, vi, beforeEach } from 'vitest';
import { settingsService } from '../settings.service';

vi.mock('@/lib/supabase', () => {
  const from = vi.fn();
  return { supabase: { from, functions: { invoke: vi.fn() } } };
});

describe('settingsService', () => {
  let supabaseMock: any;

  beforeEach(async () => {
    const mod = await import('@/lib/supabase');
    supabaseMock = mod.supabase;
    supabaseMock.from = vi.fn();
    supabaseMock.functions.invoke = vi.fn();
  });

  describe('getSetting', () => {
    it('returns setting value when found', async () => {
      const single = vi.fn().mockResolvedValue({ data: { value: 'test-value' }, error: null });
      const eq = vi.fn(() => ({ single }));
      supabaseMock.from.mockReturnValue({ select: vi.fn(() => ({ eq })) });

      const result = await settingsService.getSetting<string>('test_key');
      expect(result).toBe('test-value');
    });

    it('returns null when not found', async () => {
      const single = vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } });
      const eq = vi.fn(() => ({ single }));
      supabaseMock.from.mockReturnValue({ select: vi.fn(() => ({ eq })) });

      const result = await settingsService.getSetting<string>('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('upsertSetting', () => {
    it('upserts setting successfully', async () => {
      const select = vi.fn().mockResolvedValue({ error: null });
      const upsert = vi.fn(() => ({ select }));
      supabaseMock.from.mockReturnValue({ upsert });

      const result = await settingsService.upsertSetting('test_key', 'test-value');
      expect(result).toBe(true);
    });

    it('throws on error', async () => {
      const select = vi.fn().mockResolvedValue({ error: { message: 'Failed', code: 'UNKNOWN' } });
      const upsert = vi.fn(() => ({ select }));
      supabaseMock.from.mockReturnValue({ upsert });

      await expect(settingsService.upsertSetting('test_key', 'value')).rejects.toThrow();
    });
  });

  describe('getClinicProfile', () => {
    it('returns clinic profile', async () => {
      const single = vi.fn().mockResolvedValue({
        data: { value: { name: 'PetCare Clinic', address: 'Jl. Test' } },
        error: null
      });
      const eq = vi.fn(() => ({ single }));
      supabaseMock.from.mockReturnValue({ select: vi.fn(() => ({ eq })) });

      const result = await settingsService.getClinicProfile();
      expect(result).not.toBeNull();
      expect(result!.name).toBe('PetCare Clinic');
    });
  });

  describe('updateClinicProfile', () => {
    it('updates clinic profile', async () => {
      const select = vi.fn().mockResolvedValue({ error: null });
      const upsert = vi.fn(() => ({ select }));
      supabaseMock.from.mockReturnValue({ upsert });

      const result = await settingsService.updateClinicProfile({ name: 'Updated Clinic' });
      expect(result).toBe(true);
    });
  });

  describe('getBusinessHours', () => {
    it('returns existing business hours', async () => {
      const single = vi.fn().mockResolvedValue({
        data: { value: { schedule: [], holidays: [] } },
        error: null
      });
      const eq = vi.fn(() => ({ single }));
      supabaseMock.from.mockReturnValue({ select: vi.fn(() => ({ eq })) });

      const result = await settingsService.getBusinessHours();
      expect(result.schedule).toEqual([]);
    });

    it('returns default hours when none set', async () => {
      const single = vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } });
      const eq = vi.fn(() => ({ single }));
      supabaseMock.from.mockReturnValue({ select: vi.fn(() => ({ eq })) });

      const result = await settingsService.getBusinessHours();
      expect(result.schedule).toHaveLength(7);
    });
  });

  describe('getInvoiceSettings', () => {
    it('returns existing settings', async () => {
      const single = vi.fn().mockResolvedValue({
        data: { value: { prefix: 'INV', nextNumber: 5 } },
        error: null
      });
      const eq = vi.fn(() => ({ single }));
      supabaseMock.from.mockReturnValue({ select: vi.fn(() => ({ eq })) });

      const result = await settingsService.getInvoiceSettings();
      expect(result.prefix).toBe('INV');
    });

    it('returns default settings when none set', async () => {
      const single = vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } });
      const eq = vi.fn(() => ({ single }));
      supabaseMock.from.mockReturnValue({ select: vi.fn(() => ({ eq })) });

      const result = await settingsService.getInvoiceSettings();
      expect(result.prefix).toBe('INV');
    });
  });

  describe('getModules', () => {
    it('returns modules list', async () => {
      const order = vi.fn().mockResolvedValue({
        data: [{ key: 'clinic', is_enabled: true }],
        error: null
      });
      supabaseMock.from.mockReturnValue({ select: vi.fn(() => ({ order })) });

      const result = await settingsService.getModules();
      expect(result).toHaveLength(1);
    });
  });

  describe('toggleModule', () => {
    it('toggles module', async () => {
      const select = vi.fn().mockResolvedValue({ error: null });
      const eq = vi.fn(() => ({ select }));
      const update = vi.fn(() => ({ eq }));
      supabaseMock.from.mockReturnValue({ update });

      const result = await settingsService.toggleModule('clinic', false);
      expect(result).toBe(true);
    });
  });

  describe('testWhatsApp', () => {
    it('returns success on test', async () => {
      supabaseMock.functions.invoke.mockResolvedValue({ error: null });
      const result = await settingsService.testWhatsApp('+6281234567890');
      expect(result.success).toBe(true);
    });

    it('returns failure on error', async () => {
      supabaseMock.functions.invoke.mockResolvedValue({ error: { message: 'API Error' } });
      const result = await settingsService.testWhatsApp('+6281234567890');
      expect(result.success).toBe(false);
    });

    it('handles exception', async () => {
      supabaseMock.functions.invoke.mockRejectedValue(new Error('Network error'));
      const result = await settingsService.testWhatsApp('+6281234567890');
      expect(result.success).toBe(false);
    });
  });

  describe('testEmail', () => {
    it('returns success on test', async () => {
      supabaseMock.functions.invoke.mockResolvedValue({ error: null });
      const result = await settingsService.testEmail('test@test.com');
      expect(result.success).toBe(true);
    });

    it('handles exception', async () => {
      supabaseMock.functions.invoke.mockRejectedValue(new Error('Network error'));
      const result = await settingsService.testEmail('test@test.com');
      expect(result.success).toBe(false);
    });
  });

  describe('getAuditLogs', () => {
    it('returns paginated audit logs', async () => {
      const range = vi.fn().mockResolvedValue({ data: [{ id: 'log1', action: 'login' }], count: 1, error: null });
      const order = vi.fn(() => ({ range }));
      supabaseMock.from.mockReturnValue({ select: vi.fn(() => ({ order })) });

      const result = await settingsService.getAuditLogs({ page: 1 });
      expect(result.items).toHaveLength(1);
    });

    it('filters by user', async () => {
      const range = vi.fn().mockResolvedValue({ data: [], count: 0, error: null });
      const eq = vi.fn(() => ({ range }));
      const order = vi.fn(() => ({ eq }));
      supabaseMock.from.mockReturnValue({ select: vi.fn(() => ({ order })) });

      const result = await settingsService.getAuditLogs({ user: 'u1' });
      expect(result.items).toEqual([]);
    });
  });
});