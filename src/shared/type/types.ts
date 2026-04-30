/** @format */

import { CartType, ItemType } from "@module/cart/cart.schema";
import HttpStatus from "@config/http.config.js";
import ErrorCode from "@enum/error-code";
import { CategoryType } from "@/src/shared/model/mealCategory.schema";

import { Transporter } from "nodemailer";
import Mail from "nodemailer/lib/mailer";

export type MailerCallback = (transporter: Transporter, data: MailData) => Promise<Mail>;

export type MailData = {
  user: any;
  message: string;
};

export type HttpStatusCodeType = (typeof HttpStatus)[keyof typeof HttpStatus];

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];

export type CartAction = (cartId: number, cartItem: number) => void;


export type CategoryValueType = (typeof CategoryType)[keyof typeof CategoryType];