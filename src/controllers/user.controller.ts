/** @format */

import type { Request, Response } from "express";
import { handleAsyncControl } from "../middlewares/handle-async-control.middleware.js";
import { UserService } from "../services/user.service.js";
import { HttpStatus } from "../config/http.config.js";
import { ApiResponse } from "../util/response.util.js";

import fs from "node:fs/promises";

export class UserController {
  userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  getCurrentUser = handleAsyncControl(
    async (req: Request, res: Response): Promise<Response> => {
      const userId = req?.user?._id as unknown as string;
      try {
        const user = await this.userService.getCurrentUser(userId);
        return res.status(HttpStatus.OK).json({
          data: user,
          status: "ok",
          message: "User fetched successfully",
        } as ApiResponse);
      } catch (error) {
        throw error;
      }
    },
  );

  getAllUsers = handleAsyncControl(
    async (req: Request, res: Response): Promise<Response> => {
      try {
        const users = await this.userService.getAllUsers();
        return res.status(HttpStatus.OK).json({
          data: users,
          status: "ok",
          message: "Users fetched successfully",
        } as ApiResponse);
      } catch (error) {
        throw error;
      }
    },
  );
}
