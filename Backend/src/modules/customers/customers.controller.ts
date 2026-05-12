import { Request, Response } from 'express';
import { CustomersService } from './customers.service';
import { createCustomerSchema, updateCustomerSchema, customerStatusSchema } from './customers.validation';

const customersService = new CustomersService();

export class CustomersController {
  async createCustomer(req: Request, res: Response) {
    try {
      const validation = createCustomerSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ status: 'error', message: validation.error.issues[0].message });
      }

      const result = await customersService.createCustomer(validation.data, req.user!.userId);
      res.status(201).json({ status: 'success', data: result });
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        return res.status(409).json({ status: 'error', message: error.message });
      }
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }

  async getCustomers(req: Request, res: Response) {
    try {
      const result = await customersService.getCustomers(req.query);
      res.status(200).json({ status: 'success', ...result });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }

  async getCustomerById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const customer = await customersService.getCustomerById(id);
      res.status(200).json({ status: 'success', data: customer });
    } catch (error: any) {
      if (error.message === 'Customer not found') {
        return res.status(404).json({ status: 'error', message: error.message });
      }
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }

  async updateCustomer(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const validation = updateCustomerSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ status: 'error', message: validation.error.issues[0].message });
      }

      const customer = await customersService.updateCustomer(id, validation.data);
      res.status(200).json({ status: 'success', data: customer });
    } catch (error: any) {
      if (error.message.includes('already in use')) {
        return res.status(409).json({ status: 'error', message: error.message });
      }
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }

  async toggleStatus(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const validation = customerStatusSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ status: 'error', message: validation.error.issues[0].message });
      }

      const customer = await customersService.toggleStatus(id, validation.data.is_active);
      res.status(200).json({ status: 'success', data: customer });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }
}
