/** @format */

import type { Request, Response } from "express";
import handleAsyncControl from "@middleware/handle-async-control.js";
import UserService from "./user.service.js";
import HttpStatus from "@config/http.config.js";
import { ApiResponse } from "@util/response.js";

class UserController {
  getCurrentUser = handleAsyncControl(async (req: Request, res: Response): Promise<Response> => {
    const userId = req?.user?._id as unknown as string;
    try {
      const user = await UserService.getCurrentUser(userId);
      return res.status(HttpStatus.OK).json({
        data: user,
        status: "ok",
        message: "User fetched successfully",
      } as ApiResponse);
    } catch (error) {
      throw error;
    }
  });

  getAllUsers = handleAsyncControl(async (req: Request, res: Response): Promise<Response> => {
    try {
      const users = await UserService.getAllUsers();
      return res.status(HttpStatus.OK).json({
        data: users,
        status: "ok",
        message: "Users fetched successfully",
      } as ApiResponse);
    } catch (error) {
      throw error;
    }
  });
}

export default new UserController();
