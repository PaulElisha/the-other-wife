import db from "@/src/config/db.config";
import { carts } from "../cart/cart.schema"
import CartService from "../cart/cart.service";
import { checkoutItems, checkouts } from "./checkout.schema";
import AddressService from "../address/address.service";

export const CheckOutStatus = {
 OPEN: "open",
 COMPLETED: "completed",
 EXPIRED: "expired"
} as const;

const THRESHOLD = 10000;
const DYNAMIC_FEES_IN_PERCENT = {
 high: 0.05,
 low: 0.025
}

function rateCheck(subtotal: number): number {
 let rate: number;
 if(subtotal < THRESHOLD) {
  rate = subtotal * DYNAMIC_FEES_IN_PERCENT['high'];
 } else {
  rate = subtotal * DYNAMIC_FEES_IN_PERCENT['low']
 }

 return rate;
}


class CheckOutService {
 initializeCheckout = async (customerId: number) => {
  const userCart = await CartService.getUserCart(customerId);
  const {defaultAddress, } = await AddressService.getUserAddresses(customerId);

  const total_amount = rateCheck(userCart.cart.subtotal || 0)

  const [checkout] = await db.insert(checkouts).values({
   user_id: customerId,
   shipping_address: defaultAddress.address,
   vendor_id: userCart.cart.vendor_id,
   status: CheckOutStatus.OPEN,
   subtotal: userCart.cart.subtotal,
   total_amount: total_amount,
   expired_at: new Date(Date.now() + 60 * 60 * 24 * 7)
  }).returning();

  let checkout_items;

  for (const item of userCart.cart_items) {
   checkout_items = await db.insert(checkoutItems).values({
    checkout_id: checkout.id,
    item_id: item.id,
    total_price: item.total_item_price,
    quantity: item.quantity,
    priceAtCheckout: item.price
   }).returning();
  }

  return {
   checkout,
   checkout_items
  }
 }

 createPayment = async () => {}
}

export default new CheckOutService()