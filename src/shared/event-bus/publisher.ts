/** @format */

import eventBus$, { EventContract, EventType } from "./config";

export const PublishEvent = (payload: EventContract<any>) => {
 eventBus$.next(payload);
};
