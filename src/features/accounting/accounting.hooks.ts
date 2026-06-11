import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountingService } from './accounting.service';
import type { TransactionQueryParams, TransactionPayload } from './accounting.types';

export function useAccounts() {
  return useQuery(['accounts'], () => accountingService.getAccounts());
}

export function useTransactions(params: TransactionQueryParams) {
  return useQuery(['transactions', params], () => accountingService.getTransactions(params), { keepPreviousData: true });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation((payload: TransactionPayload) => accountingService.createTransaction(payload), {
    onSuccess: () => {
      qc.invalidateQueries(['transactions']);
      qc.invalidateQueries(['accounts']);
    }
  });
}

export function useIncomeByPeriod(from?: string, to?: string) {
  return useQuery(['accounting', 'income', from, to], () => accountingService.getIncomeByPeriod(from as string, to as string), { enabled: Boolean(from && to) });
}

export function useExpenseByPeriod(from?: string, to?: string) {
  return useQuery(['accounting', 'expense', from, to], () => accountingService.getExpenseByPeriod(from as string, to as string), { enabled: Boolean(from && to) });
}

export function useProfitLoss(month?: number, year?: number) {
  return useQuery(['accounting', 'pl', month, year], () => accountingService.getProfitLoss(month as number, year as number), { enabled: Boolean(month && year) });
}

export function useCashFlow(year?: number) {
  return useQuery(['accounting', 'cashflow', year], () => accountingService.getCashFlow(year as number), { enabled: Boolean(year) });
}
