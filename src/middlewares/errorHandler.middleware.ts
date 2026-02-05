/** @format */

import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app.error.js";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof SyntaxError) {
    return res.status(400).json({
      message: "Syntax Error",
      error: err.message || "Unknown error occurred",
      status: "error",
    });
  }

  if (err instanceof TypeError) {
    return res.status(400).json({
      message: "Type Error",
      error: err.message || "Unknown error occurred",
      status: "error",
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
      error: err.errorCode,
      status: "error",
    });
  }

  if (err instanceof Error) {
    return res.status(500).json({
      message: "Internal Server error",
      error: err.message || "Unknown error occurred",
      status: "error",
    });
  }

  return res.status(500).json({
    message: "Unknown error",
    error: "Unknown error occurred",
    status: "error",
  });
};
