/** @format */

import express, { Express } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import redoc from "redoc-express";

import { errorHandler } from "./src/middlewares/errorHandler.middleware.js";

import { hostName, port, corsOrigin } from "./src/constants/constants.js";
import { Db } from "./src/config/db.config.js";
import { swaggerSpec } from "./src/config/swagger.config.js";

import { authRouter } from "./src/routes/auth.route.js";
import { userRouter } from "./src/routes/user.route.js";
import { addressRouter } from "./src/routes/address.route.js";
import { customerRouter } from "./src/routes/customer.route.js";
import { vendorRouter } from "./src/routes/vendor.route.js";
import { cartRouter } from "./src/routes/cart.route.js";

export class App {
  app: Express;
  db: Db;

  constructor() {
    this.app = express();
    this.db = new Db();
    this.initiializeMiddlewares();
    this.initializeRoutes();
    this.initializeDb();
  }

  initiializeMiddlewares() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(
      cors({
        origin: corsOrigin ?? true,
        credentials: true,
      }),
    );
    this.app.use(cookieParser());
    this.app.use(
      rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        standardHeaders: true,
        legacyHeaders: false,
      }),
    );
  }

  initializeDb() {
    void this.db.connect();
  }

  initializeRoutes() {
    this.app.use("/api/v1/auth", authRouter);
    this.app.use("/api/v1/user", userRouter);
    this.app.use("/api/v1/address", addressRouter);
    this.app.use("/api/v1/customer", customerRouter);
    this.app.use("/api/v1/vendor", vendorRouter);
    this.app.use("/api/v1/cart", cartRouter);

    this.app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    this.app.get(
      "/redoc",
      redoc({
        title: "The Other Wife API Docs",
        specUrl: "/api-docs.json",
      }),
    );
    this.app.get("/api-docs.json", (req, res) => {
      res.json(swaggerSpec);
    });

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
