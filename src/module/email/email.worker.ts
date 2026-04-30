/** @format */

import { MailAction } from "@module/email/email.dispatcher.js";
import Mailer from "@module/email/email.service.js";
import type { MailData } from "@/src/shared/type/types";

export async function EmailWorker(task: MailData, max: number = 3) {
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
