/** @format */

import mongoose from "mongoose";

import { mongoUri } from "../constants/constants.js";

class Db {
  async connect() {
    try {
      await mongoose.connect(mongoUri);

      mongoose.connection.on("connected", (): void => {
        console.log("MongoDB connected successfully");
      });

      mongoose.connection.on("error", (err): void => {
        console.error("Error connection failed:", err.message);
      });
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
      process.exit(1);
    }
  }
}

export { Db };
