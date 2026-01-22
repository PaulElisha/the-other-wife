/** @format */

import { Router } from "express";
import { UserController } from "../controllers/user.controller.js";

import { validateEditUser } from "../validation/user.validation.js";
import { roleGuardMiddleware } from "../middlewares/role-guard.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

class UserRouter {
  userController: UserController;
  router: Router;

  constructor() {
    this.userController = new UserController();
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.put(
      "/update",
      authMiddleware,
      roleGuardMiddleware(["customer", "vendor"]),
      validateEditUser,
      this.userController.editUser,
    );

    this.router.get(
      "/",
      authMiddleware,
      roleGuardMiddleware(["customer", "vendor"]),
      this.userController.getCurrentUser,
    );
  }
}

export const userRouter = new UserRouter().router;
