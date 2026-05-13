import { Router } from 'express';
import { PaymentsController } from './payments.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorizeRole } from '../../middleware/role.middleware';

const router = Router();
const paymentsController = new PaymentsController();

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment and Allocation API
 */

router.use(authenticate);
router.use(authorizeRole(['ADMIN'])); // ONLY ADMIN CAN ACCESS PAYMENTS

/**
 * @swagger
 * /payments:
 *   post:
 *     summary: Create new payment and allocate to orders
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [customer_id, amount, payment_mode, payment_date, allocations]
 *             properties:
 *               customer_id:
 *                 type: integer
 *               amount:
 *                 type: number
 *               payment_mode:
 *                 type: string
 *                 enum: [CASH, BANK_TRANSFER, UPI, CHEQUE, CARD]
 *               payment_date:
 *                 type: string
 *                 format: date-time
 *               reference_number:
 *                 type: string
 *               notes:
 *                 type: string
 *               allocations:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [order_id, allocated_amount]
 *                   properties:
 *                     order_id:
 *                       type: integer
 *                     allocated_amount:
 *                       type: number
 *     responses:
 *       201:
 *         description: Payment created
 */
router.post('/', paymentsController.createPayment.bind(paymentsController));

/**
 * @swagger
 * /payments:
 *   get:
 *     summary: Get payments with pagination, filters, and search
 *     tags: [Payments]
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
 *         name: payment_mode
 *         schema:
 *           type: string
 *           enum: [CASH, BANK_TRANSFER, UPI, CHEQUE, CARD]
 *       - in: query
 *         name: is_voided
 *         schema:
 *           type: string
 *           enum: ['true', 'false']
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: ['newest', 'oldest', 'amount']
 *     responses:
 *       200:
 *         description: List of payments
 */
router.get('/', paymentsController.getPayments.bind(paymentsController));

/**
 * @swagger
 * /payments/{id}:
 *   get:
 *     summary: Get payment details by ID
 *     tags: [Payments]
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
 *         description: Payment details
 */
router.get('/:id', paymentsController.getPaymentById.bind(paymentsController));

/**
 * @swagger
 * /payments/{id}:
 *   patch:
 *     summary: Update payment details and reallocate
 *     tags: [Payments]
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
 *               amount:
 *                 type: number
 *               payment_mode:
 *                 type: string
 *                 enum: [CASH, BANK_TRANSFER, UPI, CHEQUE, CARD]
 *               payment_date:
 *                 type: string
 *                 format: date-time
 *               reference_number:
 *                 type: string
 *               notes:
 *                 type: string
 *               allocations:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [order_id, allocated_amount]
 *                   properties:
 *                     order_id:
 *                       type: integer
 *                     allocated_amount:
 *                       type: number
 *     responses:
 *       200:
 *         description: Payment updated
 */
router.patch('/:id', paymentsController.updatePayment.bind(paymentsController));

/**
 * @swagger
 * /payments/{id}/void:
 *   patch:
 *     summary: Void a payment and reverse allocations
 *     tags: [Payments]
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
 *         description: Payment voided
 */
router.patch('/:id/void', paymentsController.voidPayment.bind(paymentsController));

export default router;
