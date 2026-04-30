/** @format */

import AuthService from "@module/auth/auth.service.js";

import handleAsyncControl from "@/src/shared/middleware/async-handler.js";

import type { Request, Response } from "express";
import HttpStatus from "@config/http.config.js";

import Envconfig from "@/env.js";
import { ApiResponse } from "@util/response.js";

class AuthController {
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
      const { firstName, lastName, email, password, userType, phoneNumber } = req.body;

      try {
        const user = await AuthService.signup({
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
          user,
        } as ApiResponse);
      } catch (error) {
        throw error;
      }
    },
  );

  verifySignup = handleAsyncControl(
    async (req: Request<{}, {}, {}, { token: string }>, res: Response): Promise<any> => {
      const emailToken = req.query.token as string;
      console.log(`Received verification request for token: ${emailToken}`);
      try {
        const user = await AuthService.verifySignup(emailToken);

        return res.status(HttpStatus.OK).json({
          status: "ok",
          message: "Email verified successfully",
          user,
        } as ApiResponse);
      } catch (error) {
        console.error("Error in verifySignup controller:", error);
        throw error;
      }
    },
  );

  handleLogin = handleAsyncControl(
    async (
      req: Request<{}, {}, { phoneNumber?: string; email?: string; password: string }>,
      res: Response,
    ): Promise<any> => {
      const { phoneNumber, email, password } = req.body;

      try {
        const { accessToken, user } = await AuthService.login({
          phoneNumber,
          email,
          password,
        });

        return res
          .cookie("token", accessToken, {
            httpOnly: true,
            sameSite: "strict",
            secure: Envconfig.NODE_ENV === "production",
          })
          .status(HttpStatus.OK)
          .json({
            status: "ok",
            message: "User login successful",
            user,
          } as ApiResponse);
      } catch (error) {
        throw error;
      }
    },
  );

  handleRefreshLogin = handleAsyncControl(
    async (req: Request<{}, {}, { refreshToken: string }>, res: Response): Promise<any> => {
      const oldRefreshToken = req.body.refreshToken;

      try {
        const { newAccessToken, ...user } = await AuthService.refreshLogin(oldRefreshToken);

        return res
          .cookie("token", newAccessToken, {
            httpOnly: true,
            sameSite: "strict",
            secure: Envconfig.NODE_ENV === "production",
          })
          .status(HttpStatus.OK)
          .json({
            status: "ok",
            message: "Login refreshed successfully",
            user,
          } as ApiResponse);
      } catch (error) {
        res.clearCookie("token");
        res.clearCookie("refreshToken");
        throw error;
      }
    },
  );

  handleLogout = handleAsyncControl(async (req: Request, res: Response): Promise<any> => {
    const userId = req?.user?._id as unknown as string;
    try {
      const cookieOptions = await AuthService.logout(userId);
      res.clearCookie("token", cookieOptions);
      res.clearCookie("refreshToken");
      return res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      throw error;
    }
  });

  handleForgotPassword = handleAsyncControl(
    async (req: Request<{}, {}, { email: string }>, res: Response): Promise<any> => {
      try {
        const { email } = req.body;
        console.log(req.body.email);
        await AuthService.forgotPassword(email);
        return res.status(200).json({
          success: true,
          message: `Otp sent to your email successfully`,
        });
      } catch (error) {
        throw error;
      }
    },
  );

  handlePasswordReset = handleAsyncControl(
    async (
      req: Request<{}, {}, { otp: string; newPassword: string }>,
      res: Response,
    ): Promise<any> => {
      try {
        await AuthService.passwordReset(req.body);
        return res.status(200).json({
          success: true,
          message: `Password reset successfully`,
        });
      } catch (error) {
        throw error;
      }
    },
  );

  handleDeleteUser = handleAsyncControl(async (req: Request, res: Response): Promise<any> => {
    const email = req?.body?.email as unknown as string;
    try {
      await AuthService.deleteUser(email);
      return res.status(200).json({
        success: true,
        message: `User has been deleted.`,
      });
    } catch (error) {
      throw error;
    }
  });
}

export default new AuthController();
