/** @format */

import { envconfig } from "../config/env.config.js";

export const port: string = envconfig.PORT;
export const hostName: string = envconfig.HOST_NAME;
export const mongoUri: string = envconfig.MONGODB_URI;
export const nodeEnv: string = envconfig.NODE_ENV;
export const jwtSecret: string = envconfig.JWT_SECRET;
export const corsOrigin: string | string[] | undefined = envconfig.CORS_ORIGIN
  ? envconfig.CORS_ORIGIN.split(",").map((origin) => origin.trim())
  : undefined;

console.log("port", !!port);
console.log("hostName", !!hostName);
console.log("mongoUri", !!mongoUri);
console.log("nodeEnv", !!nodeEnv);
console.log("jwtSecret", !!jwtSecret);
