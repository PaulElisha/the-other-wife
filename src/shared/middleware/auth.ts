/** @format */

import type { Request, Response, NextFunction } from "express";
import type { UserDocument } from "@type/env-types";

import UnauthorizedExceptionError from "@error/unauthorized-exception.js";
import HttpStatus from "@config/http.config.js";
import ErrorCode from "@enum/error-code.js";
import Envconfig from "@/env.js";

import { verifyToken } from "@util/generate-token.js";

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const accessToken = req.cookies?.token;

  if (!accessToken) {
    throw new UnauthorizedExceptionError(
      "Unauthorized. Please log in.",
      HttpStatus.UNAUTHORIZED,
      ErrorCode.AUTH_UNAUTHORIZED_ACCESS,
    );
  }

  try {
    const decoded = verifyToken(accessToken, Envconfig.JWT_SECRET);

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

export default authMiddleware;
