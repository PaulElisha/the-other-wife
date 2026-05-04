/** @format */

import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: [
    "./src/module/user/user.schema.ts",
    "./src/module/address/address.schema.ts",
    "./src/module/cart/cart.schema.ts",
    "./src/module/cartItems/cart.schema.ts",
    "./src/module/checkout/checkout.schema.ts",
    "./src/module/checkoutItems/checkout.schema.ts",
    "./src/module/onboarding/onboarding.schema.ts",
    "./src/module/customer/customer.schema.ts",
    "./src/module/meal/meal.schema.ts",
    "./src/module/vendor/vendor.schema.ts",
    "./src/module/meal/category.schema.ts",
    "./src/module/meal/mealCategory.schema.ts",
    "./src/module/onboarding/onboarding.schema.ts"
  ],
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DB_URL!
  },
});
