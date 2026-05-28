/** @format */

import {
 date,
 integer,
 jsonb,
 pgTable,
 serial,
 timestamp,
 uuid,
 varchar,
} from "drizzle-orm/pg-core";
import { orders, users } from "@/schema";
import { timestamps } from "../user/user.schema";

export const payments = pgTable("payments", {
 id: serial("id").primaryKey(),
 order_id: integer("order_id")
  .notNull()
  .references(() => orders.id)
  .unique(),
 customer_id: integer("customer_id")
  .notNull()
  .references(() => users.id),
 amount: integer("amount"),
 currency: varchar("currency", { length: 255 }),
 status: varchar("status", { length: 255 }),
 attempts: integer("attempts"),
 channels: jsonb("channels").$type<string[]>(),
 payment_reference: uuid().generatedAlwaysAs("payment_reference"),
 payment_provider: varchar("payment_provider", { length: 255 }).default(
  "paystack",
 ),
 access_code: varchar("access_code", { length: 255 }),
 authorization_url: varchar("authorization_url", { length: 255 }),
 transaction_id: varchar("transaction_id", { length: 255 }),
 paidAt: timestamp("paidAt", { mode: "date" }).notNull().defaultNow(),
 ...timestamps,
});
