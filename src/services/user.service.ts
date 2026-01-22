/** @format */

import mongoose from "mongoose";

import User from "../models/user.model.js";
import { NotFoundException } from "../errors/not-found-exception.error.js";
import { HttpStatus } from "../config/http.config.js";
import { ErrorCode } from "../enums/error-code.enum.js";

export class UserService {
  getCurrentUser = async (userId: mongoose.Types.ObjectId | undefined) => {
    const user = await User.findById(userId).select("-passwordHash");

    if (!user) {
      throw new NotFoundException(
        "User not found",
        HttpStatus.NOT_FOUND,
        ErrorCode.AUTH_USER_NOT_FOUND,
      );
    }

    return { user };
  };

  editUser = async (
    userId: mongoose.Types.ObjectId | undefined,
    body: {
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber: string;
    },
  ) => {
    const { firstName, lastName, email, phoneNumber } = body;
    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundException(
        "User not found",
        HttpStatus.NOT_FOUND,
        ErrorCode.AUTH_USER_NOT_FOUND,
      );
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;

    await user.save();

    return { user };
  };
}
