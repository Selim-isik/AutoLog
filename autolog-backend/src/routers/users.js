import { Router } from 'express';
import {
  getCustomersController,
  getCustomerByIdController,
  updateCustomerStatusController,
  deleteCustomerController,
  updateUserController,
} from '../controllers/users.js';
import upload from '../middlewares/uploadMiddleware.js';
import { authenticate } from '../middlewares/authenticate.js';
import { checkRoles } from '../middlewares/checkRoles.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { ROLES } from '../constants/index.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: User and customer management (Authentication required)
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all customers (Mechanic role only)
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer list
 *       403:
 *         description: Forbidden
 */
router.get(
  '/',
  checkRoles(ROLES.MECHANIC),
  ctrlWrapper(getCustomersController),
);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get customer details by ID
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *       404:
 *         description: User not found
 */
router.get(
  '/:id',
  checkRoles(ROLES.MECHANIC),
  ctrlWrapper(getCustomerByIdController),
);

/**
 * @swagger
 * /users/{id}/status:
 *   patch:
 *     summary: Update customer status
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: active
 *     responses:
 *       200:
 *         description: Status updated successfully
 */
router.patch(
  '/:id/status',
  checkRoles(ROLES.MECHANIC),
  ctrlWrapper(updateCustomerStatusController),
);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update user information
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 */
router.put('/:id', upload.single('avatar'), ctrlWrapper(updateUserController));
/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a customer (Mechanic role only)
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: User deleted successfully
 */
router.delete(
  '/:id',
  checkRoles(ROLES.MECHANIC),
  ctrlWrapper(deleteCustomerController),
);

export default router;
