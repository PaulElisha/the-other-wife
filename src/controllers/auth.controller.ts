/** @format */

import { AuthService } from "../services/auth.service.js";

import { handleAsyncControl } from "../middlewares/handleAsyncControl.middleware.js";

import { NextFunction, Request, Response } from "express";
import { HttpStatus } from "../config/http.config.js";

import { nodeEnv } from "../constants/constants.js";
import { ApiResponse } from "../utils/response.util.js";

export class AuthController {
  authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  handleSignup = handleAsyncControl(
    async (
      req: Request<
        {},
        {},
        {
          firstName: string;
          lastName: string;
          email: string;
          password: string;
          userType: string;
          phoneNumber: string;
        }
      >,
      res: Response,
    ): Promise<Response> => {
      const { firstName, lastName, email, password, userType, phoneNumber } =
        req.body;

      try {
        const { userId } = await this.authService.signup({
          firstName,
          lastName,
          email,
          password,
          userType,
          phoneNumber,
        });
        return res.status(HttpStatus.OK).json({
          status: "ok",
          message: "User registered successfully",
          data: { userId },
        } as ApiResponse);
      } catch (error) {
        throw error;
      }
    },
  );

  handleLogin = handleAsyncControl(
    async (
      req: Request<
        {},
        {},
        { phoneNumber?: string; email?: string; password: string }
      >,
      res: Response,
    ): Promise<any> => {
      const { phoneNumber, email, password } = req.body;

      try {
        const { token } = await this.authService.login({
          phoneNumber,
          email,
          password,
        });

        return res
          .cookie("token", token, {
            httpOnly: true,
            sameSite: "strict",
            secure: nodeEnv === "production",
          })
          .status(HttpStatus.OK)
          .json({
            status: "ok",
            message: "User login successful",
          } as ApiResponse);
      } catch (error) {
        throw error;
      }
    },
  );

  handleLogout = handleAsyncControl(
    async (req: Request, res: Response): Promise<any> => {
      try {
        const { cookieOptions } = this.authService.logout();
        res.clearCookie("token", cookieOptions);
        return res.status(HttpStatus.NO_CONTENT).send();
      } catch (error) {
        throw error;
      }
    },
  );

  // passwordResetRequest = handleAsyncControl(
  //   async (
  //     req: Request<{}, {}, { phoneNumber: string }>,
  //     res: Response,
  //   ): Promise<any> => {
  //     try {
  //       const { token } = await this.authService.passwordResetRequest(
  //         req.body.phoneNumber,
  //       );
  //       return res
  //         .status(HttpStatus.OK)
  //         .json({ status: "ok", message: "User login successful" });
  //     } catch (error) {
  //       throw error;
  //     }
  //   },
  // );

  // passwordReset = handleAsyncControl(
  //   async (
  //     req: Request<{}, {}, { phoneNumber: string; token: string }>,
  //     res: Response,
  //   ): Promise<any> => {
  //     try {
  //       await this.authService.passwordReset(
  //         req.body.phoneNumber,
  //         req.body.token,
  //       );
  //       return res
  //         .status(HttpStatus.OK)
  //         .json({ status: "ok", message: "User login successful" });
  //     } catch (error) {
  //       throw error;
  //     }
  //   },
  // );
}
