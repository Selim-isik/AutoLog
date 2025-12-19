import { Car } from '../db/models/car.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';
import { SORT_ORDER } from '../constants/index.js';

export const getAllCars = async ({
  page = 1,
  perPage = 10,
  sortBy = 'createdAt',
  sortOrder = SORT_ORDER.DESC,
  filter = {},
}) => {
  const limit = parseInt(perPage);
  const skip = (parseInt(page) - 1) * limit;

  const activeFilter = Object.fromEntries(
    Object.entries(filter).filter(
      ([, value]) => value !== undefined && value !== null && value !== '',
    ),
  );

  const carsCount = await Car.countDocuments(activeFilter);

  const cars = await Car.find(activeFilter)
    .sort({ [sortBy]: sortOrder === SORT_ORDER.ASC ? 1 : -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const paginationData = calculatePaginationData(
    carsCount,
    limit,
    parseInt(page),
  );

  return {
    data: cars,
    ...paginationData,
  };
};

export const getCarById = async (carId) => {
  return await Car.findById(carId).lean();
};

export const createCar = async (payload) => {
  return await Car.create(payload);
};

export const deleteCar = async (carId) => {
  return await Car.findByIdAndDelete(carId);
};

export const updateCar = async (carId, payload, options = {}) => {
  const result = await Car.findOneAndUpdate({ _id: carId }, payload, {
    new: true,
    upsert: options.upsert || false,
  });

  if (!result) return null;

  return {
    car: result,
    isNew: false,
  };
};

export const addServiceHistory = async (carId, serviceData) => {
  return await Car.findByIdAndUpdate(
    carId,
    { $push: { history: serviceData } },
    { new: true },
  );
};

export const deleteServiceHistory = async (carId, historyId) => {
  return await Car.findByIdAndUpdate(
    carId,
    { $pull: { history: { _id: historyId } } },
    { new: true },
  );
};
