/** @format */

import HttpStatus from "@/src/shared/enum/http.js";
import template from "@/src/shared/util/template.js";
import cors from "@config/cors.config.js";
import Env from "@config/env.config.js";
import helmet from "@config/helmet.config.js";
import limiter from "@config/limiter.config.js";
import swaggerSpec from "@config/swagger.config.js";
import errorHandler from "@middleware/error-handler.js";
import { addressRouter } from "@module/address/address.route.js";
import { authRouter } from "@module/auth/auth.route.js";
import { cartRouter } from "@module/cart/cart.route.js";
import { customerRouter } from "@module/customer/customer.route.js";
import { mealRouter } from "@module/meal/meal.route.js";
import { onboardingRouter } from "@module/onboarding/onboarding.route.js";
import { userRouter } from "@module/user/user.route.js";
import { vendorRouter } from "@module/vendor/vendor.route.js";
import cookieParser from "cookie-parser";
import express, { type Express } from "express";
import redoc from "redoc-express";

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
  this.app.use(helmet);
  this.app.use(express.json());
  this.app.use(express.urlencoded({ extended: true }));
  this.app.use(cors);
  this.app.use(cookieParser());
  this.app.use(limiter);
 }

 initializeRoutes() {
  this.app.get("/", (_req, res) => {
   res.status(HttpStatus.OK).send("Welcome to The Other Wife API");
  });

  this.app.use(`${Env.VERSION}/auth`, authRouter);
  this.app.use(`${Env.VERSION}/user`, userRouter);
  this.app.use(`${Env.VERSION}/address`, addressRouter);
  this.app.use(`${Env.VERSION}/customer`, customerRouter);
  this.app.use(`${Env.VERSION}/vendor`, vendorRouter);
  this.app.use(`${Env.VERSION}/cart`, cartRouter);
  this.app.use(`${Env.VERSION}/meal`, mealRouter);
  this.app.use(`${Env.VERSION}/onboarding`, onboardingRouter);

  this.app.get("/api-docs", async (_req, res) => {
   try {
    const html = await template`swagger.html`;
    res.send(`${html}`);
   } catch (error: any) {
    res
     .status(HttpStatus.NOT_FOUND)
     .send(`Error reading template ${error.message}`);
   }
  });

  this.app.get(
   "/redoc",
   redoc({ title: "The Other Wife API Docs", specUrl: "/api-docs.json" }),
  );
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
