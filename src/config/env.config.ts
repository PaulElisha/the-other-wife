/** @format */

import { config } from "dotenv";
config({ path: ".env" });

type EnvConfig = {
  PORT: string;
  HOST_NAME: string;
  MONGODB_URI: string;
  NODE_ENV: string;
  JWT_SECRET: string;
};

const getEnvConfig = (): EnvConfig => {
  const getEnv = (key: string): string => {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
  };

  return {
    PORT: getEnv("PORT"),
    HOST_NAME: getEnv("HOST_NAME"),
    MONGODB_URI: getEnv("MONGODB_URI"),
    NODE_ENV: getEnv("NODE_ENV"),
    JWT_SECRET: getEnv("JWT_SECRET"),
  };
};

const envconfig = getEnvConfig();

export { envconfig };
