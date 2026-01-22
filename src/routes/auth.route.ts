/** @format */

import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import {
  validateLoginUser,
  validateSignupUser,
} from "../validation/auth.validation.js";

class AuthRouter {
  router: Router;
  authController: AuthController;

  constructor() {
    this.router = Router();
    this.authController = new AuthController();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post(
      "/signup",
      validateSignupUser,
      this.authController.handleSignup
    );
    this.router.post(
      "/login",
      validateLoginUser,
      this.authController.handleLogin
    );
    this.router.post("/logout", this.authController.handleLogout);
  }
}

export const authRouter = new AuthRouter().router;
