/** @format */

import express, { Express } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import rateLimit from "express-rate-limit";
import redoc from "redoc-express";

import { errorHandler } from "./src/middlewares/errorHandler.middleware.js";

import {
  hostName,
  port,
  corsOrigin,
  mongoUri,
} from "./src/constants/constants.js";
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
    this.app.set("trust proxy", 1);
    this.db = new Db();
    this.initiializeMiddlewares();
    this.initializeRoutes();
  }

  initiializeMiddlewares() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(
      cors({
        origin: corsOrigin || true,
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
        validate: {
          xForwardedForHeader: false,
        },
      }),
    );
  }

  async initializeDb() {
    await this.db.connect();
  }

  initializeRoutes() {
    this.app.get("/", (req, res) => {
      res.status(200).send("Welcome to The Other Wife API");
    });

    this.app.use("/api/v1/auth", authRouter);
    this.app.use("/api/v1/users", userRouter);
    this.app.use("/api/v1/addresses", addressRouter);
    this.app.use("/api/v1/customers", customerRouter);
    this.app.use("/api/v1/vendors", vendorRouter);
    this.app.use("/api/v1/carts", cartRouter);

    this.app.get("/api-docs", (req, res) => {
      res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>The Other Wife API Docs</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = () => {
      window.ui = SwaggerUIBundle({
        url: '/api-docs.json',
        dom_id: '#swagger-ui',
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        layout: "StandaloneLayout"
      });
    };
  </script>
</body>
</html>
      `);
    });

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

  async startServer() {
    await this.initializeDb();
    this.app.listen(port, () => {
      console.log(`Server is running on ${hostName}:${port}`);
    });
  }
}

const appInstance = new App();
const app = appInstance.app;

if (import.meta.url === `file://${process.argv[1]}`) {
  appInstance.startServer();
}

export default app;
export { app };
