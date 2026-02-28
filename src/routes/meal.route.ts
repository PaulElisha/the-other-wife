/** @format */

import { Router } from "express";
import { MealController } from "../controllers/meal.controller";

/**
 * @swagger
 * /api/v1/meals/{id}:
 *   get:
 *     summary: Get meals by query
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestQuery:
 *       - name: search
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *       - name: tags
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
 * /api/v1/meals/{vendorId}:
 *   post:
 *     summary: Create a new meal
 *     parameters:
 *       - name: vendorId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
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
  private mealController: MealController;
  public router: Router;

  constructor() {
    this.router = Router();
    this.mealController = new MealController();
  }

  initializeRoutes() {
    this.router.get("/:id", this.mealController.getMeals);
    this.router.post("/:vendorId", this.mealController.createMeal);
  }
}

export const mealRouter = new MealRouter().router;
