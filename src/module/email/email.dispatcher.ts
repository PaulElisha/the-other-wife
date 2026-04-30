/** @format */

import type { Transporter } from "nodemailer";
import type { MailData, MailerCallback } from "@/src/shared/type/types";
import { MailSubject } from "@module/email/email.service.js";
import Env from "@config/env.config.js";

export const MailAction: Record<string, MailerCallback> = {
  verifySignup: (transporter: Transporter, data: MailData) => {
    const { user, message } = data;
    return transporter.sendMail({
      from: `"Peace from TheOtherWife" <${Env.EMAIL_USER}>`,
      to: user.email,
      subject: MailSubject.verifySignup,
      html: message,
    });
  },
  welcomeUser: (transporter: Transporter, data: MailData) => {
    const { user, message } = data;
    return transporter.sendMail({
      from: `"Peace from TheOtherWife" <${Env.EMAIL_USER}>`,
      to: user.email,
      subject: MailSubject.welcomeUser,
      html: message,
    });
  },
  forgotPassword: (transporter: Transporter, data: MailData) => {
    const { user, message } = data;
    return transporter.sendMail({
      from: `"Peace from TheOtherWife" <${Env.EMAIL_USER}>`,
      to: user.email,
      subject: MailSubject.forgotPassword,
      html: message,
    });
  },
  passwordReset: (transporter: Transporter, data: MailData) => {
    const { user, message } = data;
    return transporter.sendMail({
      from: `"Peace from TheOtherWife" <${Env.EMAIL_USER}>`,
      to: user.email,
      subject: MailSubject.passwordReset,
      html: message,
    });
  },
};
