/** @format */

import type { MailData, MailerCallback } from "@/src/shared/type/types";
import Env from "@config/env.config.js";
import { MailSubject } from "@module/email/email.service.js";
import type { Transporter } from "nodemailer";

import { TUserSchema } from "../user/user.schema";

export const MailAction: Record<string, MailerCallback> = {
 verifySignup: <T extends TUserSchema>(
  transporter: Transporter,
  data: MailData<T>,
 ) => {
  const { user, message } = data;
  return transporter.sendMail({
   from: `"Peace from TheOtherWife" <${Env.EMAIL_USER}>`,
   to: user.email,
   subject: MailSubject.verifySignup,
   html: message,
  });
 },
 welcomeUser: <T extends TUserSchema>(
  transporter: Transporter,
  data: MailData<T>,
 ) => {
  const { user, message } = data;
  return transporter.sendMail({
   from: `"Peace from TheOtherWife" <${Env.EMAIL_USER}>`,
   to: user.email,
   subject: MailSubject.welcomeUser,
   html: message,
  });
 },
 forgotPassword: <T extends TUserSchema>(
  transporter: Transporter,
  data: MailData<T>,
 ) => {
  const { user, message } = data;
  return transporter.sendMail({
   from: `"Peace from TheOtherWife" <${Env.EMAIL_USER}>`,
   to: user.email,
   subject: MailSubject.forgotPassword,
   html: message,
  });
 },
 passwordReset: <T extends TUserSchema>(
  transporter: Transporter,
  data: MailData<T>,
 ) => {
  const { user, message } = data;
  return transporter.sendMail({
   from: `"Peace from TheOtherWife" <${Env.EMAIL_USER}>`,
   to: user.email,
   subject: MailSubject.passwordReset,
   html: message,
  });
 },
};
