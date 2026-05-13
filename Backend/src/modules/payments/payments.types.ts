import { PaymentMode } from '@prisma/client';

export interface CreateAllocationDto {
  order_id: number;
  allocated_amount: number;
}

export interface CreatePaymentDto {
  customer_id: number;
  amount: number;
  payment_mode: PaymentMode;
  payment_date: string;
  reference_number?: string;
  notes?: string;
  allocations: CreateAllocationDto[];
}

export interface UpdatePaymentDto {
  amount?: number;
  payment_mode?: PaymentMode;
  payment_date?: string;
  reference_number?: string;
  notes?: string;
  allocations?: CreateAllocationDto[];
}

export interface PaymentQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  customer_id?: number;
  payment_mode?: PaymentMode;
  is_voided?: string;
  date_from?: string;
  date_to?: string;
  sort?: 'newest' | 'oldest' | 'amount';
}
