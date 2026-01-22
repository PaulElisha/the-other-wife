/** @format */

import Joi from "joi";

import { Request, Response, NextFunction } from "express";
import { BadRequestException } from "../errors/bad-request-exception.error";
import { HttpStatus } from "../config/http.config";
import { ErrorCode } from "../enums/error-code.enum";

const editUserSchema = Joi.object({
  firstName: Joi.string().trim().required(),
  lastName: Joi.string().trim().required(),
  email: Joi.string().trim().email().max(255).required(),
  phoneNumber: Joi.string().trim().required(),
});

export const validateEditUser = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { error } = editUserSchema.validate(req.body);
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
