/** @format */

import type { ClientSession } from "mongoose";

import Customer from "@model/customer.js";
import Vendor from "@model/vendor.js";

import BadRequestException from "@error/bad-request-exception.js";
import HttpStatus from "@config/http.config.js";
import ErrorCode from "@enum/error-code.js";

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

export type CreateProfileKey = Array<keyof typeof CreateProfile>;

export type UserTypeKey = keyof typeof CreateProfile;
