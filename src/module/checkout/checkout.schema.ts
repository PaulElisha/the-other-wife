import { integer, pgTable, serial, text, varchar, decimal, timestamp } from "drizzle-orm/pg-core";
import { timestamps, users } from "../user/user.schema";
import { addresses } from "../address/address.schema";
import { vendors } from "../vendor/vendor.schema";
import { meals } from "../meal/meal.schema";



export const checkouts = pgTable("checkouts", {
 id: serial("id").primaryKey(),
 user_id: integer("user_id").notNull().references(() => users.id),
 shipping_address: text("shipping_address"),
 vendor_id: integer("vendor_id").notNull().references(() => vendors.id),

 status: varchar("status", {length: 255}),

 subtotal: integer("subtotal").default(0),
 discount: integer("discount").default(0),
 tax: integer("tax").default(0),
 total_amount: integer("total_amount").default(0),
 expired_at: timestamp("expired_at",  {mode: "date", }).notNull(),
 ...timestamps
})

export const checkoutItems = pgTable("checkout_items", {
 id: serial("id").primaryKey(),
 checkout_id: integer("checkout_id").notNull().references(() => checkouts.id),
 item_id: integer("item_id").notNull().references(() => meals.id),
 total_price: integer("total_price"),
 quantity: integer("quantity"),
 priceAtCheckout: integer("price_at_checkout").notNull(),
});