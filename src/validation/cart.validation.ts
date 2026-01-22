/** @format */

import Joi from "joi";
import { NextFunction, Request, Response } from "express";
import { BadRequestException } from "../errors/bad-request-exception.error";
import { HttpStatus } from "../config/http.config";
import { ErrorCode } from "../enums/error-code.enum";

const addToCartSchema = Joi.object({
  newQuantity: Joi.number().optional(),
});

const updateCartSchema = Joi.object({
  action: Joi.string().valid("increment", "decrement").required(),
});

export const validateAddToCart = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { error } = addToCartSchema.validate(req.body);

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

export const validateUpdateCart = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { error } = updateCartSchema.validate(req.body);

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
