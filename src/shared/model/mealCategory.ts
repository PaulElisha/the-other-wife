/** @format */

import mongoose, { Document, Schema, model } from "mongoose";
import { CategoryType, type MealCategoryDocument } from "@type/env-types";

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
