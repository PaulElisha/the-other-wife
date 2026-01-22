/** @format */

import jwt from "jsonwebtoken";
import { jwtSecret } from "../constants/constants.js";

export const generateToken = (user: any) => {
  const token = jwt.sign({ id: user._id }, jwtSecret, {
    expiresIn: "1d",
  });
  return { token };
};
