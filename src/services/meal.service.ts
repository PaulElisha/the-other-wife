/** @format */

import mongoose from "mongoose";
import { HttpStatus } from "../config/http.config";
import { ErrorCode } from "../enums/error-code.enum";
import { BadRequestException } from "../errors/bad-request-exception.error";

import Meal from "../models/meal.model";
import Vendor from "../models/vendor.model";

export class MealService {
  constructor() {}

  createMeal = async (
    vendorId: string,
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
    if (!vendorId) {
      throw new BadRequestException(
        "VendorID is required",
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR,
      );
    }

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
    mealId: string,
    data: {
      search: string;
      tags: string;
    },
    pagination: { pageSize: number; pageNumber: number },
  ) => {
    const vendor = await Vendor.findOne({ userId });
    if (!vendor) {
      throw new BadRequestException(
        "Vendor not found",
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR,
      );
    }
    const vendorId = vendor._id;

    vendorId &&
      (() => {
        throw new BadRequestException(
          "UserID is required",
          HttpStatus.BAD_REQUEST,
          ErrorCode.VALIDATION_ERROR,
        );
      })();

    const { search, tags } = data;
    const { pageSize, pageNumber } = pagination;
    const skip = (pageNumber - 1) * pageSize;

    const meal = await Meal.findById(mealId);
    const categoryId = meal?.categoryId;

    if (!meal) {
      throw new BadRequestException(
        "Meal not found",
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR,
      );
    }

    const query: Record<string, any> = {
      vendorId,
      categoryId,
    };

    search && (query.search = { $regex: search, $options: "i" });
    tags && (query.tags = tags);
    mealId && (query._id = mealId as unknown as mongoose.Types.ObjectId);

    const meals = await Meal.find(query)
      .populate("vendorId", "userId")
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
