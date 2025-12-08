import createHttpError from 'http-errors';
import {
  getAllCars,
  getCarById,
  createCar,
  deleteCar,
  updateCar,
  addServiceHistory,
  deleteServiceHistory,
} from '../services/cars.js';

import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';
import { parseFilterParams } from '../utils/parseFilterParams.js';

export const getCarsController = async (req, res) => {
  const { page, perPage } = parsePaginationParams(req.query);
  const { sortBy, sortOrder } = parseSortParams(req.query);
  const filter = parseFilterParams(req.query);

  const user = req.user;
  let queryFilter = { ...filter };

  Object.keys(queryFilter).forEach((key) => {
    if (queryFilter[key] === undefined) {
      delete queryFilter[key];
    }
  });

  delete queryFilter.ownerId;
  delete queryFilter.userId;
  delete queryFilter.owner;

  if (user.role === 'customer') {
    queryFilter.ownerId = user._id;
  }

  const carsData = await getAllCars({
    page,
    perPage: 100,
    sortBy,
    sortOrder,
    filter: queryFilter,
  });

  res.json({
    status: 200,
    message: 'Successfully found cars!',
    data: carsData,
  });
};

export const getCarByIdController = async (req, res) => {
  const { carId } = req.params;
  const car = await getCarById(carId);
  if (!car) throw createHttpError(404, 'Car not found');
  res.json({ status: 200, message: `Successfully found car!`, data: car });
};

export const createCarController = async (req, res) => {
  const finalOwnerId = req.body.ownerId ? req.body.ownerId : req.user._id;
  const payload = { ...req.body, ownerId: finalOwnerId };

  const car = await createCar(payload);
  res
    .status(201)
    .json({ status: 201, message: 'Successfully created!', data: car });
};

export const deleteCarController = async (req, res, next) => {
  const { carId } = req.params;
  const car = await deleteCar(carId);
  if (!car) {
    next(createHttpError(404));
    return;
  }
  res.status(204).send();
};

export const updateCarController = async (req, res, next) => {
  const { carId } = req.params;
  const result = await updateCar(carId, req.body);
  if (!result) {
    next(createHttpError(404));
    return;
  }
  res.json({ status: 200, message: 'Updated!', data: result.car });
};

export const upsertCarController = async (req, res, next) => {
  const { carId } = req.params;
  const result = await updateCar(carId, req.body, { upsert: true });
  if (!result) {
    next(createHttpError(404));
    return;
  }
  const status = result.isNew ? 201 : 200;
  res.status(status).json({ status, message: 'Upserted!', data: result.car });
};

export const addServiceController = async (req, res, next) => {
  const { carId } = req.params;
  const updatedCar = await addServiceHistory(carId, req.body);
  if (!updatedCar) {
    next(createHttpError(404, 'Car not found'));
    return;
  }
  res
    .status(201)
    .json({ status: 201, message: 'Service added!', data: updatedCar });
};

export const deleteServiceController = async (req, res, next) => {
  const { carId, historyId } = req.params;

  const updatedCar = await deleteServiceHistory(carId, historyId);

  if (!updatedCar) {
    next(createHttpError(404, 'Car or history record not found'));
    return;
  }

  res.status(204).send();
};
