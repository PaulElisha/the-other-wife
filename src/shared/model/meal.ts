/** @format */

import mongoose, { Schema, model } from "mongoose";
import type { MealDocument } from "@type/env-types";

const MealSchema = new Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: true,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  name: {
    type: String,
    required: true,
  },
  categoryName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  isAvailable: {
    type: String,
    enum: ["pending", "available", "unavailable"],
    default: "pending",
  },
  availableFrom: {
    type: String,
    required: true,
  },
  availableUntil: {
    type: Date,
    required: true,
  },
  primaryImageUrl: {
    type: String,
    required: true,
  },
  additionalImages: {
    type: [String],
  },
  tags: {
    type: [String],
    required: true,
    default: [],
  },
  preparationTime: {
    type: Number,
  },
  servingSize: {
    type: String,
  },
  additionalData: {
    type: String,
    required: false,
  },
  isDeleted: {
    type: Boolean,
    required: true,
    default: false,
  },
});

export default model<MealDocument>("Meal", MealSchema);
