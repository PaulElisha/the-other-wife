/** @format */

import User from "../models/user.model.js";
import { NotFoundException } from "../errors/not-found-exception.error.js";
import { HttpStatus } from "../config/http.config.js";
import { ErrorCode } from "../enums/error-code.enum.js";

export class UserService {
  getCurrentUser = async (userId: string) => {
    if (!userId) {
      throw new NotFoundException(
        "User not logged in",
        HttpStatus.NOT_FOUND,
        ErrorCode.AUTH_USER_NOT_FOUND,
      );
    }

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

  getAllUsers = async () => {
    const users = await User.find()
      .select("-passwordHash")
      .populate("addressId")
      .sort({ createdAt: -1 })
      .limit(10);

    if (!users) {
      throw new NotFoundException(
        "Users not found",
        HttpStatus.NOT_FOUND,
        ErrorCode.AUTH_USER_NOT_FOUND,
      );
    }

    return users;
  };
}
