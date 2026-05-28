/** @format */

import { timestamps } from "@module/user/user.schema.js";
import { vendors } from "@module/vendor/vendor.schema.js";
import {
 boolean,
 integer,
 pgTable,
 serial,
 text,
 varchar,
} from "drizzle-orm/pg-core";

/** @format */
export const meals = pgTable("meals", {
 id: serial("id").notNull().primaryKey(),
 vendor_id: integer("vendor_id")
  .notNull()
  .references(() => vendors.id, {
   onDelete: "cascade",
  }),
 category_id: integer("category_id")
  .notNull()
  .references(() => category.id, {
   onDelete: "cascade",
  }),
 name: varchar("name", { length: 255 }).notNull(),
 category_name: varchar("category_name", { length: 255 }).notNull(),
 description: text("description").notNull(),
 price: integer("price").notNull(),
 available: varchar("available").default("pending"),
 available_from: varchar("available_from", { length: 255 }).notNull(),
 available_till: varchar("available_till", { length: 255 }).notNull(),
 primary_image: varchar("primary_image", { length: 255 }).notNull(),
 additional_images: varchar("additional_images", { length: 255 }).array(),
 tags: varchar("tags", { length: 255 }).array().notNull(),
 prep_time: varchar("prep_time", { length: 255 }),
 serving_size: varchar("serving_size", { length: 255 }),
 additional_data: varchar("additional_data", { length: 255 }),
 is_deleted: boolean("is_deleted").default(false),
 ...timestamps,
});
export type MealSchemaType = typeof meals.$inferSelect;

export const CategoryType = {
 LOCAL: "local",
 CONTINENTAL: "continental",
 VEGAN: "vegan",
 PASTRY: "pastry",
 OTHER: "other",
} as const;

export const category = pgTable("category", {
 id: serial("id").notNull().primaryKey(),
 name: varchar("name", { length: 255 }),
 slug: varchar("slug", { length: 255 }),
 description: text("description"),
 icon: varchar("icon", { length: 255 }),
 display_order: integer("display_order").default(0),
 is_active: boolean("is_active").default(false),
 ...timestamps,
});

export const mealcategories = pgTable("mealcategories", {
 id: serial("id").primaryKey(),
 category: varchar("category", { length: 255 }),
 description: varchar("description", { length: 255 }),
 ...timestamps,
});
