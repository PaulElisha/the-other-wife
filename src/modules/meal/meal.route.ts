/** @format */

import { Router } from "express";
import MealController from "@module/meal/meal.controller.js";
import authMiddleware from "@middleware/auth.js";
import roleGuardMiddleware from "@middleware/role-guard.js";
import statusCheck from "@middleware/status-check.js";

/**
 * @swagger
 * /api/v1/meals:
 *   get:
 *     summary: Get meals by query
 *     tags: [Meal]
 *     parameters:
 *       - name: search
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *       - name: tags
 *         in: query
 *         required: false
 *         description: Comma-separated tags or repeated query params
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *       - name: mealId
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *       - name: category
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *       - name: pageSize
 *         in: query
 *         required: false
 *         schema:
 *           type: number
 *       - name: pageNumber
 *         in: query
 *         required: false
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Meal fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Meal"
 */

/**
 * @swagger
 * /api/v1/meals:
 *   post:
 *     summary: Create a new meal
 *     tags: [Meal]
 *     description: Requires an authenticated approved vendor account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/Meal"
 *     responses:
 *       201:
 *         description: Meal created successfully
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

class MealRouter {
  router: Router;

  constructor() {
    this.router = Router();
    this.router.use(authMiddleware);
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get("/", MealController.getMeals);
    this.router.post(
      "/",
      roleGuardMiddleware(["vendor"]),
      statusCheck(["approved"]),
      MealController.createMeal,
    );
  }
}

export const mealRouter = new MealRouter().router;
