import { z } from 'zod';

export const orderItemSchema = z.object({
  product_id: z.number().min(1, 'Product ID is required'),
  quantity: z.number().refine(val => val > 0, 'Quantity must be greater than 0'),
});

export const createOrderSchema = z.object({
  customer_id: z.number().min(1, 'Customer ID is required'),
  items: z.array(orderItemSchema).min(1, 'At least one item is required'),
  notes: z.string().optional(),
  paid_amount: z.number().min(0).optional(),
});

export const updateOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'At least one item is required').optional(),
  notes: z.string().optional(),
});

export const orderStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'DISPATCHED', 'DELIVERED', 'CANCELLED']),
});
