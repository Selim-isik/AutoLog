import { Router } from 'express';
import {
  getCarsController,
  getCarByIdController,
  createCarController,
  deleteCarController,
  upsertCarController,
  updateCarController,
  addServiceController,
  deleteServiceController,
} from '../controllers/cars.js';
import { validateBody } from '../middlewares/validateBody.js';
import { createCarSchema } from '../validation/cars.js';
import { authenticate } from '../middlewares/authenticate.js';
import { ROLES } from '../constants/index.js';
import { isValidId } from '../middlewares/isValidId.js';
import { checkRoles } from '../middlewares/checkRoles.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  checkRoles(ROLES.MECHANIC, ROLES.CUSTOMER),
  ctrlWrapper(getCarsController),
);

router.get(
  '/:carId',
  checkRoles(ROLES.MECHANIC, ROLES.CUSTOMER),
  isValidId,
  ctrlWrapper(getCarByIdController),
);

router.post(
  '/',
  checkRoles(ROLES.MECHANIC),
  upload.single('image'),
  ctrlWrapper(createCarController),
);

router.post(
  '/:carId/history',
  checkRoles(ROLES.MECHANIC),
  isValidId,
  ctrlWrapper(addServiceController),
);

router.put(
  '/:carId',
  checkRoles(ROLES.MECHANIC),
  isValidId,
  validateBody(createCarSchema),
  ctrlWrapper(upsertCarController),
);

router.patch(
  '/:carId',
  checkRoles(ROLES.MECHANIC),
  isValidId,
  upload.single('image'),
  ctrlWrapper(updateCarController),
);

router.delete(
  '/:carId',
  checkRoles(ROLES.MECHANIC),
  isValidId,
  ctrlWrapper(deleteCarController),
);

router.delete(
  '/:carId/history/:historyId',
  checkRoles(ROLES.MECHANIC),
  isValidId,
  ctrlWrapper(deleteServiceController),
);

export default router;
