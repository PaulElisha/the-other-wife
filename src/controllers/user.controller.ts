/** @format */

import { Request, Response } from "express";
import { handleAsyncControl } from "../middlewares/handleAsyncControl.middleware";
import { UserService } from "../services/user.service";
import { HttpStatus } from "../config/http.config";

export class UserController {
  userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  getCurrentUser = handleAsyncControl(
    async (req: Request, res: Response): Promise<Response> => {
      try {
        if (!req.user || !req.user?._id) {
          return res.status(HttpStatus.UNAUTHORIZED).json({
            status: "error",
            message: "User not authenticated",
          });
        }

        const { user } = await this.userService.getCurrentUser(req.user?._id);
        return res.status(HttpStatus.OK).json({
          data: user,
          status: "ok",
          message: "User fetched successfully",
        });
      } catch (error) {
        throw error;
      }
    },
  );

  editUser = handleAsyncControl(
    async (req: Request, res: Response): Promise<Response> => {
      try {
        if (!req.user || !req.user?._id) {
          return res.status(HttpStatus.UNAUTHORIZED).json({
            status: "error",
            message: "User not authenticated",
          });
        }

        const { user } = await this.userService.editUser(
          req.user?._id,
          req.body,
        );
        return res.status(HttpStatus.OK).json({
          data: user,
          status: "ok",
          message: "User updated successfully",
        });
      } catch (error) {
        throw error;
      }
    },
  );
}
