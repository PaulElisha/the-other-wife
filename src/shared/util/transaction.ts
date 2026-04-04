/** @format */

import mongoose, { ClientSession } from "mongoose";

class Transaction {
  createtransaction = async () => {
    try {
      const session = await mongoose.startSession();
      session.startTransaction();
      return session;
    } catch (error) {
      throw error;
    }
  };

  use =
    <Args extends any[], R>(callback: (session: ClientSession, ...args: Args) => Promise<R>) =>
    async (...args: Args) => {
      const session = await this.createtransaction();
      try {
        const result: R = await callback(session, ...args);
        await session.commitTransaction();
        return result;
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    };
}

const transaction = new Transaction();

export default transaction;
