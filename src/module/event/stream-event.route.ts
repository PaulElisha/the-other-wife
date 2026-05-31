/** @format */
import { onSubscribe, StreamPayload } from "@/src/shared/event-bus/subscriber";
import asyncHandler from "@/src/shared/middleware/async-handler";
import {
 type NextFunction,
 type Request,
 type Response,
 Router,
} from "express";
import { createSession } from "better-sse";
import authenticate from "@/src/shared/middleware/auth";

class StreamEventRouter {
 router: Router;
 constructor() {
  this.router = Router();
  this.router.use(authenticate);
 }

 initializeRoutes() {
  this.router.get(
   "/stream-event",
   asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.user.id;

    const session = await createSession(req, res);

    const subscriber = onSubscribe<StreamPayload>(id).subscribe({
     next: (payload) => {
      session.push(payload.data, payload.event);
     },
     error: (err) => {
      console.error(err);
      res.end();
     },
    });

    session.on("disconnected", () => {
     subscriber.unsubscribe();
     res.end();
    });

    req.on("close", () => {
     subscriber.unsubscribe();
     res.end();
    });
   }),
  );
 }
}

export const streamEventRouter = new StreamEventRouter().router;
