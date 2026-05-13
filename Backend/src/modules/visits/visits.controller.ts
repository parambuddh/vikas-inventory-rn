import { Request, Response } from 'express';
import { VisitsService } from './visits.service';
import { checkinSchema, checkoutSchema } from './visits.validation';

const visitsService = new VisitsService();

export class VisitsController {
  async checkin(req: Request, res: Response) {
    try {
      const validation = checkinSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ status: 'error', message: validation.error.issues[0].message });
      }

      const visit = await visitsService.checkin(validation.data, req.user!.userId);
      res.status(201).json({ status: 'success', data: visit });
    } catch (error: any) {
      if (error.message.includes('not found')) {
        return res.status(404).json({ status: 'error', message: error.message });
      }
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }

  async checkout(req: Request, res: Response) {
    try {
      const validation = checkoutSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ status: 'error', message: validation.error.issues[0].message });
      }

      const visit = await visitsService.checkout(validation.data, req.user!.userId);
      res.status(200).json({ status: 'success', data: visit });
    } catch (error: any) {
      if (error.message.includes('No active visit')) {
        return res.status(400).json({ status: 'error', message: error.message });
      }
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }

  async getActiveVisit(req: Request, res: Response) {
    try {
      const visit = await visitsService.getActiveVisit(req.user!.userId);
      res.status(200).json({ status: 'success', data: visit || null });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }

  async getVisits(req: Request, res: Response) {
    try {
      const result = await visitsService.getVisits(req.query, req.user!.role, req.user!.userId);
      res.status(200).json({ status: 'success', ...result });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }

  async getRouteHistory(req: Request, res: Response) {
    try {
      const salesmanId = parseInt(req.query.salesman_id as string) || req.user!.userId;
      const dateFrom = req.query.date_from as string;
      const dateTo = req.query.date_to as string;

      if (!dateFrom || !dateTo) {
        return res.status(400).json({ status: 'error', message: 'date_from and date_to are required' });
      }

      const result = await visitsService.getRouteHistory(salesmanId, dateFrom, dateTo, req.user!.role, req.user!.userId);
      res.status(200).json({ status: 'success', data: result });
    } catch (error: any) {
      if (error.message.includes('Forbidden')) {
        return res.status(403).json({ status: 'error', message: error.message });
      }
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }

  async getAnalytics(req: Request, res: Response) {
    try {
      const salesmanId = req.query.salesman_id ? parseInt(req.query.salesman_id as string) : undefined;
      const dateFrom = req.query.date_from as string;
      const dateTo = req.query.date_to as string;

      // Only ADMIN can query other salesmen's analytics explicitly
      if (req.user!.role === 'SALESMAN' && salesmanId && salesmanId !== req.user!.userId) {
        return res.status(403).json({ status: 'error', message: 'Forbidden' });
      }

      const querySalesmanId = req.user!.role === 'SALESMAN' ? req.user!.userId : salesmanId;
      const result = await visitsService.getProductivityAnalytics(querySalesmanId, dateFrom, dateTo);
      res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }

  async getVisitById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const visit = await visitsService.getVisitById(id, req.user!.role, req.user!.userId);
      res.status(200).json({ status: 'success', data: visit });
    } catch (error: any) {
      if (error.message.includes('Forbidden')) {
        return res.status(403).json({ status: 'error', message: error.message });
      }
      if (error.message === 'Visit not found') {
        return res.status(404).json({ status: 'error', message: error.message });
      }
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }
}
