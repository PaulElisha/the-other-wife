/** @format */

import HttpStatus from "@config/http.config.js";
import ErrorCode from "@enum/error-code.js";
import BadRequestException from "@error/bad-request-exception.js";
import NotFoundException from "@error/not-found-exception.js";

import db from "@config/db.config";

import {meals} from "@module/meal/meal.schema.js";
import {vendors} from "@module/vendor/vendor.schema.js";
import { mealcategories } from "@/src/shared/model/mealCategory.schema.js";
import { eq, and, ilike, or, desc, count, sql } from "drizzle-orm";

class MealService {
  createMeal =
    async (
      vendorId: number,
      userId: number,
      mealData: {
        name: string;
        description: string;
        price: number;
        categoryName: string;
        availableFrom: string;
        availableUntil: string;
        primaryImageUrl: string;
        tags: string[];
      },
    ) => {
      const {
        name,
        description,
        price,
        categoryName,
        availableFrom,
        availableUntil,
        primaryImageUrl,
        tags,
      } = mealData;

      const meal = await db.transaction(async (tx) => {
        const [vendor] = await tx.select().from(vendors).where(
          and(
            eq(vendors.user_id, userId),
            eq(vendors.id, vendorId)
          )
        ).limit(1);
        
        const [meal_category] = await tx.select().from(mealcategories).where(
          eq(mealcategories.category, categoryName)
        ).limit(1);
  
        const categoryId = meal_category.id;
  
        const [newMeal] = await db.insert(meals).values(
            {
              vendor_id: vendor.id,
              name,
              category_name: categoryName,
              category_id: categoryId,
              description,
              price,
              available: "pending",
              available_from: availableFrom,
              available_till: availableUntil,
              primary_image: primaryImageUrl,
              tags,
            },
          ).onConflictDoNothing().returning();

          return newMeal;
      });

      return meal;
  }

  getMeals = async (
    data: {
      search?: string;
      tags?: string[];
      mealId?: number;
      category?: string;
    },
    pagination: { pageSize?: number; pageNumber?: number },
  ) => {
    const { search, tags, mealId, category } = data;
    const pageSize = Math.min(Math.max(pagination.pageSize ?? 10, 1), 50);
    const pageNumber = Math.max(pagination.pageNumber ?? 1, 1);
    const skip = (pageNumber - 1) * pageSize;

    const filters = [
      eq(meals.is_deleted, false),
      eq(meals.available, "available")
    ]

    if (search) {
      filters.push(
        or (
          ilike(meals.name, `%${search}%`),
          ilike(meals.description, `%${search}%`)
        )!
      )
    }

    if (Array.isArray(tags) && tags.length > 0) {
      filters.push(sql`${meals.tags} && ${tags}`); 
    }

    if (mealId) {
      filters.push(eq(meals.id, mealId));
    }

    if (category) {
      const [mealcategory] = await db.select()
      .from(mealcategories)
      .where(eq(mealcategories.category, category))
      .limit(1);


      if (!mealcategory) {
        throw new NotFoundException(
          "Meal category not found",
          HttpStatus.NOT_FOUND,
          ErrorCode.RESOURCE_NOT_FOUND,
        );
      }

      filters.push(eq(meals.category_id, mealcategory.id));
    }

    const mealsList = await db
    .select({
      meal: meals,
      vendor: vendors,
    })
    .from(meals)
    .leftJoin(vendors, eq(meals.vendor_id, vendors.id))
    .where(and(...filters))
    .limit(pageSize)
    .offset(skip)
    .orderBy(desc(meals.created_at));

    const [totalCountResult] = await db
    .select({ total: count() })
    .from(meals)
    .where(and(...filters));

    // const totalMeals = await Meal.countDocuments(query);

    const totalMeals = Number(totalCountResult.total);
    const totalPages = Math.ceil(totalMeals / pageSize);

    if (!meals) {
      throw new BadRequestException(
        "Meals not found",
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR,
      );
    }

    return {
      mealsList,
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

export default new MealService();
