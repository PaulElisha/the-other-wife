/** @format */

import { pgTable,  serial, varchar  } from "drizzle-orm/pg-core";
import { timestamps } from "@module/user/user.schema.js";

export const CategoryType = {
  LOCAL: "local",
  CONTINENTAL: "continental",
  VEGAN: "vegan",
  PASTRY: "pastry",
  OTHER: "other",
} as const;


export const mealcategories = pgTable("mealcategories", {
  id: serial("id").primaryKey(),
  category: varchar("category", {length: 255}),
  description: varchar("description", {length: 255}),
  ...timestamps
});
