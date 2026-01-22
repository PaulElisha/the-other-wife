/** @format */

import { Router } from "express";
import { UserController } from "../controllers/user.controller";

import { validateEditUser } from "../validation/user.validation";
import { roleGuardMiddleware } from "../middlewares/role-guard.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";

class UserRouter {
  userController: UserController;
  router: Router;

  constructor() {
    this.userController = new UserController();
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post(
      "/",
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
