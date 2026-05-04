/** @format */

import type { NextFunction, Request, Response } from "express";
import z from "zod";
import { CreateProfile, UserTypeKey } from "@module/user/user-profile.js";
import ErrorCode from "@enum/error-code.js";
import HttpConfig from "@config/http.config.js";
import UnauthorizedExceptionError from "../error/unauthorized-exception";

const allowGuard =
  (schema: z.ZodType<any>) => (req: Request, res: Response, next: NextFunction) => {
    const allowedUsers = Object.keys(CreateProfile).slice(0, Object.keys(CreateProfile).length - 1);
    try {
      const userType: UserTypeKey = <UserTypeKey>schema.parse(req.body.userType);
      if (userType == "admin" || !allowedUsers.includes(userType)) {
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
