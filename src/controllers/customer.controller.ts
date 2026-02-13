/** @format */

import { HttpStatus } from "../config/http.config.js";
import { handleAsyncControl } from "../middlewares/handleAsyncControl.middleware.js";
import { CustomerService } from "../services/customer.service.js";
import { Request, Response } from "express";

export class CustomerController {
  customerService: CustomerService;
  constructor() {
    this.customerService = new CustomerService();
  }

  getCustomerProfile = handleAsyncControl(
    async (
      req: Request<{ customerId: string }>,
      res: Response,
    ): Promise<Response> => {
      try {
        const { customerId } = req.params;
        const { customer } =
          await this.customerService.getCustomerProfile(customerId);
        return res.status(HttpStatus.OK).json({
          status: "ok",
          message: "Customer profile fetched",
          customer,
        });
      } catch (error) {
        throw error;
      }
    },
  );

  updateCustomerProfile = handleAsyncControl(
    async (
      req: Request<{ customerId: string }>,
      res: Response,
    ): Promise<Response> => {
      try {
        const { customerId } = req.params;
        const { profileImageUrl } = req.body;
        const { customer } = await this.customerService.updateCustomerProfile(
          customerId,
          profileImageUrl,
        );
        return res
          .status(HttpStatus.NO_CONTENT)
          .json({ status: "ok", message: "Customer updated", customer });
      } catch (error) {
        throw error;
      }
    },
  );

  deleteCustomerProfile = handleAsyncControl(
    async (
      req: Request<{ customerId: string }>,
      res: Response,
    ): Promise<Response> => {
      try {
        const { customerId } = req.params;
        await this.customerService.deleteCustomerProfile(customerId);
        return res
          .status(HttpStatus.NO_CONTENT)
          .json({ status: "ok", message: "Customer deleted" });
      } catch (error) {
        throw error;
      }
    },
  );
}
