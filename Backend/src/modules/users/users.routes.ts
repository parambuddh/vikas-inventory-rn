import { Router } from 'express';
import { UsersController } from './users.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorizeRole } from '../../middleware/role.middleware';
import { upload } from '../../utils/upload';

const router = Router();
const usersController = new UsersController();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management API
 */

router.use(authenticate);

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get logged-in user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile data
 */
router.get('/profile', usersController.getProfile.bind(usersController));

/**
 * @swagger
 * /users/profile:
 *   patch:
 *     summary: Update logged-in user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               address:
 *                 type: string
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.patch('/profile', upload.single('photo'), usersController.updateProfile.bind(usersController));

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create new user (ADMIN only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [first_name, last_name, phone, password]
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               address:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [ADMIN, SALESMAN]
 *     responses:
 *       201:
 *         description: User created
 */
router.post('/', authorizeRole(['ADMIN']), usersController.createUser.bind(usersController));

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (ADMIN only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/', authorizeRole(['ADMIN']), usersController.getUsers.bind(usersController));

/**
 * @swagger
 * /users/reset-password:
 *   post:
 *     summary: Reset user password (ADMIN only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, new_password]
 *             properties:
 *               userId:
 *                 type: integer
 *               new_password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 */
router.post('/reset-password', authorizeRole(['ADMIN']), usersController.resetPassword.bind(usersController));

/**
 * @swagger
 * /users/{id}/status:
 *   patch:
 *     summary: Toggle user active status (ADMIN only)
 *     tags: [Users]
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
router.patch('/:id/status', authorizeRole(['ADMIN']), usersController.toggleStatus.bind(usersController));

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID (ADMIN or self)
 *     tags: [Users]
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
 *         description: User data
 */
router.get('/:id', usersController.getUserById.bind(usersController));

export default router;
