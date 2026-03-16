/** @format */

import { config } from "dotenv";
config({ path: "./.env" });

type EnvConfig = {
  PORT: string;
  HOST_NAME: string;
  MONGODB_URI: string;
  NODE_ENV: string;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  CORS_ORIGIN?: string;
  EMAIL_HOST: string;
  EMAIL_PORT: number;
  EMAIL_USER: string;
  EMAIL_PASSWORD: string;
  FROM: string;
};

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

const envconfig = getEnvConfig();

export { envconfig };
