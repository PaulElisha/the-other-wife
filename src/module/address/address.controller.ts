/** @format */

import type { NextFunction, Request, Response } from "express";
import AddressService from "@module/address/address.service.js";
import HttpStatus from "@config/http.config.js";
import { ApiResponse } from "@util/response.js";
import asyncHandler from "@/src/shared/middleware/async-handler.js";

class AddressController {
  createUserAddress = asyncHandler(
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
          label?: string;
          address?: string;
          isDefault?: boolean;
        }
      >,
      res: Response,
      next: NextFunction
    ): Promise<any> => {
      const {city, state, country, postalCode, latitude, longitude, label, address, isDefault} = req.body;

      const userId = Number(req.user.id);
      try {
        const userAddress = await AddressService.createUserAddress(
          userId,
          {
            city,
            state,
            country,
            postalCode,
            latitude,
            longitude,
            label,
            address,
            isDefault,
          }
        );

        return res.status(HttpStatus.CREATED).json({
          status: "ok",
          message: "Address created successfully",
          data: userAddress,
        } as ApiResponse);
      } catch (error) {
        next(error);
      }
    },
  );

  editUserAddress = asyncHandler(
    async (
      req: Request<
        { id: string },
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
      next: NextFunction
    ): Promise<any> => {
      const  addressId = Number(req.params.id);
      const userId = Number(req.user.id)
      try {
        const userAddress = await AddressService.editUserAddress(userId, addressId, req.body);

        return res.status(HttpStatus.OK).json({
          status: "ok",
          message: "Address updated successfully",
          data: userAddress,
        } as ApiResponse);
      } catch (error) {
        next(error);
      }
    },
  );

  toggleDefaultAddress = asyncHandler(
    async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<any> => {
      const addressId = Number(req.params.id);
      const userId = Number(req.user.id)
      try {
        const defaultAddress = await AddressService.toggleDefaultAddress(userId, addressId);

        return res.status(HttpStatus.OK).json({
          status: "ok",
          message: "Default address set successfully",
          data: defaultAddress,
        } as ApiResponse);
      } catch (error) {
        next(error);
      }
    },
  );

  deleteUserAddress = asyncHandler(
    async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<any> => {
      const addressId = Number(req.params.id);
      const userId = Number(req.user.id);
      const userType = req.user.userType;
      try {
        await AddressService.deleteUserAddress(userId, addressId);
        return res.status(HttpStatus.NO_CONTENT).send();
      } catch (error) {
        next(error);
      }
    },
  );

  getUserAddresses = asyncHandler(
    async (req: Request<{}>, res: Response, next: NextFunction): Promise<any> => {
      const userId = Number(req.user.id)

      try {
        const userAddresses = await AddressService.getUserAddresses(userId);
        return res.status(HttpStatus.OK).json({
          status: "ok",
          message: "User addresses fetched successfully",
          data: userAddresses,
        } as ApiResponse);
      } catch (error) {
        next(error);
      }
    },
  );
}

export default new AddressController();
