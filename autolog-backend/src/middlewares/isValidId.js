import { isValidObjectId } from 'mongoose';
import createHttpError from 'http-errors';

export const isValidId = (req, res, next) => {
  const { carId } = req.params;

  if (!isValidObjectId(carId)) {
    throw createHttpError(404, 'Not found');
  }

  next();
};
