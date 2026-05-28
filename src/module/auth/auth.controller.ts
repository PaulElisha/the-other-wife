/** @format */

import HttpStatus from "@/src/shared/enum/http.js";
import asyncHandler from "@/src/shared/middleware/async-handler.js";
import { UserRole } from "@/src/shared/type/types";
import Env from "@config/env.config.js";
import AuthService from "@module/auth/auth.service.js";
import { ApiResponse } from "@util/response.js";
import type { NextFunction, Request, Response } from "express";
import { TUserSchema } from "../user/user.schema";

class AuthController {
 handleSignup = asyncHandler(
  async (
   req: Request<{}, {}, Partial<TUserSchema>>,
   res: Response,
   next: NextFunction,
  ): Promise<any> => {
   const { first_name, last_name, email, password, user_type, phone_number } =
    req.body;

   try {
    const user = await AuthService.signup({
     first_name,
     last_name,
     email,
     password,
     user_type,
     phone_number,
    });

    return res.status(HttpStatus.OK).json({
     status: "ok",
     message: "User registered successfully",
     user,
    } as ApiResponse);
   } catch (error) {
    next(error);
   }
  },
 );

 verifySignup = asyncHandler(
  async (
   req: Request<{}, {}, {}, Pick<TUserSchema, "email_token">>,
   res: Response,
   next: NextFunction,
  ): Promise<any> => {
   const emailToken = req.query.email_token as string;
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
    next(error);
   }
  },
 );

 handleLogin = asyncHandler(
  async (
   req: Request<{}, {}, Partial<TUserSchema>>,
   res: Response,
   next: NextFunction,
  ): Promise<any> => {
   const { phone_number, email, password } = req.body;

   try {
    const { accessToken, user } = await AuthService.login({
     phone_number,
     email,
     password,
    });

    return res
     .cookie("token", accessToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: Env.NODE_ENV === "production",
     })
     .status(HttpStatus.OK)
     .json({
      status: "ok",
      message: "User login successful",
      user,
     } as ApiResponse);
   } catch (error) {
    next(error);
   }
  },
 );

 // handleRefreshLogin = handleAsyncControl(
 //   async (req: Request<{}, {}, { refreshToken: string }>, res: Response): Promise<any> => {
 //     const oldRefreshToken = req.body.refreshToken;

 //     try {
 //       const { newAccessToken, ...user } = await AuthService.refreshLogin(oldRefreshToken);

 //       return res
 //         .cookie("token", newAccessToken, {
 //           httpOnly: true,
 //           sameSite: "strict",
 //           secure: Envconfig.NODE_ENV === "production",
 //         })
 //         .status(HttpStatus.OK)
 //         .json({
 //           status: "ok",
 //           message: "Login refreshed successfully",
 //           user,
 //         } as ApiResponse);
 //     } catch (error) {
 //       res.clearCookie("token");
 //       res.clearCookie("refreshToken");
 //       throw error;
 //     }
 //   },
 // );

 handleLogout = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
   const userId = Number(req.user.id);
   try {
    const cookieOptions = await AuthService.logout(userId);
    res.clearCookie("token", cookieOptions);
    res.clearCookie("refreshToken");
    return res.status(HttpStatus.NO_CONTENT).send();
   } catch (error) {
    next(error);
   }
  },
 );

 // handleForgotPassword = handleAsyncControl(
 //   async (req: Request<{}, {}, { email: string }>, res: Response): Promise<any> => {
 //     try {
 //       const { email } = req.body;
 //       console.log(req.body.email);
 //       await AuthService.forgotPassword(email);
 //       return res.status(200).json({
 //         success: true,
 //         message: `Otp sent to your email successfully`,
 //       });
 //     } catch (error) {
 //       throw error;
 //     }
 //   },
 // );

 // handlePasswordReset = handleAsyncControl(
 //   async (
 //     req: Request<{}, {}, { otp: string; newPassword: string }>,
 //     res: Response,
 //   ): Promise<any> => {
 //     try {
 //       await AuthService.passwordReset(req.body);
 //       return res.status(200).json({
 //         success: true,
 //         message: `Password reset successfully`,
 //       });
 //     } catch (error) {
 //       throw error;
 //     }
 //   },
 // );

 handleDeleteUser = asyncHandler(
  async (
   req: Request<{}, {}, Pick<TUserSchema, "email">>,
   res: Response,
   next: NextFunction,
  ): Promise<any> => {
   const email = req.body.email as string;
   try {
    await AuthService.deleteUser(email);
    return res.status(200).json({
     success: true,
     message: `User has been deleted.`,
    });
   } catch (error) {
    next(error);
   }
  },
 );
}

export default new AuthController();
