import { z } from 'zod';

export const createCustomerSchema = z.object({
  shop_name: z.string().trim().min(1, 'Shop name is required'),
  owner_name: z.string().trim().min(1, 'Owner name is required'),
  phone: z.string().trim().min(10, 'Phone must be at least 10 characters'),
  alternate_phone: z.string().trim().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().trim().min(1, 'Address is required'),
  gst_number: z.string().trim().optional(),
  area: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial().extend({
  total_orders_amount: z.number().min(0).optional(),
  total_received_amount: z.number().min(0).optional(),
  pending_amount: z.number().min(0).optional(),
});

export const customerStatusSchema = z.object({
  is_active: z.boolean({ required_error: 'is_active is required' }),
});
