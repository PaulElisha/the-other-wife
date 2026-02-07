/** @format */

import mongoose from "mongoose";
import { HttpStatus } from "../config/http.config.js";
import { ErrorCode } from "../enums/error-code.enum.js";
import { NotFoundException } from "../errors/not-found-exception.error.js";
import Cart from "../models/cart.model.js";
import Meal from "../models/meal.model.js";

export class CartService {
  addToCart = async (
    customerId: string | undefined,
    mealId: string,
    quantity: number,
    action: "increment" | "decrement" | undefined,
  ) => {
    const meal = await Meal.findById(mealId);
    const existingCart = await Cart.findOne({ customerId });

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
            existingMeal.totalPrice = existingMeal.price * existingMeal.quantity;
          }
        } else {
          existingMeal.quantity += quantity;
          existingMeal.totalPrice = existingMeal.price * existingMeal.quantity;
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
    } else {
      await Cart.create({
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
    }
  };

  deleteFromCart = async (customerId: string | undefined, mealId: string) => {
    const meal = await Meal.findById(mealId);
    const existingCart = await Cart.findOne({ customerId });

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

      const removedMeal = existingCart.meals[mealIndex];
      existingCart.meals.splice(mealIndex, 1);
      existingCart.totalAmount = existingCart.meals.reduce(
        (total, meal, index) =>
          total + existingCart.meals[index].quantity * meal.price,
        0,
      );

      await existingCart.save();
    }
  };

  getUserCart = async (customerId: string | undefined) => {
    const existingCart = await Cart.findOne({ customerId });
    return existingCart;
  };
}
