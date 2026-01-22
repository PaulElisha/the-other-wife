/** @format */

import mongoose, { Document, Schema, model } from "mongoose";

export interface RoleDocument extends Document {
  name: string;
  description: string;
}

const RoleSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
});

export default model<RoleDocument>("Role", RoleSchema);
