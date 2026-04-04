/** @format */

import nodemailer, { Transporter } from "nodemailer";

import type { MailData, MailerCallback } from "@type/env-types";

import Envconfig from "@/env.js";

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
      host: Envconfig.EMAIL_HOST,
      port: Envconfig.EMAIL_PORT,
      secure: true,
      auth: {
        user: Envconfig.EMAIL_USER,
        pass: Envconfig.EMAIL_PASSWORD,
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
