/** @format */

import { Router } from "express";
import { CartController } from "../controllers/cart.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleGuardMiddleware } from "../middlewares/role-guard.middleware";

export class CartRouter {
  cartController: CartController;
  router: Router;
  constructor() {
    this.cartController = new CartController();
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post(
      "/add-to-cart/meals/:mealId",
      authMiddleware,
      roleGuardMiddleware(["customer"]),
      this.cartController.addToCart,
    );
    this.router.delete(
      "/delete-from-cart/meals/:mealId",
      authMiddleware,
      roleGuardMiddleware(["customer"]),
      this.cartController.deleteFromCart,
    );
    this.router.get(
      "/get-user-cart",
      authMiddleware,
      roleGuardMiddleware(["customer"]),
      this.cartController.getUserCart,
    );
  }
}

export const cartRouter = new CartRouter().router;
