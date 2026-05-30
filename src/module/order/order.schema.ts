/** @format */

import { carts, meals, users, vendors } from "@/schema";
import {
 boolean,
 integer,
 jsonb,
 pgTable,
 serial,
 varchar,
} from "drizzle-orm/pg-core";

import { timestamps } from "../user/user.schema";

export const orders = pgTable("orders", {
 id: serial("id").primaryKey(),
 customer_id: integer("customer_id")
  .notNull()
  .references(() => users.id)
  .unique(),
 vendor_id: integer("vendor_id")
  .notNull()
  .references(() => vendors.id, { onDelete: "cascade" }),
 cart_id: integer("cart_id")
  .notNull()
  .references(() => carts.id, { onDelete: "cascade" }),
 subtotal: integer("subtotal"),
 service_charge: integer("service_charge"),
 delivery_fee: integer("delivery_fee"),
 tax_amount: integer("tax_amount"),
 discount_amount: integer("discount_amount"),
 total_amount: integer("total_amount"),
 delivery_address: jsonb("delivery_address")
  .$type<{
   label: string;
   address: string;
   city: string;
   state: string;
   country: string;
   latitude: number;
   longitude: number;
  }>()
  .notNull(),
 order_status: varchar("order_status", { length: 255 }),
 order_completed: boolean("order_completed").default(false),
 order_rejected: varchar("order_rejected", { length: 255 }),
 payment_status: varchar("payment_status", { length: 255 }),
 ...timestamps,
});

export const orderItems = pgTable("orderItems", {
 id: serial("id").primaryKey(),
 order_id: integer("order_id")
  .notNull()
  .references(() => orders.id),
 meal_id: integer("meal_id")
  .notNull()
  .references(() => meals.id),
 quantity: integer("quantity").notNull(),
 unit_price: integer("unit_price").notNull(),
 line_total: integer("line_total"),
});
