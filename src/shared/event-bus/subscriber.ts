/** @format */

import { catchError, filter, map, of, retry } from "rxjs";
import eventBus$, { EventType } from "./config";

export const SubscribeEvent = (event_type: EventType) => {
 return eventBus$.asObservable().pipe(
  filter((e) => {
   const hasEventType = e.event_type === event_type;
   const hasValidPayload =
    e.payload &&
    typeof e.payload === "object" &&
    ("userId" in e.payload || "vendorId" in e.payload);
   return hasEventType && hasValidPayload;
  }),
  map((update) => update.payload),
  retry(2),
  catchError((err) => {
   console.error("SSE Stream Error:", err);
   return of('event: error\ndata: {"msg": "Stream disconnected"}\n\n');
  }),
 );
};
