/** @format */

import { CustomerController } from "../controllers/customer.controller.js";
import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleGuardMiddleware } from "../middlewares/role-guard.middleware.js";

/**
 * @openapi
 * /api/v1/customer/customer-profile/{customerId}:
 *   get:
 *     summary: Get customer profile
 *     tags: [Customer]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Customer profile fetched
 */

/**
 * @openapi
 * /api/v1/customer/customer-profile/{customerId}:
 *   put:
 *     summary: Update customer profile
 *     tags: [Customer]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [profileImageUrl]
 *             properties:
 *               profileImageUrl: { type: string }
 *     responses:
 *       200:
 *         description: Customer updated
 */

/**
 * @openapi
 * /api/v1/customer/customer-profile/{customerId}:
 *   delete:
 *     summary: Delete customer profile
 *     tags: [Customer]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Customer deleted
 */

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
