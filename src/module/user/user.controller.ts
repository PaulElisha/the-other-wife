/** @format */

import HttpStatus from "@/src/shared/enum/http.js";
import asyncHandler from "@/src/shared/middleware/async-handler.js";
import UserService from "@module/user/user.service.js";
import { ApiResponse } from "@util/response.js";
import type { NextFunction, Request, Response } from "express";

class UserController {
 getCurrentUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
   const userId = Number(req.user.id);
   try {
    const user = await UserService.getCurrentUser(userId);
    return res.status(HttpStatus.OK).json({
     data: user,
     status: "ok",
     message: "User fetched successfully",
    } satisfies ApiResponse);
   } catch (error) {
    next(error);
   }
  },
 );

 getAllUsers = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
   try {
    const users = await UserService.getAllUsers();
    return res.status(HttpStatus.OK).json({
     data: users,
     status: "ok",
     message: "Users fetched successfully",
    } satisfies ApiResponse);
   } catch (error) {
    next(error);
   }
  },
 );
}

export default new UserController();
