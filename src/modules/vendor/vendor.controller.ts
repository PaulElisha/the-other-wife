/** @format */

import HttpStatus from "@config/http.config.js";
import handleAsyncControl from "@middleware/handle-async-control.js";
import VendorService from "./vendor.service.js";
import type { Request, Response } from "express";
import { ApiResponse } from "@util/response.js";

class VendorController {
  getVendorProfile = handleAsyncControl(
    async (req: Request<{ id: string }>, res: Response): Promise<Response> => {
      const userId = req?.user?._id as unknown as string;
      try {
        const vendor = await VendorService.getVendorProfile(userId);
        return res.status(HttpStatus.OK).json({
          status: "ok",
          message: "Vendor profile retrieved successfully",
          data: vendor,
        } as ApiResponse);
      } catch (error) {
        throw error;
      }
    },
  );

  updateVendorProfile = handleAsyncControl(
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
    ): Promise<Response> => {
      const vendorId = req.params.id;
      const userId = req?.user?._id as unknown as string;

      const {
        firstName,
        lastName,
        phoneNumber,
        businessName,
        businessDescription,
        businessLogoUrl,
      } = req.body;

      try {
        const vendor = await VendorService.updateVendorProfile(userId, {
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
        throw error;
      }
    },
  );

  approveVendor = handleAsyncControl(
    async (req: Request<{ id: string }>, res: Response): Promise<Response> => {
      const vendorId = req.params.id;
      const userId = req.user?._id as unknown as string;
      const userType = req.user?.userType as unknown as string;

      try {
        const vendor = await VendorService.approveVendor(vendorId, userId, userType);
        return res.status(HttpStatus.OK).json({
          status: "ok",
          message: "Vendor approved successfully",
          data: vendor,
        } as ApiResponse);
      } catch (error) {
        throw error;
      }
    },
  );

  rejectVendor = handleAsyncControl(
    async (
      req: Request<
        { id: string },
        {},
        {
          rejectionReason: string;
        }
      >,
      res: Response,
    ): Promise<Response> => {
      const vendorId = req.params.id;
      const userId = req?.user?._id as unknown as string;
      const rejectionReason = req.body.rejectionReason;

      try {
        const vendor = await VendorService.rejectVendor(vendorId, userId, rejectionReason);
        return res.status(HttpStatus.OK).json({
          status: "ok",
          message: "Vendor rejected successfully",
          data: vendor,
        } as ApiResponse);
      } catch (error) {
        throw error;
      }
    },
  );

  suspendVendor = handleAsyncControl(
    async (req: Request<{ id: string }>, res: Response): Promise<Response> => {
      const vendorId = req.params.id;
      const userId = req?.user?._id as unknown as string;

      try {
        const vendor = await VendorService.suspendVendor(vendorId, userId);
        return res.status(HttpStatus.OK).json({
          status: "ok",
          message: "Vendor suspended successfully",
          data: vendor,
        } as ApiResponse);
      } catch (error) {
        throw error;
      }
    },
  );

  deleteVendorProfile = handleAsyncControl(
    async (req: Request, res: Response): Promise<Response> => {
      const userId = req?.user?._id as unknown as string;

      try {
        await VendorService.deleteVendorProfile(userId);
        return res.status(HttpStatus.NO_CONTENT).send();
      } catch (error) {
        throw error;
      }
    },
  );
}

export default new VendorController();
