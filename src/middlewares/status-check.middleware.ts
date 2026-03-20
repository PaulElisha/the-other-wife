/** @format */

import type { Request, Response, NextFunction } from "express";
import Vendor from "../models/vendor.model.ts";
import { BadRequestException } from "../errors/bad-request-exception.error.ts";
import { HttpStatus } from "../config/http.config.ts";
import { ErrorCode } from "../enums/error-code.enum.ts";

export const statusCheck =
  (status: Array<string>) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req?.user?._id;
      const vendor = await Vendor.findOne({ userId });
      if (!status.includes(vendor?.approvalStatus as string)) {
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
