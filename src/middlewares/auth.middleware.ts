/** @format */

import { Request, Response, NextFunction } from "express";
import { UnauthorizedExceptionError } from "../errors/unauthorized-exception.error.ts";
import { HttpStatus } from "../config/http.config.ts";
import { ErrorCode } from "../enums/error-code.enum.ts";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // if(req.user.user_type)
  if (!req.user || !req.user._id) {
    throw new UnauthorizedExceptionError(
      "Unauthorized. Please log in.",
      HttpStatus.UNAUTHORIZED,
      ErrorCode.AUTH_UNAUTHORIZED_ACCESS,
    );
  }

  next();
};
