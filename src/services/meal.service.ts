/** @format */

import mongoose from "mongoose";
import { HttpStatus } from "../config/http.config";
import { ErrorCode } from "../enums/error-code.enum";
import { BadRequestException } from "../errors/bad-request-exception.error";

import Meal from "../models/meal.model";
import Vendor from "../models/vendor.model";
import MealCategory from "../models/mealCategory.model";

export class MealService {
  constructor() {}

  createMeal = async (
    userId: string,
    mealData: {
      name: string;
      description: string;
      price: number;
      imageUrl: string;
      availableFrom: string;
      availableUntil: string;
      primaryImageUrl: string;
      additionalImages: string[];
      tags: string[];
      isAvailable: boolean;
      preparationTime: number;
      servingSize: string;
      additionalData: string;
    },
  ) => {
    const {
      name,
      description,
      price,
      imageUrl,
      availableFrom,
      availableUntil,
      primaryImageUrl,
      additionalImages,
      tags,
      isAvailable,
      preparationTime,
      servingSize,
      additionalData,
    } = mealData;

    const vendor = await Vendor.findOne({ userId });
    if (!vendor) {
      throw new BadRequestException(
        "Vendor not found",
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR,
      );
    }
    const vendorId = vendor._id;

    const meal = await Meal.create({
      vendorId,
      name,
      description,
      price,
      imageUrl,
      availableFrom,
      availableUntil,
      primaryImageUrl,
      additionalImages,
      tags,
      isAvailable,
      preparationTime,
      servingSize,
      additionalData,
    });

    if (!meal) {
      throw new BadRequestException(
        "Meal not created",
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR,
      );
    }

    return { meal };
  };

  getMeals = async (
    userId: string,
    data: {
      search: string;
      tags: string[];
      mealId: string;
      category: string;
    },
    pagination: { pageSize: number; pageNumber: number },
  ) => {
    userId &&
      (() => {
        throw new BadRequestException(
          "UserID is required",
          HttpStatus.BAD_REQUEST,
          ErrorCode.VALIDATION_ERROR,
        );
      })();

    const { search, tags, mealId, category } = data;
    const { pageSize, pageNumber } = pagination;
    const skip = (pageNumber - 1) * pageSize;

    const mealCategory = await MealCategory.findOne({ category });
    const categoryId = mealCategory?._id;

    if (!mealCategory) {
      throw new BadRequestException(
        "Meal category not found",
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR,
      );
    }

    const query: Record<string, any> = {};

    search && (query.search = { $regex: search, $options: "i" });
    Array.isArray(tags) && tags.length > 0 && (query.tags = { $in: tags });
    mealId && (query._id = mealId as unknown as mongoose.Types.ObjectId);
    categoryId &&
      (query.categoryId = categoryId as unknown as mongoose.Types.ObjectId);

    const meals = await Meal.find(query)
      .populate("vendorId")
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 });

    const totalMeals = await Meal.countDocuments(query);

    const totalPages = Math.ceil(totalMeals / pageSize);

    if (!meals) {
      throw new BadRequestException(
        "Meals not found",
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR,
      );
    }

    return {
      meals,
      pagination: {
        pageSize,
        pageNumber,
        totalMeals,
        totalPages,
        skip,
      },
    };
  };
}
