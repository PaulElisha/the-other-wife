/** @format */

import { integer, pgTable, serial, varchar } from "drizzle-orm/pg-core"
import {createInsertSchema, createSelectSchema} from "drizzle-zod"
import { relations } from "drizzle-orm";

import { timestamps, users } from "@module/user/user.schema.js";
import {addresses} from "@module/address/address.schema.js"

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull().references(() => users.id, {
    onDelete: 'cascade'
  }),
  address_id: integer("address_id").references(() => addresses.id, {
    onDelete: "cascade"
  }),
  profile_image: varchar("profile_image", {length: 255}),
  ...timestamps
})