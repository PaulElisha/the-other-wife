/** @format */

import mongoose, { ClientSession } from "mongoose";

export class CreateTransaction {
  private session: ClientSession;

  constructor() {
    this.session = {} as ClientSession;
    new.target;
  }

  startTransaction = async () => {
    this.session = await mongoose.startSession();
    this.session.startTransaction();
    return this.session;
  };

  commitTransaction = async () => {
    await this.session.commitTransaction();
  };

  end = async () => {
    await this.session.abortTransaction();
    this.session.endSession();
  };
}
