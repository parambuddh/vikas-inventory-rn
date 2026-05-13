import { VisitStatus } from '@prisma/client';

export interface CheckinDto {
  customer_id: number;
  latitude?: number;
  longitude?: number;
  notes?: string;
}

export interface CheckoutDto {
  latitude?: number;
  longitude?: number;
  notes?: string;
}

export interface VisitQueryDto {
  page?: number;
  limit?: number;
  customer_id?: number;
  salesman_id?: number;
  status?: VisitStatus;
  date_from?: string;
  date_to?: string;
  productive?: string; // 'true' | 'false' (order_created)
}
