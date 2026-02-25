/** @format */

import Customer from "../models/customer.model.js";
import User from "../models/user.model.js";
import { NotFoundException } from "../errors/not-found-exception.error.js";
import { HttpStatus } from "../config/http.config.js";
import { ErrorCode } from "../enums/error-code.enum.js";
import mongoose from "mongoose";
import { CreateTransaction } from "../util/transaction.util.js";
import { BadRequestException } from "../errors/bad-request-exception.error.js";

export class CustomerService {
  getCustomerProfile = async (customerId: string) => {
    if (!customerId) {
      throw new BadRequestException(
        "Customer ID is required",
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR,
      );
    }

    const customer = await Customer.findById(customerId)
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

    const tx = new CreateTransaction();
    try {
      const session = await tx.startTransaction();

      const customer = await Customer.findByIdAndUpdate(
        [
          customerId,
          {
            $set: { profileImageUrl },
          },
          { new: true },
        ],
        {
          session,
        },
      );

      const user = await User.findByIdAndUpdate(
        [
          customer?.userId,
          {
            $set: { firstName, lastName, email, phoneNumber },
          },
          { new: true },
        ],
        {
          session,
        },
      );

      if (!customer && !user) {
        throw new NotFoundException(
          "Customer profile not found",
          HttpStatus.NOT_FOUND,
          ErrorCode.RESOURCE_NOT_FOUND,
        );
      }

      await tx.commitTransaction();
      return { customer, user };
    } catch (error) {
      await tx.end();
      throw error;
    }
  };

  deleteCustomerProfile = async (customerId: string) => {
    if (!customerId) {
      throw new BadRequestException(
        "Customer ID is required",
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR,
      );
    }

    const tx = new CreateTransaction();

    try {
      const session = await tx.startTransaction();

      const customer = await Customer.findOne([{ customerId }], { session });

      if (!customer) {
        throw new NotFoundException(
          "Customer not found",
          HttpStatus.NOT_FOUND,
          ErrorCode.RESOURCE_NOT_FOUND,
        );
      }

      const user = await User.findById([customer.userId], { session });

      if (!user) {
        throw new NotFoundException(
          "User not found",
          HttpStatus.NOT_FOUND,
          ErrorCode.RESOURCE_NOT_FOUND,
        );
      }

      await user.deleteOne({ session });
      await customer.deleteOne({ session });

      await tx.commitTransaction();
    } catch (error) {
      await tx.end();
      throw error;
    }
  };
}
