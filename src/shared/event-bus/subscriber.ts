/** @format */

import { catchError, filter, map, Observable, of, retry } from "rxjs";

import eventBus$, { EventContract } from "./config";

export interface StreamPayload {
 event: string | "error";
 data: any;
}

export const onSubscribe = <T extends StreamPayload>(
 userId: string,
): Observable<T> => {
 return (eventBus$.asObservable() as Observable<EventContract>).pipe(
  filter((update) => update?.payload?.userId === Number(userId)),
  map(
   (update): T =>
    ({
     event: update.event_type,
     data: update.payload,
    } as T),
  ),
  retry(2),
  catchError((err) => {
   console.error("SSE Stream Error:", err);
   return of({
    event: "error" as const,
    data: { msg: "Stream disconnected" },
   } as T);
  }),
 );
};
