import { UnitType } from '@prisma/client';

export interface CreateProductDto {
  name: string;
  sku: string;
  description?: string;
  purchase_price: number;
  selling_price: number;
  gst_percentage: number;
  unit_type: UnitType;
  low_stock_threshold: number;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {
  image_url?: string;
  thumbnail_url?: string;
}

export interface ProductQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: string;
  unit_type?: UnitType;
  sort?: 'newest' | 'oldest' | 'name';
}
