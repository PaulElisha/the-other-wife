/** @format */

import { relations } from "drizzle-orm";
import { index, integer, pgTable, serial, unique } from "drizzle-orm/pg-core";

import { customers } from "@module/customer/customer.schema";
import { timestamps, users } from "@module/user/user.schema.js";
import { meals } from "@module/meal/meal.schema";
import { vendors } from "../vendor/vendor.schema";

export const carts = pgTable("carts", {
  id: serial("id").primaryKey(),
  customer_id: integer("customer_id").notNull().references(() => users.id, {
    onDelete: 'cascade'
  }).unique(),
  vendor_id: integer("vendor_id").notNull().references(() => vendors.id, {
    onDelete: "cascade"
  }),
  subtotal: integer("subtotal"),
  ...timestamps
})

export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  cart_id: integer("cart_id").notNull()
    .references(() => carts.id),
  meal_id: integer("meal_id").notNull()
    .references(() => meals.id),
  price: integer("price").notNull(),
  quantity: integer("quantity").notNull(),
  total_item_price: integer("total_item_price")
}, (t) => [
  index("cartMealUnq").on(t.cart_id, t.meal_id),
]);

export type CartType = typeof carts.$inferSelect;
export type ItemType = typeof cartItems.$inferSelect;