/** @format */

import { CustomerController } from "../controllers/customer.controller.js";
import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleGuardMiddleware } from "../middlewares/role-guard.middleware.js";

/**
 * @swagger
 * /api/v1/customer/{customerId}:
 *   get:
 *     summary: Get customer profile
 *     tags: [Customer]
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *           required: true
 *           description: The customer ID
 *     responses:
 *       200:
 *         description: Customer profile fetched
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Customer"
 *       "401":
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/responses/401"
 *       "403":
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/responses/403"
 *       "404":
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/responses/404"
 *       "500":
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/responses/500"
 */

/**
 * @swagger
 * /api/v1/customer/{customerId}:
 *   put:
 *     summary: Update customer profile
 *     tags: [Customer]
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema: 
 *           type: string
 *           required: true
 *           description: The customer ID
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
 *       "204":
 *         description: Customer updated
 *         content:
 *           application/json
 *       "401":
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/responses/401"
 *       "403":
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/responses/403"
 *       "404":
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/responses/404"
 *       "500":
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/responses/500"
 */

/**
 * @swagger
 * /api/v1/customer/{customerId}:
 *   delete:
 *     summary: Delete customer profile
 *     tags: [Customer]
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *           required: true
 *           description: The customer ID
 *     responses:
 *       "204":
 *         description: Customer deleted
 *         content:
 *           application/json:
 *       "401":
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/responses/401"
 *       "403":
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/responses/403"
 *       "404":
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/responses/404"
 *       "500":
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/responses/500"
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
      "/:customerId",
      authMiddleware,
      roleGuardMiddleware(["customer", "admin"]),
      this.customerController.getCustomerProfile,
    );
    this.router.put(
      "/:customerId",
      authMiddleware,
      roleGuardMiddleware(["customer"]),
      this.customerController.updateCustomerProfile,
    );
    this.router.delete(
      "/:customerId",
      authMiddleware,
      roleGuardMiddleware(["customer", "admin"]),
      this.customerController.deleteCustomerProfile,
    );
  }
}

export const customerRouter = new CustomerRouter().router;
