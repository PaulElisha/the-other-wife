/** @format */

import Customer from "../models/customer.model.js";
import User from "../models/user.model.js";
import { NotFoundException } from "../errors/not-found-exception.error.js";
import { HttpStatus } from "../config/http.config.js";
import { ErrorCode } from "../enums/error-code.enum.js";
import { transaction } from "../util/transaction.util.js";
import { BadRequestException } from "../errors/bad-request-exception.error.js";

export class CustomerService {
  private tx;

  constructor() {
    this.tx = transaction();
  }

  getCustomerProfile = async (customerId: string, userId: string) => {
    if (!customerId) {
      throw new BadRequestException(
        "Customer ID is required",
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR,
      );
    }

    const customer = await Customer.findOne({ _id: customerId, userId })
      .populate("userId")
      .populate("addressId");

    if (!customer) {
      throw new NotFoundException(
        "Customer not found",
        HttpStatus.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }

    return { customer };
  };

  updateCustomerProfile = async (
    customerId: string,
    userId: string,
    body: {
      profileImageUrl: string;
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber: string;
    },
  ) => {
    if (!customerId) {
      throw new BadRequestException(
        "Customer ID is required",
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR,
      );
    }

    const { profileImageUrl, firstName, lastName, email, phoneNumber } = body;

    const session = await this.tx.startTransaction();

    try {
      const customer = await Customer.findOneAndUpdate([
        customerId,
        userId,
        {
          $set: { profileImageUrl },
        },
        { new: true },
      ]).session(session);

      const user = await User.findOneAndUpdate(
        { _id: customerId, userId },
        {
          $set: { firstName, lastName, email, phoneNumber },
        },
        { new: true },
      ).session(session);

      if (!customer && !user) {
        throw new NotFoundException(
          "Customer profile not found",
          HttpStatus.NOT_FOUND,
          ErrorCode.RESOURCE_NOT_FOUND,
        );
      }

      await this.tx.commitTransaction(session);
      return { ...{ user }, ...{ customer } };
    } catch (error) {
      await this.tx.end(session);
      throw error;
    }
  };

  deleteCustomerProfile = async (customerId: string, userId: string) => {
    if (!customerId) {
      throw new BadRequestException(
        "Customer ID is required",
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR,
      );
    }

    const session = await this.tx.startTransaction();

    try {
      const customer = await Customer.findOne({
        _id: customerId,
        userId,
      }).session(session);

      if (!customer) {
        throw new NotFoundException(
          "Customer not found",
          HttpStatus.NOT_FOUND,
          ErrorCode.RESOURCE_NOT_FOUND,
        );
      }

      const user = await User.findOneAndUpdate({
        _id: customer.userId,
      }).session(session);

      if (!user) {
        throw new NotFoundException(
          "User not found",
          HttpStatus.NOT_FOUND,
          ErrorCode.RESOURCE_NOT_FOUND,
        );
      }

      await user.deleteOne({ session });
      await customer.deleteOne({ session });

      await this.tx.commitTransaction(session);
    } catch (error) {
      await this.tx.end(session);
      throw error;
    }
  };
}
