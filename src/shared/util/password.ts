/** @format */

import Env from "@config/env.config.js";
import bcrypt from "bcrypt";

export const hashPassword = async (password: string) => {
 return bcrypt.hash(password, Env.SALT);
};

export const comparePassword = async (password: string, hashPassword: string) =>
 bcrypt.compare(password, hashPassword);
