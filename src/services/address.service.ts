/** @format */

import mongoose from "mongoose";
import Address from "../models/address.model";
import { NotFoundException } from "../errors/not-found-exception.error";
import { HttpStatus } from "../config/http.config";
import { ErrorCode } from "../enums/error-code.enum";
import Customer from "../models/customer.model";

export class AddressService {
  constructor() {}

  createUserAddress = async (
    userId: mongoose.Types.ObjectId | undefined,
    city: string,
    state: string,
    country: string,
    postalCode: string,
    latitude: number,
    longitude: number,
  ) => {
    const userAddress = await Address.create({
      userId,
      city,
      state,
      country,
      postalCode,
      latitude,
      longitude,
    });

    await Customer.findByIdAndUpdate(
      userId,
      { $set: { addressId: userAddress._id } },
      { new: true },
    );

    return { userAddress };
  };

  editUserAddress = async (
    addressId: string,
    city: string,
    state: string,
    country: string,
    postalCode: string,
    latitude: number,
    longitude: number,
  ) => {
    const userAddress = await Address.findById(addressId);

    if (!userAddress) {
      throw new NotFoundException(
        "Address not found",
        HttpStatus.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }

    if (city) userAddress.city = city;
    if (state) userAddress.state = state;
    if (country) userAddress.country = country;
    if (postalCode) userAddress.postalCode = postalCode;
    if (latitude) userAddress.latitude = latitude;
    if (longitude) userAddress.longitude = longitude;

    await userAddress.save();

    return { userAddress };
  };

  toggleDefaultAddress = async (addressId: string) => {
    const userAddress = await Address.findById(addressId);

    if (!userAddress) {
      throw new NotFoundException(
        "Address not found",
        HttpStatus.NOT_FOUND,
        ErrorCode.AUTH_USER_NOT_FOUND,
      );
    }

    if (!userAddress) {
      throw new NotFoundException(
        "Address not found",
        HttpStatus.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }

    userAddress.isDefault = !userAddress.isDefault;

    await userAddress.save();

    return { userAddress };
  };

  deleteUserAddress = async (addressId: string) => {
    await Address.findByIdAndDelete(addressId);
  };
}
