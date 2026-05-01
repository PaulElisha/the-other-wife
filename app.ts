/** @format */

import express, { Express } from "express";
import cookieParser from "cookie-parser";
import redoc from "redoc-express";

import { authRouter } from "@module/auth/auth.route.js";
import { userRouter } from "@module/user/user.route.js";
import { addressRouter } from "@module/address/address.route.js";
import { customerRouter } from "@module/customer/customer.route.js";
import { vendorRouter } from "@module/vendor/vendor.route.js";
import { cartRouter } from "@module/cart/cart.route.js";
import { mealRouter } from "@module/meal/meal.route.js";

import HttpStatus from "@config/http.config.js";
import { limiter } from "@config/limiter.config.js";
import helmetOptions from "@config/helmet.config.js";
import corsOptions from "@config/cors.config.js";
import swaggerSpec from "@config/swagger.config.js";

import template from "@/src/shared/util/template.js";
import Env from "@config/env.config.js"
import errorHandler from "@middleware/error-handler.js";

export class App {
  app: Express;

  constructor() {
    this.app = express();
    this.app.disable("x-powered-by");
    this.app.set("trust proxy", 1);
    this.initiializeMiddlewares();
    this.initializeRoutes();
  }

  initiializeMiddlewares() {
    this.app.use(helmetOptions);
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(corsOptions);
    this.app.use(cookieParser());
    this.app.use(limiter);
  }

  initializeRoutes() {
    this.app.get("/", (_req, res) => {
      res.status(HttpStatus.OK).send("Welcome to The Other Wife API");
    });

    this.app.use("/api/v1/auth", authRouter);
    this.app.use("/api/v1/users", userRouter);
    this.app.use("/api/v1/addresses", addressRouter);
    this.app.use("/api/v1/customers", customerRouter);
    this.app.use("/api/v1/vendors", vendorRouter);
    this.app.use("/api/v1/carts", cartRouter);
    this.app.use("/api/v1/meals", mealRouter);

    this.app.get("/api-docs", async (_req, res) => {
      try {
        const html = await template`swagger.html`;
        res.send(`${html}`);
      } catch (error: any) {
        res.status(HttpStatus.NOT_FOUND).send(`Error reading template ${error.message}`);
      }
    });

    this.app.get("/redoc", redoc({ title: "The Other Wife API Docs", specUrl: "/api-docs.json" }));
    this.app.get("/api-docs.json", (_req, res) => {
      res.json(swaggerSpec);
    });

    this.app.use(errorHandler);
  }

  async startServer() {
    this.app.listen(Env.PORT, () => {
      console.log(`Server is running on ${Env.HOST}:${Env.PORT}`);
    });
  }
}

const appInstance = new App();
const app = appInstance.app;

// Start server
appInstance.startServer();

export default app;
export { app };
