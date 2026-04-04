/** @format */

import { MailAction } from "@service/email/mail-dispatcher.js";
import Mailer from "@service/email/email-service.js";
import type { MailData } from "@type/env-types";

async function* EmailWorker(task: MailData) {
  let attempts = 0;
  const max = 3;

  while (attempts < max) {
    try {
      yield await Mailer.relayTo(MailAction.verifySignup)(task);
      return;
    } catch (err) {
      attempts++;
      console.error(`Attempt ${attempts} failed`);
      if (attempts < max) await new Promise((res) => setTimeout(res, 1000));
    }
  }
}

export default EmailWorker;
