/** @format */

import { eq, sql, and  } from "drizzle-orm";
import HttpStatus from "@config/http.config.js";
import ErrorCode from "@enum/error-code.js";
import NotFoundException from "@error/not-found-exception.js";
import { cartItems, carts, CartType } from "@module/cart/cart.schema.js";
import CartActions from "@module/cart/cart.dispatcher.js";
import { meals } from "@module/meal/meal.schema.js";
import type { CartAction } from "@type/types.js"
import db from "@config/db.config.js";
import { customers } from "../customer/customer.schema";
import BadRequestException from "@/src/shared/error/bad-request-exception";

class CartBase {
  calculateTotalAmount = async (cartId: number, customerId: number) => {
    await db.transaction(async (tx) => {
      const [result] = await tx
      .select({
        subtotal: sql<number>`COALESCE(SUM(${cartItems.total_item_price}), 0)`
      })
      .from(cartItems)
      .where(eq(cartItems.cart_id, cartId));
  
      await tx.update(carts)
      .set({
        subtotal: result.subtotal
      })
      .where(
        and(
        eq(carts.id, cartId),
        eq(customers.id, customerId)
        )
      ).returning()
    })
  };

  modifyCart = async (
    customerId: number,
    mealId: number,
    modifier: CartAction,
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

    if(meal.vendor_id != cart.vendor_id) {
      throw new BadRequestException(
        "Only meals from a single vendor is allowed in a cart",
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR
      )
    }

    cart ?? (
      [cart] = await db.insert(carts)
      .values({ 
        customer_id: customerId,
        vendor_id: meal.vendor_id,
      })
      .returning()
    );

    await modifier(cart.id, meal.id);
    await this.calculateTotalAmount(cart.id, customerId);
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


  getUserCart = async (customerId: number) => {
    const result = await db.select().from(carts).innerJoin(cartItems, eq(carts.id, cartItems.cart_id)).where(
        eq(carts.customer_id, customerId)
      )

    return {
      cart: result[0].carts,
      cart_items: result.map(r => r.cart_items)
    }
  }

  clearCart = async (customerId: number, cartId: number) => {

    const cart = await db.select()
    .from(carts)
    .where(
      and(
        eq(carts.id, cartId),
        eq(carts.customer_id, customerId)
      )
    )
    .limit(1);

    if (cart.length === 0) {
      throw new Error("Cart not found or doesn't belong to this customer");
    }

    const deletedItems = await db.delete(cartItems)
    .where(eq(cartItems.cart_id, cartId))
    .returning();

    return deletedItems;
  }
}

export default new CartService();
