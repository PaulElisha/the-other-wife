/** @format */

import PQueue from "p-queue";

const pqueue: any = new PQueue({
 concurrency: 5,
 interval: 100,
});

pqueue.on("active", () => {
 console.log(`Lanes: ${pqueue.pending} | Waiting: ${pqueue.size}`);
});

pqueue.on("error", (error: any) => {
 console.error("Queue Job Error:", error);
});

export default pqueue;
