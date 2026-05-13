import { Router } from 'express';
import { InventoryController } from './inventory.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorizeRole } from '../../middleware/role.middleware';

const router = Router();
const inventoryController = new InventoryController();

/**
 * @swagger
 * tags:
 *   name: Inventory
 *   description: Inventory management API
 */

router.use(authenticate);

/**
 * @swagger
 * /inventory/add-stock:
 *   post:
 *     summary: Add stock or manually adjust (ADMIN only)
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [product_id, type, quantity_changed]
 *             properties:
 *               product_id:
 *                 type: integer
 *               type:
 *                 type: string
 *                 enum: [STOCK_ADDED, MANUAL_ADJUSTMENT]
 *               quantity_changed:
 *                 type: number
 *                 description: Positive or negative decimal
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Stock updated
 */
router.post('/add-stock', authorizeRole(['ADMIN']), inventoryController.addStock.bind(inventoryController));

/**
 * @swagger
 * /inventory/logs:
 *   get:
 *     summary: Get inventory movement logs
 *     tags: [Inventory]
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
 *         name: product_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [STOCK_ADDED, ORDER_DEDUCTED, MANUAL_ADJUSTMENT]
 *     responses:
 *       200:
 *         description: List of logs
 */
router.get('/logs', inventoryController.getLogs.bind(inventoryController));

/**
 * @swagger
 * /inventory/low-stock:
 *   get:
 *     summary: Get low stock or negative stock products
 *     tags: [Inventory]
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
 *         name: negative_only
 *         schema:
 *           type: string
 *           enum: ['true', 'false']
 *     responses:
 *       200:
 *         description: Low stock products
 */
router.get('/low-stock', inventoryController.getLowStock.bind(inventoryController));

export default router;
