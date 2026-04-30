/** @format */

import { relations } from "drizzle-orm";
import { integer, pgTable, serial, unique } from "drizzle-orm/pg-core";

import { customers } from "@module/customer/customer.schema";
import { timestamps } from "@module/user/user.schema.js";
import { meals } from "@module/meal/meal.schema";

export const carts = pgTable("carts", {
  id: serial("id").primaryKey(),
  customer_id: integer("customer_id").notNull().references(() => customers.id, {
    onDelete: 'cascade'
  }),
  total_amount: integer("total_amount"),
  ...timestamps
})

export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  cart_id: integer("cart_id").notNull()
    .references(() => carts.id, { onDelete: "cascade" }),
  meal_id: integer("meal_id").notNull()
    .references(() => meals.id, {onDelete: "cascade"}),
  price: integer("price").notNull(),
  quantity: integer("quantity").notNull(),
  total_price: integer("total_price")
}, (t) => ({
  cartMealUnq: unique().on(t.cart_id, t.meal_id),
}));

export type CartType = typeof carts.$inferSelect;
export type ItemType = typeof cartItems.$inferSelect;