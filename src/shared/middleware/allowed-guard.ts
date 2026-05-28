/** @format */

import HttpConfig from "@/src/shared/enum/http.js";
import ErrorCode from "@enum/error-code.js";
import { UserType } from "@module/auth/auth.service.js";
import { UserRole } from "@shared/type/types.js";
import type { NextFunction, Request, Response } from "express";
import z from "zod";

import UnauthorizedExceptionError from "../error/unauthorized-exception";

const allowGuard =
 (schema: z.ZodType<any>) =>
 (req: Request, res: Response, next: NextFunction) => {
  const allowedUsers: readonly [string, string] = <[string, string]>(
   Object.keys(UserType).slice(0, Object.keys(UserType).length - 1)
  );
  try {
   const userType: UserRole = <UserRole>schema.parse(req.body.userType);
   if (!allowedUsers.includes(userType)) {
    throw new UnauthorizedExceptionError(
     `${userType} is not allowed`,
     HttpConfig.UNAUTHORIZED,
     ErrorCode.AUTH_UNAUTHORIZED_ACCESS,
    );
   }
   next();
  } catch (error) {
   next(error);
  }
 };

export default allowGuard;
