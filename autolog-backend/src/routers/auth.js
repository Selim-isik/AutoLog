import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import {
  registerUserController,
  loginUserController,
  logoutUserController,
  refreshUserSessionController,
  requestResetTokenController,
  resetPasswordController,
} from '../controllers/auth.js';
import { registerUserSchema, loginUserSchema } from '../validation/auth.js';

const router = Router();

/**
 * @swagger
 * /auth/register:
 * post:
 * summary: Register a new user
 * tags: [Auth]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required: [name, email, password]
 * properties:
 * name: { type: string }
 * email: { type: string }
 * password: { type: string }
 * responses:
 * 201:
 * description: User successfully created
 */
router.post(
  '/register',
  validateBody(registerUserSchema),
  ctrlWrapper(registerUserController),
);

/**
 * @swagger
 * /auth/login:
 * post:
 * summary: User login
 * tags: [Auth]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required: [email, password]
 * properties:
 * email: { type: string }
 * password: { type: string }
 * responses:
 * 200:
 * description: Login successful
 */
router.post(
  '/login',
  validateBody(loginUserSchema),
  ctrlWrapper(loginUserController),
);

router.post('/logout', ctrlWrapper(logoutUserController));
router.post('/refresh', ctrlWrapper(refreshUserSessionController));

/**
 * @swagger
 * /auth/request-reset-token:
 * post:
 * summary: Request password reset email
 * tags: [Auth]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required: [email]
 * properties:
 * email: { type: string }
 * responses:
 * 200:
 * description: Reset link sent
 */
router.post('/request-reset-token', ctrlWrapper(requestResetTokenController));

/**
 * @swagger
 * /auth/reset-password:
 * post:
 * summary: Reset password with token
 * tags: [Auth]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required: [token, password]
 * properties:
 * token: { type: string }
 * password: { type: string }
 * responses:
 * 200:
 * description: Password updated
 */
router.post('/reset-password', ctrlWrapper(resetPasswordController));

export default router;
