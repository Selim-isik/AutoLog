import { Router } from 'express';
import carsRouter from './cars.js';
import authRouter from './auth.js';
import usersRouter from './users.js';

const router = Router();

router.use('/cars', carsRouter);
router.use('/auth', authRouter);
router.use('/users', usersRouter);

export default router;
