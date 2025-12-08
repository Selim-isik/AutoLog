import Joi from 'joi';

export const createCarSchema = Joi.object({
  plate: Joi.string().required().min(5).max(15),
  brand: Joi.string().required(),
  model: Joi.string().required(),
  year: Joi.number().integer().min(1900).max(2025).required(),

  ownerId: Joi.string().optional(),

  status: Joi.string().valid('in-service', 'ready', 'delivered').optional(),
});

export const updateCarSchema = Joi.object({
  plate: Joi.string().min(5).max(15),
  brand: Joi.string(),
  model: Joi.string(),
  year: Joi.number().integer().min(1900).max(2025),
  status: Joi.string().valid('in-service', 'ready', 'delivered'),
});
