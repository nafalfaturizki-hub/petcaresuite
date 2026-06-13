import { describe, it, expect, vi, beforeEach } from 'vitest';
import { reportsService } from '../reports.service';

vi.mock('@/lib/supabase', () => {
  const from = vi.fn();
  return { supabase: { from } };
});

describe('reportsService', () => {
  let supabaseMock: any;

  beforeEach(async () => {
    const mod = await import('@/lib/supabase');
    supabaseMock = mod.supabase;
    supabaseMock.from = vi.fn();
  });

  describe('getFinancialReport', () => {
    it('returns financial report with monthly trend', async () => {
      const lte = vi.fn().mockResolvedValue({ data: [{ id: 'inv1', total: 100000, created_at: '2026-01-15T00:00:00Z' }], error: null });
      const gte = vi.fn(() => ({ lte }));
      supabaseMock.from.mockReturnValue({ select: vi.fn(() => ({ gte })) });

      const result = await reportsService.getFinancialReport({ startDate: '2026-01-01', endDate: '2026-12-31' });
      expect(result.summary.totalRevenue).toBe(100000);
      expect(result.monthlyTrend).toHaveLength(12);
    });

    it('handles empty data', async () => {
      const lte = vi.fn().mockResolvedValue({ data: [], error: null });
      const gte = vi.fn(() => ({ lte }));
      supabaseMock.from.mockReturnValue({ select: vi.fn(() => ({ gte })) });

      const result = await reportsService.getFinancialReport();
      expect(result.summary.totalRevenue).toBe(0);
      expect(result.summary.totalExpense).toBe(0);
    });
  });

  describe('getClinicalStats', () => {
    it('returns clinical statistics', async () => {
      const lte = vi.fn().mockResolvedValue({ data: [{ pet_id: 'p1', assessment: 'Healthy', record_type: 'checkup', created_at: '2026-01-01' }], error: null });
      const gte = vi.fn(() => ({ lte }));
      supabaseMock.from.mockReturnValue({ select: vi.fn(() => ({ gte })) });

      const result = await reportsService.getClinicalStats('2026-01-01', '2026-12-31');
      expect(result.totalPatients).toBe(1);
      expect(result.topDiagnoses).toHaveLength(1);
    });
  });

  describe('getDoctorStats', () => {
    it('returns doctor statistics', async () => {
      const lte = vi.fn().mockResolvedValue({ data: [{ id: 'a1', doctor_id: 'd1', pet_id: 'p1', service_id: 's1', created_at: '2026-01-01' }], error: null });
      const gte = vi.fn(() => ({ lte }));
      const in_ = vi.fn().mockResolvedValue({ data: [], error: null });
      supabaseMock.from.mockReturnValue({ select: vi.fn(() => ({ gte, in: in_ })) });

      const result = await reportsService.getDoctorStats('2026-01-01', '2026-12-31');
      expect(result).toHaveLength(1);
    });
  });

  describe('getInventoryStats', () => {
    it('returns inventory statistics', async () => {
      const lte = vi.fn().mockResolvedValue({ data: [], error: null });
      const gte = vi.fn(() => ({ lte }));
      supabaseMock.from.mockReturnValue({ select: vi.fn(() => ({ gte })) });

      const result = await reportsService.getInventoryStats();
      expect(result.lowStockCount).toBe(0);
      expect(result.expiring30).toBe(0);
    });
  });

  describe('getProductStats', () => {
    it('returns product statistics', async () => {
      const lte = vi.fn().mockResolvedValue({
        data: [{ reference_id: 'p1', name: 'Product A', quantity: 5, total: 50000, created_at: '2026-01-01' }],
        error: null
      });
      const gte = vi.fn(() => ({ lte }));
      const eq = vi.fn(() => ({ gte }));
      supabaseMock.from.mockReturnValue({ select: vi.fn(() => ({ eq })) });

      const result = await reportsService.getProductStats('2026-01-01', '2026-12-31');
      expect(result).toHaveLength(1);
      expect(result[0].qty).toBe(5);
    });
  });

  describe('getRevenueByService', () => {
    it('returns revenue by service', async () => {
      const lte = vi.fn().mockResolvedValue({
        data: [{ reference_id: 's1', name: 'Grooming', total: 150000, created_at: '2026-01-01' }],
        error: null
      });
      const gte = vi.fn(() => ({ lte }));
      const eq = vi.fn(() => ({ gte }));
      supabaseMock.from.mockReturnValue({ select: vi.fn(() => ({ eq })) });

      const result = await reportsService.getRevenueByService('2026-01-01', '2026-12-31');
      expect(result).toHaveLength(1);
      expect(result[0].amount).toBe(150000);
    });
  });
});