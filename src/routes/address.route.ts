/** @format */

import { AddressController } from "../controllers/address.controller";
import { roleGuardMiddleware } from "../middlewares/role-guard.middleware";
import { Router } from "express";

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
      roleGuardMiddleware(["customer", "vendor"]),
      this.addressController.createUserAddress,
    );

    this.router.put(
      "/edit-address/:addressId",
      roleGuardMiddleware(["customer", "vendor"]),
      this.addressController.editUserAddress,
    );

    this.router.put(
      "/toggle-default-address/:addressId",
      roleGuardMiddleware(["customer", "vendor"]),
      this.addressController.toggleDefaultAddress,
    );

    this.router.delete(
      "/delete-address/:addressId",
      roleGuardMiddleware(["customer", "vendor", "admin"]),
      this.addressController.deleteUserAddress,
    );
  }
}

export const addressRouter = new AddressRouter().router;
