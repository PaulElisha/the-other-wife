/** @format */

import { Router } from "express";
import { UserController } from "../controllers/user.controller.js";

import { roleGuardMiddleware } from "../middlewares/role-guard.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { zodValidation } from "../middlewares/validation.js";
import {
  closeCurrentUserAccountSchema,
  updateUserStatusSchema,
} from "../zod-schema/user.schema.js";

/**
 * @swagger
 * /api/v1/users/me:
 *   get:
 *     summary: Get current user
 *     tags: [User]
 *     responses:
 *       "200":
 *         description: User fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ApiResponse"
 *       "401":
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/responses/401"
 *       "403":
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/responses/403"
 *       "404":
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/responses/404"
 *       "500":
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/responses/500"
 */

/**
 * @swagger
 *  /api/v1/users:
 *    get:
 *      summary: Get all users (admin)
 *      tags: [User]
 *      responses:
 *        "200":
 *          description: Users fetched successfully
 *          content:
 *              application/json:
 *                schema:
 *                  $ref: "#/components/schemas/ApiResponse"
 *        "400":
 *          description: Bad request
 *          content:
 *              application/json:
 *                schema:
 *                  $ref: "#/components/responses/400"
 *        "401":
 *          description: Unauthorized
 *          content:
 *              application/json:
 *                schema:
 *                  $ref: "#/components/responses/401"
 *        "403":
 *          description: Forbidden
 *          content:
 *              application/json:
 *                schema:
 *                  $ref: "#/components/responses/403"
 *        "404":
 *          description: Not found
 *          content:
 *              application/json:
 *                schema:
 *                  $ref: "#/components/responses/404"
 *        "500":
 *          description: Internal server error
 *          content:
 *              application/json:
 *                schema:
 *                  $ref: "#/components/responses/500"
 */

class UserRouter {
  userController: UserController;
  router: Router;

  constructor() {
    this.userController = new UserController();
    this.router = Router();
    this.router.use(authMiddleware);
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get(
      "/me",
      roleGuardMiddleware(["customer", "vendor"]),
      this.userController.getCurrentUser,
    );

    this.router.delete(
      "/me",
      roleGuardMiddleware(["customer", "vendor", "admin"]),
      zodValidation(closeCurrentUserAccountSchema),
      this.userController.closeCurrentUserAccount,
    );

    this.router.get(
      "/",
      roleGuardMiddleware(["admin"]),
      this.userController.getAllUsers,
    );

    this.router.patch(
      "/:userId/status",
      roleGuardMiddleware(["admin"]),
      zodValidation(updateUserStatusSchema),
      this.userController.updateUserStatus,
    );
  }
}

export const userRouter = new UserRouter().router;
