/** @format */

import { CustomerController } from "../controllers/customer.controller";
import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleGuardMiddleware } from "../middlewares/role-guard.middleware";

class CustomerRouter {
  customerController: CustomerController;
  router: Router;
  constructor() {
    this.customerController = new CustomerController();
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get(
      "/customer-profile/:customerId",
      authMiddleware,
      roleGuardMiddleware(["customer", "admin"]),
      this.customerController.getCustomerProfile,
    );
    this.router.put(
      "/customer-profile/:customerId",
      authMiddleware,
      roleGuardMiddleware(["customer"]),
      this.customerController.updateCustomerProfile,
    );
    this.router.delete(
      "/customer-profile/:customerId",
      authMiddleware,
      roleGuardMiddleware(["customer", "admin"]),
      this.customerController.deleteCustomerProfile,
    );
  }
}

export const customerRouter = new CustomerRouter().router;
