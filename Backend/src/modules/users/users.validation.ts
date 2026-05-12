import { z } from 'zod';

export const createUserSchema = z.object({
  first_name: z.string().trim().min(1, 'First name is required'),
  last_name: z.string().trim().min(1, 'Last name is required'),
  phone: z.string().trim().min(10, 'Phone must be at least 10 characters'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  address: z.string().optional(),
  role: z.enum(['ADMIN', 'SALESMAN']).optional(),
  is_active: z.boolean().optional(),
});

export const updateProfileSchema = z.object({
  first_name: z.string().trim().min(1).optional(),
  last_name: z.string().trim().min(1).optional(),
  address: z.string().optional(),
});

export const resetPasswordSchema = z.object({
  new_password: z.string().min(6, 'Password must be at least 6 characters'),
});
