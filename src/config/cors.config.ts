/** @format */

import cors from "cors";
import Env from "@config/env.config.js";

export default cors({ origin: Env.CORS_ORIGIN || true, credentials: true });
