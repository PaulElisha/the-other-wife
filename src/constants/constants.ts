/** @format */

import { envconfig } from "../config/env.config.ts";

export const port: string = envconfig.PORT;
export const hostName: string = envconfig.HOST_NAME;
export const mongoUri: string = envconfig.MONGODB_URI;
export const nodeEnv: string = envconfig.NODE_ENV;
export const jwtSecret: string = envconfig.JWT_SECRET;
