import prisma from '../../config/prisma';
import { CreateOrderDto, UpdateOrderDto, OrderQueryDto } from './orders.types';
import { Prisma, OrderStatus } from '@prisma/client';

export class OrdersService {
  private generateOrderNumber() {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${timestamp}${random}`;
  }

  async createOrder(data: CreateOrderDto, userId: number) {
    return prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findUnique({ where: { id: data.customer_id } });
      if (!customer) throw new Error('Customer not found');

      let totalAmount = new Prisma.Decimal(0);
      const orderItemsData = [];

      for (const item of data.items) {
        const product = await tx.product.findUnique({ where: { id: item.product_id } });
        if (!product) throw new Error(`Product ID ${item.product_id} not found`);

        const quantity = new Prisma.Decimal(item.quantity);
        const pricePerUnit = product.selling_price;
        const subtotal = pricePerUnit.mul(quantity);
        
        const gstPercentage = product.gst_percentage;
        const gstAmount = subtotal.mul(gstPercentage).div(100);
        const itemTotal = subtotal.add(gstAmount);

        totalAmount = totalAmount.add(itemTotal);

        orderItemsData.push({
          product_id: product.id,
          product_name: product.name,
          quantity: quantity,
          unit_type: product.unit_type,
          price_per_unit: pricePerUnit,
          gst_percentage: gstPercentage,
          gst_amount: gstAmount,
          subtotal: subtotal,
          total: itemTotal
        });
      }

      const paidAmount = new Prisma.Decimal(data.paid_amount || 0);
      const pendingAmount = totalAmount.sub(paidAmount);
      let paymentStatus = 'UNPAID';
      if (paidAmount.gte(totalAmount)) {
        paymentStatus = 'PAID';
      } else if (paidAmount.gt(0)) {
        paymentStatus = 'PARTIAL';
      }

      const orderNumber = this.generateOrderNumber();

      const order = await tx.order.create({
        data: {
          order_number: orderNumber,
          customer_id: data.customer_id,
          total_amount: totalAmount,
          paid_amount: paidAmount,
          pending_amount: pendingAmount,
          payment_status: paymentStatus as any,
          notes: data.notes,
          created_by: userId,
          items: {
            create: orderItemsData
          }
        },
        include: { items: true, customer: { select: { shop_name: true } } }
      });

      return order;
    });
  }

  async getOrders(query: OrderQueryDto, userRole: string, userId: number) {
    const page = query.page ? parseInt(query.page as any) : 1;
    const limit = query.limit ? parseInt(query.limit as any) : 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (userRole === 'SALESMAN') {
      where.created_by = userId;
    } else if (query.created_by) {
      where.created_by = parseInt(query.created_by as any);
    }

    if (query.customer_id) where.customer_id = parseInt(query.customer_id as any);
    if (query.status) where.status = query.status;
    if (query.payment_status) where.payment_status = query.payment_status;

    if (query.search) {
      where.OR = [
        { order_number: { contains: query.search, mode: 'insensitive' } },
        { customer: { shop_name: { contains: query.search, mode: 'insensitive' } } },
        { customer: { owner_name: { contains: query.search, mode: 'insensitive' } } },
        { customer: { phone: { contains: query.search } } },
      ];
    }

    if (query.date_from || query.date_to) {
      where.created_at = {};
      if (query.date_from) where.created_at.gte = new Date(query.date_from);
      if (query.date_to) where.created_at.lte = new Date(query.date_to);
    }

    let orderBy: any = { created_at: 'desc' };
    if (query.sort === 'oldest') orderBy = { created_at: 'asc' };
    else if (query.sort === 'total_amount') orderBy = { total_amount: 'desc' };

    const [data, total] = await prisma.$transaction([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          customer: { select: { shop_name: true, owner_name: true, phone: true } },
          creator: { select: { first_name: true, last_name: true } }
        }
      }),
      prisma.order.count({ where })
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }

  async getOrderById(id: number, userRole: string, userId: number) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        customer: { select: { shop_name: true, owner_name: true, phone: true, address: true } },
        creator: { select: { first_name: true, last_name: true } }
      }
    });

    if (!order) throw new Error('Order not found');
    if (userRole === 'SALESMAN' && order.created_by !== userId) {
      throw new Error('Forbidden: You can only view your own orders');
    }

    return order;
  }

  async updateOrder(id: number, data: UpdateOrderDto, userId: number, userRole: string) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id }, include: { items: true } });
      if (!order) throw new Error('Order not found');
      
      if (userRole === 'SALESMAN' && order.created_by !== userId) {
        throw new Error('Forbidden: You can only edit your own orders');
      }

      if (order.status !== 'PENDING') {
        throw new Error('Only PENDING orders can be edited');
      }

      if (data.items) {
        await tx.orderItem.deleteMany({ where: { order_id: id } });

        let totalAmount = new Prisma.Decimal(0);
        const orderItemsData = [];

        for (const item of data.items) {
          const product = await tx.product.findUnique({ where: { id: item.product_id } });
          if (!product) throw new Error(`Product ID ${item.product_id} not found`);

          const quantity = new Prisma.Decimal(item.quantity);
          const pricePerUnit = product.selling_price;
          const subtotal = pricePerUnit.mul(quantity);
          const gstAmount = subtotal.mul(product.gst_percentage).div(100);
          const itemTotal = subtotal.add(gstAmount);

          totalAmount = totalAmount.add(itemTotal);

          orderItemsData.push({
            product_id: product.id,
            product_name: product.name,
            quantity: quantity,
            unit_type: product.unit_type,
            price_per_unit: pricePerUnit,
            gst_percentage: product.gst_percentage,
            gst_amount: gstAmount,
            subtotal: subtotal,
            total: itemTotal,
            order_id: id
          });
        }

        const pendingAmount = totalAmount.sub(order.paid_amount);
        let paymentStatus = order.payment_status;
        if (order.paid_amount.gte(totalAmount) && totalAmount.gt(0)) {
          paymentStatus = 'PAID';
        } else if (order.paid_amount.gt(0)) {
          paymentStatus = 'PARTIAL';
        }

        await tx.orderItem.createMany({ data: orderItemsData });
        
        return tx.order.update({
          where: { id },
          data: {
            total_amount: totalAmount,
            pending_amount: pendingAmount,
            payment_status: paymentStatus,
            notes: data.notes ?? order.notes
          },
          include: { items: true }
        });
      }

      return tx.order.update({
        where: { id },
        data: { notes: data.notes },
        include: { items: true }
      });
    });
  }

  async updateOrderStatus(id: number, status: OrderStatus, userId: number, userRole: string) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id }, include: { items: true } });
      if (!order) throw new Error('Order not found');

      if (userRole === 'SALESMAN' && order.created_by !== userId) {
        throw new Error('Forbidden: You can only update your own orders');
      }

      if (order.status === 'PENDING' && status === 'CONFIRMED') {
        for (const item of order.items) {
          const product = await tx.product.findUnique({ where: { id: item.product_id } });
          if (!product) continue;

          const quantityBefore = product.stock_quantity;
          const quantityAfter = quantityBefore.sub(item.quantity);

          await tx.product.update({
            where: { id: item.product_id },
            data: { stock_quantity: quantityAfter }
          });

          await tx.inventoryLog.create({
            data: {
              product_id: item.product_id,
              type: 'ORDER_DEDUCTED',
              quantity_before: quantityBefore,
              quantity_changed: item.quantity.mul(-1),
              quantity_after: quantityAfter,
              reference_id: order.order_number,
              notes: `Order Confirmed`,
              created_by: userId
            }
          });
        }
        return tx.order.update({ where: { id }, data: { status, confirmed_at: new Date() } });
      }

      if ((order.status === 'CONFIRMED' || order.status === 'DISPATCHED' || order.status === 'DELIVERED') && status === 'CANCELLED') {
        for (const item of order.items) {
          const product = await tx.product.findUnique({ where: { id: item.product_id } });
          if (!product) continue;

          const quantityBefore = product.stock_quantity;
          const quantityAfter = quantityBefore.add(item.quantity);

          await tx.product.update({
            where: { id: item.product_id },
            data: { stock_quantity: quantityAfter }
          });

          await tx.inventoryLog.create({
            data: {
              product_id: item.product_id,
              type: 'ORDER_CANCELLED_RESTORE',
              quantity_before: quantityBefore,
              quantity_changed: item.quantity,
              quantity_after: quantityAfter,
              reference_id: order.order_number,
              notes: `Order Cancelled`,
              created_by: userId
            }
          });
        }
        return tx.order.update({ where: { id }, data: { status, cancelled_at: new Date() } });
      }

      const updateData: any = { status };
      if (status === 'DISPATCHED' && !order.dispatched_at) updateData.dispatched_at = new Date();
      if (status === 'DELIVERED' && !order.delivered_at) updateData.delivered_at = new Date();
      if (status === 'CANCELLED' && !order.cancelled_at) updateData.cancelled_at = new Date();

      return tx.order.update({ where: { id }, data: updateData });
    });
  }
}
