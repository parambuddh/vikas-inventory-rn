import prisma from '../../config/prisma';
import { CreatePaymentDto, UpdatePaymentDto, PaymentQueryDto } from './payments.types';
import { Prisma } from '@prisma/client';

export class PaymentsService {
  private generatePaymentNumber() {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `PAY-${timestamp}${random}`;
  }

  private async recalculateOrderTotals(tx: Prisma.TransactionClient, orderId: number) {
    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order) return;

    const allocations = await tx.paymentAllocation.findMany({
      where: {
        order_id: orderId,
        payment: { is_voided: false }
      }
    });

    const totalAllocated = allocations.reduce((sum, alloc) => sum.add(alloc.allocated_amount), new Prisma.Decimal(0));
    
    const totalAmount = order.total_amount;
    const pendingAmount = totalAmount.sub(totalAllocated);

    let paymentStatus = 'UNPAID';
    if (totalAllocated.gte(totalAmount) && totalAmount.gt(0)) {
      paymentStatus = 'PAID';
    } else if (totalAllocated.gt(0)) {
      paymentStatus = 'PARTIAL';
    }

    await tx.order.update({
      where: { id: orderId },
      data: {
        paid_amount: totalAllocated,
        pending_amount: pendingAmount,
        payment_status: paymentStatus as any
      }
    });
  }

  async createPayment(data: CreatePaymentDto, userId: number) {
    return prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findUnique({ where: { id: data.customer_id } });
      if (!customer) throw new Error('Customer not found');

      const paymentAmount = new Prisma.Decimal(data.amount);
      const totalAllocated = data.allocations.reduce((sum, alloc) => sum.add(new Prisma.Decimal(alloc.allocated_amount)), new Prisma.Decimal(0));

      if (totalAllocated.gt(paymentAmount)) {
        throw new Error('Total allocated amount cannot exceed payment amount');
      }

      for (const alloc of data.allocations) {
        const order = await tx.order.findUnique({ where: { id: alloc.order_id } });
        if (!order || order.customer_id !== data.customer_id) {
          throw new Error(`Order ID ${alloc.order_id} is invalid or does not belong to customer`);
        }
      }

      const payment = await tx.payment.create({
        data: {
          payment_number: this.generatePaymentNumber(),
          customer_id: data.customer_id,
          amount: paymentAmount,
          payment_mode: data.payment_mode,
          payment_date: new Date(data.payment_date),
          reference_number: data.reference_number,
          notes: data.notes,
          created_by: userId,
          allocations: {
            create: data.allocations.map(a => ({
              order_id: a.order_id,
              allocated_amount: new Prisma.Decimal(a.allocated_amount)
            }))
          }
        },
        include: { allocations: true }
      });

      for (const alloc of payment.allocations) {
        await this.recalculateOrderTotals(tx, alloc.order_id);
      }

      return payment;
    });
  }

  async getPayments(query: PaymentQueryDto) {
    const page = query.page ? parseInt(query.page as any) : 1;
    const limit = query.limit ? parseInt(query.limit as any) : 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.customer_id) where.customer_id = parseInt(query.customer_id as any);
    if (query.payment_mode) where.payment_mode = query.payment_mode;
    if (query.is_voided !== undefined) where.is_voided = query.is_voided === 'true';

    if (query.search) {
      where.OR = [
        { payment_number: { contains: query.search, mode: 'insensitive' } },
        { reference_number: { contains: query.search, mode: 'insensitive' } },
        { customer: { shop_name: { contains: query.search, mode: 'insensitive' } } },
        { customer: { owner_name: { contains: query.search, mode: 'insensitive' } } },
        {
          allocations: {
            some: {
              order: { order_number: { contains: query.search, mode: 'insensitive' } }
            }
          }
        }
      ];
    }

    if (query.date_from || query.date_to) {
      where.payment_date = {};
      if (query.date_from) where.payment_date.gte = new Date(query.date_from);
      if (query.date_to) where.payment_date.lte = new Date(query.date_to);
    }

    let orderBy: any = { created_at: 'desc' };
    if (query.sort === 'oldest') orderBy = { created_at: 'asc' };
    else if (query.sort === 'amount') orderBy = { amount: 'desc' };

    const [data, total] = await prisma.$transaction([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          customer: { select: { shop_name: true, owner_name: true } },
          creator: { select: { first_name: true, last_name: true } },
          allocations: {
            include: { order: { select: { order_number: true } } }
          }
        }
      }),
      prisma.payment.count({ where })
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }

  async getPaymentById(id: number) {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        customer: { select: { shop_name: true, owner_name: true, phone: true } },
        creator: { select: { first_name: true, last_name: true } },
        allocations: {
          include: { order: { select: { order_number: true, total_amount: true, pending_amount: true } } }
        }
      }
    });

    if (!payment) throw new Error('Payment not found');
    return payment;
  }

  async updatePayment(id: number, data: UpdatePaymentDto) {
    return prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { id },
        include: { allocations: true }
      });
      if (!payment) throw new Error('Payment not found');
      if (payment.is_voided) throw new Error('Cannot edit a voided payment');

      const paymentAmount = new Prisma.Decimal(data.amount ?? payment.amount);
      
      let newAllocations = data.allocations;
      
      if (newAllocations) {
        const totalAllocated = newAllocations.reduce((sum, alloc) => sum.add(new Prisma.Decimal(alloc.allocated_amount)), new Prisma.Decimal(0));
        if (totalAllocated.gt(paymentAmount)) {
          throw new Error('Total allocated amount cannot exceed payment amount');
        }

        const oldOrderIds = payment.allocations.map(a => a.order_id);

        for (const alloc of newAllocations) {
          const order = await tx.order.findUnique({ where: { id: alloc.order_id } });
          if (!order || order.customer_id !== payment.customer_id) {
            throw new Error(`Order ID ${alloc.order_id} is invalid or does not belong to customer`);
          }
        }

        await tx.paymentAllocation.deleteMany({ where: { payment_id: id } });

        await tx.paymentAllocation.createMany({
          data: newAllocations.map(a => ({
            payment_id: id,
            order_id: a.order_id,
            allocated_amount: new Prisma.Decimal(a.allocated_amount)
          }))
        });

        const updatedPayment = await tx.payment.update({
          where: { id },
          data: {
            amount: paymentAmount,
            payment_mode: data.payment_mode,
            payment_date: data.payment_date ? new Date(data.payment_date) : undefined,
            reference_number: data.reference_number,
            notes: data.notes
          },
          include: { allocations: true }
        });

        const allOrderIdsToRecalc = new Set([...oldOrderIds, ...newAllocations.map(a => a.order_id)]);
        for (const orderId of allOrderIdsToRecalc) {
          await this.recalculateOrderTotals(tx, orderId);
        }

        return updatedPayment;
      } else {
        return tx.payment.update({
          where: { id },
          data: {
            amount: paymentAmount,
            payment_mode: data.payment_mode,
            payment_date: data.payment_date ? new Date(data.payment_date) : undefined,
            reference_number: data.reference_number,
            notes: data.notes
          },
          include: { allocations: true }
        });
      }
    });
  }

  async voidPayment(id: number) {
    return prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { id },
        include: { allocations: true }
      });
      if (!payment) throw new Error('Payment not found');
      if (payment.is_voided) throw new Error('Payment is already voided');

      const voidedPayment = await tx.payment.update({
        where: { id },
        data: { is_voided: true }
      });

      for (const alloc of payment.allocations) {
        await this.recalculateOrderTotals(tx, alloc.order_id);
      }

      return voidedPayment;
    });
  }
}
