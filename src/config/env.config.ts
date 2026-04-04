/** @format */

import { config } from "dotenv";
import type { EnvConfig } from "../type/env-types.js";

config({ path: "./.env" });

const getEnvConfig = (): EnvConfig => {
  const getEnv = (key: string): string => process.env[key] ?? "";

  return {
    PORT: getEnv("PORT") || "8000",
    HOST_NAME: getEnv("HOST_NAME") || "https://the-other-wife.vercel.app/",
    MONGODB_URI: getEnv("MONGODB_URI") || "mongodb://localhost:27017",
    NODE_ENV: getEnv("NODE_ENV") || "development",
    JWT_SECRET: getEnv("JWT_SECRET") || "secret",
    JWT_REFRESH_SECRET: getEnv("JWT_REFRESH_SECRET") || "refresh_secret",
    CORS_ORIGIN: getEnv("CORS_ORIGIN") || "",
    EMAIL_HOST: getEnv("EMAIL_HOST"),
    EMAIL_PORT: Number(getEnv("EMAIL_PORT")),
    EMAIL_USER: getEnv("EMAIL_USER"),
    EMAIL_PASSWORD: getEnv("EMAIL_PASSWORD"),
    FROM: getEnv("FROM"),
  };
};

export default getEnvConfig();
