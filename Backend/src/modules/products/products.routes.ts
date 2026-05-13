import { Router } from 'express';
import { ProductsController } from './products.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorizeRole } from '../../middleware/role.middleware';
import { productUpload } from '../../utils/product-upload';

const router = Router();
const productsController = new ProductsController();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management API
 */

router.use(authenticate);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create new product (ADMIN only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name, sku, purchase_price, selling_price, gst_percentage, unit_type, low_stock_threshold]
 *             properties:
 *               name:
 *                 type: string
 *               sku:
 *                 type: string
 *               description:
 *                 type: string
 *               purchase_price:
 *                 type: number
 *               selling_price:
 *                 type: number
 *               gst_percentage:
 *                 type: number
 *               unit_type:
 *                 type: string
 *                 enum: [PCS, KG, GRAM, BOX, LITER]
 *               low_stock_threshold:
 *                 type: number
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Product created
 */
router.post('/', authorizeRole(['ADMIN']), productUpload.single('image'), productsController.createProduct.bind(productsController));

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: string
 *           enum: ['true', 'false']
 *       - in: query
 *         name: unit_type
 *         schema:
 *           type: string
 *           enum: [PCS, KG, GRAM, BOX, LITER]
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: ['newest', 'oldest', 'name']
 *     responses:
 *       200:
 *         description: List of products
 */
router.get('/', productsController.getProducts.bind(productsController));

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product details
 */
router.get('/:id', productsController.getProductById.bind(productsController));

/**
 * @swagger
 * /products/{id}:
 *   patch:
 *     summary: Update product details (ADMIN only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               purchase_price:
 *                 type: number
 *               selling_price:
 *                 type: number
 *               gst_percentage:
 *                 type: number
 *               low_stock_threshold:
 *                 type: number
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Product updated
 */
router.patch('/:id', authorizeRole(['ADMIN']), productUpload.single('image'), productsController.updateProduct.bind(productsController));

/**
 * @swagger
 * /products/{id}/status:
 *   patch:
 *     summary: Soft delete / toggle active status (ADMIN only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [is_active]
 *             properties:
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch('/:id/status', authorizeRole(['ADMIN']), productsController.toggleStatus.bind(productsController));

export default router;
