/** @format */

import mongoose, { Document, Schema, model } from "mongoose";

export interface CategoryDocument extends Document {
  name: string;
  slug: string;
  description: string;
  iconUrl: string;
  displayOrder: number;
  isActive: boolean;
}

const CategorySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  iconUrl: {
    type: String,
    required: true,
  },
  displayOrder: {
    type: Number,
    required: true,
    default: 0,
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true,
  },
});

export default model<CategoryDocument>("Category", CategorySchema);
