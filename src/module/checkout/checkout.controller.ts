/** @format */

import asyncHandler from "@/src/shared/middleware/async-handler";
import { Request, Response, NextFunction } from "express";
import CheckoutService from "./checkout.service";
import HttpStatus from "@/src/shared/enum/http";
import { ApiResponse } from "@/src/shared/util/response";
import { AnyD1Database } from "drizzle-orm/d1";

class CheckoutController {
 proceedToCheckout = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
   const userId = Number(req.user.id);

   try {
    const result = await CheckoutService.proceedToCheckout(userId);
    return res.status(HttpStatus.OK).json({
     status: "ok",
     data: result,
    } as ApiResponse);
   } catch (error) {
    throw error;
   }
  },
 );

 confirmCheckout = asyncHandler(
  async (
   req: Request,
   res: Response,
   next: NextFunction,
  ): Promise<AnyD1Database> => {
   const userId = Number(req.user.id);
   const checkOutId = Number(req.params.id);
   const { channel } = req.body;

   await CheckoutService.confirmCheckout(checkOutId, userId, channel);

   return res.status(HttpStatus.NO_CONTENT).json({
    status: "ok",
   });
  },
 );
}

export default new CheckoutController();
