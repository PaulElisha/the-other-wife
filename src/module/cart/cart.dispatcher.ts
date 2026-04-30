/** @format */
import db from "@/src/config/db.config";
import { cartItems, carts, CartType, ItemType } from "./cart.schema";
import { meals } from "../meal/meal.schema";
import { eq, sql, and} from "drizzle-orm";

import InternalServerError from "@/src/shared/error/internal-server";
import HttpStatus from "@/src/config/http.config";
import ErrorCode from "@/src/shared/enum/error-code";

const CartActions: Record<string, any> = {
  increment: async (cartId: number, cartItemsId: number, quantity: number = 1) => {
    const updatedItem = await db.update(cartItems).set({
      quantity: sql`${cartItems.quantity} + ${quantity}`,
      total_price: sql`(${cartItems.quantity} + ${quantity}) * ${cartItems.price}`
    }).where(
      and(
        eq(cartItems.id, cartItemsId),
        eq(cartItems.cart_id, cartId)
      )
    ).returning()

    return updatedItem[0];
  },
  decrement: async (cartId: number, cartItemsId: number, quantity: number = 1) => {
    const updatedItem = await db.update(cartItems).set({
      quantity: sql`GREATEST(${cartItems.quantity} - ${quantity}, 1)`,
      total_price: sql`GREATEST(${cartItems.quantity} - ${quantity}, 1) * ${cartItems.price}`
    }).where(
      and(
        eq(cartItems.id, cartItemsId),
        eq(cartItems.cart_id, cartId)
      )
    ).returning()

    return updatedItem[0];
  },
  add: async (cartId: number, cartItemsId: number, quantity: number = 1) => {

    const [mealItem] = await db.transaction(async (tx) => {
      const [{ price }] = await tx.select({ price: meals.price })
      .from(meals)
      .where(eq(meals.id, cartItemsId))
      .limit(1);
  
      const mealItem = await tx
      .insert(cartItems)
      .values({
        cart_id: cartId,
        meal_id: cartItemsId,
        price: price,
        quantity: sql`${cartItems.quantity} + ${quantity}`,
        total_price: price * quantity
      })
      .onConflictDoUpdate({
        target: [cartItems.cart_id, cartItems.meal_id],
        set: { 
          quantity: sql`${cartItems.quantity} + ${quantity}`,
          total_price: sql`(${cartItems.quantity} + ${quantity}) * ${cartItems.price}`
        }
      })
      .returning();

      return [
        mealItem[0]
      ]
    });

    return mealItem;
  },
  remove: async (cartId: number, cartItemsId: number) => {
    const deletedItem = await db.delete(cartItems).where(
      and(
        eq(carts.id, cartId),
        eq(meals.id, cartItemsId)
      )
    ).returning();

    if(!deletedItem) throw new InternalServerError(
      "Unable to remove item",
      HttpStatus.INTERNAL_SERVER_ERROR,
      ErrorCode.INTERNAL_SERVER_ERROR
    )
  },
};

export default CartActions;
