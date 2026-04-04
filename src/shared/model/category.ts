/** @format */

import { Schema, model } from "mongoose";
import type { CategoryDocument } from "@type/env-types";

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
