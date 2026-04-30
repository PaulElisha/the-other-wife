/** @format */

import type { NextFunction, Request, Response } from "express";
import HttpStatus from "@config/http.config.js";
import handleAsyncControl from "@/src/shared/middleware/async-handler.js";
import CartService from "@module/cart/cart.service.js";
import { ApiResponse } from "@util/response.js";
import asyncHandler from "@/src/shared/middleware/async-handler.js";

class CartController {
  addToCart = asyncHandler(
    async (req: Request<{ mealId: string }, {}, {}>, res: Response, next: NextFunction): Promise<any> => {
      const userId = Number(req.user.id);
      const mealId = Number(req.params.mealId);

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

  removeFromCart = asyncHandler(
    async (req: Request<{ mealId: string }, {}, {}>, res: Response): Promise<any> => {
      const userId = Number(req.user.id);
      const mealId = Number(req.params.mealId);

      try {
        await CartService.removeFromCart(userId, mealId);
        return res.status(HttpStatus.NO_CONTENT).send();
      } catch (error) {
        throw error;
      }
    },
  );

  incrementCart = asyncHandler(
    async (req: Request<{ mealId: string }, {}, {}>, res: Response): Promise<any> => {
      const userId = Number(req.user.id);
      const mealId = Number(req.params.mealId);

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

  decrementCart = asyncHandler(
    async (req: Request<{ mealId: string }, {}, {}>, res: Response): Promise<any> => {
      const userId = Number(req.user.id);
      const mealId = Number(req.params.mealId);

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

  getUserCart = asyncHandler(
    async (req: Request<{}, {}, {}>, res: Response): Promise<any> => {
      const userId = Number(req.user.id);

      try {
        const cart = await CartService.getUserCart(userId);
        return res.status(HttpStatus.OK).json({
          status: "ok",
          message: "Cart fetched successfully",
          data: cart,
        });
      } catch (error) {
        throw error;
      }
    },
  );
}

export default new CartController();
