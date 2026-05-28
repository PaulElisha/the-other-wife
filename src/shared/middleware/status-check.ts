/** @format */

import HttpStatus from "@/src/shared/enum/http.js";
import db from "@config/db.config";
import ErrorCode from "@enum/error-code.js";
import BadRequestException from "@error/bad-request-exception.js";
import { users } from "@module/user/user.schema.js";
import { vendors } from "@module/vendor/vendor.schema.js";
import { and, eq } from "drizzle-orm";
import type { NextFunction, Request, Response } from "express";

const statusCheck =
 (status: Array<string>) =>
 async (req: Request, res: Response, next: NextFunction) => {
  try {
   const userId = Number(req.user.id);
   const [user] = await db
    .select()
    .from(users)
    .innerJoin(vendors, eq(vendors.user_id, userId))
    .where(and(eq(vendors.user_id, userId), eq(users.id, userId)));
   if (!status.includes(user.vendors.approval_status as string)) {
    throw new BadRequestException(
     "Suspended: profile cannot perform this action",
     HttpStatus.BAD_REQUEST,
     ErrorCode.VALIDATION_ERROR,
    );
   }
   next();
  } catch (error) {
   next(error);
  }
 };

export default statusCheck;
