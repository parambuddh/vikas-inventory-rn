import { Request, Response } from 'express';
import { PaymentsService } from './payments.service';
import { createPaymentSchema, updatePaymentSchema } from './payments.validation';

const paymentsService = new PaymentsService();

export class PaymentsController {
  async createPayment(req: Request, res: Response) {
    try {
      const validation = createPaymentSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ status: 'error', message: validation.error.issues[0].message });
      }

      const payment = await paymentsService.createPayment(validation.data, req.user!.userId);
      res.status(201).json({ status: 'success', data: payment });
    } catch (error: any) {
      if (error.message.includes('not exceed payment amount') || error.message.includes('invalid')) {
        return res.status(400).json({ status: 'error', message: error.message });
      }
      if (error.message.includes('not found')) {
        return res.status(404).json({ status: 'error', message: error.message });
      }
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }

  async getPayments(req: Request, res: Response) {
    try {
      const result = await paymentsService.getPayments(req.query);
      res.status(200).json({ status: 'success', ...result });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }

  async getPaymentById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const payment = await paymentsService.getPaymentById(id);
      res.status(200).json({ status: 'success', data: payment });
    } catch (error: any) {
      if (error.message === 'Payment not found') {
        return res.status(404).json({ status: 'error', message: error.message });
      }
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }

  async updatePayment(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const validation = updatePaymentSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ status: 'error', message: validation.error.issues[0].message });
      }

      const payment = await paymentsService.updatePayment(id, validation.data);
      res.status(200).json({ status: 'success', data: payment });
    } catch (error: any) {
      if (error.message.includes('not exceed payment amount') || error.message.includes('invalid') || error.message.includes('voided')) {
        return res.status(400).json({ status: 'error', message: error.message });
      }
      if (error.message === 'Payment not found') {
        return res.status(404).json({ status: 'error', message: error.message });
      }
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }

  async voidPayment(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const payment = await paymentsService.voidPayment(id);
      res.status(200).json({ status: 'success', data: payment });
    } catch (error: any) {
      if (error.message.includes('already voided')) {
        return res.status(400).json({ status: 'error', message: error.message });
      }
      if (error.message === 'Payment not found') {
        return res.status(404).json({ status: 'error', message: error.message });
      }
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }
}
