/** @format */

import mongoose from "mongoose";
import { HttpStatus } from "../config/http.config.js";
import { ErrorCode } from "../enums/error-code.enum.js";
import { NotFoundException } from "../errors/not-found-exception.error.js";
import Cart from "../models/cart.model.js";
import Meal from "../models/meal.model.js";
import { transaction } from "../util/transaction.util.js";

export class CartService {
  private tx;

  constructor() {
    this.tx = transaction();
  }

  addToCart = async (
    customerId: string,
    mealId: string,
    quantity: number,
    action: "increment" | "decrement" | undefined,
  ) => {
    const session = await this.tx.startTransaction();

    try {
      const meal = await Meal.findById(mealId).session(session);
      const existingCart = await Cart.findById(customerId).session(session);

      if (!meal) {
        throw new NotFoundException(
          "Meal not found",
          HttpStatus.NOT_FOUND,
          ErrorCode.RESOURCE_NOT_FOUND,
        );
      }

      if (existingCart) {
        const mealIndex = existingCart?.meals.findIndex(
          (meal) => meal.mealId.toString() === mealId,
        );

        if (mealIndex !== -1 && mealIndex !== undefined) {
          const existingMeal = existingCart.meals[mealIndex];
          if (action === "decrement") {
            existingMeal.quantity -= quantity;
            if (existingMeal.quantity <= 0) {
              existingCart.meals.splice(mealIndex, 1);
            } else {
              existingMeal.totalPrice =
                existingMeal.price * existingMeal.quantity;
            }
          } else {
            existingMeal.quantity += quantity;
            existingMeal.totalPrice =
              existingMeal.price * existingMeal.quantity;
          }
        } else {
          const newMeal = {
            mealId: mealId as unknown as mongoose.Types.ObjectId,
            price: meal.price,
            quantity,
            totalPrice: meal.price * quantity,
          };
          existingCart.meals.push(newMeal);
        }

        existingCart.totalAmount = existingCart.meals.reduce(
          (total, meal, index) =>
            total + existingCart.meals[index].quantity * meal.price,
          0,
        );

        await existingCart.save();
        return existingCart;
      } else {
        const cart = await Cart.create({
          customerId,
          meals: [
            {
              mealId: mealId as unknown as mongoose.Types.ObjectId,
              price: meal.price,
              quantity,
              totalPrice: meal.price * quantity,
            },
          ],
          totalAmount: meal.price * quantity,
        });

        await this.tx.commitTransaction(session);
        return cart;
      }
    } catch (error) {
      await this.tx.end(session);
      throw error;
    }
  };

  deleteFromCart = async (customerId: string, mealId: string) => {
    const session = await this.tx.startTransaction();
    try {
      const meal = await Meal.findById(mealId).session(session);
      const existingCart = await Cart.findOne({ customerId }).session(session);

      if (!meal) {
        throw new NotFoundException(
          "Meal not found",
          HttpStatus.NOT_FOUND,
          ErrorCode.RESOURCE_NOT_FOUND,
        );
      }

      if (existingCart) {
        const mealIndex = existingCart?.meals.findIndex(
          (meal) => meal.mealId.toString() === mealId,
        );

        if (mealIndex === -1 || mealIndex === undefined) {
          throw new NotFoundException(
            "Meal not found in cart",
            HttpStatus.NOT_FOUND,
            ErrorCode.RESOURCE_NOT_FOUND,
          );
        }

        existingCart.meals.splice(mealIndex, 1);
        existingCart.totalAmount = existingCart.meals.reduce(
          (total, meal, index) =>
            total + existingCart.meals[index].quantity * meal.price,
          0,
        );

        await existingCart.save();
      }
    } catch (error) {
      throw error;
    }
  };

  getUserCart = async (customerId: string) =>
    (await Cart.findById(customerId)) ??
    (() => {
      throw new NotFoundException(
        "Cart not found",
        HttpStatus.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    })();
}
