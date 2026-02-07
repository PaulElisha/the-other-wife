/** @format */

import { AddressController } from "../controllers/address.controller.js";
import { roleGuardMiddleware } from "../middlewares/role-guard.middleware.js";
import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  validateCreateAddress,
  validateEditAddress,
} from "../validation/address.validation.js";

/**
 * @openapi
 * /api/v1/address/create-address:
 *   post:
 *     summary: Create address
 *     tags: [Address]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [address, city, state, country, postalCode, latitude, longitude]
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
 *       200:
 *         description: Address created successfully
 */

/**
 * @openapi
 * /api/v1/address/edit-address/{addressId}:
 *   put:
 *     summary: Edit address
 *     tags: [Address]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema: { type: string }
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
 *       200:
 *         description: Address updated successfully
 */

/**
 * @openapi
 * /api/v1/address/toggle-default-address/{addressId}:
 *   put:
 *     summary: Toggle default address
 *     tags: [Address]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Default address set successfully
 */

/**
 * @openapi
 * /api/v1/address/delete-address/{addressId}:
 *   delete:
 *     summary: Delete address
 *     tags: [Address]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Address deleted successfully
 */

class AddressRouter {
  addressController: AddressController;
  router: Router;

  constructor() {
    this.addressController = new AddressController();
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post(
      "/create-address",
      authMiddleware,
      roleGuardMiddleware(["customer", "vendor"]),
      validateCreateAddress,
      this.addressController.createUserAddress,
    );

    this.router.put(
      "/edit-address/:addressId",
      authMiddleware,
      roleGuardMiddleware(["customer", "vendor"]),
      validateEditAddress,
      this.addressController.editUserAddress,
    );

    this.router.put(
      "/toggle-default-address/:addressId",
      authMiddleware,
      roleGuardMiddleware(["customer", "vendor"]),
      this.addressController.toggleDefaultAddress,
    );

    this.router.delete(
      "/delete-address/:addressId",
      authMiddleware,
      roleGuardMiddleware(["customer", "vendor", "admin"]),
      this.addressController.deleteUserAddress,
    );
  }
}

export const addressRouter = new AddressRouter().router;
