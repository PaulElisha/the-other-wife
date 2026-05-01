/** @format */

import bcrypt from "bcrypt";
import PQueue from "p-queue";

import HttpStatus from "@config/http.config.js";
import db from "@config/db.config";
import Env from "@config/env.config";

import ErrorCode from "@enum/error-code.js";
import BadRequestException from "@error/bad-request-exception.js";
import UnauthorizedExceptionError from "@error/unauthorized-exception.js";
import NotFoundException from "@error/not-found-exception.js";

import {users} from "@module/user/user.schema.js";

import {
  generateEmailToken,
  generateRefreshToken,
  generateToken,
  verifyToken,
} from "@util/jwt.js";
import {comparePassword, hashPassword}  from "@util/password.js";
import { CreateProfile } from "@module/user/user-profile.js";
import template from "@/src/shared/util/template.js";
import AUTH_CONSTANTS from "@/src/shared/constants/auth.js";
import EmailWorker from "@module/email/email.worker.js";

import { eq, or, and, ilike, gt } from "drizzle-orm";

const UserType: Record<string, string> = {
  customer: "customer",
  vendor: "vendor",
  admin: "admin"
} as const;

type UserRoleType = string;

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
    userType: UserRoleType;
    phoneNumber: string;
  }) => {
    const { firstName, lastName, password, userType, phoneNumber, email } = body;

      const result = await db.transaction(async (tx) => {
        try {
          const [existingUser] = await tx.select().from(users).where(
            ilike(users.email, `%${email}%`)
          );
    
          const authType = existingUser
            ? existingUser.email === email
              ? "email"
              : existingUser.phone_number === phoneNumber
                ? "phone number"
                : null
            : null;
    
            console.log(`Auth type: ${authType}`);
    
          authType && 
              (() => {throw new BadRequestException(
                `${authType} already exists`,
                HttpStatus.BAD_REQUEST,
                authType === "email"
                  ? ErrorCode.AUTH_EMAIL_ALREADY_EXISTS
                  : ErrorCode.AUTH_PHONE_NUMBER_ALREADY_EXISTS,
              )})();

          type UserRole = typeof UserType[keyof typeof UserType];
          const roleType = Object.values(UserType).includes(userType as UserRole) 
              ? (userType as UserRole) 
              : UserType.customer;
         
          const [newUser] = await tx.insert(users).values({
              first_name: firstName,
              last_name: lastName,
              email: email,
              password: password,
              user_type: roleType,
              phone_number: phoneNumber
          }).returning();

          console.log(`New User: ${JSON.stringify(newUser)}`);
    
          const userProfile = await (await CreateProfile[userType as keyof typeof CreateProfile](tx))({userId: newUser.id});
          console.log(`User Profile: ${JSON.stringify(userProfile)}`);
          // await (await userProfile)(newUser.id);
    
          const [accessToken, {refreshToken, refreshTokenExpiry}, {emailToken, emailTokenExpiry}] = await Promise.all([
            generateToken({
              id: newUser.id,
              userType: userType,
              email: email
            }),
            generateRefreshToken({
              id: newUser.id,
              userType: userType
            }),
            generateEmailToken()
          ])
    
          await tx.update(users).set({
            refresh_token: refreshToken,
            refresh_token_ms: refreshTokenExpiry,
            email_token: emailToken,
            email_token_ms: emailTokenExpiry
          });
    
          const { password: _, ...userWithoutPassword } = newUser;
    
          return {
            accessToken,
            refreshToken,
            data: userWithoutPassword,
          };
        } catch (error) {
          throw error;
        }
      });

      const html = await template`verify-signup.html${{
        user: result.data,
        verificationUrl: `http://localhost:8000/api/v1/auth/verify?token=${result.data.email_token}`,
      }}`;
  
      this.emailQueue.add(async () => {
        await EmailWorker({
          user: result.data,
          message: html,
        })
      });
  
      return result;
    }

  verifySignup = async (emailToken: string) => {
      const verifiedUser = await db.transaction(async (tx) => {
        try {
          console.log(`Verifying signup with token: ${emailToken}`);
          const [existingUser] = await tx.select().from(users).where(and(
            ilike(users.email_token, `%${emailToken}%`),
            gt(users.email_token_ms, new Date())
          ));
  
          if (!existingUser) {
            console.log(`Verification failed: Token ${emailToken} not found or expired`);
            throw new NotFoundException(
              "User not found or token expired",
              HttpStatus.NOT_FOUND,
              ErrorCode.AUTH_USER_NOT_FOUND,
            );
          }
  
          await tx.update(users).set({
            email_verified: true,
            email_token: null,
            email_token_ms: new Date(Date.now() + AUTH_CONSTANTS.EMAIL_TOKEN_EXPIRY_MS),
            lastLogin: new Date(),
            auth_type: existingUser.email || existingUser.phone_number
          }).where(eq(users.id, existingUser.id));
  
          const {password: _, ...userWithoutPassword} = existingUser;
  
          return {userWithoutPassword};
        } catch (error) {
          console.error("Error in verifySignup service:", error);
          throw error;
        }
      });

      const html = await template`welcome-email.html${{ verifiedUser }}`;

      this.emailQueue.add(async () => {
        await EmailWorker({
          user: verifiedUser,
          message: html,
        })
      })
  };

  login =
    async (
      body: {
        phoneNumber?: string;
        email?: string;
        password: string;
      },
    ): Promise<any> => {
      const { phoneNumber, email, password } = body;

      const result = await db.transaction(async (tx) => {
        try {
          const [existingUser] = await tx.select().from(users).where(
            or(
              ilike(users.email, `%${email}%`),
              ilike(users.phone_number, `%${phoneNumber}%`)
            )
          );
  
          if (!existingUser) {
            throw new NotFoundException(
              `Incorrect ${email ? "email" : "phone number"}`,
              HttpStatus.NOT_FOUND,
              ErrorCode.AUTH_USER_NOT_FOUND,
            );
          }
  
          const hash = await hashPassword(existingUser.password as string);
  
          const validPassword = await comparePassword(password, hash);
  
          if (!validPassword) {
            throw new UnauthorizedExceptionError(
              `Validation Error: Password is invalid`,
              HttpStatus.UNAUTHORIZED,
              ErrorCode.AUTH_UNAUTHORIZED_ACCESS,
            );
          }
          
          const [accessToken, {refreshToken}] = await Promise.all([
            generateToken({
              id: existingUser.id,
              userType: existingUser.user_type as string,
              email: existingUser.email
            }),
            generateRefreshToken({
              id: existingUser.id,
              userType: existingUser.user_type as string
            })
          ])
  
          await tx.update(users).set({
            lastLogin: new Date(),
            refresh_token: refreshToken,
            refresh_token_ms: new Date(Date.now() + AUTH_CONSTANTS.REFRESH_TOKEN_EXPIRY_MS)
          }).where(eq(users.id, existingUser.id))
  
          const {password: _, ...userWithoutPassword} = existingUser;
  
          return {
            accessToken,
            refreshToken,
            user: userWithoutPassword
          };
        } catch (error) {
          throw error;
        }
      });

      return result;
    }

  // refreshLogin = transaction.use(
  //   async (session: ClientSession, refreshToken: string): Promise<any> => {
  //     try {
  //       if (!refreshToken) {
  //         throw new BadRequestException(
  //           "Refresh token is required",
  //           HttpStatus.BAD_REQUEST,
  //           ErrorCode.VALIDATION_ERROR,
  //         );
  //       }

  //       const decoded = verifyToken(refreshToken, Envconfig.JWT_REFRESH_SECRET);

  //       if (!decoded || typeof decoded === "string") {
  //         throw new UnauthorizedExceptionError(
  //           "Invalid token",
  //           HttpStatus.UNAUTHORIZED,
  //           ErrorCode.AUTH_UNAUTHORIZED_ACCESS,
  //         );
  //       }

  //       let user = await User.findOne({
  //         _id: decoded._id,
  //         refreshToken,
  //         refreshTokenExpiry: { $gt: new Date() },
  //       }).session(session);

  //       if (!user) {
  //         throw new NotFoundException(
  //           "Session expired",
  //           HttpStatus.NOT_FOUND,
  //           ErrorCode.AUTH_INVALID_TOKEN,
  //         );
  //       }

  //       if (user.status !== AUTH_CONSTANTS.USER_STATUS.ACTIVE) {
  //         throw new UnauthorizedExceptionError(
  //           `User account is ${user.status}`,
  //           HttpStatus.UNAUTHORIZED,
  //           ErrorCode.AUTH_UNAUTHORIZED_ACCESS,
  //         );
  //       }

  //       const { token: newAccessToken } = generateToken(user);
  //       const { refreshToken: newRefreshToken } = generateRefreshToken(user);

  //       user.refreshToken = newRefreshToken;
  //       user.refreshTokenExpiry = new Date(Date.now() + AUTH_CONSTANTS.REFRESH_TOKEN_EXPIRY_MS);
  //       user.lastLogin = new Date();
  //       await user.save({ session });

  //       return {
  //         newAccessToken,
  //         ...(user?.omitPassword() as any),
  //       };
  //     } catch (error) {
  //       throw error;
  //     }
  //   },
  // );

  logout = async (userId: number) => {
    await db.update(users).set({
      refresh_token: null,
      refresh_token_ms: null
    }).where(eq(users.id, userId));

    return {
      httpOnly: true,
      secure: Env.NODE_ENV === "production",
      sameSite: "strict" as "strict",
      path: "/",
      expires: new Date(0),
    };
  };

  // forgotPassword = async (email: string) => {
  //   const result = await transaction.use(async (session: ClientSession, email: string) => {
  //     try {
  //       const user = await User.findOne({ email }).session(session);

  //       if (!user) {
  //         throw new NotFoundException(
  //           "User not found",
  //           HttpStatus.NOT_FOUND,
  //           ErrorCode.AUTH_USER_NOT_FOUND,
  //         );
  //       }

  //       const { otp, otpExpiry } = generateOtp();
  //       user.otp = otp;
  //       user.otpExpiry = otpExpiry;
  //       await user.save({ session });

  //       return { otp, otpExpiry, ...(user?.omitPassword() as any) };
  //     } catch (error) {
  //       throw error;
  //     }
  //   })(email);

  //   const html = await template`forgot-password.html${{
  //     otp: result?.otp,
  //     otpExpiry: result?.otpExpiry,
  //   }}`;

  //   this.emailQueue.add(async () => {
  //     for await (const _ of EmailWorker({
  //       user: result,
  //       message: html,
  //     }));
  //   });

  //   return result;
  // };

  // passwordReset = async (body: { newPassword: string; otp: string }) => {
  //   const result = await transaction.use(async (session: ClientSession, body) => {
  //     const { newPassword, otp } = body;

  //     const user = await User.findOne({
  //       otp,
  //       otpExpiry: { $gt: Date.now(), $lt: Date.now() + 20 * 60 * 1000 },
  //     }).session(session);

  //     if (!user) {
  //       throw new NotFoundException(
  //         "User not found",
  //         HttpStatus.NOT_FOUND,
  //         ErrorCode.AUTH_USER_NOT_FOUND,
  //       );
  //     }

  //     user.passwordHash = await bcrypt.hash(newPassword, 10);
  //     user.otp = "";
  //     user.otpExpiry = new Date(Date.now() - 1000);
  //     await user.save({ session });

  //     return { ...(user?.omitPassword() as any) };
  //   })(body);

  //   const html = await template`password-reset.html${result}`;

  //   this.emailQueue.add(async () => {
  //     for await (const _ of EmailWorker({
  //       user: result,
  //       message: html,
  //     }));
  //   });
  // };

  deleteUser = async (email: string) => {
      try {
        await db.delete(users).where(eq(users.email, email));
        return;
      } catch (error) {
        throw error;
      }
  };
}

export default new AuthService();
