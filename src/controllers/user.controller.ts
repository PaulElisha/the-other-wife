/** @format */

import { Request, Response } from "express";
import { handleAsyncControl } from "../middlewares/handleAsyncControl.middleware.js";
import { UserService } from "../services/user.service.js";
import { HttpStatus } from "../config/http.config.js";

export class UserController {
  userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  getCurrentUser = handleAsyncControl(
    async (req: Request, res: Response): Promise<Response> => {
      try {
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

  getAllUsers = handleAsyncControl(
    async (req: Request, res: Response): Promise<Response> => {
      try {
        const { users } = await this.userService.getAllUsers();
        return res.status(HttpStatus.OK).json({
          data: users,
          status: "ok",
          message: "Users fetched successfully",
        });
      } catch (error) {
        throw error;
      }
    },
  );

  editUser = handleAsyncControl(
    async (req: Request, res: Response): Promise<Response> => {
      try {
        const { user } = await this.userService.editUser(
          req.user?._id,
          req.body,
        );
        return res.status(HttpStatus.NO_CONTENT).json({
          data: user,
          status: "ok",
          message: "User updated successfully",
        });
      } catch (error) {
        throw error;
      }
    },
  );

  deleteUser = handleAsyncControl(
    async (req: Request, res: Response): Promise<Response> => {
      try {
        await this.userService.deleteUser(req.user?._id);
        return res.status(HttpStatus.NO_CONTENT).json({
          status: "ok",
          message: "User deleted successfully",
        });
      } catch (error) {
        throw error;
      }
    },
  );
}
