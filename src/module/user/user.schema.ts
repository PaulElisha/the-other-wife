
/** @format */

import AUTH_CONSTANTS from "@/src/shared/constants/auth.js";

import { boolean, pgEnum, pgTable, serial, time, timestamp, varchar } from "drizzle-orm/pg-core";

export const statusEnum = pgEnum("status", ["inactive", "active", "suspended", "deleted"]);

export const timestamps = {
  created_at: timestamp("created_at", { mode: "date"}).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { mode: "date"}).notNull().defaultNow(),
}

export const users = pgTable("users", {
  id: serial("id").primaryKey().notNull(),
  first_name: varchar("first_name", {length: 255}).notNull(),
  last_name: varchar("last_name", {length: 255}).notNull(),
  email: varchar("email", {length: 255}).notNull().unique(),
  email_token: varchar("email_token", {length: 255}),
  email_token_ms: timestamp("email_token_ms", {mode: "date"}),
  refresh_token: varchar("refresh_token", {length: 255}),
  refresh_token_ms: timestamp("refresh_token_ms", {mode: "date"}),
  password: varchar("password", {length: 255}),
  phone_number: varchar("phone_number", {length: 255}).notNull(),
  status: statusEnum("status").default("active"),
  user_type: varchar("user_type", {length: 255}),
  auth_type: varchar("auth_type", {length: 255}).default("email"),
  email_verified: boolean("email_verified").default(false),
  phone_verified: boolean("phone_verified").default(false),
  lastLogin: timestamp("lastLogin", { mode: "date"}).defaultNow(),
  ...timestamps
});