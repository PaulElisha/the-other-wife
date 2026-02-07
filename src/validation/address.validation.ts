/** @format */

import Joi from "joi";

import { Request, Response, NextFunction } from "express";
import { BadRequestException } from "../errors/bad-request-exception.error.js";
import { HttpStatus } from "../config/http.config.js";
import { ErrorCode } from "../enums/error-code.enum.js";

const createAddressSchema = Joi.object({
  address: Joi.string().required(),
  label: Joi.string().valid("home", "work", "other").optional(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  country: Joi.string().required(),
  postalCode: Joi.string().required(),
  latitude: Joi.number().required(),
  longitude: Joi.number().required(),
  isDefault: Joi.boolean().optional(),
});

const editAddressSchema = Joi.object({
  address: Joi.string().optional(),
  label: Joi.string().valid("home", "work", "other").optional(),
  city: Joi.string().optional(),
  state: Joi.string().optional(),
  country: Joi.string().optional(),
  postalCode: Joi.string().optional(),
  latitude: Joi.number().optional(),
  longitude: Joi.number().optional(),
  isDefault: Joi.boolean().optional(),
});

export const validateCreateAddress = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { error } = createAddressSchema.validate(req.body);
    if (error) {
      throw new BadRequestException(
        error.details[0].message,
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR,
      );
    }
    next();
  } catch (error) {
    next(error);
  }
};

export const validateEditAddress = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { error } = editAddressSchema.validate(req.body);
    if (error) {
      throw new BadRequestException(
        error.details[0].message,
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR,
      );
    }
    next();
  } catch (error) {
    next(error);
  }
};
