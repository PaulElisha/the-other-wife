/** @format */

import { HttpStatusCodeType } from "../config/http.config.js";
import { ErrorCodeType } from "../enums/error-code.enum.js";

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: HttpStatusCodeType,
    public errorCode: ErrorCodeType
  ) {
    super(message);
    this.message = message;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    Error.captureStackTrace(this, this.constructor);
  }
}
