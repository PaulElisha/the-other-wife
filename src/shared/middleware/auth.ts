/** @format */

import Env from "@/src/config/env.config";
import HttpStatus from "@/src/shared/enum/http.js";
import ErrorCode from "@enum/error-code.js";
import UnauthorizedExceptionError from "@error/unauthorized-exception.js";
import { JwtRefreshSecretKey, verifyToken } from "@util/jwt.js";
import type { NextFunction, Request, Response } from "express";

const authenticate = async (
 req: Request,
 _res: Response,
 next: NextFunction,
) => {
 const token = req.cookies?.token;

 if (!token) {
  throw new UnauthorizedExceptionError(
   "Unauthorized. Please log in.",
   HttpStatus.UNAUTHORIZED,
   ErrorCode.AUTH_UNAUTHORIZED_ACCESS,
  );
 }

 try {
  const payload = await verifyToken(token, JwtRefreshSecretKey);
  req.user = payload;
  next();
 } catch (error) {
  next(error);
 }
};

export default authenticate;
