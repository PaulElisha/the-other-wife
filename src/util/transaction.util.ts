/** @format */

import mongoose, { ClientSession } from "mongoose";

class CreateTransaction {
  private session: ClientSession;

  constructor() {
    this.session = {} as ClientSession;
  }

  startTransaction = async () => {
    try {
      this.session = await mongoose.startSession();
      this.session.startTransaction();
      return this.session;
    } catch (error) {
      throw error;
    }
  };

  commitTransaction = async (session: ClientSession) => {
    try {
      await session.commitTransaction();
    } catch (error) {
      throw error;
    }
  };

  end = async (session: ClientSession) => {
    try {
      await session.abortTransaction();
      session.endSession();
    } catch (error) {
      throw error;
    }
  };
}

export const transaction = () => new CreateTransaction();
