import prisma from '../../config/prisma';
import { CreateCustomerDto, UpdateCustomerDto, CustomerQueryDto } from './customers.types';

export class CustomersService {
  async createCustomer(data: CreateCustomerDto, userId: number) {
    const existing = await prisma.customer.findUnique({ where: { phone: data.phone } });
    if (existing) {
      throw new Error('Customer with this phone number already exists');
    }

    return prisma.customer.create({
      data: {
        ...data,
        created_by: userId,
      },
      select: this.customerSelect()
    });
  }

  async getCustomers(query: CustomerQueryDto) {
    const page = query.page ? parseInt(query.page as any) : 1;
    const limit = query.limit ? parseInt(query.limit as any) : 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.is_active !== undefined) {
      where.is_active = query.is_active === 'true';
    }

    if (query.created_by) {
      where.created_by = parseInt(query.created_by as any);
    }

    if (query.search) {
      where.OR = [
        { shop_name: { contains: query.search, mode: 'insensitive' } },
        { owner_name: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search } },
        { area: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    let orderBy: any = { created_at: 'desc' }; // newest
    if (query.sort === 'oldest') {
      orderBy = { created_at: 'asc' };
    } else if (query.sort === 'shop_name') {
      orderBy = { shop_name: 'asc' };
    }

    const [data, total] = await prisma.$transaction([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: this.customerSelect()
      }),
      prisma.customer.count({ where })
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

  async getCustomerById(id: number) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      select: this.customerSelect()
    });
    if (!customer) throw new Error('Customer not found');
    return customer;
  }

  async updateCustomer(id: number, data: UpdateCustomerDto) {
    if (data.phone) {
      const existing = await prisma.customer.findFirst({
        where: { phone: data.phone, id: { not: id } }
      });
      if (existing) {
        throw new Error('Phone number already in use by another customer');
      }
    }

    return prisma.customer.update({
      where: { id },
      data,
      select: this.customerSelect()
    });
  }

  async toggleStatus(id: number, is_active: boolean) {
    return prisma.customer.update({
      where: { id },
      data: { is_active },
      select: { id: true, shop_name: true, is_active: true }
    });
  }

  private customerSelect() {
    return {
      id: true,
      shop_name: true,
      owner_name: true,
      phone: true,
      alternate_phone: true,
      email: true,
      address: true,
      gst_number: true,
      area: true,
      notes: true,
      latitude: true,
      longitude: true,
      total_orders_amount: true,
      total_received_amount: true,
      pending_amount: true,
      is_active: true,
      created_by: true,
      created_at: true,
      updated_at: true,
      creator: {
        select: {
          id: true,
          first_name: true,
          last_name: true
        }
      }
    };
  }
}
