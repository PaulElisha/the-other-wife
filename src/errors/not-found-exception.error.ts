/** @format */

import { ErrorCodeType } from "../enums/error-code.enum";
import { HttpStatusCodeType } from "../config/http.config";
import { AppError } from "./app.error";

export class NotFoundException extends AppError {
  constructor(
    public message: string,
    public statusCode: HttpStatusCodeType,
    public errorCode: ErrorCodeType
  ) {
    super(message, statusCode, errorCode);
  }
}
