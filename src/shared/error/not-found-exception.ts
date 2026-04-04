/** @format */

import type { HttpStatusCodeType, ErrorCodeType } from "@type/env-types.js";

import AppError from "./app-error.js";

export default class NotFoundException extends AppError {
  constructor(
    public message: string,
    public statusCode: HttpStatusCodeType,
    public errorCode: ErrorCodeType,
  ) {
    super(message, statusCode, errorCode);
  }
}
