import { Router } from 'express';
import { VisitsController } from './visits.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();
const visitsController = new VisitsController();

/**
 * @swagger
 * tags:
 *   name: Visits
 *   description: Salesman Visit Tracking API
 */

router.use(authenticate); // Both ADMIN and SALESMAN

/**
 * @swagger
 * /visits/checkin:
 *   post:
 *     summary: Check-in to a customer visit
 *     tags: [Visits]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [customer_id]
 *             properties:
 *               customer_id:
 *                 type: integer
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Checked in
 */
router.post('/checkin', visitsController.checkin.bind(visitsController));

/**
 * @swagger
 * /visits/checkout:
 *   post:
 *     summary: Check-out from active visit
 *     tags: [Visits]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Checked out
 */
router.post('/checkout', visitsController.checkout.bind(visitsController));

/**
 * @swagger
 * /visits/active:
 *   get:
 *     summary: Get current active visit for logged in user
 *     tags: [Visits]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active visit
 */
router.get('/active', visitsController.getActiveVisit.bind(visitsController));

/**
 * @swagger
 * /visits/route-history:
 *   get:
 *     summary: Get route history for a salesman
 *     tags: [Visits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: salesman_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: date_from
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: date_to
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Route history
 */
router.get('/route-history', visitsController.getRouteHistory.bind(visitsController));

/**
 * @swagger
 * /visits/analytics:
 *   get:
 *     summary: Get productivity analytics
 *     tags: [Visits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: salesman_id
 *         schema:
 *           type: integer
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
 *     responses:
 *       200:
 *         description: Analytics data
 */
router.get('/analytics', visitsController.getAnalytics.bind(visitsController));

/**
 * @swagger
 * /visits:
 *   get:
 *     summary: Get visits list with filters
 *     tags: [Visits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: customer_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: salesman_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, COMPLETED, AUTO_CLOSED]
 *       - in: query
 *         name: productive
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
 *     responses:
 *       200:
 *         description: Visits list
 */
router.get('/', visitsController.getVisits.bind(visitsController));

/**
 * @swagger
 * /visits/{id}:
 *   get:
 *     summary: Get visit details by ID
 *     tags: [Visits]
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
 *         description: Visit details
 */
router.get('/:id', visitsController.getVisitById.bind(visitsController));

export default router;
