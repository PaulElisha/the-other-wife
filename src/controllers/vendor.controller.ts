/** @format */

import { HttpStatus } from "../config/http.config.js";
import { handleAsyncControl } from "../middlewares/handleAsyncControl.middleware.js";
import { VendorService } from "../services/vendor.service.js";
import { Request, Response } from "express";

export class VendorController {
  vendorService: VendorService;
  constructor() {
    this.vendorService = new VendorService();
  }

  getVendorProfile = handleAsyncControl(
    async (
      req: Request<{ vendorId: string }>,
      res: Response,
    ): Promise<Response> => {
      const vendorId = req.params.vendorId;
      try {
        const vendor = await this.vendorService.getVendorProfile(vendorId);
        return res.status(HttpStatus.OK).json({
          status: "ok",
          message: "Vendor profile retrieved successfully",
          vendor,
        });
      } catch (error) {
        throw error;
      }
    },
  );

  approveVendor = handleAsyncControl(
    async (
      req: Request<{ vendorId: string }>,
      res: Response,
    ): Promise<Response> => {
      const vendorId = req.params.vendorId;
      const userId = req.user?._id?.toString();

      try {
        const vendor = await this.vendorService.approveVendor(vendorId, userId);
        return res.status(HttpStatus.NO_CONTENT).json({
          status: "ok",
          message: "Vendor approved successfully",
          vendor,
        });
      } catch (error) {
        throw error;
      }
    },
  );

  rejectVendor = handleAsyncControl(
    async (
      req: Request<
        { vendorId: string },
        {},
        {
          rejectionReason: string;
        }
      >,
      res: Response,
    ): Promise<Response> => {
      const vendorId = req.params.vendorId;
      const rejectionReason = req.body.rejectionReason;

      try {
        const vendor = await this.vendorService.rejectVendor(
          vendorId,
          rejectionReason,
        );
        return res.status(HttpStatus.NO_CONTENT).json({
          status: "ok",
          message: "Vendor rejected successfully",
          vendor,
        });
      } catch (error) {
        throw error;
      }
    },
  );

  suspendVendor = handleAsyncControl(
    async (
      req: Request<{ vendorId: string }>,
      res: Response,
    ): Promise<Response> => {
      const vendorId = req.params.vendorId;

      try {
        const vendor = await this.vendorService.suspendVendor(vendorId);
        return res.status(HttpStatus.NO_CONTENT).json({
          status: "ok",
          message: "Vendor suspended successfully",
          vendor,
        });
      } catch (error) {
        throw error;
      }
    },
  );

  deleteVendorProfile = handleAsyncControl(
    async (
      req: Request<{ vendorId: string }>,
      res: Response,
    ): Promise<Response> => {
      const vendorId = req.params.vendorId;

      try {
        const vendor = await this.vendorService.deleteVendorProfile(vendorId);
        return res.status(HttpStatus.NO_CONTENT).json({
          status: "ok",
          message: "Vendor profile deleted successfully",
          vendor,
        });
      } catch (error) {
        throw error;
      }
    },
  );
}
