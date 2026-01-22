/** @format */

import { ErrorCodeType } from "../enums/error-code.enum";
import { AppError } from "./app.error";
import { HttpStatusCodeType } from "../config/http.config";

export class InternalServerError extends AppError {
  constructor(
    public message: string,
    public statusCode: HttpStatusCodeType,
    public errorCode: ErrorCodeType
  ) {
    super(message, statusCode, errorCode);
  }
}
