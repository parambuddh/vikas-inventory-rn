import { z } from 'zod';

export const addStockSchema = z.object({
  product_id: z.number().min(1, 'Product ID is required'),
  type: z.enum(['STOCK_ADDED', 'MANUAL_ADJUSTMENT']),
  quantity_changed: z.number().refine(val => val !== 0, 'Quantity cannot be zero'),
  notes: z.string().optional(),
});
