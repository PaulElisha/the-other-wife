/** @format */

import mongoose from "mongoose";
import Customer from "../models/customer.model";
import { NotFoundException } from "../errors/not-found-exception.error";
import { HttpStatus } from "../config/http.config";
import { ErrorCode } from "../enums/error-code.enum";

export class CustomerService {
  getCustomerProfile = async (customerId: string) => {
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

  deleteCustomerProfile = async (customerId: string) => {
    await Customer.findByIdAndDelete(customerId);
  };

  updateCustomerProfile = async (
    customerId: string,
    profileImageUrl: string,
  ) => {
    const customer = await Customer.findByIdAndUpdate(
      customerId,
      {
        $set: { profileImageUrl },
      },
      { new: true },
    );

    if (!customer) {
      throw new NotFoundException(
        "Customer not found",
        HttpStatus.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }

    return { customer };
  };
}
