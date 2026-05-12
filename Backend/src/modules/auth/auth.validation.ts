import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, 'Identifier is required'),
  password: z.string().trim().min(6, 'Password must be at least 6 characters'),
}).superRefine((data, ctx) => {
  if (data.identifier.includes('@')) {
    const emailResult = z.string().email().safeParse(data.identifier);
    if (!emailResult.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid email format',
        path: ['identifier']
      });
    }
  }
});

export const validateLoginPayload = (data: any): { isValid: boolean; error?: string; data?: any } => {
  const result = loginSchema.safeParse(data);
  if (!result.success) {
    return { isValid: false, error: result.error.issues[0].message };
  }
  return { isValid: true, data: result.data };
};
