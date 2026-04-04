/** @format */

import type { Request, Response } from "express";
import handleAsyncControl from "@middleware/handle-async-control.js";
import AddressService from "@module/address/address.service.js";
import HttpStatus from "@config/http.config.js";
import { ApiResponse } from "@util/response.js";

class AddressController {
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
    ): Promise<Response> => {
      const userId = req.user?._id as unknown as string;
      try {
        const userAddress = await AddressService.createUserAddress(
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

        return res.status(HttpStatus.CREATED).json({
          status: "ok",
          message: "Address created successfully",
          data: userAddress,
        } as ApiResponse);
      } catch (error) {
        throw error;
      }
    },
  );

  editUserAddress = handleAsyncControl(
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
    ): Promise<Response> => {
      const { id: addressId } = req.params;
      const userId = req.user?._id as unknown as string;
      try {
        const userAddress = await AddressService.editUserAddress(userId, addressId, req.body);

        return res.status(HttpStatus.OK).json({
          status: "ok",
          message: "Address updated successfully",
          data: userAddress,
        } as ApiResponse);
      } catch (error) {
        throw error;
      }
    },
  );

  toggleDefaultAddress = handleAsyncControl(
    async (req: Request<{ id: string }>, res: Response): Promise<Response> => {
      const { id: addressId } = req.params;
      const userId = req.user?._id as unknown as string;
      try {
        const defaultAddress = await AddressService.toggleDefaultAddress(userId, addressId);

        return res.status(HttpStatus.OK).json({
          status: "ok",
          message: "Default address set successfully",
          data: defaultAddress,
        } as ApiResponse);
      } catch (error) {
        throw error;
      }
    },
  );

  deleteUserAddress = handleAsyncControl(
    async (req: Request<{ id: string }>, res: Response): Promise<Response> => {
      const { id: addressId } = req.params;
      const userId = req.user?._id as unknown as string;
      const userType = req.user?.userType as string;
      try {
        await AddressService.deleteUserAddress(userId, addressId, userType);
        return res.status(HttpStatus.NO_CONTENT).send();
      } catch (error) {
        throw error;
      }
    },
  );

  getUserAddresses = handleAsyncControl(
    async (req: Request<{}>, res: Response): Promise<Response> => {
      const userId = req.user?._id as unknown as string;

      try {
        const userAddresses = await AddressService.getUserAddresses(userId);
        return res.status(HttpStatus.OK).json({
          status: "ok",
          message: "User addresses fetched successfully",
          data: userAddresses,
        } as ApiResponse);
      } catch (error) {
        throw error;
      }
    },
  );
}

export default new AddressController();
