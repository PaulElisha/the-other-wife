/** @format */

import { boolean, integer, pgTable,  serial, text, varchar  } from "drizzle-orm/pg-core";
import { timestamps } from "@module/user/user.schema.js";

export const CategoryType = {
  LOCAL: "local",
  CONTINENTAL: "continental",
  VEGAN: "vegan",
  PASTRY: "pastry",
  OTHER: "other",
} as const;

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

export const mealcategories = pgTable("mealcategories", {
  id: serial("id").primaryKey(),
  category: varchar("category", {length: 255}),
  description: varchar("description", {length: 255}),
  ...timestamps
});
