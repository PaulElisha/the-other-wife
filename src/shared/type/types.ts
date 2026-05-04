/** @format */

import { CartType, ItemType } from "@module/cart/cart.schema";
import HttpStatus from "@config/http.config.js";
import ErrorCode from "@enum/error-code";
import { CategoryType } from "@/src/module/meal/mealCategory.schema";

import { Transporter } from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import { MealSchemaType } from "@module/meal/meal.schema.js";
import z from "zod";

export type MailerCallback = (transporter: Transporter, data: MailData) => Promise<Mail>;

export type MailData = {
  user: any;
  message: string;
};

export type HttpStatusCodeType = (typeof HttpStatus)[keyof typeof HttpStatus];

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];

export type CartAction = (cartId: number, mealId: number) => void;


export type CategoryValueType = (typeof CategoryType)[keyof typeof CategoryType];