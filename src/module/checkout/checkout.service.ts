/** @format */

import db from "@/src/config/db.config";

import AddressService from "../address/address.service";
import CartService from "../cart/cart.service";
import OrderService from "../order/order.service";
import PaymentService, {
 ReturnPaystackData,
 Transaction,
} from "../payment/payment.service";

import { checkoutItems, checkouts } from "./checkout.schema";
import { eq, and, gt, or } from "drizzle-orm";
import { PublishEvent } from "@/src/shared/event-bus/publisher";
import { EventType } from "@/src/shared/event-bus/config";
import NotFoundException from "@/src/shared/error/not-found-exception";
import HttpStatus from "@/src/shared/enum/http";
import ErrorCode from "@/src/shared/enum/error-code";
import { users } from "@/schema";
import Env from "@/src/config/env.config";
import z, { email } from "zod";
import { payments } from "../payment/payment.schema";

export enum CheckOutStatus {
 OPEN = "OPEN",
 COMPLETED = "COMPLETED",
 EXPIRED = "EXPIRED",
}

const THRESHOLD = 10000;
const DYNAMIC_FEES_IN_PERCENT = {
 high: 0.05,
 low: 0.025,
};

function rateCheck(subtotal: number): number {
 let rate: number;
 if (subtotal < THRESHOLD) {
  rate = subtotal * DYNAMIC_FEES_IN_PERCENT["high"];
 } else {
  rate = subtotal * DYNAMIC_FEES_IN_PERCENT["low"];
 }

 return rate;
}

class CheckOutService {
 constructor(
  protected cartService: typeof CartService,
  protected addressService: typeof AddressService,
  protected orderService: typeof OrderService,
  protected paymentService: typeof PaymentService,
 ) {}

 proceedToCheckout = async (userId: number) => {
  const { cart, cart_items } = await this.cartService.getUserCart(userId);
  const currentUserAddress = (
   await this.addressService.getUserAddresses(userId)
  ).defaultAddress;

  const total_amount = rateCheck(cart.subtotal || 0);

  return await db.transaction(async (tx: Transaction) => {
   const [checkOut] = await tx
    .insert(checkouts)
    .values({
     customer_id: userId,
     cart_id: cart.id,
     shipping_address: {
      label: currentUserAddress.label,
      address: currentUserAddress.address,
      city: currentUserAddress.city,
      state: currentUserAddress.state,
      country: currentUserAddress.country,
      latitude: currentUserAddress.latitude,
      longitude: currentUserAddress.longitude,
     } as any,
     vendor_id: cart.vendor_id,
     status: CheckOutStatus.OPEN,
     subtotal: cart.subtotal,
     total_amount: total_amount,
     expired_at: new Date(Date.now() + 60 * 60 * 24 * 7),
    })
    .returning();

   let checkOutItems;

   for (const item of cart_items) {
    checkOutItems = await tx
     .insert(checkoutItems)
     .values({
      checkout_id: checkOut.id,
      item_id: item.id,
      total_price: item.total_item_price,
      quantity: item.quantity,
      priceAtCheckout: item.price,
     })
     .returning();
   }

   return { checkOut, checkOutItems };
  });
 };

 confirmCheckout = async (
  checkOutId: number,
  userId: number,
  channel: string,
 ) => {
  await db
   .transaction(async (tx: Transaction) => {
    const [{ email }] = await tx
     .select({
      email: users.email,
     })
     .from(users)
     .where(eq(users.id, userId))
     .limit(1);

    const [currentCheckout] = await tx
     .select()
     .from(checkouts)
     .where(
      and(
       eq(checkouts.id, checkOutId),
       gt(checkouts.expired_at, new Date(Date.now())),
      ),
     )
     .limit(1);

    if (!currentCheckout || currentCheckout.status !== CheckOutStatus.OPEN)
     throw new NotFoundException(
      "Checkout already completed or expired",
      HttpStatus.NOT_FOUND,
      ErrorCode.RESOURCE_NOT_FOUND,
     );

    const { order, order_items } = await this.orderService.createOrder(tx)(
     checkOutId,
     userId,
    );

    const paymentData = {
     amount: <number>currentCheckout?.total_amount,
     channel: [channel],
    };

    const payment = await this.paymentService.createPayment(tx)(
     userId,
     order?.id,
     paymentData,
    );

    const data: z.infer<typeof ReturnPaystackData> =
     await this.paymentService.initializePayment({
      email,
      amount: <number>currentCheckout?.total_amount,
      reference: <string>payment?.payment_reference,
      metadata: {
       orderId: order.id,
       paymentId: payment.id,
      },
      paystackSecretKey: Env.PAYSTACK_SECRET_KEY,
     });

    await db
     .update(payments)
     .set({
      access_code: data?.access_code,
      authorization_url: data?.authorization_url,
     })
     .where(eq(payments.id, payment.id));

    return { orderId: order.id };
   })
   .then((r) => {
    PublishEvent({
     event_type: EventType.ORDER_PLACED,
     payload: {
      orderId: r.orderId,
      userId: userId,
     },
    });

    return r;
   });
 };
}

export default new CheckOutService(
 CartService,
 AddressService,
 OrderService,
 PaymentService,
);
