/** @format */

import { Subject } from "rxjs";

export enum EventType {
 STEP_COMPLETED = "STEP_COMPLETED",
 ORDER_PLACED = "ORDER_PLACED",
 ORDER_ACCEPTED = "ORDER_ACCEPTED",
 ORDER_REJECTED = "ORDER_REJECTED",
 ORDER_COMPLETED = "ORDER_COMPLETED",
 ORDER_PENDING = "ORDER_PENDING",
 USER_REGISTERED = "USER_REGISTERED",
 USER_VERIFIED = "USER_VERIFIED",
}

export interface EventContract {
 event_type: string | "error";
 payload: any;
}

const eventBus$ = new Subject<EventContract>();
export default eventBus$;
