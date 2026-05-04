import type { Request, Response, NextFunction } from "express";

import asyncHandler from "@/src/shared/middleware/async-handler";
import OnboardingService from "./onboarding.service";
import HttpStatus from "@/src/config/http.config";
import { ApiResponse } from "@/src/shared/util/response";

class OnboardingController {

 stepOne = asyncHandler(
  async (req: Request<{}, {}, {
   vendorData: {
    firstName: string,
    lastName: string,
    email: string,
    userType: string,
    phoneNumber: string,
    password: string,
   },
   data: {
    state: string,
    city: string,
    address: string,
    instagram: string,
    facebook: string,
    twitter: string,
   }
  }>, res: Response, next: NextFunction): Promise<any> => {
   try {
    const {vendorData, data}= req.body;
    const resultData = await OnboardingService.stepOne(vendorData, data);

    return res.status(HttpStatus.OK).json({
     status: "ok",
     message: "Step One completed",
     data: resultData
    } satisfies ApiResponse);
   } catch (error) {
    next(error);
   }
  }
 )

 stepTwo = asyncHandler(async (req: Request<{id: string}, {}, {
  data: {
   yearsOfExperience: number,
   cuisines: string, 
   bankName: string,
   accountNumber: string,
   isVerified: boolean
  }
 }>, res: Response, next: NextFunction): Promise<any> => {
  try {
   const vendorId = Number(req.params.id);
   const stepTwo= req.query.stepTwo as string;
   const {data} = req.body;

   const resultData =  await OnboardingService.stepTwo(vendorId, stepTwo, data)
   
   return res.status(HttpStatus.OK).json({
    status: "ok",
    message: "Step Two completed",
    data: resultData
   })
  } catch (error) {
   next(error);
  }
 });

 stepThree = asyncHandler( async (req: Request<{id: string}>, res: Response, next: NextFunction): Promise<any> => {
  try {
   const vendorId = Number(req.params.id);
   const lastStep = req.query.lastStep as string
   const data = req.body;
   const resultData = await OnboardingService.stepThree(vendorId, lastStep, data);

   return res.status(HttpStatus.OK).json({
    status: "ok",
    message: "Data submitted successfully",
    data: resultData
   } satisfies ApiResponse)
  } catch (error) {
    next(error);
  }
 })

 getCurrentProcess = asyncHandler( async (req: Request<{id: string}>, res: Response, next: NextFunction): Promise<any> => {
  try {
   const vendorId = Number(req.params.id);
   const userId = Number(req.user.id);

   const resultData = await OnboardingService.getCurrentProcess(vendorId, userId);

   return res.status(HttpStatus.OK).json({
    status: "ok",
    message: "Fetched current onboarding process",
    data: resultData
   })
   
  } catch (error) {
   next(error);
  }
 })

 memoEventStatus = asyncHandler( async (req: Request<{id: string}>, res: Response, next: NextFunction): Promise<any> => {
  const vendorId = Number(req.params.id);
  try {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    await OnboardingService.subscribeToMemo(vendorId, res);
    res.write(`data: ${JSON.stringify({ message: "connected" })}\n\n`);
  } catch (error) {
    next(error);
  }
 })
}

export default new OnboardingController()



// private statusUpdates$ = new Subject<{ vendorId: string; data: any }>();
// const heartbeat$ = interval(30000).pipe(
//   map(() => ({ type: 'heartbeat', timestamp: new Date() }))
// );

// // 2. The Filtered Update Stream (only for this vendor)
// const vendorUpdates$ = this.statusUpdates$.pipe(
//   filter(update => update.vendorId === vendorId),
//   map(update => update.data)
// );

// // 3. Merge them into one push-based pipe
// const combinedStream$ = merge(heartbeat$, vendorUpdates$);

// const subscription = combinedStream$.subscribe((payload) => {
//   res.write(`data: ${JSON.stringify(payload)}\n\n`);
// });

// // Clean up everything when the user leaves
// req.on("close", () => {
//   subscription.unsubscribe();
// });

// This replaces the old sseManager.notify
// notifyUpdate(vendorId: string, data: any) {
//   this.statusUpdates$.next({ vendorId, data });
// }



// import { interval, merge, Subject } from 'rxjs';
// import { map, filter } from 'rxjs/operators';

// // A central bus for updates (could live in a separate file)
// const sseBus$ = new Subject<{ vendorId: string; data: any }>();

// // In your Controller
// streamStatus = asyncHandler(async (req, res) => {
//   const { id: vendorId } = req.params;

//   res.writeHead(200, {
//     "Content-Type": "text/event-stream",
//     "Cache-Control": "no-cache",
//     "Connection": "keep-alive",
//   });

//   // 1. Create a heartbeat stream (every 30s)
//   const heartbeat$ = interval(30000).pipe(map(() => ': keep-alive\n\n'));

//   // 2. Create an update stream for THIS vendor
//   const updates$ = sseBus$.pipe(
//     filter(update => update.vendorId === vendorId),
//     map(update => `data: ${JSON.stringify(update.data)}\n\n`)
//   );

//   // 3. Merge them and subscribe
//   const subscription = merge(heartbeat$, updates$).subscribe(message => {
//     res.write(message);
//   });

//   req.on("close", () => {
//     subscription.unsubscribe(); // Automatically stops the interval too!
//   });
// });

// // In your Service (to trigger an update)
// export const notifyClient = (vendorId: string, data: any) => {
//   sseBus$.next({ vendorId, data });
// };



// @shared/event-bus.ts
// import { Subject } from 'rxjs';
// import { filter } from 'rxjs/operators';

// export enum OnboardingEvents {
//   STEP_COMPLETED = 'STEP_COMPLETED',
//   VERIFICATION_FAILED = 'VERIFICATION_FAILED'
// }

// interface AppEvent {
//   type: OnboardingEvents;
//   payload: any;
// }

// // The "Emitter"
// export const bus$ = new Subject<AppEvent>();

// // Helper to listen for specific types
// export const onEvent = (eventType: OnboardingEvents) => 
//   bus$.asObservable().pipe(filter(e => e.type === eventType));

// --- SERVICE B (Email Service) ---
// import { onEvent, OnboardingEvents } from "@shared/event-bus";

// // We subscribe HERE because we want to trigger an action (email)
// // usually during the service's initialization/constructor
// onEvent(OnboardingEvents.STEP_COMPLETED).subscribe((event) => {
//   console.log("Service B received event! Sending email...");
//   emailProvider.send(event.payload.email, "Welcome to Step 2!");
// });

// bus$.next({
//   type: OnboardingEvents.STEP_COMPLETED,
//   payload: { vendorId: 123, step: 2 }
// });