/** @format */

import { SignJWT, type JWTPayload, jwtVerify} from "jose";
import {createSecretKey} from "crypto";
import Env from "@config/env.config.js";
import AUTH_CONSTANTS from "@/src/shared/constants/auth.js";

export interface JwtPayload extends JWTPayload {
  id: string;
  userType: string;
  email: string;
}

const JwtSecretKey = createSecretKey(Env.JWT_SECRET, "utf-8");

export const generateToken = async (payload: JwtPayload) => {
  return new SignJWT(payload)    
  .setProtectedHeader({ alg: "HS256" })
  .setIssuedAt(Date.now())
  .setExpirationTime(Env.JWT_EXPIRY)
  .sign(JwtSecretKey);
};

// export const generateRefreshToken = (user: UserDocument) => {
//   const refreshToken = jwt.sign(
//     { _id: user._id, userType: user.userType },
//     Env.JWT_REFRESH_SECRET,
//     {
//       expiresIn: "7d",
//     },
//   );

//   return { refreshToken };
// };

// export const generateEmailToken = () => ({
//   emailToken: crypto.randomBytes(20).toString("hex"),
//   emailTokenExpiry: new Date(Date.now() + AUTH_CONSTANTS.EMAIL_TOKEN_EXPIRY_MS),
// });

// export const generateOtp = () => ({
//   otp: Math.floor(1000 + Math.random() * 9000).toString(),
//   otpExpiry: new Date(Date.now() + AUTH_CONSTANTS.OTP_EXPIRY_MS),
// });

export const verifyToken = async (token: string): Promise<JwtPayload> => {
  const {payload} = await jwtVerify(token, JwtSecretKey);

  return <JwtPayload>payload;
}
