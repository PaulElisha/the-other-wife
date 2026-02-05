/** @format */

import { Router } from "express";
import { UserController } from "../controllers/user.controller.js";

import { validateEditUser } from "../validation/user.validation.js";
import { roleGuardMiddleware } from "../middlewares/role-guard.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

/**
 * @openapi
 * /api/v1/user/update:
 *   put:
 *     summary: Update current user
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email, phoneNumber]
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               email: { type: string, format: email }
 *               phoneNumber: { type: string }
 *     responses:
 *       200:
 *         description: User updated successfully
 */

/**
 * @openapi
 * /api/v1/user/current-user:
 *   get:
 *     summary: Get current user
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User fetched successfully
 */

/**
 * @openapi
 * /api/v1/user/all:
 *   get:
 *     summary: Get all users (admin)
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Users fetched successfully
 */

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
      "/current-user",
      authMiddleware,
      roleGuardMiddleware(["customer", "vendor"]),
      this.userController.getCurrentUser,
    );

    this.router.get(
      "/all",
      authMiddleware,
      roleGuardMiddleware(["admin"]),
      this.userController.getAllUsers,
    );
  }
}

export const userRouter = new UserRouter().router;
