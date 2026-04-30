/** @format */

import type { Request, Response, NextFunction } from "express";

import UnauthorizedExceptionError from "@error/unauthorized-exception.js";
import HttpStatus from "@config/http.config.js";
import ErrorCode from "@enum/error-code.js";

import { verifyToken } from "@util/jwt.js";

const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.token;

  if (!token) {
    throw new UnauthorizedExceptionError(
      "Unauthorized. Please log in.",
      HttpStatus.UNAUTHORIZED,
      ErrorCode.AUTH_UNAUTHORIZED_ACCESS,
    );
  }

  try {
    const payload = await verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    next(error);
  }
};

export default authenticate;
