import { Request, Response } from 'express';
import { OrdersService } from './orders.service';
import { createOrderSchema, updateOrderSchema, orderStatusSchema } from './orders.validation';

const ordersService = new OrdersService();

export class OrdersController {
  async createOrder(req: Request, res: Response) {
    try {
      const validation = createOrderSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ status: 'error', message: validation.error.issues[0].message });
      }

      const order = await ordersService.createOrder(validation.data, req.user!.userId);
      res.status(201).json({ status: 'success', data: order });
    } catch (error: any) {
      if (error.message.includes('not found')) {
        return res.status(404).json({ status: 'error', message: error.message });
      }
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }

  async getOrders(req: Request, res: Response) {
    try {
      const result = await ordersService.getOrders(req.query, req.user!.role, req.user!.userId);
      res.status(200).json({ status: 'success', ...result });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }

  async getOrderById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const order = await ordersService.getOrderById(id, req.user!.role, req.user!.userId);
      res.status(200).json({ status: 'success', data: order });
    } catch (error: any) {
      if (error.message.includes('Forbidden')) {
        return res.status(403).json({ status: 'error', message: error.message });
      }
      if (error.message === 'Order not found') {
        return res.status(404).json({ status: 'error', message: error.message });
      }
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }

  async updateOrder(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const validation = updateOrderSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ status: 'error', message: validation.error.issues[0].message });
      }

      const order = await ordersService.updateOrder(id, validation.data, req.user!.userId, req.user!.role);
      res.status(200).json({ status: 'success', data: order });
    } catch (error: any) {
      if (error.message.includes('Forbidden')) {
        return res.status(403).json({ status: 'error', message: error.message });
      }
      if (error.message.includes('not found')) {
        return res.status(404).json({ status: 'error', message: error.message });
      }
      if (error.message.includes('PENDING')) {
        return res.status(400).json({ status: 'error', message: error.message });
      }
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }

  async updateOrderStatus(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const validation = orderStatusSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ status: 'error', message: validation.error.issues[0].message });
      }

      const order = await ordersService.updateOrderStatus(id, validation.data.status as any, req.user!.userId, req.user!.role);
      res.status(200).json({ status: 'success', data: order });
    } catch (error: any) {
      if (error.message.includes('Forbidden')) {
        return res.status(403).json({ status: 'error', message: error.message });
      }
      if (error.message === 'Order not found') {
        return res.status(404).json({ status: 'error', message: error.message });
      }
      console.error(error);
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }
}
