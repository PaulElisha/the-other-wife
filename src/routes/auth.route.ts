/** @format */

import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import {
  validateLoginUser,
  validateSignupUser,
} from "../validation/auth.validation.js";

/**
 * @openapi
 * /api/v1/auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, password]
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string, format: password }
 *               userType: { type: string, enum: [customer, vendor, admin] }
 *               phoneNumber: { type: string }
 *     responses:
 *       200:
 *         description: User registered successfully
 */

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               phoneNumber: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string, format: password }
 *     responses:
 *       200:
 *         description: User login successful
 */

/**
 * @openapi
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: User logged out successfully
 */

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
