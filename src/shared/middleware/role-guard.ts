/** @format */

import type { NextFunction, Request, Response } from "express";
import UnauthorizedExceptionError from "@error/unauthorized-exception.js";
import HttpStatus from "@config/http.config.js";
import ErrorCode from "@enum/error-code.js";

const roleGuardMiddleware = (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("User Type: ", req?.user?.userType);
      if (!roles.includes(req?.user?.userType as string)) {
        throw new UnauthorizedExceptionError(
          `Forbidden. ${req?.user?.userType} is not allowed to access this resource`,
          HttpStatus.FORBIDDEN,
          ErrorCode.ACCESS_UNAUTHORIZED,
        );
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default roleGuardMiddleware;
