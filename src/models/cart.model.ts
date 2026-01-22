/** @format */

import mongoose, { Document, Schema, model } from "mongoose";

export interface CartDocument extends Document {
  customerId: mongoose.Types.ObjectId;
  meals: {
    mealId: mongoose.Types.ObjectId;
    quantity: number;
    totalPrice: number;
  }[];
  totalAmount: number;
}

const CartSchema = new Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    meals: [
      {
        mealId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Meal",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        totalPrice: {
          type: Number,
          required: true,
        },
      },
    ],
    subTotal: {
      type: Number,
      required: false,
    },
    deliveryFee: {
      type: Number,
      required: false,
    },
    serviceCharge: {
      type: Number,
      required: false,
    },
    totalAmount: {
      type: Number,
      required: false,
    },
  },
  { timestamps: true },
);

export default model<CartDocument>("Cart", CartSchema);
