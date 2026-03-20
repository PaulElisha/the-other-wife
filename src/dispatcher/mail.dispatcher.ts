/** @format */

import { Transporter } from "nodemailer";
import { MailData } from "../services/email.service.ts";
import { MailSubject } from "../services/email.service.ts";
import { from } from "../constants/env.ts";

export type MailerCallback = (transporter: Transporter, data: MailData) => void;

export const MailAction: Record<string, MailerCallback> = {
  verifySignup: (transporter: Transporter, data: MailData) => {
    const { user, message } = data;
    return transporter.sendMail({
      from: `"Peace from TheOtherWife" <${from}>`,
      to: user.email,
      subject: MailSubject.verifySignup,
      html: message,
    });
  },
  welcomeUser: (transporter: Transporter, data: MailData) => {
    const { user, message } = data;
    return transporter.sendMail({
      from: `"Peace from TheOtherWife" <${from}>`,
      to: user.email,
      subject: MailSubject.welcomeUser,
      html: message,
    });
  },
  forgotPassword: (transporter: Transporter, data: MailData) => {
    const { user, message } = data;
    return transporter.sendMail({
      from: `"Peace from TheOtherWife" <${from}>`,
      to: user.email,
      subject: MailSubject.forgotPassword,
      html: message,
    });
  },
  passwordReset: (transporter: Transporter, data: MailData) => {
    const { user, message } = data;
    return transporter.sendMail({
      from: `"Peace from TheOtherWife" <${from}>`,
      to: user.email,
      subject: MailSubject.passwordReset,
      html: message,
    });
  },
};
