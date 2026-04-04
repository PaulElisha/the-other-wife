/** @format */

import mongoose, { Document, Schema, model } from "mongoose";
import type { CustomerDocument } from "@type/env-types";

const CustomerSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    unique: true,
    index: true,
    required: true,
  },
  addressId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Address",
    required: false,
  },
  profileImageUrl: {
    type: String,
    required: false,
  },
});

export default model<CustomerDocument>("Customer", CustomerSchema);
