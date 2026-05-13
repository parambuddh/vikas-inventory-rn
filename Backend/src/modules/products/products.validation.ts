import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  sku: z.string().trim().min(1, 'SKU is required'),
  description: z.string().trim().optional(),
  purchase_price: z.number().min(0, 'Purchase price cannot be negative'),
  selling_price: z.number().min(0, 'Selling price cannot be negative'),
  gst_percentage: z.number().min(0).max(100),
  unit_type: z.enum(['PCS', 'KG', 'GRAM', 'BOX', 'LITER']),
  low_stock_threshold: z.number().min(0, 'Threshold cannot be negative'),
});

export const updateProductSchema = createProductSchema.partial();

export const productStatusSchema = z.object({
  is_active: z.boolean({ required_error: 'is_active is required' }),
});
