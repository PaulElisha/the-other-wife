/** @format */

import type { Request, Response, NextFunction } from "express";
import Vendor from "@model/vendor.js";
import BadRequestException from "@error/bad-request-exception.js";
import HttpStatus from "@config/http.config.js";
import ErrorCode from "@enum/error-code.js";

const statusCheck =
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

export default statusCheck;
