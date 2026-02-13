/** @format */

import { Request, Response, NextFunction } from "express";
import { UnauthorizedExceptionError } from "../errors/unauthorized-exception.error.js";
import { HttpStatus } from "../config/http.config.js";
import { ErrorCode } from "../enums/error-code.enum.js";

import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { jwtSecret } from "../constants/constants.js";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const accessToken = req.cookies?.token;

  accessToken ??
    (() => {
      throw new UnauthorizedExceptionError(
        "Unauthorized. Please log in.",
        HttpStatus.UNAUTHORIZED,
        ErrorCode.AUTH_UNAUTHORIZED_ACCESS,
      );
    })();

  try {
    const decoded = jwt.verify(accessToken, jwtSecret);

    if (!decoded || typeof decoded === "string") {
      throw new UnauthorizedExceptionError(
        "Unauthorized. Please log in.",
        HttpStatus.UNAUTHORIZED,
        ErrorCode.AUTH_UNAUTHORIZED_ACCESS,
      );
    }

    req.user = await User.findById(decoded.id).select("-passwordHash");

    if (!req.user)
      throw new UnauthorizedExceptionError(
        "Unauthorized. Please log in.",
        HttpStatus.UNAUTHORIZED,
        ErrorCode.AUTH_UNAUTHORIZED_ACCESS,
      );
    next();
  } catch (error) {
    throw error;
  }
};
