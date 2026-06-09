/** @format */

import EmailWorker from "./email.worker";
import { onEvent } from "@shared/event-bus/consumer";
import { EventContract, EventType } from "@shared/event-bus/config";

onEvent<EventContract>(EventType.USER_REGISTERED).subscribe({
 next: async (payload) => {
  await EmailWorker({
   user: payload.payload.user,
   message: payload.payload.message,
  });
 },
 error: (error) => {
  console.error(error);
 },
});
