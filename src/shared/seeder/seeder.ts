/** @format */

import mongoose from "mongoose";

import Db from "@config/db.config.js";
import MealCategory from "@model/mealCategory.js";
import { CategoryType } from "@type/env-types";

import type { ClientSession } from "mongoose";

class Seeder {
  public session: ClientSession | undefined;

  startSession = async (): Promise<ClientSession> => {
    try {
      if (this.session) return this.session;
      else this.session = await mongoose.startSession();
      return this.session;
    } catch (error) {
      throw error;
    }
  };

  clearExistingCategories = async (session: ClientSession): Promise<void> => {
    try {
      await MealCategory.deleteMany({}, { session });
    } catch (error) {
      throw error;
    }
  };

  run = async (): Promise<void> => {
    let session: ClientSession | undefined;
    session = await this.startSession();

    try {
      await Db.connect();
      session.startTransaction();

      await this.clearExistingCategories(session);

      await this.seedCategories(session);
      await session.commitTransaction();
    } catch (error) {
      await session?.abortTransaction();
      console.log("transaction aborted", error);
      throw error;
    } finally {
      await session?.endSession();
    }
  };

  seedCategories = async (session: ClientSession) => {
    const CategoryArray = Object.values(CategoryType);
    for (const categoryValue of CategoryArray) {
      try {
        const existCategory = await MealCategory.findOne({
          category: categoryValue as unknown as string,
        }).session(session);
        if (!existCategory) {
          await MealCategory.create(
            [
              {
                category: categoryValue as unknown as string,
                description: `${categoryValue} category`,
              },
            ],
            {
              session,
            },
          );
          console.log("Category created");
        }
      } catch (error) {
        throw error;
      }
    }
  };
}

export default Seeder;

if (import.meta.url === `file://${process.argv[1]}`) {
  new Seeder()
    .run()
    .then(() => console.log("Seeding complete"))
    .catch((err) => console.log("Seeding failed", err));
}
