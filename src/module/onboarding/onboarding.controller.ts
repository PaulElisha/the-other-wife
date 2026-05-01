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
}

export default new OnboardingController()