/** @format */

import HttpStatus from "@config/http.config.js";
import handleAsyncControl from "@middleware/handle-async-control.js";
import CustomerService from "@module/customer/customer.service.js";
import type { Request, Response } from "express";
import { ApiResponse } from "@util/response.js";

class CustomerController {
  getCustomerProfile = handleAsyncControl(
    async (req: Request<{ id: string }>, res: Response): Promise<Response> => {
      try {
        const { id: customerId } = req.params;
        const userId = <string>(<unknown>req?.user?._id);
        const { customer } = await CustomerService.getCustomerProfile(customerId, userId);
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
    async (req: Request<{ id: string }>, res: Response): Promise<Response> => {
      try {
        const { id: customerId } = req.params;
        const userId = <string>(<unknown>req?.user?._id);
        const customerProfile = await CustomerService.updateCustomerProfile(
          customerId,
          userId,
          req.body,
        );
        return res.status(HttpStatus.OK).json({
          status: "ok",
          message: "Customer updated",
          data: customerProfile,
        } as ApiResponse);
      } catch (error) {
        throw error;
      }
    },
  );

  deleteCustomerProfile = handleAsyncControl(
    async (req: Request<{ id: string }>, res: Response): Promise<Response> => {
      try {
        const { id: customerId } = req.params;
        const userId = <string>(<unknown>req?.user?._id);
        await CustomerService.deleteCustomerProfile(customerId, userId);
        return res.status(HttpStatus.NO_CONTENT).send();
      } catch (error) {
        throw error;
      }
    },
  );
}

export default new CustomerController();
