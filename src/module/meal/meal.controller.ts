/** @format */

import { NextFunction, Request, Response } from "express";
import handleAsyncControl from "@/src/shared/middleware/async-handler.js";
import MealService from "@module/meal/meal.service.js";
import HttpStatus from "@config/http.config.js";
import { ApiResponse } from "@util/response.js";
import asyncHandler from "@/src/shared/middleware/async-handler.js";

class MealController {
  createMeal = asyncHandler(async (req: Request<{vendorId: string}>, res: Response, next: NextFunction): Promise<any> => {
    try {
      const userId = Number(req.user.id);
      const vendorId = Number(req.params.vendorId);
      const mealData = req.body;

      const meal = await MealService.createMeal(vendorId, userId, mealData);
      return res.status(HttpStatus.CREATED).json({
        status: "ok",
        message: "Meal created successfully",
        data: meal,
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  });

  getMeals = asyncHandler(async (req: Request<{ mealId: string }>, res: Response, next: NextFunction): Promise<any> => {
    try {
      const filters = {
        search: req.query.search as string | undefined,
        tags:
          typeof req.query.tags === "string"
            ? req.query.tags.split(",").map((tag) => tag.trim())
            : (req.query.tags as string[] | undefined),
        mealId: Number(req.query.mealId),
        category: req.query.category as string | undefined, 
      };

      const pageSizeValue = Number(req.query.pageSize);
      const pageNumberValue = Number(req.query.pageNumber);

      const pagination = {
        pageSize: Number.isFinite(pageSizeValue) ? pageSizeValue : undefined,
        pageNumber: Number.isFinite(pageNumberValue) ? pageNumberValue : undefined,
      };

      const meal = await MealService.getMeals(filters, pagination);
      return res.status(HttpStatus.OK).json({
        status: "ok",
        message: "Meals fetched successfully",
        data: meal,
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  });
}

export default new MealController();
