import createHttpError from 'http-errors';
import { Car } from '../db/models/car.js';
import { ROLES } from '../constants/index.js';

export const checkRoles =
  (...roles) =>
  async (req, res, next) => {
    const { user } = req;

    if (!user) {
      next(createHttpError(401));
      return;
    }

    const { role } = user;

    if (roles.includes(ROLES.MECHANIC) && role === ROLES.MECHANIC) {
      next();
      return;
    }

    if (roles.includes(ROLES.CUSTOMER) && role === ROLES.CUSTOMER) {
      const { carId } = req.params;

      if (!carId) {
        next();
        return;
      }

      const car = await Car.findOne({
        _id: carId,
        ownerId: user._id,
      });

      if (car) {
        next();
        return;
      }
    }

    next(createHttpError(403));
  };
