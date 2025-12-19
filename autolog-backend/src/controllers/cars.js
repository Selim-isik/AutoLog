import createHttpError from 'http-errors';
import fs from 'node:fs/promises';
import path from 'node:path';
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
import { sendMail } from '../utils/sendMail.js';
import { UsersCollection as User } from '../db/models/user.js';

export const getCarsController = async (req, res, next) => {
  try {
    const { page, perPage } = parsePaginationParams(req.query);
    const { sortBy, sortOrder } = parseSortParams(req.query);
    const filter = parseFilterParams(req.query);

    const user = req.user;
    if (!user) return next(createHttpError(401, 'User not found'));

    let queryFilter = { ...filter };

    Object.keys(queryFilter).forEach((key) => {
      if (
        queryFilter[key] === undefined ||
        queryFilter[key] === '' ||
        queryFilter[key] === null
      ) {
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
      perPage,
      sortBy,
      sortOrder,
      filter: queryFilter,
    });

    res.json({
      status: 200,
      message: 'Successfully found cars!',
      data: carsData,
    });
  } catch (error) {
    next(error);
  }
};

export const getCarByIdController = async (req, res, next) => {
  try {
    const { carId } = req.params;
    const car = await getCarById(carId);
    if (!car) return next(createHttpError(404, 'Car not found'));
    res.json({ status: 200, message: `Successfully found car!`, data: car });
  } catch (error) {
    next(error);
  }
};

export const createCarController = async (req, res, next) => {
  try {
    const finalOwnerId = req.body.ownerId ? req.body.ownerId : req.user._id;
    const payload = { ...req.body, ownerId: finalOwnerId };

    if (req.file) {
      payload.image = req.file.path;
    }

    const car = await createCar(payload);
    res
      .status(201)
      .json({ status: 201, message: 'Successfully created!', data: car });
  } catch (error) {
    next(error);
  }
};

export const deleteCarController = async (req, res, next) => {
  try {
    const { carId } = req.params;
    const car = await deleteCar(carId);
    if (!car) return next(createHttpError(404));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const updateCarController = async (req, res, next) => {
  try {
    const { carId } = req.params;
    const payload = { ...req.body };

    if (req.file) payload.image = req.file.path;
    else if (req.body.deleteImage === 'true') payload.image = null;

    const result = await updateCar(carId, payload);
    if (!result) return next(createHttpError(404));

    if (payload.status === 'ready' && result.car.ownerId) {
      try {
        const owner = await User.findById(result.car.ownerId);
        if (owner && owner.email) {
          const templatePath = path.resolve(
            'src',
            'templates',
            'vehicle-ready.html',
          );
          let htmlContent = await fs.readFile(templatePath, 'utf-8');

          const historyRows = result.car.history
            .filter((item) => item.description || item.action)
            .map(
              (item) => `
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd;">${
                    item.description || item.action
                  }</td>
                  <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">$${
                    item.cost || item.price || 0
                  }</td>
                </tr>
              `,
            )
            .join('');

          const totalCost = result.car.history.reduce(
            (acc, item) => acc + (item.cost || item.price || 0),
            0,
          );

          htmlContent = htmlContent
            .replace('{{name}}', owner.name || 'Customer')
            .replace('{{brand}}', result.car.brand)
            .replace('{{model}}', result.car.model)
            .replace('{{plate}}', result.car.plate)
            .replace('{{historyRows}}', historyRows)
            .replace('{{totalAmount}}', totalCost.toLocaleString());

          await sendMail({
            to: owner.email,
            subject: `🚗 Vehicle Service Complete - ${result.car.plate}`,
            html: htmlContent,
          });
        }
      } catch (mailErr) {
        console.error('Final Report Mail Error:', mailErr);
      }
    }

    res.json({ status: 200, message: 'Updated!', data: result.car });
  } catch (error) {
    next(error);
  }
};

export const upsertCarController = async (req, res, next) => {
  try {
    const { carId } = req.params;
    const result = await updateCar(carId, req.body, { upsert: true });
    if (!result) return next(createHttpError(404));
    const status = result.isNew ? 201 : 200;
    res.status(status).json({ status, message: 'Upserted!', data: result.car });
  } catch (error) {
    next(error);
  }
};

export const addServiceController = async (req, res, next) => {
  try {
    const { carId } = req.params;
    const updatedCar = await addServiceHistory(carId, req.body);
    if (!updatedCar) return next(createHttpError(404, 'Car not found'));
    res
      .status(201)
      .json({ status: 201, message: 'Service added!', data: updatedCar });
  } catch (error) {
    next(error);
  }
};

export const deleteServiceController = async (req, res, next) => {
  try {
    const { carId, historyId } = req.params;
    const updatedCar = await deleteServiceHistory(carId, historyId);
    if (!updatedCar)
      return next(createHttpError(404, 'Car or history record not found'));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
