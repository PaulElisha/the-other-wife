/** @format */

import { Request, Response, NextFunction } from "express";
import { UnauthorizedExceptionError } from "../errors/unauthorized-exception.error.js";
import { HttpStatus } from "../config/http.config.js";
import { ErrorCode } from "../enums/error-code.enum.js";

import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { jwtSecret } from "../constants/constants.js";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const accessToken = req.cookies?.token;

  if (!accessToken) {
    return res.status(HttpStatus.OK).json({ mesage: "Please login first" });
  }

  try {
    const decoded = jwt.verify(accessToken, jwtSecret);

    if (!decoded || typeof decoded === "string") {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: "Invalid token" });
    }

    req.user = await User.findById(decoded.id).select("-passwordHash");

    if (!req.user)
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: "User not found" });
    next();
  } catch (error) {
    throw error;
  }
};
