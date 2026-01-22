/** @format */

import express, { Express } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import { errorHandler } from "./src/middlewares/errorHandler.middleware.js";
import { roleGuardMiddleware } from "./src/middlewares/role-guard.middleware.js";

import { Db } from "./src/config/db.config.js";

import { hostName, port, mongoUri } from "./src/constants/constants.js";

import { authRouter } from "./src/routes/auth.route.js";
import { userRouter } from "./src/routes/user.route.js";

export class App {
  app: Express;
  db: Db;

  constructor() {
    this.app = express();
    this.db = new Db();
    this.initiializeMiddlewares();
    this.initializeRoutes();
  }

  initiializeMiddlewares() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(
      cors({
        origin: "*",
        credentials: true,
      }),
    );
    this.app.use(cookieParser());
  }

  initializeRoutes() {
    this.app.use("/api/v1/auth", authRouter);
    this.app.use("/api/v1/user", userRouter);

    this.app.use(errorHandler);
  }

  startServer() {
    this.app.listen(port, () => {
      console.log(`Server is running on ${hostName}:${port}`);
    });
  }
}

// const app = new App();
// app.startServer();

const appInstance = new App();
const app = appInstance.app;

// Only start the server if this file is the main entry point (not imported by Vercel)
// In Vercel, we export the app to be used as a serverless function
if (import.meta.url === `file://${process.argv[1]}`) {
  appInstance.startServer();
}

export default app;
export { app };
