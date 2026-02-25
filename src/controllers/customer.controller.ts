/** @format */

import { HttpStatus } from "../config/http.config.js";
import { handleAsyncControl } from "../middlewares/handle-async-control.middleware.js";
import { CustomerService } from "../services/customer.service.js";
import type { Request, Response } from "express";
import { ApiResponse } from "../util/response.util.js";

export class CustomerController {
  customerService: CustomerService;
  constructor() {
    this.customerService = new CustomerService();
  }

  getCustomerProfile = handleAsyncControl(
    async (
      req: Request<{ userId: string }>,
      res: Response,
    ): Promise<Response> => {
      try {
        const { userId } = req.params;
        const { customer } =
          await this.customerService.getCustomerProfile(userId);
        return res.status(HttpStatus.OK).json({
          status: "ok",
          message: "Customer profile fetched",
          data: customer,
        } as ApiResponse);
      } catch (error) {
        throw error;
      }
    },
  );

  updateCustomerProfile = handleAsyncControl(
    async (
      req: Request<{ userId: string }>,
      res: Response,
    ): Promise<Response> => {
      try {
        const { userId } = req.params;
        const { profileImageUrl } = req.body;
        const { customer } = await this.customerService.updateCustomerProfile(
          userId,
          profileImageUrl,
        );
        return res.status(HttpStatus.OK).json({
          status: "ok",
          message: "Customer updated",
          data: customer,
        } as ApiResponse);
      } catch (error) {
        throw error;
      }
    },
  );

  deleteCustomerProfile = handleAsyncControl(
    async (
      req: Request<{ userId: string }>,
      res: Response,
    ): Promise<Response> => {
      try {
        const { userId } = req.params;
        await this.customerService.deleteCustomerProfile(userId);
        return res.status(HttpStatus.NO_CONTENT).send();
      } catch (error) {
        throw error;
      }
    },
  );
}
