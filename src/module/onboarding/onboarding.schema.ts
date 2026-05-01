
import { serial, varchar, integer, jsonb, pgTable, text, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { vendors } from "@module/vendor/vendor.schema.js";
import { timestamps } from "@module/user/user.schema.js";
import { json } from "zod";

export const onboarding = pgTable("onboarding", {
 id: serial("id").notNull().primaryKey(),
 vendorId: integer("vendorId").notNull().references(
  () => vendors.id, {onDelete: "cascade"}).unique(),

 state: varchar("state", {length: 255}),
 city: varchar("city", {length: 255}),
 address: varchar("address", {length: 255}),
 instagram: varchar("instagram", {length: 255}),
 facebook: varchar("facebook", {length: 255}),
 twitter: varchar("twitter", {length: 255}),

 years_of_experience: integer("years_of_experience"),
 cuisines: jsonb("cuisines").$type<string[]>(),
 bank_name: text("bank_name"),
 account_number: text("account_number"),
 is_verified: boolean("is_verified").default(false),

 governmentId: varchar("governmentId", {length: 255}),
 business_certificate: jsonb("business_certificate").$type<{}>(),
 display_image: jsonb("display_image").$type<{}>(),
 confirmed_accuracy: boolean("confirmed_accuracy"),
 accepted_terms: boolean("accepted_terms").default(false),
 accepted_verification:  boolean("accepted_verification").default(false),

 completed_at: timestamp("completed_at", { mode: "date" }),
 updated_at: timestamp("updated_at", {mode: "date"})
});

const stepsEnum = pgEnum("stepsEnum", ["1", "2", "3"]);

export const onboarding_status = pgTable("onboarding_status", {
 id: serial("id").notNull().primaryKey(),
 onboardingId: integer("onboardingId").notNull().references(() => 
  onboarding.id, {onDelete: "cascade"}).unique(),
 steps: stepsEnum("steps").default("1"),
 step1_completed: boolean("step1_completed").default(false),
 step2_completed: boolean("step2_completed").default(false),
 step3_completed: boolean("step3_completed").default(false),
 submitted_at: timestamp("submitted_at", { mode: "date" }).defaultNow(),
 updated_at: timestamp("updated_at", {mode: "date"}).defaultNow(),
})

export const OnboardingSchema = createSelectSchema(onboarding);
export const OnboardingStatus = createSelectSchema(onboarding_status);