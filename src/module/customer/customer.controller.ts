/** @format */

import type { Request, NextFunction, Response } from "express";
import { ApiResponse } from "@util/response.js"

import asyncHandler from "@/src/shared/middleware/async-handler.js";
import HttpStatus from "@config/http.config.js";
import CustomerService from "@module/customer/customer.service.js";

class CustomerController {
  getCustomerProfile = asyncHandler(
    async (req: Request<{id: string}, {}, {}, {}>, res: Response, next: NextFunction): Promise<any> => {
      try {
        const  customerId  = Number(req.params.id);
        const userId = Number(req.user.id);
        const customerProfile = await CustomerService.getCustomerProfile(customerId, userId);
        return res.status(HttpStatus.OK).json({
          status: "ok",
          message: "Customer profile fetched",
          data: customerProfile,
        } satisfies ApiResponse<typeof customerProfile>);
      } catch (error) {
        next(error);
      }
    },
  );

  updateCustomerProfile = asyncHandler(
    async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<any> => {
      try {
        const customerId  = Number(req.params.id);
        const userId = Number(req.user.id);
        const customerProfile = await CustomerService.updateCustomerProfile(
          customerId,
          userId,
          req.body,
        );
        return res.status(HttpStatus.OK).json({
          status: "ok",
          message: "Customer updated",
          data: customerProfile,
        } satisfies ApiResponse<typeof customerProfile>);
      } catch (error) {
        next(error);
      }
    },
  );

  deleteCustomerProfile = asyncHandler(
    async (req: Request<{ id: string }>, res: Response): Promise<any> => {
      try {
        const  customerId = Number(req.params.id);
        const userId = Number(req.user.id);
        await CustomerService.deleteCustomerProfile(customerId, userId);
        return res.status(HttpStatus.NO_CONTENT).send();
      } catch (error) {
        throw error;
      }
    },
  );
}

export default new CustomerController();
