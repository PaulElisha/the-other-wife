/** @format */

import { Request, Response } from "express";
import handleAsyncControl from "@middleware/handle-async-control.js";
import MealService from "@module/meal/meal.service.js";
import HttpStatus from "@config/http.config.js";
import { ApiResponse } from "@util/response.js";

class MealController {
  createMeal = handleAsyncControl(async (req: Request<{}>, res: Response) => {
    try {
      const userId = req?.user?._id as unknown as string;
      const mealData = req.body;
      const meal = await MealService.createMeal(userId, mealData);
      return res.status(HttpStatus.CREATED).json({
        status: "ok",
        message: "Meal created successfully",
        data: meal,
      } as ApiResponse);
    } catch (error) {
      throw error;
    }
  });

  getMeals = handleAsyncControl(async (req: Request<{ mealId: string }>, res: Response) => {
    try {
      const query = {
        search: req.query.search as string,
        tags:
          typeof req.query.tags === "string"
            ? req.query.tags.split(",").map((tag) => tag.trim())
            : (req.query.tags as string[] | undefined),
        mealId: req.query.mealId as string,
        category: req.query.category as string,
      };

      const pageSizeValue = Number(req.query.pageSize);
      const pageNumberValue = Number(req.query.pageNumber);

      const pagination = {
        pageSize: Number.isFinite(pageSizeValue) ? pageSizeValue : undefined,
        pageNumber: Number.isFinite(pageNumberValue) ? pageNumberValue : undefined,
      };

      const meal = await MealService.getMeals(query, pagination);
      return res.status(HttpStatus.OK).json({
        status: "ok",
        message: "Meals fetched successfully",
        data: meal,
      } as ApiResponse);
    } catch (error) {
      throw error;
    }
  });
}

export default new MealController();
