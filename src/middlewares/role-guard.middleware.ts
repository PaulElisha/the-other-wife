/** @format */

import { NextFunction, Request, Response } from "express";
import { UnauthorizedExceptionError } from "../errors/unauthorized-exception.error.js";
import { HttpStatus } from "../config/http.config.js";
import { ErrorCode } from "../enums/error-code.enum.js";

export const roleGuardMiddleware = (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!roles.includes(req.user?.userType as string)) {
        throw new UnauthorizedExceptionError(
          "Unauthorized. You do not have permission to access this resource.",
          HttpStatus.UNAUTHORIZED,
          ErrorCode.AUTH_UNAUTHORIZED_ACCESS,
        );
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
