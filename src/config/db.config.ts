/** @format */

import mongoose from "mongoose";

class Db {
  async connect(mongoUri: string): Promise<void> {
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
