import { Router } from 'express';
import { CustomersController } from './customers.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();
const customersController = new CustomersController();

/**
 * @swagger
 * tags:
 *   name: Customers
 *   description: Customer management API
 */

router.use(authenticate);

/**
 * @swagger
 * /customers:
 *   post:
 *     summary: Create new customer
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [shop_name, owner_name, phone, address]
 *             properties:
 *               shop_name:
 *                 type: string
 *               owner_name:
 *                 type: string
 *               phone:
 *                 type: string
 *               alternate_phone:
 *                 type: string
 *               email:
 *                 type: string
 *               address:
 *                 type: string
 *               gst_number:
 *                 type: string
 *               area:
 *                 type: string
 *               notes:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *     responses:
 *       201:
 *         description: Customer created
 */
router.post('/', customersController.createCustomer.bind(customersController));

/**
 * @swagger
 * /customers:
 *   get:
 *     summary: Get all customers with pagination, search, and filters
 *     tags: [Customers]
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
 *         name: created_by
 *         schema:
 *           type: integer
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: ['newest', 'oldest', 'shop_name']
 *     responses:
 *       200:
 *         description: List of customers
 */
router.get('/', customersController.getCustomers.bind(customersController));

/**
 * @swagger
 * /customers/{id}:
 *   get:
 *     summary: Get customer details by ID
 *     tags: [Customers]
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
 *         description: Customer details
 */
router.get('/:id', customersController.getCustomerById.bind(customersController));

/**
 * @swagger
 * /customers/{id}:
 *   patch:
 *     summary: Update customer details
 *     tags: [Customers]
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
 *               shop_name:
 *                 type: string
 *               owner_name:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               total_orders_amount:
 *                 type: number
 *               total_received_amount:
 *                 type: number
 *               pending_amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Customer updated
 */
router.patch('/:id', customersController.updateCustomer.bind(customersController));

/**
 * @swagger
 * /customers/{id}/status:
 *   patch:
 *     summary: Soft delete / toggle active status
 *     tags: [Customers]
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
router.patch('/:id/status', customersController.toggleStatus.bind(customersController));

export default router;
