/** @format */

import type { MailData } from "@/src/shared/type/types";
import { MailAction } from "@module/email/email.dispatcher.js";
import Mailer from "@module/email/email.service.js";

import { TUserSchema } from "../user/user.schema";

export async function EmailWorker<T extends TUserSchema>(
 task: MailData<T>,
 max: number = 3,
) {
 let attempts = 0;
 while (attempts < max) {
  try {
   await Mailer.relayTo(MailAction.verifySignup)(task);
  } catch (err) {
   attempts++;
   console.error(`Attempt ${attempts} failed`);
   if (attempts < max) await new Promise((res) => setTimeout(res, 1000));
  }
 }
}

export default EmailWorker;
