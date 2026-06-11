export interface InventoryCategory {
  id: string;
  name: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact?: string | null;
  address?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  categoryId: string;
  categoryName?: string;
  unit: string;
  minStock: number;
  currentStock: number;
  pricePerUnit: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryBatch {
  id: string;
  itemId: string;
  itemName?: string;
  supplierId?: string | null;
  supplierName?: string | null;
  batchNumber: string;
  quantity: number;
  expiryDate?: string | null;
  purchasePrice: number;
  receivedAt: string;
  createdBy?: string | null;
}

export interface StockMovement {
  id: string;
  itemId: string;
  itemName?: string;
  batchId?: string | null;
  batchNumber?: string | null;
  movementType: 'inbound' | 'outbound' | 'adjustment';
  quantity: number;
  referenceType?: string | null;
  referenceId?: string | null;
  notes?: string | null;
  createdBy?: string | null;
  createdAt: string;
}

export interface InventoryValue {
  categoryId: string;
  categoryName: string;
  totalValue: number;
}

export interface InventoryQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  categoryId?: string;
  lowStock?: boolean;
  isActive?: boolean;
}

export interface BatchQueryParams {
  itemId: string;
}

export interface StockMovementQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  type?: 'inbound' | 'outbound' | 'adjustment';
  startDate?: string;
  endDate?: string;
}

export interface InventoryItemPayload {
  name: string;
  categoryId: string;
  unit: string;
  minStock: number;
  currentStock: number;
  pricePerUnit: number;
  isActive?: boolean;
}

export interface InventoryBatchPayload {
  itemId: string;
  supplierId?: string | null;
  batchNumber: string;
  quantity: number;
  expiryDate?: string | null;
  purchasePrice: number;
}

export interface AdjustStockPayload {
  itemId: string;
  quantity: number;
  reason: string;
}
