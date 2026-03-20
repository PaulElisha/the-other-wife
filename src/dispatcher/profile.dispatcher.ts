/** @format */

import type { ClientSession } from "mongoose";

import Customer from "../models/customer.model.ts";
import Vendor from "../models/vendor.model.ts";

import { BadRequestException } from "../errors/bad-request-exception.error.ts";
import { HttpStatus } from "../config/http.config.ts";
import { ErrorCode } from "../enums/error-code.enum.ts";

export const CreateProfile = {
  customer: (userId: string, session: ClientSession) => Customer.create([{ userId }], { session }),
  vendor: (userId: string, session: ClientSession) => Vendor.create([{ userId }], { session }),
  admin: () => {
    throw new BadRequestException(
      "Admin user cannot be created via public signup.",
      HttpStatus.BAD_REQUEST,
      ErrorCode.ACCESS_UNAUTHORIZED,
    );
  },
};
