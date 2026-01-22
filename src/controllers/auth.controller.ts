/** @format */

import { AuthService } from "../services/auth.service";

import { handleAsyncControl } from "../middlewares/handleAsyncControl.middleware";

import { NextFunction, Request, Response } from "express";
import { HttpStatus } from "../config/http.config";

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
          passwordHash: string;
          userType: string;
          phoneNumber: string;
        }
      >,
      res: Response,
    ): Promise<Response> => {
      const {
        firstName,
        lastName,
        email,
        passwordHash,
        userType,
        phoneNumber,
      } = req.body;
      try {
        await this.authService.signup({
          firstName,
          lastName,
          email,
          passwordHash,
          userType,
          phoneNumber,
        });
        return res
          .status(201)
          .json({ message: "User registered successfully" });
      } catch (error) {
        throw error;
      }
    },
  );

  handleLogin = handleAsyncControl(
    async (
      req: Request<{}, {}, { phoneNumber: string; passwordHash: string }>,
      res: Response,
      next: NextFunction,
    ): Promise<any> => {
      const { phoneNumber, passwordHash } = req.body;
      try {
        const { token } = await this.authService.login({
          phoneNumber,
          passwordHash,
        });

        return res
          .cookie("token", token, { httpOnly: true, sameSite: "strict" })
          .status(HttpStatus.OK)
          .json({ status: "ok", message: "User login successful" });
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
        return res
          .status(HttpStatus.OK)
          .json({ status: "ok", message: "User logged out successfully" });
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
