/** @format */

import Joi from "joi";
import { NextFunction, Request, Response } from "express";
import { BadRequestException } from "../errors/bad-request-exception.error.js";
import { HttpStatus } from "../config/http.config.js";
import { ErrorCode } from "../enums/error-code.enum.js";

const registerUserSchema = Joi.object({
  firstName: Joi.string().trim().required(),
  lastName: Joi.string().trim().required(),
  email: Joi.string().trim().email().max(255).required(),
  passwordHash: Joi.string().trim().min(8).required(),
  userType: Joi.string()
    .valid("customer", "vendor", "admin")
    .default("customer"),
  phoneNumber: Joi.string().trim().required(),
  profileImageUrl: Joi.string().trim().optional(),
  createdAt: Joi.date().default(null),
});

const loginUserSchema = Joi.object({
  phoneNumber: Joi.string().trim().required(),
  passwordHash: Joi.string().trim().min(8).required(),
});

export const validateSignupUser = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { error } = registerUserSchema.validate(req.body);
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

export const validateLoginUser = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { error } = loginUserSchema.validate(req.body);
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
