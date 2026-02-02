/** @format */

import mongoose, { Document, Schema, model } from "mongoose";

export interface MealCategoryDocument extends Document {
  category: string;
  description: string;
}

export const CategoryType = {
  LOCAL: "local",
  CONTINENTAL: "continental",
  VEGAN: "vegan",
  PASTRY: "pastry",
  OTHER: "other",
} as const;

export type CategoryValueType =
  (typeof CategoryType)[keyof typeof CategoryType];

const MealCategorySchema = new Schema({
  category: {
    type: String,
    enum: Object.values(CategoryType),
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

export default model<MealCategoryDocument>("MealCategory", MealCategorySchema);
