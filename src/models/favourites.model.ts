/** @format */

import mongoose, { Document, Schema, model } from "mongoose";

export interface FavouritesDocument extends Document {
  customerId: mongoose.Types.ObjectId;
  favouriteMeals: mongoose.Types.ObjectId[];
}

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
