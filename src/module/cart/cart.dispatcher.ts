/** @format */
import db from "@/src/config/db.config";
import { cartItems, carts, CartType, ItemType } from "./cart.schema";
import { meals, MealSchemaType} from "../meal/meal.schema.js";
import { eq, sql, and} from "drizzle-orm";

import InternalServerError from "@/src/shared/error/internal-server";
import HttpStatus from "@/src/config/http.config";
import ErrorCode from "@/src/shared/enum/error-code";

const CartActions: Record<string, any> = {
  increment: async (cartId: number, mealId: number, quantity: number = 1) => {
    const updatedItem = await db.update(cartItems).set({
      quantity: sql`${cartItems.quantity} + ${quantity}`,
      total_item_price: sql`(${cartItems.quantity} + ${quantity}) * ${cartItems.price}`
    }).where(
      and(
        eq(cartItems.cart_id, cartId),
        eq(cartItems.meal_id, mealId)
      )
    ).returning();

    return updatedItem[0];
  },
  decrement: async (cartId: number, mealId: number, quantity: number = 1) => {
    const updatedItem = await db.update(cartItems).set({
      quantity: sql`GREATEST(${cartItems.quantity} - ${quantity}, 1)`,
      total_item_price: sql`GREATEST(${cartItems.quantity} - ${quantity}, 1) * ${cartItems.price}`
    }).where(
      and(
        eq(cartItems.cart_id, cartId),
        eq(cartItems.meal_id, mealId)
      )
    ).returning()

    return updatedItem[0];
  },
  add: async (cartId: number, mealId: number, quantity: number = 1) => {

    const [mealItem] = await db.transaction(async (tx) => {
      const [{ price }] = await tx.select({ price: meals.price })
      .from(meals)
      .where(eq(meals.id, mealId))
      .limit(1);
  
      const mealItem = await tx
      .insert(cartItems)
      .values({
        cart_id: cartId,
        meal_id: mealId,
        price: price,
        quantity: sql`${cartItems.quantity} + ${quantity}`,
        total_item_price: price * quantity,
      })
      .returning();

      return [
        mealItem[0]
      ]
    });

    return mealItem;
  },
  remove: async (cartId: number, mealId: number) => {
    const deletedItem = await db.delete(cartItems).where(
      and(
        eq(cartItems.cart_id, cartId),
        eq(cartItems.meal_id, mealId)
      )
    ).returning();

    if(!deletedItem) throw new InternalServerError(
      "Unable to remove item",
      HttpStatus.INTERNAL_SERVER_ERROR,
      ErrorCode.INTERNAL_SERVER_ERROR
    )
  }
};

export default CartActions;
