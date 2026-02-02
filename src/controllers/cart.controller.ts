/** @format */

import { Request, Response } from "express";
import { HttpStatus } from "../config/http.config.js";
import { handleAsyncControl } from "../middlewares/handleAsyncControl.middleware";
import { CartService } from "../services/cart.service.js";

export class CartController {
  cartService: CartService;

  constructor() {
    this.cartService = new CartService();
  }

  addToCart = handleAsyncControl(
    async (
      req: Request<
        { mealId: string },
        {},
        {
          quantity: number;
          action: "increment" | "decrement";
        }
      >,
      res: Response,
    ): Promise<Response> => {
      const userId = req.user?._id?.toString();
      const mealId = req.params.mealId;

      try {
        const { quantity, action } = req.body;
        await this.cartService.addToCart(userId, mealId, quantity, action);
        return res.status(HttpStatus.OK).json({
          success: true,
          message: "Meal added to cart successfully",
        });
      } catch (error) {
        throw error;
      }
    },
  );

  deleteFromCart = handleAsyncControl(
    async (
      req: Request<{ mealId: string }, {}, {}>,
      res: Response,
    ): Promise<Response> => {
      const userId = req.user?._id?.toString();
      const mealId = req.params.mealId;

      try {
        await this.cartService.deleteFromCart(userId, mealId);
        return res.status(HttpStatus.OK).json({
          success: true,
          message: "Meal deleted from cart successfully",
        });
      } catch (error) {
        throw error;
      }
    },
  );

  getUserCart = handleAsyncControl(
    async (
      req: Request<{ mealId: string }, {}, {}>,
      res: Response,
    ): Promise<Response> => {
      const userId = req.user?._id?.toString();

      try {
        const cart = await this.cartService.getUserCart(userId);
        return res.status(HttpStatus.OK).json({
          success: true,
          message: "Cart fetched successfully",
          data: cart,
        });
      } catch (error) {
        throw error;
      }
    },
  );
}
