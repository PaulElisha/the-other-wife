/** @format */

import { eq, sql } from "drizzle-orm";
import HttpStatus from "@config/http.config.js";
import ErrorCode from "@enum/error-code.js";
import NotFoundException from "@error/not-found-exception.js";
import { cartItems, carts, CartType } from "@module/cart/cart.schema.js";
import CartActions from "@module/cart/cart.dispatcher.js";
import { meals } from "@module/meal/meal.schema.js";
import type { CartAction } from "@type/types.js"
import db from "@config/db.config.js";

class CartBase {
  calculateTotalAmount = async (cartId: number) => {
    await db.update(carts)
    .set({
      total_amount: sql`(
        SELECT COALESCE(SUM(${cartItems.total_price}), 0)::integer
        FROM ${cartItems}
        WHERE ${cartItems.cart_id} = ${cartId}
      )`
    })
    .where(eq(carts.id, cartId)).returning()
  };

  modifyCart = async (
    customerId: number,
    mealId: number,
    handler: CartAction,
  ) => {
    const [meal] = await db.select().from(meals).where(
      eq(meals.id, mealId)
    ).limit(1);

    if (!meal) {
      throw new NotFoundException(
        "Meal not found",
        HttpStatus.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
    let cart: CartType;

    [cart] = await db.select().from(carts).where(eq(carts.customer_id, customerId)).limit(1);

    cart ?? (
      [cart] = await db.insert(carts)
      .values({ customer_id: customerId })
      .returning()
    );

    await handler(cart.id, mealId);
    await this.calculateTotalAmount(cart.id);
    return cart;
  }
};


class CartService extends CartBase {
  addToCart = 
    async (customerId: number, mealId: number) =>
      await this.modifyCart(customerId, mealId, CartActions.add)


  removeFromCart =
    async (customerId: number, mealId: number) =>
      await this.modifyCart(customerId, mealId, CartActions.remove)
  
  incrementCart = 
    async (customerId: number, mealId: number) =>
      await this.modifyCart(customerId, mealId, CartActions.increment)

  decrementCart =
    async (customerId: number, mealId: number) =>
      await this.modifyCart(customerId, mealId, CartActions.decrement)


  getUserCart = async (customerId: number) =>
    await db.select().from(carts).where(eq(carts.customer_id, customerId));
}

export default new CartService();
