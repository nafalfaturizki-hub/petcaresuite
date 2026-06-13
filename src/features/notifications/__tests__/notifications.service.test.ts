import { describe, it, expect, vi, beforeEach } from 'vitest';
import { notificationsService } from '../notifications.service';

vi.mock('@/lib/supabase', () => {
  const from = vi.fn();
  return { supabase: { from, functions: { invoke: vi.fn() } } };
});

describe('notificationsService', () => {
  let supabaseMock: any;

  beforeEach(async () => {
    const mod = await import('@/lib/supabase');
    supabaseMock = mod.supabase;
    supabaseMock.from = vi.fn();
    supabaseMock.functions.invoke = vi.fn();
  });

  describe('getNotificationLogs', () => {
    it('returns paginated logs', async () => {
      const range = vi.fn().mockResolvedValue({
        data: [{ id: 'n1', channel: 'whatsapp', recipient: '+62', status: 'success', sent_at: '2026-01-01' }],
        count: 1, error: null
      });
      const order = vi.fn(() => ({ range }));
      supabaseMock.from.mockReturnValue({ select: vi.fn(() => ({ order })) });

      const result = await notificationsService.getNotificationLogs({ page: 1 });
      expect(result.items).toHaveLength(1);
    });

    it('filters by channel', async () => {
      const range = vi.fn().mockResolvedValue({ data: [], count: 0, error: null });
      const eq = vi.fn(() => ({ range }));
      const order = vi.fn(() => ({ eq }));
      supabaseMock.from.mockReturnValue({ select: vi.fn(() => ({ order })) });

      const result = await notificationsService.getNotificationLogs({ channel: 'email' });
      expect(result.items).toEqual([]);
    });
  });

  describe('retryNotification', () => {
    it('retries whatsapp notification', async () => {
      const single = vi.fn().mockResolvedValue({
        data: { id: 'n1', channel: 'whatsapp', recipient: '+62', status: 'failed' },
        error: null
      });
      const eq = vi.fn(() => ({ single }));
      const select = vi.fn(() => ({ eq }));
      const update = vi.fn(() => ({ eq }));
      supabaseMock.from.mockReturnValue({ select, update });
      supabaseMock.functions.invoke.mockResolvedValue({});

      const result = await notificationsService.retryNotification('n1');
      expect(result).toBe(true);
    });

    it('throws when notification not found', async () => {
      const single = vi.fn().mockResolvedValue({ data: null, error: null });
      const eq = vi.fn(() => ({ single }));
      const select = vi.fn(() => ({ eq }));
      supabaseMock.from.mockReturnValue({ select });

      await expect(notificationsService.retryNotification('nonexistent')).rejects.toThrow('Notification not found');
    });
  });

  describe('markAsRead', () => {
    it('marks notification as read', async () => {
      const eq = vi.fn().mockResolvedValue({ error: null });
      const update = vi.fn(() => ({ eq }));
      supabaseMock.from.mockReturnValue({ update });

      const result = await notificationsService.markAsRead('n1');
      expect(result).toBe(true);
    });
  });

  describe('markAllRead', () => {
    it('marks all as read', async () => {
      const is = vi.fn().mockResolvedValue({ error: null });
      const update = vi.fn(() => ({ is }));
      supabaseMock.from.mockReturnValue({ update });

      const result = await notificationsService.markAllRead();
      expect(result).toBe(true);
    });
  });

  describe('getTemplates', () => {
    it('returns templates', async () => {
      const single = vi.fn().mockResolvedValue({
        data: { value: [{ id: 't1', name: 'Welcome' }] },
        error: null
      });
      const eq = vi.fn(() => ({ single }));
      supabaseMock.from.mockReturnValue({ select: vi.fn(() => ({ eq })) });

      const result = await notificationsService.getTemplates();
      expect(result).toHaveLength(1);
    });
  });

  describe('getWhatsAppConfig', () => {
    it('returns config when exists', async () => {
      const single = vi.fn().mockResolvedValue({
        data: { value: { apiKey: 'key', phoneNumber: '+62' } },
        error: null
      });
      const eq = vi.fn(() => ({ single }));
      supabaseMock.from.mockReturnValue({ select: vi.fn(() => ({ eq })) });

      const result = await notificationsService.getWhatsAppConfig();
      expect(result).not.toBeNull();
    });

    it('returns null on error', async () => {
      const single = vi.fn().mockResolvedValue({ data: null, error: { message: 'Error' } });
      const eq = vi.fn(() => ({ single }));
      supabaseMock.from.mockReturnValue({ select: vi.fn(() => ({ eq })) });

      const result = await notificationsService.getWhatsAppConfig();
      expect(result).toBeNull();
    });
  });

  describe('saveWhatsAppConfig', () => {
    it('saves config', async () => {
      const select = vi.fn().mockResolvedValue({ error: null });
      const upsert = vi.fn(() => ({ select }));
      supabaseMock.from.mockReturnValue({ upsert });

      const result = await notificationsService.saveWhatsAppConfig({ apiKey: 'key', phoneNumber: '+62' });
      expect(result).toBe(true);
    });
  });

  describe('getEmailConfig', () => {
    it('returns email config', async () => {
      const single = vi.fn().mockResolvedValue({
        data: { value: { host: 'smtp.test.com', port: 587 } },
        error: null
      });
      const eq = vi.fn(() => ({ single }));
      supabaseMock.from.mockReturnValue({ select: vi.fn(() => ({ eq })) });

      const result = await notificationsService.getEmailConfig();
      expect(result).not.toBeNull();
    });
  });

  describe('saveEmailConfig', () => {
    it('saves email config', async () => {
      const select = vi.fn().mockResolvedValue({ error: null });
      const upsert = vi.fn(() => ({ select }));
      supabaseMock.from.mockReturnValue({ upsert });

      const result = await notificationsService.saveEmailConfig({ host: 'smtp.test.com', port: 587, user: 'user', password: 'pass' });
      expect(result).toBe(true);
    });
  });

  describe('broadcast', () => {
    it('broadcasts to all customers', async () => {
      const select = vi.fn().mockResolvedValue({ data: [{ whatsapp: '+62' }], error: null });
      supabaseMock.from.mockReturnValue({ select });

      const result = await notificationsService.broadcast({ templateKey: 't1', segment: 'all' });
      expect(result).toBe(1);
    });

    it('returns 0 when no recipients', async () => {
      const select = vi.fn().mockResolvedValue({ data: [], error: null });
      supabaseMock.from.mockReturnValue({ select });

      const result = await notificationsService.broadcast({ templateKey: 't1', segment: 'all' });
      expect(result).toBe(0);
    });
  });

  describe('getBroadcastCount', () => {
    it('returns count for all segment', async () => {
      const select = vi.fn().mockResolvedValue({ data: [{ whatsapp: '+62' }, { whatsapp: '+63' }], error: null });
      supabaseMock.from.mockReturnValue({ select });

      const result = await notificationsService.getBroadcastCount('all');
      expect(result).toBe(2);
    });
  });
});