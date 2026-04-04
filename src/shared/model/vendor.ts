/** @format */

import mongoose, { Schema, model } from "mongoose";
import type { VendorDocument } from "@type/env-types";

const VendorSchema = new Schema({
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
  businessName: {
    type: String,
    required: false,
  },
  businessDescription: {
    type: String,
    required: false,
  },
  businessLogoUrl: {
    type: String,
    required: false,
  },
  approvalStatus: {
    type: String,
    enum: ["pending", "approved", "suspended", "rejected"],
    default: "pending",
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  approvedAt: {
    type: Date,
    required: false,
  },
  rejectionReason: {
    type: String,
    required: false,
  },
  additionalData: {
    type: Object,
    required: false,
  },
});

export default model<VendorDocument>("Vendor", VendorSchema);
