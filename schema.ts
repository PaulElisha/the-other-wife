/** @format */

import { addresses } from "@module/address/address.schema.js";
import { cartItems, carts } from "@module/cart/cart.schema.js";
import { checkoutItems, checkouts } from "@module/checkout/checkout.schema.js";
import { customers } from "@module/customer/customer.schema.js";
import { category, mealcategories, meals } from "@module/meal/meal.schema.js";
import {
 onboarding,
 onboarding_status,
} from "@module/onboarding/onboarding.schema.js";
import { users } from "@module/user/user.schema.js";
import { vendors } from "@module/vendor/vendor.schema.js";

import { orderItems, orders } from "./src/module/order/order.schema";

export {
 users,
 addresses,
 carts,
 cartItems,
 checkouts,
 checkoutItems,
 customers,
 vendors,
 mealcategories,
 meals,
 category,
 onboarding,
 onboarding_status,
 orders,
 orderItems,
};
