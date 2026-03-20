/** @format */

import { ErrorCodeType } from "../enums/error-code.enum.ts";
import { HttpStatusCodeType } from "../config/http.config.ts";
import { AppError } from "../errors/app.error.ts";

export class UnauthorizedExceptionError extends AppError {
  constructor(
    public message: string,
    public statusCode: HttpStatusCodeType,
    public errorCode: ErrorCodeType,
  ) {
    super(message, statusCode, errorCode);
  }
}
