/** @format */

import { Request, Response, NextFunction } from "express";
import { UnauthorizedExceptionError } from "../errors/unauthorized-exception.error";
import { HttpStatus } from "../config/http.config";
import { ErrorCode } from "../enums/error-code.enum";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user || !req.user._id) {
    throw new UnauthorizedExceptionError(
      "Unauthorized. Please log in.",
      HttpStatus.UNAUTHORIZED,
      ErrorCode.AUTH_UNAUTHORIZED_ACCESS,
    );
  }

  next();
};
