/** @format */

import jwt from "jsonwebtoken";
import crypto from "crypto";
import Envconfig from "@/env.js";
import type { UserDocument } from "@type/env-types";
import AUTH_CONSTANTS from "@constant/auth.js";

export const generateToken = (user: UserDocument) => {
  const payload = { _id: user._id, userType: user.userType };
  const token = jwt.sign(payload, Envconfig.JWT_SECRET, {
    expiresIn: "30m",
  });

  return { token };
};

export const generateRefreshToken = (user: UserDocument) => {
  const refreshToken = jwt.sign(
    { _id: user._id, userType: user.userType },
    Envconfig.JWT_REFRESH_SECRET,
    {
      expiresIn: "7d",
    },
  );

  return { refreshToken };
};

export const generateEmailToken = () => ({
  emailToken: crypto.randomBytes(20).toString("hex"),
  emailTokenExpiry: new Date(Date.now() + AUTH_CONSTANTS.EMAIL_TOKEN_EXPIRY_MS),
});

export const generateOtp = () => ({
  otp: Math.floor(1000 + Math.random() * 9000).toString(),
  otpExpiry: new Date(Date.now() + AUTH_CONSTANTS.OTP_EXPIRY_MS),
});

export const verifyToken = (token: string, secret: string) => jwt.verify(token, secret);
