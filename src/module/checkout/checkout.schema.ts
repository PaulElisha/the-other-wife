/** @format */

import { carts } from "@/schema";
import {
 integer,
 jsonb,
 pgTable,
 serial,
 timestamp,
 varchar,
} from "drizzle-orm/pg-core";

import { meals } from "../meal/meal.schema";
import { timestamps, users } from "../user/user.schema";
import { vendors } from "../vendor/vendor.schema";

export const checkouts = pgTable("checkouts", {
 id: serial("id").primaryKey(),
 customer_id: integer("customer_id")
  .notNull()
  .references(() => users.id),
 cart_id: integer("cart_id")
  .notNull()
  .references(() => carts.id),
 shipping_address: jsonb("shipping_address").$type<{
  label: string;
  address: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
 }>(),
 vendor_id: integer("vendor_id")
  .notNull()
  .references(() => vendors.id),

 status: varchar("status", { length: 255 }),

 subtotal: integer("subtotal").default(0),
 discount: integer("discount").default(0),
 tax: integer("tax").default(0),
 total_amount: integer("total_amount").default(0),
 expired_at: timestamp("expired_at", { mode: "date" }).notNull(),
 ...timestamps,
});

export const checkoutItems = pgTable("checkout_items", {
 id: serial("id").primaryKey(),
 checkout_id: integer("checkout_id")
  .notNull()
  .references(() => checkouts.id),
 item_id: integer("item_id")
  .notNull()
  .references(() => meals.id),
 total_price: integer("total_price"),
 quantity: integer("quantity"),
 priceAtCheckout: integer("price_at_checkout").notNull(),
});
