/** @format */

import Joi from "joi";

import { Request, Response, NextFunction } from "express";
import { BadRequestException } from "../errors/bad-request-exception.error";
import { HttpStatus } from "../config/http.config";
import { ErrorCode } from "../enums/error-code.enum";

const createAddressSchema = Joi.object({
  addressLine1: Joi.string().required(),
  addressLine2: Joi.string().required(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  country: Joi.string().required(),
  latitude: Joi.number().required(),
  longitude: Joi.number().required(),
  deliveryInstructions: Joi.string().required(),
  isDefault: Joi.boolean().optional(),
});

const editAddressSchema = Joi.object({
  addressLine1: Joi.string().required(),
  addressLine2: Joi.string().required(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  country: Joi.string().required(),
  latitude: Joi.number().required(),
  longitude: Joi.number().required(),
  deliveryInstructions: Joi.string().required(),
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
