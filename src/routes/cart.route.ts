/** @format */

import { Router } from "express";
import { CartController } from "../controllers/cart.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleGuardMiddleware } from "../middlewares/role-guard.middleware.js";
import { validateAddToCart } from "../validation/cart.validation.js";

/**
 * @openapi
 * /api/v1/cart/add-to-cart/meals/{mealId}:
 *   post:
 *     summary: Add meal to cart
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: mealId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quantity]
 *             properties:
 *               quantity: { type: number }
 *               action: { type: string, enum: [increment, decrement] }
 *     responses:
 *       200:
 *         description: Meal added to cart successfully
 */

/**
 * @openapi
 * /api/v1/cart/delete-from-cart/meals/{mealId}:
 *   delete:
 *     summary: Delete meal from cart
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: mealId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Meal deleted from cart successfully
 */

/**
 * @openapi
 * /api/v1/cart/get-user-cart:
 *   get:
 *     summary: Get current user cart
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Cart fetched successfully
 */

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
      validateAddToCart,
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
