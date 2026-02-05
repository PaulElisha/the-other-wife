/** @format */

import mongoose from "mongoose";
import Address from "../models/address.model.js";
import { NotFoundException } from "../errors/not-found-exception.error.js";
import { HttpStatus } from "../config/http.config.js";
import { ErrorCode } from "../enums/error-code.enum.js";
import Customer from "../models/customer.model.js";

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
    label?: "home" | "work" | "other",
    address?: string,
    isDefault?: boolean,
  ) => {
    const userAddress = await Address.create({
      userId,
      city,
      state,
      country,
      postalCode,
      latitude,
      longitude,
      label,
      address,
      isDefault,
    });

    if (userId) {
      await Customer.findOneAndUpdate(
        { userId },
        { $set: { addressId: userAddress._id } },
        { new: true },
      );
    }

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
    label?: "home" | "work" | "other",
    address?: string,
    isDefault?: boolean,
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
    if (label) userAddress.label = label;
    if (address) userAddress.address = address;
    if (typeof isDefault === "boolean") userAddress.isDefault = isDefault;

    await userAddress.save();

    return { userAddress };
  };

  toggleDefaultAddress = async (addressId: string) => {
    const userAddress = await Address.findById(addressId);

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
