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
  const getEnv = (key: string): string => {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
  };

  const getEnvOptional = (key: string): string | undefined => {
    const value = process.env[key];
    return value || undefined;
  };

  return {
    PORT: getEnvOptional("PORT") || "8000",
    HOST_NAME:
      getEnvOptional("HOST_NAME") || "https://the-other-wife.vercel.app/",
    MONGODB_URI: getEnv("MONGODB_URI"),
    NODE_ENV: getEnv("NODE_ENV"),
    JWT_SECRET: getEnv("JWT_SECRET"),
    CORS_ORIGIN: getEnvOptional("CORS_ORIGIN"),
  };
};

const envconfig = getEnvConfig();

export { envconfig };
