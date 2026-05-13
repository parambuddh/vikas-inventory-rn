import { OrderStatus, PaymentStatus } from '@prisma/client';

export interface CreateOrderItemDto {
  product_id: number;
  quantity: number;
}

export interface CreateOrderDto {
  customer_id: number;
  items: CreateOrderItemDto[];
  notes?: string;
  paid_amount?: number;
}

export interface UpdateOrderDto {
  items?: CreateOrderItemDto[];
  notes?: string;
}

export interface OrderQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  customer_id?: number;
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  created_by?: number;
  date_from?: string;
  date_to?: string;
  sort?: 'newest' | 'oldest' | 'total_amount';
}
