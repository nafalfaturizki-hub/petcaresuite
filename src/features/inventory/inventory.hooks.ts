import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryService } from './inventory.service';
import type { InventoryQueryParams, StockMovementQueryParams } from './inventory.types';

export function useInventoryCategories() {
  return useQuery(['inventoryCategories'], () => inventoryService.getCategories());
}

export function useSuppliers() {
  return useQuery(['suppliers'], () => inventoryService.getSuppliers());
}

export function useInventoryItems(params: InventoryQueryParams) {
  return useQuery(['inventoryItems', params], () => inventoryService.getInventoryItems(params), { keepPreviousData: true });
}

export function useInventoryBatches(page: number) {
  return useQuery(['inventoryBatches', page], () => inventoryService.getInventoryBatches(page), { keepPreviousData: true });
}

export function useStockMovements(params: StockMovementQueryParams) {
  return useQuery(['stockMovements', params], () => inventoryService.getStockMovements(params), { keepPreviousData: true });
}

export function useLowStockItems() {
  return useQuery(['lowStockItems'], () => inventoryService.getLowStockItems());
}

export function useExpiringBatches(withinDays: number) {
  return useQuery(['expiringBatches', withinDays], () => inventoryService.getExpiringItems(withinDays));
}

export function useInventoryValue() {
  return useQuery(['inventoryValue'], () => inventoryService.getInventoryValue());
}

export function useCreateInventoryItem() {
  const qc = useQueryClient();
  return useMutation((payload: any) => inventoryService.createItem(payload), {
    onSuccess: () => qc.invalidateQueries(['inventoryItems'])
  });
}

export function useCreateInventoryBatch() {
  const qc = useQueryClient();
  return useMutation((payload: any) => inventoryService.addBatch(payload), {
    onSuccess: () => {
      qc.invalidateQueries(['inventoryBatches']);
      qc.invalidateQueries(['inventoryItems']);
      qc.invalidateQueries(['lowStockItems']);
      qc.invalidateQueries(['expiringBatches']);
    }
  });
}
