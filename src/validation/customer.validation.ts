/** @format */

import Joi from "joi";

import { Request, Response, NextFunction } from "express";
import { BadRequestException } from "../errors/bad-request-exception.error.js";
import { HttpStatus } from "../config/http.config.js";
import { ErrorCode } from "../enums/error-code.enum.js";

const editCustomerProfileSchema = Joi.object({
  profileImageUrl: Joi.string().required(),
});

export const validateEditCustomerProfile = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { error } = editCustomerProfileSchema.validate(req.body);
    if (error) {
      throw new BadRequestException(
        error.details[0].message,
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR
      );
    }
    next();
  } catch (error) {
    next(error);
  }
};
