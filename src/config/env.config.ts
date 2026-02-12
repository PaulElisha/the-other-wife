/** @format */

import { config } from "dotenv";
config({ path: "./.env" });

type EnvConfig = {
  PORT: string;
  HOST_NAME: string;
  MONGODB_URI: string;
  NODE_ENV: string;
  JWT_SECRET: string;
  CORS_ORIGIN?: string;
};

const getEnvConfig = (): EnvConfig => {
  const getEnv = (key: string): string => process.env[key] ?? "";

  return {
    PORT: getEnv("PORT") || "8000",
    HOST_NAME: getEnv("HOST_NAME") || "https://the-other-wife.vercel.app/",
    MONGODB_URI: getEnv("MONGODB_URI") || "localhost:27017",
    NODE_ENV: getEnv("NODE_ENV") || "development",
    JWT_SECRET: getEnv("JWT_SECRET") || "secret",
    CORS_ORIGIN: getEnv("CORS_ORIGIN") || "",
  };
};

const envconfig = getEnvConfig();

export { envconfig };
