/** @format */

import { pgTable, serial, integer, varchar, text, boolean } from "drizzle-orm/pg-core";
import { timestamps } from "../user/user.schema";


export const category = pgTable("category", {
  id: serial("id").notNull().primaryKey(),
  name: varchar("name", {length: 255}),
  slug: varchar("slug", {length: 255}),
  description: text("description"),
  icon: varchar("icon", {length: 255}),
  display_order: integer("display_order").default(0),
  is_active: boolean("is_active").default(false),
  ...timestamps
});