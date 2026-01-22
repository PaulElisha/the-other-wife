/** @format */

import mongoose, { Document, Schema, model } from "mongoose";

export interface MealDocument extends Document {
  vendorId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
  availableFrom: Date;
  availableUntil: Date;
  primaryImageUrl: string;
  additionalImages: string[];
  tags: string[];
  preparationTime: number;
  servingSize: string;
  additionalData: Object;
  isDeleted: boolean;
}

const MealSchema = new Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: true,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  name: {
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
    type: Boolean,
    required: true,
    default: true,
  },
  availableFrom: {
    type: Date,
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
    required: false,
  },
  tags: {
    type: [String],
    default: [],
  },
  preparationTime: {
    type: Number,
    required: true,
  },
  servingSize: {
    type: String,
    required: true,
  },
  additionalData: {
    type: Object,
    required: false,
  },
  isDeleted: {
    type: Boolean,
    required: true,
    default: false,
  },
});

export default model<MealDocument>("Meal", MealSchema);
