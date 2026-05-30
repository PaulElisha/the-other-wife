/** @format */

import eventBus$, { EventContract } from "./config";

export const PublishEvent = (payload: EventContract) => {
 eventBus$.next(payload);
};
