import { InventoryMovementType } from '@prisma/client';

export interface AddStockDto {
  product_id: number;
  type: 'STOCK_ADDED' | 'MANUAL_ADJUSTMENT';
  quantity_changed: number;
  notes?: string;
}

export interface InventoryQueryDto {
  page?: number;
  limit?: number;
  product_id?: number;
  type?: InventoryMovementType;
}

export interface LowStockQueryDto {
  page?: number;
  limit?: number;
  negative_only?: string;
}
