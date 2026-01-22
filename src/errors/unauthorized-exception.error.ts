/** @format */

import { ErrorCodeType } from "../enums/error-code.enum.js";
import { HttpStatusCodeType } from "../config/http.config.js";
import { AppError } from "./app.error.js";

export class UnauthorizedExceptionError extends AppError {
  constructor(
    public message: string,
    public statusCode: HttpStatusCodeType,
    public errorCode: ErrorCodeType
  ) {
    super(message, statusCode, errorCode);
  }
}
