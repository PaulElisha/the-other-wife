/** @format */

import { Router } from "express";
import { UserController } from "../controllers/user.controller.js";

import { validateEditUser } from "../validation/user.validation.js";
import { roleGuardMiddleware } from "../middlewares/role-guard.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

/**
 * @swagger
 * /api/v1/user/{userId}
 *   put:
 *     summary: Update user
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           required: true
 *           description: The user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: ["firstName", "lastName", "email", "phoneNumber"]
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               email: { type: string, format: email }
 *               phoneNumber: { type: string }
 *     responses:
 *       "204":
 *         description: User updated successfully
 *         content:
 *           application/json
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
 * /api/v1/user/me
 *   get:
 *     summary: Get current user
 *     tags: [User]
 *     responses:
 *       "200":
 *         description: User fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/User"
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
 *  /api/v1/user/:
 *    get:
 *      summary: Get all users (admin)
 *      tags: [User]
 *      responses:
 *        "200":
 *          description: Users fetched successfully
 *            contents:
 *              application/json:
 *                schema:
 *                  $ref: "#/components/schemas/User"
 *        "400":
 *          description: Bad request
 *            contents:
 *              application/json:
 *                schema:
 *                  $ref: "#/components/responses/400"
 *        "401":
 *          description: Unauthorized
 *            contents:
 *              application/json:
 *                schema:
 *                  $ref: "#/components/responses/401"
 *        "403":
 *          description: Forbidden
 *            contents:
 *              application/json:
 *                schema:
 *                  $ref: "#/components/responses/403"
 *        "404":
 *          description: Not found
 *            contents:
 *              application/json:
 *                schema:
 *                  $ref: "#/components/responses/404"
 *        "500":
 *          description: Internal server error
 *            contents:
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
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.put(
      "/:userId",
      authMiddleware,
      roleGuardMiddleware(["customer", "vendor"]),
      validateEditUser,
      this.userController.editUser,
    );

    this.router.get(
      "/me",
      authMiddleware,
      roleGuardMiddleware(["customer", "vendor"]),
      this.userController.getCurrentUser,
    );

    this.router.get(
      "/",
      authMiddleware,
      roleGuardMiddleware(["admin"]),
      this.userController.getAllUsers,
    )
  }
}

export const userRouter = new UserRouter().router;
