/** @format */

import type { Request, Response } from "express";
import HttpStatus from "@config/http.config.js";
import handleAsyncControl from "@middleware/handle-async-control.js";
import CartService from "@module/cart/cart.service.js";
import { ApiResponse } from "@util/response.js";

class CartController {
  addToCart = handleAsyncControl(
    async (req: Request<{ mealId: string }, {}, {}>, res: Response): Promise<Response> => {
      const userId = req.user?._id as unknown as string;
      const mealId = req.params.mealId;

      try {
        const cart = await CartService.addToCart(userId, mealId);
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

  removeFromCart = handleAsyncControl(
    async (req: Request<{ mealId: string }, {}, {}>, res: Response): Promise<Response> => {
      const userId = req.user?._id as unknown as string;
      const mealId = req.params.mealId;

      try {
        await CartService.removeFromCart(userId, mealId);
        return res.status(HttpStatus.NO_CONTENT).send();
      } catch (error) {
        throw error;
      }
    },
  );

  incrementCart = handleAsyncControl(
    async (req: Request<{ mealId: string }, {}, {}>, res: Response): Promise<Response> => {
      const userId = req.user?._id as unknown as string;
      const mealId = req.params.mealId;

      try {
        const cart = await CartService.incrementCart(userId, mealId);
        return res.status(HttpStatus.OK).json({
          status: "ok",
          message: "Meal incremented in cart successfully",
          data: cart,
        } as ApiResponse);
      } catch (error) {
        throw error;
      }
    },
  );

  decrementCart = handleAsyncControl(
    async (req: Request<{ mealId: string }, {}, {}>, res: Response): Promise<Response> => {
      const userId = req.user?._id as unknown as string;
      const mealId = req.params.mealId;

      try {
        const cart = await CartService.decrementCart(userId, mealId);
        return res.status(HttpStatus.OK).json({
          status: "ok",
          message: "Meal decremented in cart successfully",
          data: cart,
        } as ApiResponse);
      } catch (error) {
        throw error;
      }
    },
  );

  getUserCart = handleAsyncControl(
    async (req: Request<{}, {}, {}>, res: Response): Promise<Response> => {
      const userId = req.user?._id as unknown as string;

      try {
        const cart = await CartService.getUserCart(userId);
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

export default new CartController();
