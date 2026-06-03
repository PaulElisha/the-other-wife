/** @format */
import db from "@/src/config/db.config";
import ErrorCode from "@/src/shared/enum/error-code";
import HttpStatus from "@/src/shared/enum/http.js";
import InternalServerError from "@/src/shared/error/internal-server";
import { and, eq, sql } from "drizzle-orm";

import { meals } from "../meal/meal.schema.js";
import { cartItems, ItemType } from "./cart.schema";
import { Transaction } from "../payment/payment.service.js";

const CartActions: Record<
 string,
 (
  tx: Transaction,
 ) => (cartId: number, mealId: number) => Promise<ItemType> | Promise<void>
> = {
 increment:
  (tx: Transaction) =>
  async (cartId: number, mealId: number, quantity: number = 1) => {
   const updatedItem = await tx
    .update(cartItems)
    .set({
     quantity: sql`${cartItems.quantity} + ${quantity}`,
     total_item_price: sql`(${cartItems.quantity} + ${quantity}) * ${cartItems.price}`,
    })
    .where(and(eq(cartItems.cart_id, cartId), eq(cartItems.meal_id, mealId)))
    .returning();

   return updatedItem[0];
  },
 decrement:
  (tx: Transaction) =>
  async (cartId: number, mealId: number, quantity: number = 1) => {
   const updatedItem = await tx
    .update(cartItems)
    .set({
     quantity: sql`GREATEST(${cartItems.quantity} - ${quantity}, 1)`,
     total_item_price: sql`GREATEST(${cartItems.quantity} - ${quantity}, 1) * ${cartItems.price}`,
    })
    .where(and(eq(cartItems.cart_id, cartId), eq(cartItems.meal_id, mealId)))
    .returning();

   return updatedItem[0];
  },
 add:
  (tx: Transaction) =>
  async (cartId: number, mealId: number, quantity: number = 1) => {
   const [{ price }] = await tx
    .select({ price: meals.price })
    .from(meals)
    .where(eq(meals.id, mealId))
    .limit(1);

   const [mealItem] = await tx
    .insert(cartItems)
    .values({
     cart_id: cartId,
     meal_id: mealId,
     price: price,
     quantity: sql`${cartItems.quantity} + ${quantity}`,
     total_item_price: sql`price * ${quantity}`,
    })
    .returning();

   return mealItem;
  },
 remove: (tx: Transaction) => async (cartId: number, mealId: number) => {
  const deletedItem = await tx
   .delete(cartItems)
   .where(and(eq(cartItems.cart_id, cartId), eq(cartItems.meal_id, mealId)))
   .returning();

  if (!deletedItem)
   throw new InternalServerError(
    "Unable to remove item",
    HttpStatus.INTERNAL_SERVER_ERROR,
    ErrorCode.INTERNAL_SERVER_ERROR,
   );
 },
};

export default CartActions;
