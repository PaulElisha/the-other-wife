/** @format */

import { HttpStatus } from "../config/http.config.js";
import { ErrorCode } from "../enums/error-code.enum.js";
import { NotFoundException } from "../errors/not-found-exception.error.js";
import { UnauthorizedExceptionError } from "../errors/unauthorized-exception.error.js";
import Vendor from "../models/vendor.model.js";
import User from "../models/user.model.js";
import { BadRequestException } from "../errors/bad-request-exception.error.js";

export class VendorService {
  constructor() {}

  getVendorProfile = async (vendorId: string) => {
    if (!vendorId) {
      throw new BadRequestException(
        "Vendor ID is required",
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR,
      );
    }

    const vendor = await Vendor.findById(vendorId)
      .populate("userId")
      .populate("addressId");

    if (!vendor) {
      throw new NotFoundException(
        "Vendor not found",
        HttpStatus.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }

    return { vendor };
  };

  approveVendor = async (
    vendorId: string,
    userId: string,
    userType: string,
  ) => {
    if (!vendorId && !userId && !userType) {
      throw new BadRequestException(
        "Vendor ID and User ID and User Type are required",
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR,
      );
    }

    const isAdmin = userType === "admin";
    if (!isAdmin) {
      throw new UnauthorizedExceptionError(
        "User is not an admin",
        HttpStatus.FORBIDDEN,
        ErrorCode.ACCESS_UNAUTHORIZED,
      );
    }

    const vendor = await Vendor.findByIdAndUpdate(
      vendorId,
      {
        approvalStatus: "approved",
        approvedBy: userId,
        approvedAt: new Date(),
      },
      { new: true },
    );

    if (!vendor) {
      throw new NotFoundException(
        "Vendor not found",
        HttpStatus.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }

    return { vendor };
  };

  rejectVendor = async (vendorId: string, reason: string | undefined) => {
    if (!vendorId) {
      throw new BadRequestException(
        "Vendor ID is required",
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR,
      );
    }

    const vendor = await Vendor.findByIdAndUpdate(
      vendorId,
      {
        approvalStatus: "rejected",
        rejectionReason: reason,
      },
      { new: true },
    );

    if (!vendor) {
      throw new NotFoundException(
        "Vendor not found",
        HttpStatus.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }

    return { vendor };
  };

  suspendVendor = async (vendorId: string) => {
    if (!vendorId) {
      throw new BadRequestException(
        "Vendor ID is required",
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR,
      );
    }

    const vendor = await Vendor.findByIdAndUpdate(
      vendorId,
      {
        approvalStatus: "suspended",
      },
      { new: true },
    );

    if (!vendor) {
      throw new NotFoundException(
        "Vendor not found",
        HttpStatus.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }

    return { vendor };
  };

  deleteVendorProfile = async (vendorId: string) => {
    if (!vendorId) {
      throw new BadRequestException(
        "Vendor ID is required",
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR,
      );
    }

    const vendor = await Vendor.findOne({ vendorId });

    if (!vendor) {
      throw new NotFoundException(
        "Vendor not found",
        HttpStatus.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }

    const user = await User.findById(vendor.userId);

    if (!user) {
      throw new NotFoundException(
        "User not found",
        HttpStatus.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }

    await user.deleteOne();
    await vendor.deleteOne();
  };
}
