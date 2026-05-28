/** @format */

import auth from "@middleware/auth.js";
import roleGuardMiddleware from "@middleware/role-guard.js";
import UserController from "@module/user/user.controller.js";
import { Router } from "express";

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
 router: Router;

 constructor() {
  this.router = Router();
  this.router.use(auth);
  this.initializeRoutes();
 }

 initializeRoutes() {
  this.router.get(
   "/me",
   roleGuardMiddleware(["customer", "vendor"]),
   UserController.getCurrentUser,
  );

  this.router.get(
   "/all",
   roleGuardMiddleware(["admin"]),
   UserController.getAllUsers,
  );
 }
}

export const userRouter = new UserRouter().router;
