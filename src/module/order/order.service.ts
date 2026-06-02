/** @format */

import { checkoutItems, checkouts, users } from "@/schema";
import db from "@/src/config/db.config";
import ErrorCode from "@/src/shared/enum/error-code";
import HttpStatus from "@/src/shared/enum/http";
import BadRequestException from "@/src/shared/error/bad-request-exception";
import { EventType } from "@/src/shared/event-bus/config";
import { PublishEvent } from "@/src/shared/event-bus/publisher";
import { and, eq, ne } from "drizzle-orm";

import { Transaction } from "../payment/payment.service";
import { orderItems, orders } from "./order.schema";

export enum OrderStatus {
 ORDER_PLACED = "ORDER_PLACED",
 ORDER_ACCEPTED = "ORDER_ACCEPTED",
 ORDER_REJECTED = "ORDER_REJECTED",
 ORDER_COMPLETED = "ORDER_COMPLETED",
 ORDER_PENDING = "ORDER_PENDING",
}

export enum PaymentStatus {
 PENDING = "PENDING",
 SUCCEEDED = "SUCCEEDED",
}

class OrderService {
 constructor() {}

 createOrder = (tx: Transaction) => {
  return async (checkoutId: number, userId: number) => {
   const result = await tx
    .select()
    .from(checkouts)
    .innerJoin(checkoutItems, eq(checkouts.id, checkoutItems.checkout_id))
    .where(and(eq(checkouts.id, checkoutId), eq(users.id, userId)));

   const [order] = await tx
    .insert(orders)
    .values({
     customer_id: userId,
     vendor_id: result[0].checkouts.vendor_id,
     cart_id: result[0].checkouts.cart_id,
     subtotal: result[0].checkouts.subtotal,
     discount_amount: result[0].checkouts.discount,
     tax_amount: result[0].checkouts.tax,
     delivery_address: {
      label: "mobile",
      address: result[0].checkouts.shipping_address,
      city: result[0].checkouts.shipping_address?.city,
      state: result[0].checkouts.shipping_address?.state,
      country: result[0].checkouts.shipping_address?.country,
      latitude: result[0].checkouts.shipping_address?.latitude,
      longitude: result[0].checkouts.shipping_address?.longitude,
     } as any,
     order_status: OrderStatus.ORDER_PLACED,
     payment_status: PaymentStatus.PENDING,
    })
    .returning();

   let order_items;

   for (const item of result.map((c: any) => c.checkout_items)) {
    order_items = await tx
     .insert(orderItems)
     .values({
      order_id: order.id,
      meal_id: item.item_id,
      unit_price: <number>item.priceAtCheckout,
      quantity: <number>item.quantity,
      // line_total: 0,
     })
     .returning();
   }

   return {
    order,
    order_items,
   };
  };
 };

 getUserOrders = async (customerId: number) => {
  const [userOrders] = await db
   .select()
   .from(orders)
   .innerJoin(orderItems, eq(orderItems.order_id, orders.id))
   .where(eq(orders.customer_id, customerId));

  return userOrders;
 };

 getVendorOrders = async (vendorId: number) => {
  const vendorOrders = await db
   .select()
   .from(orders)
   .innerJoin(orderItems, eq(orders.id, orderItems.order_id))
   .where(and(eq(orders.vendor_id, vendorId), ne(orders.order_completed, true)))
   .orderBy(orders.created_at);

  return {
   vendororders: vendorOrders[0].orders,
   orderitems: vendorOrders.map((o) => o.orderItems),
  };
 };

 acceptOrder = async (vendorId: number, orderId: number) => {
  await db
   .transaction(async (tx: Transaction) => {
    const vendorOrder = await db
     .select()
     .from(orders)
     .where(and(eq(orders.id, orderId), ne(orders.customer_id, vendorId)));

    if (vendorOrder[0].order_completed) {
     throw new BadRequestException(
      "Order fulfilled",
      HttpStatus.BAD_REQUEST,
      ErrorCode.INTERNAL_SERVER_ERROR,
     );
    }

    const [acceptedOrder] = await db
     .update(orders)
     .set({
      order_status: OrderStatus.ORDER_ACCEPTED,
     })
     .returning();

    return acceptedOrder;
   })
   .then((o) => {
    PublishEvent({
     event_type: EventType.ORDER_ACCEPTED,
     payload: {
      orderId,
      status: o.order_status,
      userId: vendorId,
     },
    });
   });
 };

 rejectOrder = async (vendorId: number, orderId: number, reason: string) => {
  await db
   .transaction(async (tx: Transaction) => {
    const vendorOrder = await tx
     .select()
     .from(orders)
     .where(and(eq(orders.id, orderId), ne(orders.customer_id, vendorId)));

    if (vendorOrder[0].order_rejected !== "undefined") {
     throw new BadRequestException(
      "Order already rejected",
      HttpStatus.BAD_REQUEST,
      ErrorCode.INTERNAL_SERVER_ERROR,
     );
    }

    const [rejectedOrder] = await tx
     .update(orders)
     .set({
      order_rejected: reason,
      order_status: OrderStatus.ORDER_REJECTED,
     })
     .returning();

    return rejectedOrder;
   })
   .then((o) => {
    PublishEvent({
     event_type: EventType.ORDER_REJECTED,
     payload: {
      orderId,
      status: o.order_status,
      reason: o.order_rejected,
      userId: vendorId,
     },
    });
   });
 };
}

export default new OrderService();
