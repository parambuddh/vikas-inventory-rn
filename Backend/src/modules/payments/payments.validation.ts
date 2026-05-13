import { z } from 'zod';

export const allocationSchema = z.object({
  order_id: z.number().min(1, 'Order ID is required'),
  allocated_amount: z.number().refine(val => val > 0, 'Allocated amount must be > 0'),
});

export const createPaymentSchema = z.object({
  customer_id: z.number().min(1, 'Customer ID is required'),
  amount: z.number().refine(val => val > 0, 'Amount must be > 0'),
  payment_mode: z.enum(['CASH', 'BANK_TRANSFER', 'UPI', 'CHEQUE', 'CARD']),
  payment_date: z.string().datetime(),
  reference_number: z.string().optional(),
  notes: z.string().optional(),
  allocations: z.array(allocationSchema).min(1, 'At least one allocation is required'),
});

export const updatePaymentSchema = z.object({
  amount: z.number().refine(val => val > 0, 'Amount must be > 0').optional(),
  payment_mode: z.enum(['CASH', 'BANK_TRANSFER', 'UPI', 'CHEQUE', 'CARD']).optional(),
  payment_date: z.string().datetime().optional(),
  reference_number: z.string().optional(),
  notes: z.string().optional(),
  allocations: z.array(allocationSchema).min(1).optional(),
});
