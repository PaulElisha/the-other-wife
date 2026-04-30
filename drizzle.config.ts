/** @format */

import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: [
    "./src/module/user/user.schema.ts",
    "./src/module/address/address.schema.ts",
    "./src/module/cart/cart.schema.ts",
    "./src/module/customer/customer.schema.ts",
    "./src/module/meal/meal.schema.ts",
    "./src/module/vendor/vendor.schema.ts",
    "./src/module/category/category.schema.ts",
    "./src/shared/model/mealCategory.schema.ts"
  ],
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DB_URL!
  },
});
