import { CarsCollection } from '../db/models/car.js';

import { calculatePaginationData } from '../utils/calculatePaginationData.js';

import { SORT_ORDER } from '../constants/index.js';

export const getAllCars = async ({
  page = 1,

  perPage = 10,

  sortOrder = SORT_ORDER.ASC,

  sortBy = '_id',

  filter = {},
}) => {
  const limit = perPage;

  const skip = (page - 1) * perPage;

  const activeFilter = {};

  Object.keys(filter).forEach((key) => {
    if (
      filter[key] !== undefined &&
      filter[key] !== null &&
      filter[key] !== ''
    ) {
      activeFilter[key] = filter[key];
    }
  });

  console.log('Backend Filtresi:', activeFilter);

  const carsCount = await CarsCollection.countDocuments(activeFilter);

  const cars = await CarsCollection.find(activeFilter)

    .skip(skip)

    .limit(limit)

    .sort({ [sortBy]: sortOrder })

    .exec();

  const paginationData = calculatePaginationData(carsCount, perPage, page);

  return {
    data: cars,

    ...paginationData,
  };
};

export const getCarById = async (carId) => {
  const car = await CarsCollection.findById(carId);

  return car;
};

export const createCar = async (payload) => {
  const car = await CarsCollection.create(payload);

  return car;
};

export const deleteCar = async (carId) => {
  const car = await CarsCollection.findOneAndDelete({ _id: carId });

  return car;
};

export const updateCar = async (carId, payload, options = {}) => {
  const rawResult = await CarsCollection.findOneAndUpdate(
    { _id: carId },

    payload,

    {
      new: true,

      includeResultMetadata: true,

      ...options,
    },
  );

  if (!rawResult || !rawResult.value) return null;

  return {
    car: rawResult.value,

    isNew: Boolean(rawResult?.lastErrorObject?.upserted),
  };
};

export const addServiceHistory = async (carId, serviceData) => {
  const car = await CarsCollection.findOneAndUpdate(
    { _id: carId },
    {
      $push: { history: serviceData }, // $push:
    },
    {
      new: true,
    },
  );

  return car;
};

export const deleteServiceHistory = async (carId, historyId) => {
  const car = await CarsCollection.findOneAndUpdate(
    { _id: carId },
    {
      $pull: {
        history: { _id: historyId },
      },
    },
    { new: true },
  );
  return car;
};
