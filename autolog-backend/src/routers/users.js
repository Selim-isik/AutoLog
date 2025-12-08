import { Router } from 'express';
import {
  getCustomersController,
  getCustomerByIdController,
  updateCustomerStatusController,
  deleteCustomerController,
  updateUserController,
} from '../controllers/users.js';

import { authenticate } from '../middlewares/authenticate.js';
import { checkRoles } from '../middlewares/checkRoles.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { ROLES } from '../constants/index.js';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  checkRoles(ROLES.MECHANIC),
  ctrlWrapper(getCustomersController),
);

router.get(
  '/:id',
  checkRoles(ROLES.MECHANIC),
  ctrlWrapper(getCustomerByIdController),
);

router.patch(
  '/:id/status',
  checkRoles(ROLES.MECHANIC),
  ctrlWrapper(updateCustomerStatusController),
);

router.put('/:id', ctrlWrapper(updateUserController));

router.delete(
  '/:id',
  checkRoles(ROLES.MECHANIC),
  ctrlWrapper(deleteCustomerController),
);

export default router;
