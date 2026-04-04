/** @format */

import mongoose, { Document, Schema, model } from "mongoose";
import type { FavouritesDocument } from "@type/env-types";

const FavouritesSchema = new Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  favouriteMeals: [
    {
      mealId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Meal",
      },
    },
  ],
});

export default model<FavouritesDocument>("Favourites", FavouritesSchema);
