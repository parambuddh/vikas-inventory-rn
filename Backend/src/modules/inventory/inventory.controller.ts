import { Request, Response } from 'express';
import { InventoryService } from './inventory.service';
import { addStockSchema } from './inventory.validation';

const inventoryService = new InventoryService();

export class InventoryController {
  async addStock(req: Request, res: Response) {
    try {
      const validation = addStockSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ status: 'error', message: validation.error.issues[0].message });
      }

      const result = await inventoryService.addStock(validation.data, req.user!.userId);
      res.status(201).json({ status: 'success', data: result });
    } catch (error: any) {
      if (error.message === 'Product not found') {
        return res.status(404).json({ status: 'error', message: error.message });
      }
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }

  async getLogs(req: Request, res: Response) {
    try {
      const result = await inventoryService.getInventoryLogs(req.query);
      res.status(200).json({ status: 'success', ...result });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }

  async getLowStock(req: Request, res: Response) {
    try {
      const result = await inventoryService.getLowStockProducts(req.query);
      res.status(200).json({ status: 'success', ...result });
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }
}
