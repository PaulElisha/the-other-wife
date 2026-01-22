/** @format */

import jwt from "jsonwebtoken";
import { jwtSecret } from "../constants/constants.js";
import mongoose from "mongoose";

export const generateToken = (userId: mongoose.Types.ObjectId) => {
  const token = jwt.sign({ id: userId }, jwtSecret, {
    expiresIn: "1d",
  });
  return { token };
};
