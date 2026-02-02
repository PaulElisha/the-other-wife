/** @format */

import { HttpStatus } from "../config/http.config";
import { ErrorCode } from "../enums/error-code.enum";
import { NotFoundException } from "../errors/not-found-exception.error";
import Vendor from "../models/vendor.model";
import User from "../models/user.model";

export class VendorService {
  constructor() {}

  getVendorProfile = async (vendorId: string) => {
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

  approveVendor = async (vendorId: string, userId: string | undefined) => {
    const user = await User.findById(userId);
    const isAdmin = user?.userType === "admin";
    if (!isAdmin) {
      throw new NotFoundException(
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
    const vendor = await Vendor.findByIdAndDelete(vendorId);

    if (!vendor) {
      throw new NotFoundException(
        "Vendor not found",
        HttpStatus.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }

    return { vendor };
  };

  
}
