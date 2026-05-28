/** @format */

import Env from "@config/env.config.js";
import cors from "cors";

export default cors({ origin: Env.CORS_ORIGIN || true, credentials: true });
