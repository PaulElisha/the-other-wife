/** @format */

import { Subject } from "rxjs";

export enum EventType {
 STEP_COMPLETED = "STEP_COMPLETED",
 ORDER_PLACED = "ORDER_PLACED",
 ORDER_ACCEPTED = "ORDER_ACCEPTED",
 ORDER_REJECTED = "ORDER_REJECTED",
 ORDER_COMPLETED = "ORDER_COMPLETED",
 ORDER_PENDING = "ORDER_PENDING",
}

export interface EventContract<T> {
 event_type: EventType;
 payload: T;
}

const eventBus$ = new Subject<EventContract<any>>();
export default eventBus$;
