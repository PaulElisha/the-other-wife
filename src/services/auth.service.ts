/** @format */

import mongoose, { ClientSession } from "mongoose";

import { HttpStatus } from "../config/http.config.js";
import { ErrorCode } from "../enums/error-code.enum.js";

import { BadRequestException } from "../errors/bad-request-exception.error.js";
import { UnauthorizedExceptionError } from "../errors/unauthorized-exception.error.js";
import { NotFoundException } from "../errors/not-found-exception.error.js";

import User, { UserDocument } from "../models/user.model.js";
import Customer from "../models/customer.model.js";
import Vendor from "../models/vendor.model.js";

import { generateToken } from "../utils/generate-token.js";
import { nodeEnv } from "../constants/constants.js";

export class AuthService {
  signup = async (body: {
    firstName: string;
    lastName: string;
    email?: string;
    password: string;
    userType?: string;
    phoneNumber?: string;
  }): Promise<{
    userId: mongoose.Types.ObjectId;
  }> => {
    const {
      firstName,
      lastName,
      password,
      userType = "customer",
      phoneNumber,
      email,
    } = body;

    try {
      if (!phoneNumber && !email) {
        throw new BadRequestException(
          "Email or phone number is required",
          HttpStatus.BAD_REQUEST,
          ErrorCode.VALIDATION_ERROR,
        );
      }

      if (phoneNumber) {
        const userByPhone = await User.findOne({ phoneNumber });
        if (userByPhone) {
          throw new BadRequestException(
            "Phone number already exists",
            HttpStatus.BAD_REQUEST,
            ErrorCode.AUTH_PHONE_NUMBER_ALREADY_EXISTS,
          );
        }
      }

      if (email) {
        const userByEmail = await User.findOne({ email });
        if (userByEmail) {
          throw new BadRequestException(
            "Email already exists",
            HttpStatus.BAD_REQUEST,
            ErrorCode.AUTH_EMAIL_ALREADY_EXISTS,
          );
        }
      }

      const newUser = await User.create({
        firstName,
        lastName,
        email,
        passwordHash: password,
        userType,
        phoneNumber,
      });

      switch (userType) {
        case "customer":
          await Customer.create({
            userId: newUser._id,
          });
          break;
        case "vendor":
          await Vendor.create({
            userId: newUser._id,
          });
          break;
        default:
          throw new Error("Account for user type cannot be created.");
      }

      return { userId: newUser._id };
    } catch (error) {
      throw error;
    }
  };

  login = async (body: {
    phoneNumber?: string;
    email?: string;
    password: string;
  }): Promise<any> => {
    const { phoneNumber, email, password } = body;

    try {
      if (!email && !phoneNumber) {
        throw new BadRequestException(
          "Email or phone number is required",
          HttpStatus.BAD_REQUEST,
          ErrorCode.VALIDATION_ERROR,
        );
      }

      const user = await User.findOne(email ? { email } : { phoneNumber });
      if (!user) {
        throw new NotFoundException(
          "User not found",
          HttpStatus.NOT_FOUND,
          ErrorCode.AUTH_USER_NOT_FOUND,
        );
      }

      const isValid = await user.comparePassword(password);
      if (!isValid) {
        throw new UnauthorizedExceptionError(
          "Invalid phone number or password",
          HttpStatus.UNAUTHORIZED,
          ErrorCode.AUTH_UNAUTHORIZED_ACCESS,
        );
      }

      user.lastLogin = new Date();
      await user.save();

      const { token } = generateToken(user._id);
      return { token };
    } catch (error) {
      throw error;
    }
  };

  logout = (): any => ({
    httpOnly: true,
    secure: nodeEnv === "production",
    sameSite: "strict",
    path: "/",
    expires: new Date(0),
  });

  // passwordResetRequest = async (phoneNumber: string) => {
  //   const user = await User.findOne({ phoneNumber });

  //   if (!user) {
  //     throw new NotFoundException(
  //       "User not found",
  //       HttpStatus.NOT_FOUND,
  //       ErrorCode.AUTH_USER_NOT_FOUND,
  //     );
  //   }

  //   const token = Crypto.randomBytes(20).toString("hex");
  //   user.resetToken = token;
  //   user.resetTokenExpiry = Date.now() + 20 * 60 * 1000;
  //   await user.save();

  //   return { token };
  // };

  // passwordReset = async (newPassword: string, token: string) => {
  //   const user = await User.findOne({
  //     resetToken: token,
  //     resetTokenExpiry: { $gt: Date.now(), $lt: Date.now() + 20 * 60 * 1000 },
  //   });
  //   if (!user) {
  //     throw new NotFoundException(
  //       "User not found",
  //       HttpStatus.NOT_FOUND,
  //       ErrorCode.AUTH_USER_NOT_FOUND,
  //     );
  //   }

  //   user.passwordHash = await bcrypt.hash(newPassword, 10);
  //   user.resetToken = null;
  //   user.resetTokenExpiry = null;
  //   await user.save();
  // };
}
