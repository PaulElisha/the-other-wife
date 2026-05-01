/** @format */

import db from "@config/db.config.js";

import { customers } from "@module/customer/customer.schema.js";
import { vendors } from "../vendor/vendor.schema";

import BadRequestException from "@error/bad-request-exception.js";
import HttpStatus from "@config/http.config.js";
import ErrorCode from "@enum/error-code.js";

export const CreateProfile = {
  customer: async (tx: any) => {
    return async ({userId}: {userId: number}) => {
      const [customer] = await tx.insert(customers).values({
        user_id: userId,
      }).returning()
      return customer;
    }
  },
  vendor: async (tx: any) => {
    return async ({userId}: {userId: number}) => {
      await tx.insert(vendors).values({
        user_id: userId
      }).returning()
    }
  },
  admin: () => {
    throw new BadRequestException(
      "Admin user cannot be created via public signup.",
      HttpStatus.BAD_REQUEST,
      ErrorCode.ACCESS_UNAUTHORIZED,
    );
  }
}

export type CreateProfileKey = Array<keyof typeof CreateProfile>;
export type UserTypeKey = keyof typeof CreateProfile;
