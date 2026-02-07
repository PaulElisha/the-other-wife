/** @format */

import { Router } from "express";
import { VendorController } from "../controllers/vendor.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleGuardMiddleware } from "../middlewares/role-guard.middleware.js";

/**
 * @openapi
 * /api/v1/vendor/get-vendor-profile/{vendorId}:
 *   get:
 *     summary: Get vendor profile
 *     tags: [Vendor]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: vendorId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Vendor profile retrieved successfully
 */

/**
 * @openapi
 * /api/v1/vendor/approve-vendor/{vendorId}:
 *   put:
 *     summary: Approve vendor
 *     tags: [Vendor]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: vendorId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Vendor approved successfully
 */

/**
 * @openapi
 * /api/v1/vendor/reject-vendor/{vendorId}:
 *   put:
 *     summary: Reject vendor
 *     tags: [Vendor]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: vendorId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rejectionReason: { type: string }
 *     responses:
 *       200:
 *         description: Vendor rejected successfully
 */

/**
 * @openapi
 * /api/v1/vendor/suspend-vendor/{vendorId}:
 *   put:
 *     summary: Suspend vendor
 *     tags: [Vendor]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: vendorId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Vendor suspended successfully
 */

/**
 * @openapi
 * /api/v1/vendor/delete-vendor-profile/{vendorId}:
 *   delete:
 *     summary: Delete vendor profile
 *     tags: [Vendor]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: vendorId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Vendor profile deleted successfully
 */

class VendorRouter {
  vendorController: VendorController;
  router: Router;

  constructor() {
    this.vendorController = new VendorController();
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get(
      "/get-vendor-profile/:vendorId",
      authMiddleware,
      roleGuardMiddleware(["vendor", "admin"]),
      this.vendorController.getVendorProfile,
    );
    this.router.put(
      "/approve-vendor/:vendorId",
      authMiddleware,
      roleGuardMiddleware(["admin"]),
      this.vendorController.approveVendor,
    );
    this.router.put(
      "/reject-vendor/:vendorId",
      authMiddleware,
      roleGuardMiddleware(["admin"]),
      this.vendorController.rejectVendor,
    );
    this.router.put(
      "/suspend-vendor/:vendorId",
      authMiddleware,
      roleGuardMiddleware(["admin"]),
      this.vendorController.suspendVendor,
    );
    this.router.delete(
      "/delete-vendor-profile/:vendorId",
      authMiddleware,
      roleGuardMiddleware(["vendor", "admin"]),
      this.vendorController.deleteVendorProfile,
    );
  }
}

export const vendorRouter = new VendorRouter().router;
