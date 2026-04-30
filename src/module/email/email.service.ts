/** @format */

import nodemailer from "nodemailer";

import type { MailData, MailerCallback } from "@/src/shared/type/types";

import Env from "@config/env.config.js";

export const MailHeading = () => ({
  welcomeUser: "Welcome to TheOtherWife – Your Comfort Food Journey Starts Here!",
  verifySignup: "Verify Your Email",
  forgotPassword: "Forgot Password",
  passwordReset: "Password Reset",
});

export const MailSubject = MailHeading();

class EmailService {
  private transporter: any;

  relayTo = (callback: MailerCallback) => {
    this.transporter = nodemailer.createTransport({
      host: Env.EMAIL_HOST,
      port: Env.EMAIL_PORT,
      secure: true,
      auth: {
        user: Env.EMAIL_USER,
        pass: Env.EMAIL_PASS,
      },
    });

    return (data: MailData) => {
      try {
        return callback(this.transporter, data);
      } catch (error) {
        throw error;
      }
    };
  };
}

export default new EmailService();
