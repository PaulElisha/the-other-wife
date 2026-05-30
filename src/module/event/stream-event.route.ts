/** @format */
import { onSubscribe, StreamPayload } from "@/src/shared/event-bus/subscriber";
import asyncHandler from "@/src/shared/middleware/async-handler";
import {
 type NextFunction,
 type Request,
 type Response,
 Router,
} from "express";
import {} from "better-sse";
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
    const id = req.user.id as string;

    res.writeHead(200, {
     "Content-Type": "text/event-stream",
     "Cache-Control": "no-cache",
     Connection: "keep-alive",
    });

    const subscriber = onSubscribe<StreamPayload>(id).subscribe((payload) => {
     res.write(`event: ${payload.event}\n`);
     res.write(`data: ${JSON.stringify(payload.data)}\n\n`);
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
