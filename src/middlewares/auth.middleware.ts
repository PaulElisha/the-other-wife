/** @format */

import type { Request, Response, NextFunction } from "express";
import { UnauthorizedExceptionError } from "../errors/unauthorized-exception.error.js";
import { HttpStatus } from "../config/http.config.js";
import { ErrorCode } from "../enums/error-code.enum.js";

import { jwtSecret } from "../constants/constants.js";

import { verifyToken } from "../util/generate-token.util.js";
import { UserDocument } from "../models/user.model.js";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const accessToken = req.cookies?.token;

  if (!accessToken) {
    throw new UnauthorizedExceptionError(
      "Unauthorized. Please log in.",
      HttpStatus.UNAUTHORIZED,
      ErrorCode.AUTH_UNAUTHORIZED_ACCESS,
    );
  }

  try {
    const decoded = verifyToken(accessToken, jwtSecret);

    if (!decoded || typeof decoded === "string") {
      throw new UnauthorizedExceptionError(
        `Unauthorized
        Reason: ${decoded}`,
        HttpStatus.UNAUTHORIZED,
        ErrorCode.AUTH_UNAUTHORIZED_ACCESS,
      );
    }

    req.user = decoded as unknown as UserDocument;

    if (!req.user)
      throw new UnauthorizedExceptionError(
        `Unauthorized
        Reason: User not found ${req.user}`,
        HttpStatus.UNAUTHORIZED,
        ErrorCode.AUTH_UNAUTHORIZED_ACCESS,
      );
    next();
  } catch (error) {
    throw error;
  }
};
