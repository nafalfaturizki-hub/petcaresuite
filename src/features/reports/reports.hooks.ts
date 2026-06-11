import { useQuery } from '@tanstack/react-query';
import { reportsService } from './reports.service';
export function useFinancialReport(params?: { startDate?: string; endDate?: string }) {
  return useQuery(['financialReport', params], () => reportsService.getFinancialReport(params));
}

export function useClinicalStats(from?: string, to?: string) {
  return useQuery(['reports', 'clinical', from, to], () => reportsService.getClinicalStats(from, to), { enabled: Boolean(from && to) });
}

export function useDoctorStats(from?: string, to?: string) {
  return useQuery(['reports', 'doctors', from, to], () => reportsService.getDoctorStats(from, to), { enabled: Boolean(from && to) });
}

export function useInventoryStats() {
  return useQuery(['reports', 'inventory'], () => reportsService.getInventoryStats());
}

export function useProductStats(from?: string, to?: string) {
  return useQuery(['reports', 'products', from, to], () => reportsService.getProductStats(from, to), { enabled: Boolean(from && to) });
}

export function useRevenueByService(from?: string, to?: string) {
  return useQuery(['reports', 'revenueByService', from, to], () => reportsService.getRevenueByService(from, to), { enabled: Boolean(from && to) });
}

export default {};
