
/** @format */

import AUTH_CONSTANTS from "@/src/shared/constants/auth.js";

import { boolean, pgEnum, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";

export const statusEnum = pgEnum("status", ["inactive", "active", "suspended", "deleted"]);
export const typeEnum = pgEnum("user_type", ["customer", "vendor", "admin"]);
export const authEnum = pgEnum("auth_type", ["email", "phone_number"]);

export const timestamps = {
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
}

export const users = pgTable("users", {
  id: serial("id").primaryKey().notNull(),
  first_name: varchar("first_name", {length: 255}),
  last_name: varchar("last_name", {length: 255}),
  email: varchar("email", {length: 255}).notNull().unique(),
  email_token: varchar("email_token", {length: 255}),
  email_token_ms: varchar("email_token_ms", {length: 255}),
  refresh_token: varchar("refresh_token", {length: 255}),
  refresh_token_ms: varchar("refresh_token_ms", {length: 255}),
  password: varchar("password", {length: 255}),
  phone_number: varchar("phone_number", {length: 255}),
  status: statusEnum().default("inactive"),
  user_type: typeEnum("user_type").default("customer"),
  auth_type: authEnum("auth_type").default("email"),
  email_verified: boolean("email_verified").default(false),
  phone_verified: boolean("phone_verified").default(false),
  lastLogin: timestamp(),
  ...timestamps
});