export interface CreateCustomerDto {
  shop_name: string;
  owner_name: string;
  phone: string;
  alternate_phone?: string;
  email?: string;
  address: string;
  gst_number?: string;
  area?: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateCustomerDto extends Partial<CreateCustomerDto> {
  total_orders_amount?: number;
  total_received_amount?: number;
  pending_amount?: number;
}

export interface CustomerQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: string;
  created_by?: number;
  sort?: 'newest' | 'oldest' | 'shop_name';
}
