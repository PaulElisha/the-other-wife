/** @format */

import mongoose from "mongoose";

import { mongoUri } from "../constants/constants.js";

export class Db {
  private connectionPromise: Promise<typeof mongoose> | null = null;

  connect = async () => {
    if (this.connectionPromise) return this.connectionPromise;

    if (!mongoUri) {
      throw new Error("MONGODB_URI is not defined");
    }

    this.connectionPromise = mongoose.connect(mongoUri).then((m) => {
      console.log("MongoDB connected successfully");
      return m;
    });

    try {
      return await this.connectionPromise;
    } catch (error) {
      this.connectionPromise = null;
      console.error("Error connecting to MongoDB:", error);
      throw error;
    }
  };
}
