import { Router, Request, Response } from 'express';
import { OrdersController } from './orders.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();
const ordersController = new OrdersController();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management API
 */

router.use(authenticate);

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [customer_id, items]
 *             properties:
 *               customer_id:
 *                 type: integer
 *               paid_amount:
 *                 type: number
 *               notes:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [product_id, quantity]
 *                   properties:
 *                     product_id:
 *                       type: integer
 *                     quantity:
 *                       type: number
 *     responses:
 *       201:
 *         description: Order created
 */
router.post('/', ordersController.createOrder.bind(ordersController));

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get orders with pagination, filters, and search
 *     tags: [Orders]
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
 *         name: customer_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, CONFIRMED, DISPATCHED, DELIVERED, CANCELLED]
 *       - in: query
 *         name: payment_status
 *         schema:
 *           type: string
 *           enum: [UNPAID, PARTIAL, PAID]
 *       - in: query
 *         name: created_by
 *         schema:
 *           type: integer
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: ['newest', 'oldest', 'total_amount']
 *     responses:
 *       200:
 *         description: List of orders
 */
router.get('/', ordersController.getOrders.bind(ordersController));

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get order details by ID
 *     tags: [Orders]
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
 *         description: Order details
 */
router.get('/:id', ordersController.getOrderById.bind(ordersController));

/**
 * @swagger
 * /orders/{id}:
 *   patch:
 *     summary: Update PENDING order details
 *     tags: [Orders]
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
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [product_id, quantity]
 *                   properties:
 *                     product_id:
 *                       type: integer
 *                     quantity:
 *                       type: number
 *     responses:
 *       200:
 *         description: Order updated
 */
router.patch('/:id', ordersController.updateOrder.bind(ordersController));

/**
 * @swagger
 * /orders/{id}/status:
 *   patch:
 *     summary: Update order status (and cancel)
 *     tags: [Orders]
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
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, CONFIRMED, DISPATCHED, DELIVERED, CANCELLED]
 *     responses:
 *       200:
 *         description: Order status updated
 */
router.patch('/:id/status', ordersController.updateOrderStatus.bind(ordersController));

/**
 * @swagger
 * /orders/{id}/cancel:
 *   patch:
 *     summary: Alias to cancel an order
 *     tags: [Orders]
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
 *         description: Order cancelled
 */
router.patch('/:id/cancel', (req: Request, res: Response) => {
  req.body.status = 'CANCELLED';
  ordersController.updateOrderStatus(req, res);
});

export default router;
