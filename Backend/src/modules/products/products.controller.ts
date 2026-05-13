import { Request, Response } from 'express';
import { ProductsService } from './products.service';
import { createProductSchema, updateProductSchema, productStatusSchema } from './products.validation';
import { processProductImage } from '../../utils/product-upload';

const productsService = new ProductsService();

export class ProductsController {
  async createProduct(req: Request, res: Response) {
    try {
      if (req.body.purchase_price) req.body.purchase_price = Number(req.body.purchase_price);
      if (req.body.selling_price) req.body.selling_price = Number(req.body.selling_price);
      if (req.body.gst_percentage) req.body.gst_percentage = Number(req.body.gst_percentage);
      if (req.body.low_stock_threshold) req.body.low_stock_threshold = Number(req.body.low_stock_threshold);

      const validation = createProductSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ status: 'error', message: validation.error.issues[0].message });
      }

      let image_url, thumbnail_url;
      if (req.file) {
        const processed = await processProductImage(req.file, `product-${validation.data.sku}`);
        image_url = processed.image_url;
        thumbnail_url = processed.thumbnail_url;
      }

      const createData = { ...validation.data, image_url, thumbnail_url };
      const product = await productsService.createProduct(createData, req.user!.userId);
      res.status(201).json({ status: 'success', data: product });
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        return res.status(409).json({ status: 'error', message: error.message });
      }
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }

  async getProducts(req: Request, res: Response) {
    try {
      const result = await productsService.getProducts(req.query);
      res.status(200).json({ status: 'success', ...result });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }

  async getProductById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const product = await productsService.getProductById(id);
      res.status(200).json({ status: 'success', data: product });
    } catch (error: any) {
      if (error.message === 'Product not found') {
        return res.status(404).json({ status: 'error', message: error.message });
      }
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }

  async updateProduct(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      
      if (req.body.purchase_price) req.body.purchase_price = Number(req.body.purchase_price);
      if (req.body.selling_price) req.body.selling_price = Number(req.body.selling_price);
      if (req.body.gst_percentage) req.body.gst_percentage = Number(req.body.gst_percentage);
      if (req.body.low_stock_threshold) req.body.low_stock_threshold = Number(req.body.low_stock_threshold);

      const validation = updateProductSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ status: 'error', message: validation.error.issues[0].message });
      }

      let image_url, thumbnail_url;
      if (req.file) {
        const processed = await processProductImage(req.file, `product-${id}`);
        image_url = processed.image_url;
        thumbnail_url = processed.thumbnail_url;
      }

      const updateData = { ...validation.data, ...(image_url && { image_url, thumbnail_url }) };
      const product = await productsService.updateProduct(id, updateData);
      
      res.status(200).json({ status: 'success', data: product });
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
      const validation = productStatusSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ status: 'error', message: validation.error.issues[0].message });
      }

      const product = await productsService.toggleStatus(id, validation.data.is_active);
      res.status(200).json({ status: 'success', data: product });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }
}
