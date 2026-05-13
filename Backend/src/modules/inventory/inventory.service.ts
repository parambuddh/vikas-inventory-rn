import prisma from '../../config/prisma';
import { AddStockDto, InventoryQueryDto, LowStockQueryDto } from './inventory.types';
import { Prisma } from '@prisma/client';

export class InventoryService {
  async addStock(data: AddStockDto, userId: number) {
    const product = await prisma.product.findUnique({ where: { id: data.product_id } });
    if (!product) throw new Error('Product not found');

    const quantityBefore = new Prisma.Decimal(product.stock_quantity.toString());
    const quantityChanged = new Prisma.Decimal(data.quantity_changed.toString());
    const quantityAfter = quantityBefore.plus(quantityChanged);

    return prisma.$transaction(async (tx) => {
      // 1. Update product stock
      const updatedProduct = await tx.product.update({
        where: { id: data.product_id },
        data: { stock_quantity: quantityAfter },
        select: { id: true, name: true, stock_quantity: true }
      });

      // 2. Create inventory log
      const log = await tx.inventoryLog.create({
        data: {
          product_id: data.product_id,
          type: data.type,
          quantity_before: quantityBefore,
          quantity_changed: quantityChanged,
          quantity_after: quantityAfter,
          notes: data.notes,
          created_by: userId,
        }
      });

      return { product: updatedProduct, log };
    });
  }

  async getInventoryLogs(query: InventoryQueryDto) {
    const page = query.page ? parseInt(query.page as any) : 1;
    const limit = query.limit ? parseInt(query.limit as any) : 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.product_id) where.product_id = parseInt(query.product_id as any);
    if (query.type) where.type = query.type;

    const [data, total] = await prisma.$transaction([
      prisma.inventoryLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          product: { select: { name: true, sku: true } },
          creator: { select: { first_name: true, last_name: true } }
        }
      }),
      prisma.inventoryLog.count({ where })
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }

  async getLowStockProducts(query: LowStockQueryDto) {
    const page = query.page ? parseInt(query.page as any) : 1;
    const limit = query.limit ? parseInt(query.limit as any) : 20;
    const skip = (page - 1) * limit;

    let condition = 'p.is_active = true AND p.stock_quantity <= p.low_stock_threshold';
    if (query.negative_only === 'true') {
      condition = 'p.is_active = true AND p.stock_quantity < 0';
    }

    const data: any[] = await prisma.$queryRawUnsafe(`
      SELECT p.id, p.name, p.sku, p.stock_quantity, p.low_stock_threshold, p.unit_type
      FROM products p
      WHERE ${condition}
      ORDER BY p.stock_quantity ASC
      LIMIT $1 OFFSET $2
    `, limit, skip);

    const countResult: any[] = await prisma.$queryRawUnsafe(`
      SELECT CAST(COUNT(*) AS INTEGER) as total
      FROM products p
      WHERE ${condition}
    `);
    
    const total = countResult[0]?.total || 0;

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }
}
