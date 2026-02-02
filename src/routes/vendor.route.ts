/** @format */

import { Router } from "express";
import { VendorController } from "../controllers/vendor.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleGuardMiddleware } from "../middlewares/role-guard.middleware";

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
      roleGuardMiddleware(["vendor"]),
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
