/** @format */

import HttpStatus from "@/src/shared/enum/http.js";
import BadRequestException from "@/src/shared/error/bad-request-exception";
import db from "@config/db.config.js";
import ErrorCode from "@enum/error-code.js";
import CartActions from "@module/cart/cart.dispatcher.js";
import { cartItems, carts, CartType } from "@module/cart/cart.schema.js";
import { meals } from "@module/meal/meal.schema.js";
import type { CartAction } from "@type/types.js";
import { Mutex } from "async-mutex";
import { and, eq, isNotNull, sql } from "drizzle-orm";

import { Transaction } from "../payment/payment.service";

const mutex = new Mutex();

class CartBase {
 calculateTotalAmount =
  (tx: Transaction) => async (cartId: number, customerId: number) => {
   const [result] = await tx
    .select({
     subtotal: sql<number>`COALESCE(SUM(${cartItems.total_item_price}), 0)`,
    })
    .from(cartItems)
    .where(eq(cartItems.cart_id, cartId));

   await tx
    .update(carts)
    .set({
     subtotal: result.subtotal,
    })
    .where(and(eq(carts.id, cartId), eq(carts.customer_id, customerId)));
  };

 modifyCart = async (
  customerId: number,
  mealId: number,
  modifier: CartAction,
 ) => {
  await mutex.runExclusive(async () => {
   await db.transaction(async (tx: Transaction) => {
    const [meal] = await tx
     .select()
     .from(meals)
     .where(and(eq(meals.id, mealId), isNotNull(meals.id)))
     .limit(1);

    let cart: CartType;

    [cart] = await tx
     .select()
     .from(carts)
     .where(eq(carts.customer_id, customerId))
     .limit(1);

    if (meal.vendor_id != cart.vendor_id) {
     throw new BadRequestException(
      "Only meals from a single vendor is allowed in a cart",
      HttpStatus.BAD_REQUEST,
      ErrorCode.VALIDATION_ERROR,
     );
    }

    cart ??
     ([cart] = await tx
      .insert(carts)
      .values({
       customer_id: customerId,
       vendor_id: meal.vendor_id,
      })
      .returning());

    modifier(tx)(cart.id, meal.id);
    await this.calculateTotalAmount(tx)(cart.id, customerId);
    return cart;
   });
  });
 };
}

class CartService extends CartBase {
 addToCart = async (customerId: number, mealId: number) =>
  await this.modifyCart(customerId, mealId, CartActions.add);

 removeItemFromCart = async (customerId: number, mealId: number) =>
  await this.modifyCart(customerId, mealId, CartActions.remove);

 incrementCart = async (customerId: number, mealId: number) =>
  await this.modifyCart(customerId, mealId, CartActions.increment);

 decrementCart = async (customerId: number, mealId: number) =>
  await this.modifyCart(customerId, mealId, CartActions.decrement);

 getUserCart = async (customerId: number) => {
  const result = await db
   .select()
   .from(carts)
   .innerJoin(cartItems, eq(carts.id, cartItems.cart_id))
   .where(eq(carts.customer_id, customerId));

  return {
   cart: result[0].carts,
   cart_items: result.map((r) => r.cart_items),
  };
 };

 clearCart = async (customerId: number, cartId: number) => {
  const cart = await db
   .select()
   .from(carts)
   .where(and(eq(carts.id, cartId), eq(carts.customer_id, customerId)))
   .limit(1);

  if (cart.length === 0) {
   throw new Error("Cart not found or doesn't belong to this customer");
  }

  const deletedItems = await db
   .delete(cartItems)
   .where(isNotNull(cartItems.cart_id))
   .returning();

  return deletedItems;
 };
}

export default new CartService();
