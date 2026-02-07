/** @format */

import type { Request, Response, NextFunction } from "express";
import { handleAsyncControl } from "../middlewares/handleAsyncControl.middleware.js";
import { AddressService } from "../services/address.service.js";
import { HttpStatus } from "../config/http.config.js";

export class AddressController {
  addressService: AddressService;
  constructor() {
    this.addressService = new AddressService();
  }

  createUserAddress = handleAsyncControl(
    async (
      req: Request<
        {},
        {},
        {
          city: string;
          state: string;
          country: string;
          postalCode: string;
          latitude: number;
          longitude: number;
          label?: "home" | "work" | "other";
          address?: string;
          isDefault?: boolean;
        }
      >,
      res: Response,
      next: NextFunction,
    ): Promise<Response> => {
      const userId = req.user?._id;
      try {
        const { userAddress } = await this.addressService.createUserAddress(
          userId,
          req.body.city,
          req.body.state,
          req.body.country,
          req.body.postalCode,
          req.body.latitude,
          req.body.longitude,
          req.body.label,
          req.body.address,
          req.body.isDefault,
        );

        return res.status(HttpStatus.OK).json({
          status: "ok",
          message: "Address created successfully",
          userAddress,
        });
      } catch (error) {
        throw error;
      }
    },
  );

  editUserAddress = handleAsyncControl(
    async (
      req: Request<{ addressId: string }>,
      res: Response,
      next: NextFunction,
    ): Promise<Response> => {
      try {
        const { userAddress } = await this.addressService.editUserAddress(
          req.params.addressId,
          req.body.city,
          req.body.state,
          req.body.country,
          req.body.postalCode,
          req.body.latitude,
          req.body.longitude,
          req.body.label,
          req.body.address,
          req.body.isDefault,
        );

        return res.status(HttpStatus.OK).json({
          status: "ok",
          message: "Address updated successfully",
          userAddress,
        });
      } catch (error) {
        throw error;
      }
    },
  );

  toggleDefaultAddress = handleAsyncControl(
    async (
      req: Request<{ addressId: string }>,
      res: Response,
      next: NextFunction,
    ): Promise<Response> => {
      const { addressId } = req.params;
      try {
        await this.addressService.toggleDefaultAddress(addressId);

        return res.status(HttpStatus.OK).json({
          status: "ok",
          message: "Default address set successfully",
        });
      } catch (error) {
        throw error;
      }
    },
  );

  deleteUserAddress = handleAsyncControl(
    async (
      req: Request<{ addressId: string }>,
      res: Response,
      next: NextFunction,
    ): Promise<Response> => {
      const { addressId } = req.params;
      try {
        await this.addressService.deleteUserAddress(addressId);
        return res.status(HttpStatus.OK).json({
          status: "ok",
          message: "Address deleted successfully",
        });
      } catch (error) {
        throw error;
      }
    },
  );
}
