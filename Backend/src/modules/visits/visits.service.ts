import prisma from '../../config/prisma';
import { CheckinDto, CheckoutDto, VisitQueryDto } from './visits.types';

export class VisitsService {
  async checkin(data: CheckinDto, salesmanId: number) {
    return prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findUnique({ where: { id: data.customer_id } });
      if (!customer) throw new Error('Customer not found');

      // Check for existing active visits for this salesman
      const activeVisits = await tx.visit.findMany({
        where: { salesman_id: salesmanId, status: 'ACTIVE' }
      });

      // Auto-close any existing active visits to strictly enforce "one active visit" rule
      if (activeVisits.length > 0) {
        for (const visit of activeVisits) {
          const durationSeconds = Math.floor((new Date().getTime() - visit.checkin_time.getTime()) / 1000);
          await tx.visit.update({
            where: { id: visit.id },
            data: {
              status: 'AUTO_CLOSED',
              checkout_time: new Date(),
              visit_duration: durationSeconds,
            }
          });
        }
      }

      // Geo Validation Logic (Optional, customizable later)
      // if (customer.latitude && customer.longitude && data.latitude && data.longitude) {
      //   const distance = calculateDistance(customer.lat, customer.lon, data.lat, data.lon);
      //   if (distance > MAX_ALLOWED_DISTANCE) throw new Error('You are not at the customer location');
      // }

      return tx.visit.create({
        data: {
          salesman_id: salesmanId,
          customer_id: data.customer_id,
          checkin_latitude: data.latitude,
          checkin_longitude: data.longitude,
          notes: data.notes
        },
        include: { customer: { select: { shop_name: true } } }
      });
    });
  }

  async checkout(data: CheckoutDto, salesmanId: number) {
    const activeVisit = await prisma.visit.findFirst({
      where: { salesman_id: salesmanId, status: 'ACTIVE' },
      orderBy: { checkin_time: 'desc' }
    });

    if (!activeVisit) {
      throw new Error('No active visit found to checkout');
    }

    const checkoutTime = new Date();
    const durationSeconds = Math.floor((checkoutTime.getTime() - activeVisit.checkin_time.getTime()) / 1000);

    const notes = data.notes 
      ? (activeVisit.notes ? `${activeVisit.notes} | Checkout: ${data.notes}` : data.notes) 
      : activeVisit.notes;

    return prisma.visit.update({
      where: { id: activeVisit.id },
      data: {
        status: 'COMPLETED',
        checkout_time: checkoutTime,
        visit_duration: durationSeconds,
        checkout_latitude: data.latitude,
        checkout_longitude: data.longitude,
        notes: notes
      },
      include: { customer: { select: { shop_name: true } } }
    });
  }

  async getActiveVisit(salesmanId: number) {
    return prisma.visit.findFirst({
      where: { salesman_id: salesmanId, status: 'ACTIVE' },
      include: { customer: { select: { shop_name: true, phone: true } } }
    });
  }

  // --- REUSABLE VALIDATION HELPERS ---
  
  async validateActiveVisitForOrder(salesmanId: number, customerId: number): Promise<boolean> {
    const activeVisit = await prisma.visit.findFirst({
      where: { 
        salesman_id: salesmanId, 
        customer_id: customerId,
        status: 'ACTIVE' 
      }
    });

    return !!activeVisit;
  }

  async markVisitAsProductive(salesmanId: number, customerId: number) {
    const activeVisit = await prisma.visit.findFirst({
      where: { 
        salesman_id: salesmanId, 
        customer_id: customerId,
        status: 'ACTIVE' 
      }
    });

    if (activeVisit) {
      await prisma.visit.update({
        where: { id: activeVisit.id },
        data: { order_created: true }
      });
    }
  }

  // --- QUERIES & ANALYTICS ---

  async getVisits(query: VisitQueryDto, userRole: string, userId: number) {
    const page = query.page ? parseInt(query.page as any) : 1;
    const limit = query.limit ? parseInt(query.limit as any) : 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (userRole === 'SALESMAN') {
      where.salesman_id = userId;
    } else if (query.salesman_id) {
      where.salesman_id = parseInt(query.salesman_id as any);
    }

    if (query.customer_id) where.customer_id = parseInt(query.customer_id as any);
    if (query.status) where.status = query.status;
    if (query.productive !== undefined) where.order_created = query.productive === 'true';

    if (query.date_from || query.date_to) {
      where.checkin_time = {};
      if (query.date_from) where.checkin_time.gte = new Date(query.date_from);
      if (query.date_to) where.checkin_time.lte = new Date(query.date_to);
    }

    const [data, total] = await prisma.$transaction([
      prisma.visit.findMany({
        where,
        skip,
        take: limit,
        orderBy: { checkin_time: 'desc' },
        include: {
          customer: { select: { shop_name: true, owner_name: true } },
          salesman: { select: { first_name: true, last_name: true } }
        }
      }),
      prisma.visit.count({ where })
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }

  async getRouteHistory(salesmanId: number, dateFrom: string, dateTo: string, userRole: string, requestingUserId: number) {
    if (userRole === 'SALESMAN' && salesmanId !== requestingUserId) {
      throw new Error('Forbidden: You can only view your own route history');
    }

    const visits = await prisma.visit.findMany({
      where: {
        salesman_id: salesmanId,
        checkin_time: {
          gte: new Date(dateFrom),
          lte: new Date(dateTo)
        }
      },
      orderBy: { checkin_time: 'asc' },
      include: { customer: { select: { shop_name: true, latitude: true, longitude: true } } }
    });

    const route = visits.map((v, index) => ({
      sequence: index + 1,
      visit_id: v.id,
      customer_name: v.customer.shop_name,
      checkin_time: v.checkin_time,
      checkout_time: v.checkout_time,
      duration: v.visit_duration,
      status: v.status,
      productive: v.order_created,
      checkin_coordinates: { lat: v.checkin_latitude, lng: v.checkin_longitude },
      checkout_coordinates: { lat: v.checkout_latitude, lng: v.checkout_longitude }
    }));

    return route;
  }

  async getProductivityAnalytics(salesmanId?: number, dateFrom?: string, dateTo?: string) {
    const where: any = {};
    if (salesmanId) where.salesman_id = salesmanId;
    if (dateFrom || dateTo) {
      where.checkin_time = {};
      if (dateFrom) where.checkin_time.gte = new Date(dateFrom);
      if (dateTo) where.checkin_time.lte = new Date(dateTo);
    }

    const [totalVisits, productiveVisits, durationStats] = await Promise.all([
      prisma.visit.count({ where }),
      prisma.visit.count({ where: { ...where, order_created: true } }),
      prisma.visit.aggregate({
        where: { ...where, visit_duration: { not: null } },
        _avg: { visit_duration: true }
      })
    ]);

    return {
      total_visits: totalVisits,
      productive_visits: productiveVisits,
      non_productive_visits: totalVisits - productiveVisits,
      productivity_percentage: totalVisits > 0 ? ((productiveVisits / totalVisits) * 100).toFixed(2) : 0,
      average_visit_duration_seconds: Math.floor(durationStats._avg.visit_duration || 0)
    };
  }

  async getVisitById(id: number, userRole: string, userId: number) {
    const visit = await prisma.visit.findUnique({
      where: { id },
      include: {
        customer: { select: { shop_name: true, owner_name: true, phone: true, address: true } },
        salesman: { select: { first_name: true, last_name: true, phone: true } }
      }
    });

    if (!visit) throw new Error('Visit not found');
    if (userRole === 'SALESMAN' && visit.salesman_id !== userId) {
      throw new Error('Forbidden: You can only view your own visits');
    }

    return visit;
  }
}
