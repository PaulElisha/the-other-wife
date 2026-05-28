/** @format */

import Env from "@config/env.config.js";
import type { EmailTransporter, MailData, MailerCallback } from "@type/types";
import nodemailer from "nodemailer";

import { TUserSchema } from "../user/user.schema";

export const MailHeading = () => ({
 welcomeUser:
  "Welcome to TheOtherWife – Your Comfort Food Journey Starts Here!",
 verifySignup: "Verify Your Email",
 forgotPassword: "Forgot Password",
 passwordReset: "Password Reset",
});

export const MailSubject = MailHeading();

class EmailService {
 protected transporter: EmailTransporter;

 constructor(transporter: EmailTransporter) {
  this.transporter = transporter;
 }

 relayTo = (callback: MailerCallback) => {
  return <T extends TUserSchema>(data: MailData<T>) => {
   try {
    return callback(this.transporter, data);
   } catch (error) {
    throw error;
   }
  };
 };
}

export default new EmailService(
 nodemailer.createTransport({
  host: Env.EMAIL_HOST,
  port: Env.EMAIL_PORT,
  secure: true,
  auth: {
   user: Env.EMAIL_USER,
   pass: Env.EMAIL_PASS,
  },
 }),
);
