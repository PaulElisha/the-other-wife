/** @format */

import mongoose, { Document, Schema, model } from "mongoose";

export interface AddressDocument extends Document {
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  deliveryInstructions: string;
  isDefault: boolean;
}

const AddressSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  label: {
    type: String,
    required: true,
    enum: ["home", "work", "other"],
    default: "home",
  },
  address: {
    type: String,
    required: false,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  postalCode: {
    type: String,
    required: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  deliveryInstructions: {
    type: String,
    required: true,
  },
  isDefault: {
    type: Boolean,
    required: false,
    default: false,
  },
});

export default model<AddressDocument>("Address", AddressSchema);
