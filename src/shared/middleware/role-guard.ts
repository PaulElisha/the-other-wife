/** @format */

import HttpStatus from "@/src/shared/enum/http.js";
import ErrorCode from "@enum/error-code.js";
import UnauthorizedExceptionError from "@error/unauthorized-exception.js";
import type { NextFunction, Request, Response } from "express";

const roleGuard = (roles: string[]) => {
 return async (req: Request, res: Response, next: NextFunction) => {
  try {
   console.log("User Type: ", req.user.userType);
   if (!roles.includes(req.user.userType)) {
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

export default roleGuard;
