/** @format */

import HttpStatus from "@config/http.config.js";
import VendorService from "@module/vendor/vendor.service.js";
import type { NextFunction, Request, Response } from "express";
import { ApiResponse } from "@util/response.js";
import asyncHandler from "@middleware/async-handler.js";

class VendorController {
  getVendorProfile = asyncHandler(
    async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<any> => {
      const userId = Number(req.user.id)
      const vendorId = Number(req.params.id)
      try {
        const vendor = await VendorService.getVendorProfile(vendorId, userId);
        return res.status(HttpStatus.OK).json({
          status: "ok",
          message: "Vendor profile retrieved successfully",
          data: vendor,
        } as ApiResponse);
      } catch (error) {
        next(error);
      }
    },
  );

  updateVendorProfile = asyncHandler(
    async (
      req: Request<
        { id: string },
        {},
        {
          firstName: string;
          lastName: string;
          phoneNumber: string;
          businessName: string;
          businessDescription: string;
          businessLogoUrl: string;
        }
      >,
      res: Response,
      next: NextFunction
    ): Promise<any> => {
      const vendorId = Number(req.params.id);
      const userId = Number(req.user.id);

      const {
        firstName,
        lastName,
        phoneNumber,
        businessName,
        businessDescription,
        businessLogoUrl,
      } = req.body;

      try {
        const vendor = await VendorService.updateVendorProfile(vendorId, userId, {
          firstName,
          lastName,
          phoneNumber,
          businessName,
          businessDescription,
          businessLogoUrl,
        });
        return res.status(HttpStatus.OK).json({
          status: "ok",
          message: "Vendor profile updated successfully",
          data: vendor,
        } as ApiResponse);
      } catch (error) {
        next(error);
      }
    },
  );

  approveVendor = asyncHandler(
    async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<any> => {
      const vendorId = Number(req.params.id);
      const userId = Number(req.user.id)
      const userType = req.user.userType;

      try {
        const vendor = await VendorService.approveVendor(vendorId, userId, userType);
        return res.status(HttpStatus.OK).json({
          status: "ok",
          message: "Vendor approved successfully",
          data: vendor,
        } as ApiResponse);
      } catch (error) {
        next(error);
      }
    },
  );

  rejectVendor = asyncHandler(
    async (
      req: Request<
        { id: string },
        {},
        {
          rejectionReason: string;
        }
      >,
      res: Response,
      next: NextFunction
    ): Promise<any> => {
      const vendorId = Number(req.params.id);
      const userId = Number(req.user.id)
      const rejectionReason = req.body.rejectionReason;

      try {
        const vendor = await VendorService.rejectVendor(vendorId, userId, rejectionReason);
        return res.status(HttpStatus.OK).json({
          status: "ok",
          message: "Vendor rejected successfully",
          data: vendor,
        } as ApiResponse);
      } catch (error) {
        next(error);
      }
    },
  );

  suspendVendor = asyncHandler(
    async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<any> => {
      const vendorId = Number(req.params.id);
      const userId = Number(req.user.id);

      try {
        const vendor = await VendorService.suspendVendor(vendorId, userId);
        return res.status(HttpStatus.OK).json({
          status: "ok",
          message: "Vendor suspended successfully",
          data: vendor,
        } as ApiResponse);
      } catch (error) {
        next(error);
      }
    },
  );

  deleteVendorProfile = asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<any> => {
      const userId = Number(req.user.id)
      const vendorId = Number(req.params.id)

      try {
        await VendorService.deleteVendorProfile(vendorId, userId);
        return res.status(HttpStatus.NO_CONTENT).send();
      } catch (error) {
        next(error);
      }
    },
  );
}

export default new VendorController();
