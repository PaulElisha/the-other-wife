/** @format */

import AddressController from "@module/address/address.controller.js";
import roleGuardMiddleware from "@middleware/role-guard.js";
import { Router } from "express";
import authMiddleware from "@middleware/auth.js";
import {validate} from "@middleware/validation.js";
import { createAddressSchema, editAddressSchema } from "@schema/address.js";

/**
 * @swagger
 * /api/v1/addresses:
 *   post:
 *     summary: Create address
 *     tags: [Address]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: ["city", "state", "country", "postalCode", "latitude", "longitude"]
 *             properties:
 *               city: { type: string }
 *               state: { type: string }
 *               country: { type: string }
 *               postalCode: { type: string }
 *               latitude: { type: number }
 *               longitude: { type: number }
 *               address: { type: string }
 *               label: { type: string, enum: [home, work, other] }
 *               isDefault: { type: boolean }
 *     responses:
 *       "201":
 *         description: Address created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ApiResponse"
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
 * /api/v1/addresses/edit/{id}:
 *   put:
 *     summary: Edit address
 *     tags: [Address]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *            type: string
 *            description: Edit address ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               address: { type: string }
 *               label: { type: string, enum: [home, work, other] }
 *               city: { type: string }
 *               state: { type: string }
 *               country: { type: string }
 *               postalCode: { type: string }
 *               latitude: { type: number }
 *               longitude: { type: number }
 *               isDefault: { type: boolean }
 *     responses:
 *       "200":
 *         description: Address updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ApiResponse"
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
 * /api/v1/addresses/toggle/{id}:
 *   put:
 *     summary: Toggle default address
 *     tags: [Address]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *            type: string
 *            required: true
 *            description: Toggle Address ID
 *     responses:
 *       "200":
 *         description: Default address set successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ApiResponse"
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
 * /api/v1/addresses/{id}:
 *   delete:
 *     summary: Delete address
 *     tags: [Address]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *            type: string
 *            description: Delete Address ID
 *     responses:
 *       "204":
 *         description: Address deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ApiResponse"
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
 * /api/v1/addresses/me:
 *   get:
 *     summary: Get user addresses
 *     tags: [Address]
 *     responses:
 *       "200":
 *         description: User addresses fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ApiResponse"
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

class AddressRouter {
  router: Router;

  constructor() {
    this.router = Router();
    this.router.use(authMiddleware);
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post(
      "/",
      roleGuardMiddleware(["customer", "vendor"]),
      validate(createAddressSchema),
      AddressController.createUserAddress,
    );

    this.router.put(
      "/edit/:id",
      roleGuardMiddleware(["customer", "vendor"]),
      validate(editAddressSchema),
      AddressController.editUserAddress,
    );

    this.router.put(
      "/toggle/:id",
      roleGuardMiddleware(["customer", "vendor"]),
      AddressController.toggleDefaultAddress,
    );

    this.router.delete(
      "/:id",
      roleGuardMiddleware(["customer", "vendor", "admin"]),
      AddressController.deleteUserAddress,
    );

    this.router.get(
      "/me",
      roleGuardMiddleware(["customer", "vendor"]),
      AddressController.getUserAddresses,
    );
  }
}

export const addressRouter = new AddressRouter().router;
