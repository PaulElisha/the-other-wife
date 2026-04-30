/** @format */

import { boolean, integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { timestamps, users } from "@module/user/user.schema.js";

export const addresses = pgTable("addresses", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id, {onDelete: "cascade"}),
  address: varchar("address", {length: 255}),
  label: varchar("label", {length: 255}),
  city: varchar("city", {length: 255}),
  state: varchar("state", {length: 255}),
  country: varchar("country", {length: 255}),
  postal_code: varchar("postal_code", {length: 255}),
  latitude: integer("latitude"),
  longitude: integer("longitude"),
  is_default: boolean("is_default").default(false),
  ...timestamps
});