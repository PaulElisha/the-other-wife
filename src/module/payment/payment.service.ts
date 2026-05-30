/** @format */
import { cartItems, carts, orders } from "@/schema";
import db from "@/src/config/db.config";
import Env from "@/src/config/env.config";
import ErrorCode from "@/src/shared/enum/error-code";
import HttpStatus from "@/src/shared/enum/http";
import BadRequestException from "@/src/shared/error/bad-request-exception";
import NotFoundException from "@/src/shared/error/not-found-exception";
import { EventType } from "@/src/shared/event-bus/config";
import { PublishEvent } from "@/src/shared/event-bus/publisher";
import { and, eq, isNotNull } from "drizzle-orm";
import { createHmac } from "node:crypto";
import z from "zod";

import { OrderStatus, PaymentStatus } from "../order/order.service";
import { payments } from "./payment.schema";

const InitializePaystack = z.object({
 email: z.email("Invalid email"),
 amount: z.coerce.number("Invalid amount"),
 channel: z.array(z.string()).optional(),
 callback_url: z.string().optional(),
 reference: z.string(),
 metadata: z.object({
  orderId: z.number(),
  paymentId: z.number(),
 }),
 paystackSecretKey: z.string(),
});

const PaymentData = z.object({
 amount: z.number(),
 currency: z.string().default("NG").optional(),
 channel: z.array(z.string()).optional(),
});

export const ReturnPaystackData = z.object({
 access_code: z.string(),
 authorization_url: z.string(),
 reference: z.string(),
});

const SignData = z.object({
 body: z.string(),
 signature: z.string(),
});

export type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

class PaymentService {
 constructor() {}

 createPayment = (tx: Transaction) => {
  return async (
   userId: number,
   orderId: number,
   paymentData: z.infer<typeof PaymentData>,
  ) => {
   const data = PaymentData.parse(paymentData);

   const [order] = await tx
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.customer_id, userId)))
    .limit(1);

   if (
    order.order_completed &&
    order.order_status !== OrderStatus.ORDER_PLACED &&
    order.payment_status !== PaymentStatus.PENDING
   ) {
    throw new BadRequestException(
     `Invalid order`,
     HttpStatus.BAD_REQUEST,
     ErrorCode.VALIDATION_ERROR,
    );
   }

   const [payment] = await tx
    .insert(payments)
    .values({
     order_id: orderId,
     customer_id: userId,
     amount: data.amount,
     currency: data.currency,
     status: PaymentStatus.PENDING,
     attempts: 2,
     channels: data.channel,
    })
    .returning();

   return payment;
  };
 };

 initializePayment = async (
  initData: z.infer<typeof InitializePaystack>,
 ): Promise<z.infer<typeof ReturnPaystackData>> => {
  const payload = InitializePaystack.parse(initData);

  const res = await fetch(Env.PAYSTACK_INIT_URL, {
   method: "POST",
   headers: {
    Authorization: `Bearer ${initData.paystackSecretKey}`,
    "Content-Type": "application/json",
   },
   body: JSON.stringify({
    email: payload.email,
    amount: payload.amount,
    channels: payload.channel,
    callback_url: payload.callback_url,
    reference: payload.reference,
    metadata: payload.metadata,
   }),
  });
  if (!res.status)
   throw new BadRequestException(
    "Payment Initialization error",
    HttpStatus.BAD_REQUEST,
    ErrorCode.VALIDATION_ERROR,
   );

  return (await res.json()) as any;
 };

 handlePaystackWebhook = async (
  body: string,
  signature: string,
  event: any,
 ) => {
  const validSigner = verifyValidSigner({ signature, body });

  if (!validSigner) {
   throw new BadRequestException(
    "Invalid Signer",
    HttpStatus.BAD_REQUEST,
    ErrorCode.AUTH_UNAUTHORIZED_ACCESS,
   );
  }

  if (event?.event !== "charge.success" && event?.event !== "charge.failed") {
   return { handled: false };
  }

  const reference = event?.data?.reference;

  if (!reference) {
   throw new NotFoundException(
    "No payment reference",
    HttpStatus.NOT_FOUND,
    ErrorCode.AUTH_NOT_FOUND,
   );
  }

  return await db
   .transaction(async (tx) => {
    const [payment] = await tx
     .select()
     .from(payments)
     .where(
      and(eq(payments.payment_reference, reference), isNotNull(reference)),
     );

    if (payment.status === PaymentStatus.SUCCEEDED) {
     return { handled: true, payment };
    }

    const isSuccess = event?.event === "charge.success";

    if (
     !isSuccess &&
     Number(event?.data?.amount) / Env.SCALER !== payment.amount
    ) {
     throw new BadRequestException(
      "Invalid payment amount",
      HttpStatus.BAD_REQUEST,
      ErrorCode.VALIDATION_ERROR,
     );
    }

    const [order] = await tx
     .select()
     .from(orders)
     .where(eq(orders.id, payment.order_id));

    if (payment.status === PaymentStatus.SUCCEEDED) {
     return { handled: true, payment, order };
    }

    const customerId = payment.customer_id;
    const orderId = payment.order_id;

    if (isSuccess) {
     await tx.update(payments).set({
      status: PaymentStatus.SUCCEEDED,
      transaction_id: event?.data.id,
      paidAt: new Date(Date.now()),
     });

     await tx.update(orders).set({
      order_status: OrderStatus.ORDER_COMPLETED,
      payment_status: PaymentStatus.SUCCEEDED,
      order_completed: true,
     });

     const [cart] = await tx
      .select()
      .from(carts)
      .where(eq(carts.customer_id, customerId))
      .limit(1);
     await tx.delete(cartItems).where(eq(cartItems.cart_id, cart.id));

     return {
      handled: true,
      eventType: EventType.ORDER_COMPLETED,
      orderId: order.id,
      paymentId: payment.id,
     };
    } else {
     await tx.update(payments).set({
      status: PaymentStatus.PENDING,
     });

     await tx.update(orders).set({
      payment_status: PaymentStatus.PENDING,
      order_status: OrderStatus.ORDER_PENDING,
     });
    }

    return {
     handled: true,
     eventType: EventType.ORDER_PENDING,
     payment,
     order,
    };
   })
   .then((r) => {
    if (r?.handled && r.eventType) {
     PublishEvent({
      event_type: r.eventType,
      payload: {
       userId: r.payment?.customer_id,
       orderId: r.orderId,
       paymentId: r.paymentId,
      },
     });
    }
    return r;
   });
 };
}

function verifyValidSigner(signData: z.infer<typeof SignData>): boolean {
 const signdata = SignData.parse(signData);
 const expectedSignature = createHmac("sha512", Env.PAYSTACK_SECRET_KEY)
  .update(signdata.body)
  .digest("hex");

 return expectedSignature === signdata.signature;
}

export default new PaymentService();
