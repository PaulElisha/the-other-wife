/** @format */

import { Request, Response } from "express";
import { HttpStatus } from "../config/http.config.js";
import { handleAsyncControl } from "../middlewares/handleAsyncControl.middleware.js";
import { CartService } from "../services/cart.service.js";
import { ApiResponse } from "../utils/response.util.js";

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
      const userId = req.user?._id as unknown as string;
      const mealId = req.params.mealId;

      try {
        const { quantity, action } = req.body;
        const cart = await this.cartService.addToCart(
          userId,
          mealId,
          quantity,
          action,
        );
        return res.status(HttpStatus.OK).json({
          status: "ok",
          message: "Meal added to cart successfully",
          data: cart,
        } as ApiResponse);
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
      const userId = req.user?._id as unknown as string;
      const mealId = req.params.mealId;

      try {
        await this.cartService.deleteFromCart(userId, mealId);
        return res.status(HttpStatus.NO_CONTENT).send();
      } catch (error) {
        throw error;
      }
    },
  );

  getUserCart = handleAsyncControl(
    async (req: Request<{}, {}, {}>, res: Response): Promise<Response> => {
      const userId = req.user?._id as unknown as string;

      try {
        const cart = await this.cartService.getUserCart(userId);
        return res.status(HttpStatus.OK).json({
          status: "ok",
          message: "Cart fetched successfully",
          data: cart,
        } as ApiResponse);
      } catch (error) {
        throw error;
      }
    },
  );
}
