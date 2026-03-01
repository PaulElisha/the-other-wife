/** @format */

import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { jwtSecret, jwtRefreshSecret } from "../constants/constants.js";

export const generateToken = (
  user:
    | { _id: mongoose.Types.ObjectId | string; userType?: string }
    | mongoose.Types.ObjectId
    | string,
) => {
  const payload =
    typeof user === "string" || user instanceof mongoose.Types.ObjectId
      ? { _id: user.toString() }
      : {
          _id: user._id.toString(),
          ...(user.userType && { userType: user.userType }),
        };
  const token = jwt.sign(payload, jwtSecret, {
    expiresIn: "15m",
  });

  return { token };
};

export const generateRefreshToken = (
  user:
    | { _id: mongoose.Types.ObjectId | string }
    | mongoose.Types.ObjectId
    | string,
) => {
  const userId =
    typeof user === "string" || user instanceof mongoose.Types.ObjectId
      ? user.toString()
      : user._id.toString();
  const refreshToken = jwt.sign({ _id: userId }, jwtRefreshSecret, {
    expiresIn: "7d",
  });

  return { refreshToken };
};

export const verifyToken = (token: string, secret: string) =>
  jwt.verify(token, secret);
