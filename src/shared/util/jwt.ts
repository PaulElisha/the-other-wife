/** @format */

import { SignJWT, type JWTPayload, jwtVerify} from "jose";
import {createSecretKey} from "crypto";
import Env from "@config/env.config.js";
import AUTH_CONSTANTS from "@/src/shared/constants/auth.js";

export interface JwtPayload extends JWTPayload {
  id: number;
  userType: string;
  email: string;
}

const JwtSecretKey = createSecretKey(Env.JWT_SECRET, "utf-8");
const JwtRefreshSecretKey = createSecretKey(Env.REFRESH_SECRET, "utf-8");

export const generateToken = async (payload: JwtPayload) => {
  return new SignJWT(payload)    
  .setProtectedHeader({ alg: "HS256" })
  .setIssuedAt()
  .setExpirationTime(Env.JWT_EXPIRY)
  .sign(JwtSecretKey);
};

export const generateRefreshToken = async (payload: { id: number; userType: string }) => {
  const [refreshToken, refreshTokenExpiry] = await Promise.all([
    new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(Env.REFRESH_EXPIRY)
      .sign(JwtRefreshSecretKey),
    new Date(Date.now() + AUTH_CONSTANTS.REFRESH_TOKEN_EXPIRY_MS),
  ]);

  return { refreshToken, refreshTokenExpiry};
};

export const generateEmailToken = async () => ({
  emailToken: crypto.randomUUID().toString(),
      emailTokenExpiry: new Date(Date.now() + AUTH_CONSTANTS.EMAIL_TOKEN_EXPIRY_MS),
    });

export const generateOtp = async () => ({
  otp: Math.floor(1000 + Math.random() * 9000).toString(),
  otpExpiry: new Date(Date.now() + AUTH_CONSTANTS.OTP_EXPIRY_MS),
});

export const verifyToken = async (token: string): Promise<JwtPayload> => {
  const {payload} = await jwtVerify(token, JwtSecretKey);

  return <JwtPayload>payload;
}
