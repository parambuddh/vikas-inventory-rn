import prisma from '../../config/prisma';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from './products.types';

export class ProductsService {
  async createProduct(data: CreateProductDto, userId: number) {
    const existing = await prisma.product.findUnique({ where: { sku: data.sku } });
    if (existing) {
      throw new Error('Product with this SKU already exists');
    }

    return prisma.product.create({
      data: {
        ...data,
        created_by: userId,
      },
    });
  }

  async getProducts(query: ProductQueryDto) {
    const page = query.page ? parseInt(query.page as any) : 1;
    const limit = query.limit ? parseInt(query.limit as any) : 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.is_active !== undefined) {
      where.is_active = query.is_active === 'true';
    }

    if (query.unit_type) {
      where.unit_type = query.unit_type;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { sku: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    let orderBy: any = { created_at: 'desc' };
    if (query.sort === 'oldest') {
      orderBy = { created_at: 'asc' };
    } else if (query.sort === 'name') {
      orderBy = { name: 'asc' };
    }

    const [data, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      prisma.product.count({ where })
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getProductById(id: number) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw new Error('Product not found');
    return product;
  }

  async updateProduct(id: number, data: UpdateProductDto) {
    if (data.sku) {
      const existing = await prisma.product.findFirst({
        where: { sku: data.sku, id: { not: id } }
      });
      if (existing) throw new Error('SKU already in use');
    }

    return prisma.product.update({
      where: { id },
      data,
    });
  }

  async toggleStatus(id: number, is_active: boolean) {
    return prisma.product.update({
      where: { id },
      data: { is_active },
      select: { id: true, name: true, is_active: true }
    });
  }
}
