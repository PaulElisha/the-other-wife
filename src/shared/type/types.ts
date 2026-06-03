/** @format */

import { Transaction } from "@/src/module/payment/payment.service";
import HttpStatus from "@/src/shared/enum/http.js";
import ErrorCode from "@enum/error-code";
import { UserType } from "@module/auth/auth.service.js";
import { CategoryType } from "@module/meal/meal.schema";
import { TUserSchema } from "@module/user/user.schema";
import { Transporter } from "nodemailer";
import Mail from "nodemailer/lib/mailer";

export type EmailTransporter = Transporter;

export type MailerCallback = (
 transporter: Transporter,
 data: MailData<TUserSchema>,
) => Promise<Mail>;

export interface MailData<TUserSchema> {
 user: TUserSchema;
 message: string;
}

export type UserRole = (typeof UserType)[keyof typeof UserType];

export type HttpStatusCodeType = (typeof HttpStatus)[keyof typeof HttpStatus];

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];

export type CartAction = (
 tx: Transaction,
) => (cartId: number, mealId: number) => void;

export type CategoryValueType =
 (typeof CategoryType)[keyof typeof CategoryType];
