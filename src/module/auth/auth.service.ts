/** @format */

import bcrypt from "bcrypt";
import PQueue from "p-queue";

import HttpStatus from "@config/http.config.js";
import ErrorCode from "@enum/error-code.js";

import BadRequestException from "@error/bad-request-exception.js";
import UnauthorizedExceptionError from "@error/unauthorized-exception.js";
import NotFoundException from "@error/not-found-exception.js";

import {users} from "@module/user/user.schema.js";

import {
  generateToken,
  verifyToken,
} from "@util/jwt.js";
import Env from "@config/env.config.js"
import transaction from "@util/transaction.js";
import { CreateProfile } from "@module/user/user-profile.js";
import template from "@/src/shared/util/template.js";
import AUTH_CONSTANTS from "@/src/shared/constants/auth.js";
import EmailWorker from "@module/email/email.worker.js";

class AuthService {
  emailQueue: PQueue;

  constructor() {
    this.emailQueue = new PQueue({
      concurrency: 5,
      interval: 100,
    });

    this.emailQueue.on("active", () => {
      console.log(`Lanes: ${this.emailQueue.pending} | Waiting: ${this.emailQueue.size}`);
    });

    this.emailQueue.on("error", (error) => {
      console.error("Queue Job Error:", error);
    });
  }

  signup = async (body: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    userType: string;
    phoneNumber: string;
  }) => {
    const result = await transaction.use(async (session: ClientSession, body): Promise<any> => {
      const { firstName, lastName, password, userType, phoneNumber, email } = body;

      try {
        const existingUser = await User.findOne({
          $or: [{ ...(email && { email }) }, { ...(phoneNumber && { phoneNumber }) }],
        }).session(session);

        const authType = existingUser
          ? existingUser.email === email
            ? "email"
            : existingUser.phoneNumber === phoneNumber
              ? "phone number"
              : null
          : null;

        console.log(`Auth type: ${authType}`);

        authType &&
          (() => {
            throw new BadRequestException(
              `${authType} already exists`,
              HttpStatus.BAD_REQUEST,
              authType === "email"
                ? ErrorCode.AUTH_EMAIL_ALREADY_EXISTS
                : ErrorCode.AUTH_PHONE_NUMBER_ALREADY_EXISTS,
            );
          })();

        const [newUser] = await User.create(
          [
            {
              firstName,
              lastName,
              email,
              passwordHash: password,
              userType,
              phoneNumber,
            },
          ],
          { session },
        );

        await CreateProfile[userType as keyof typeof CreateProfile](
          newUser._id as unknown as string,
          session,
        );

        const { token: accessToken } = generateToken(newUser);
        const { refreshToken } = generateRefreshToken(newUser);
        const { emailToken, emailTokenExpiry } = generateEmailToken();

        newUser.refreshToken = refreshToken;
        newUser.refreshTokenExpiry = new Date(Date.now() + AUTH_CONSTANTS.REFRESH_TOKEN_EXPIRY_MS);
        newUser.emailToken = emailToken;

        newUser.emailTokenExpiry = emailTokenExpiry;
        await newUser.save({ session });

        return {
          accessToken,
          refreshToken,
          ...(newUser.omitPassword() as any),
        };
      } catch (error) {
        throw error;
      }
    })(body);

    const html = await template`verify-signup.html${{
      user: result,
      verificationUrl: `http://localhost:8000/api/v1/auth/verify?token=${result.emailToken}`,
    }}`;

    this.emailQueue.add(async () => {
      for await (const _ of EmailWorker({
        user: result,
        message: html,
      }));
    });

    return result;
  };

  verifySignup = async (emailToken: string) => {
    const result = await transaction.use(
      async (session: ClientSession, emailToken: string): Promise<any> => {
        try {
          console.log(`Verifying signup with token: ${emailToken}`);
          let user = await User.findOne({
            emailToken,
            emailTokenExpiry: { $gt: new Date() },
          }).session(session);

          if (!user) {
            console.log(`Verification failed: Token ${emailToken} not found or expired`);
            throw new NotFoundException(
              "User not found or token expired",
              HttpStatus.NOT_FOUND,
              ErrorCode.AUTH_USER_NOT_FOUND,
            );
          }

          console.log(`User found for token: ${user.email}`);
          user.isEmailVerified = true;
          user.emailToken = "";
          user.emailTokenExpiry = new Date(Date.now() - 1000);
          user.lastLogin = new Date();
          await user.save({ session });

          console.log("Verified user from DB:", user);

          return { ...(user.omitPassword() as any) };
        } catch (error) {
          console.error("Error in verifySignup service:", error);
          throw error;
        }
      },
    )(emailToken);

    const html = await template`welcome-email.html${{ result }}`;

    this.emailQueue.add(async () => {
      for await (const _ of EmailWorker({
        user: result,
        message: html,
      }));
    });

    console.log(`New User: ${result}`);

    return result;
  };

  login = transaction.use(
    async (
      session: ClientSession,
      body: {
        phoneNumber?: string;
        email?: string;
        password: string;
      },
    ): Promise<any> => {
      const { phoneNumber, email, password } = body;

      try {
        const existingUser = await User.findOne({
          ...(email && { email }),
          ...(phoneNumber && { phoneNumber }),
        }).session(session);

        if (!existingUser) {
          throw new NotFoundException(
            `Incorrect ${email ? "email" : "phone number"}`,
            HttpStatus.NOT_FOUND,
            ErrorCode.AUTH_USER_NOT_FOUND,
          );
        }

        const isValid = await existingUser.comparePassword(password);
        if (!isValid) {
          throw new UnauthorizedExceptionError(
            `Incorrect password`,
            HttpStatus.UNAUTHORIZED,
            ErrorCode.AUTH_UNAUTHORIZED_ACCESS,
          );
        }

        const { token: accessToken } = generateToken(existingUser);

        const { refreshToken } = generateRefreshToken(existingUser);

        const user = await User.findByIdAndUpdate(
          <mongoose.Types.ObjectId>existingUser._id,
          {
            $set: {
              lastLogin: new Date(),
              refreshToken,
              refreshTokenExpiry: new Date(Date.now() + AUTH_CONSTANTS.REFRESH_TOKEN_EXPIRY_MS),
            },
          },
          session,
        );

        return {
          accessToken,
          ...(user?.omitPassword() as any),
        };
      } catch (error) {
        throw error;
      }
    },
  );

  refreshLogin = transaction.use(
    async (session: ClientSession, refreshToken: string): Promise<any> => {
      try {
        if (!refreshToken) {
          throw new BadRequestException(
            "Refresh token is required",
            HttpStatus.BAD_REQUEST,
            ErrorCode.VALIDATION_ERROR,
          );
        }

        const decoded = verifyToken(refreshToken, Envconfig.JWT_REFRESH_SECRET);

        if (!decoded || typeof decoded === "string") {
          throw new UnauthorizedExceptionError(
            "Invalid token",
            HttpStatus.UNAUTHORIZED,
            ErrorCode.AUTH_UNAUTHORIZED_ACCESS,
          );
        }

        let user = await User.findOne({
          _id: decoded._id,
          refreshToken,
          refreshTokenExpiry: { $gt: new Date() },
        }).session(session);

        if (!user) {
          throw new NotFoundException(
            "Session expired",
            HttpStatus.NOT_FOUND,
            ErrorCode.AUTH_INVALID_TOKEN,
          );
        }

        if (user.status !== AUTH_CONSTANTS.USER_STATUS.ACTIVE) {
          throw new UnauthorizedExceptionError(
            `User account is ${user.status}`,
            HttpStatus.UNAUTHORIZED,
            ErrorCode.AUTH_UNAUTHORIZED_ACCESS,
          );
        }

        const { token: newAccessToken } = generateToken(user);
        const { refreshToken: newRefreshToken } = generateRefreshToken(user);

        user.refreshToken = newRefreshToken;
        user.refreshTokenExpiry = new Date(Date.now() + AUTH_CONSTANTS.REFRESH_TOKEN_EXPIRY_MS);
        user.lastLogin = new Date();
        await user.save({ session });

        return {
          newAccessToken,
          ...(user?.omitPassword() as any),
        };
      } catch (error) {
        throw error;
      }
    },
  );

  logout = async (userId: string): Promise<any> => {
    if (!userId) {
      throw new BadRequestException(
        "User ID is required",
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR,
      );
    }

    await User.findByIdAndUpdate(<mongoose.Types.ObjectId>(<unknown>userId), {
      $unset: { refreshToken: 1, refreshTokenExpiry: 1 },
    });

    return {
      httpOnly: true,
      secure: Envconfig.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      expires: new Date(0),
    };
  };

  forgotPassword = async (email: string) => {
    const result = await transaction.use(async (session: ClientSession, email: string) => {
      try {
        const user = await User.findOne({ email }).session(session);

        if (!user) {
          throw new NotFoundException(
            "User not found",
            HttpStatus.NOT_FOUND,
            ErrorCode.AUTH_USER_NOT_FOUND,
          );
        }

        const { otp, otpExpiry } = generateOtp();
        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save({ session });

        return { otp, otpExpiry, ...(user?.omitPassword() as any) };
      } catch (error) {
        throw error;
      }
    })(email);

    const html = await template`forgot-password.html${{
      otp: result?.otp,
      otpExpiry: result?.otpExpiry,
    }}`;

    this.emailQueue.add(async () => {
      for await (const _ of EmailWorker({
        user: result,
        message: html,
      }));
    });

    return result;
  };

  passwordReset = async (body: { newPassword: string; otp: string }) => {
    const result = await transaction.use(async (session: ClientSession, body) => {
      const { newPassword, otp } = body;

      const user = await User.findOne({
        otp,
        otpExpiry: { $gt: Date.now(), $lt: Date.now() + 20 * 60 * 1000 },
      }).session(session);

      if (!user) {
        throw new NotFoundException(
          "User not found",
          HttpStatus.NOT_FOUND,
          ErrorCode.AUTH_USER_NOT_FOUND,
        );
      }

      user.passwordHash = await bcrypt.hash(newPassword, 10);
      user.otp = "";
      user.otpExpiry = new Date(Date.now() - 1000);
      await user.save({ session });

      return { ...(user?.omitPassword() as any) };
    })(body);

    const html = await template`password-reset.html${result}`;

    this.emailQueue.add(async () => {
      for await (const _ of EmailWorker({
        user: result,
        message: html,
      }));
    });
  };

  deleteUser = async (email: string) => {
    return transaction.use(async (session: ClientSession, email: string) => {
      try {
        const user = await User.deleteMany({}).session(session);

        if (!user) {
          throw new NotFoundException(
            "User not found",
            HttpStatus.NOT_FOUND,
            ErrorCode.AUTH_USER_NOT_FOUND,
          );
        }
        return;
      } catch (error) {
        throw error;
      }
    })(email);
  };
}

export default new AuthService();
