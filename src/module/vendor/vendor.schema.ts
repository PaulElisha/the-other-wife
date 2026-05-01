
import { json, pgEnum, pgTable, serial, timestamp, varchar, integer, boolean, jsonb } from "drizzle-orm/pg-core"
import {} from "drizzle-orm";

import { timestamps, users } from "@module/user/user.schema.js";
import { addresses } from "@module/address/address.schema.js";

export const vendors = pgTable("vendors", {
  id: serial("id").notNull().primaryKey(),
  user_id: integer("user_id").notNull().references(() => users.id, {
    onDelete: "cascade"
  }),
  address_id: integer("address_id").references(() => addresses.id, {
    onDelete: "cascade"
  }),
  business_name: varchar("business_name", {length: 255}),
  business_desc: varchar("business_desc", {length: 255}),
  business_logo: varchar("business_logo", {length: 255}),
  approved_by: integer("approved_by").references(() => users.id, {
    onDelete: "cascade"
  }),
  approval_status: varchar("approval_status", {length: 255}),
  approved_at: timestamp("approved_at", {mode: "date"}).defaultNow(),
  rejection: varchar("rejection", {length: 255}),
  additional_data: jsonb("addtional_data").$type<Record<string, unknown>>(),
  ...timestamps
});

export type VendorSchema = typeof vendors.$inferSelect;
