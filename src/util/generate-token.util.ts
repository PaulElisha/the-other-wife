/** @format */

import jwt from "jsonwebtoken";
import { jwtSecret, jwtRefreshSecret } from "../constants/constants.js";

export const generateToken = (user: any) => {
  const token = jwt.sign({ id: user._id }, jwtSecret, {
    expiresIn: "15m",
  });

  return { token };
};

export const generateRefreshToken = (user: any) => {
  const refreshToken = jwt.sign({ id: user._id }, jwtRefreshSecret, {
    expiresIn: "7d",
  });

  return { refreshToken };
};

export const verifyToken = (token: string, secret: string) => {
  return jwt.verify(token, secret);
};
