/** @format */

import { ErrorCodeType } from "../enums/error-code.enum.js";
import { AppError } from "./app.error.js";
import { HttpStatusCodeType } from "../config/http.config.js";

export class BadRequestException extends AppError {
  constructor(
    public message: string,
    public statusCode: HttpStatusCodeType,
    public errorCode: ErrorCodeType
  ) {
    super(message, statusCode, errorCode);
  }
}
