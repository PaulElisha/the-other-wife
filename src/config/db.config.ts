/** @format */

import * as schema from "@/schema.js";
import Env, { isProd } from "@config/env.config.js";
import { remember } from "@epic-web/remember";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

let client;

const createPool = () =>
 new Pool({
  connectionString: Env.DB_URL,
 });

if (isProd()) {
 client = createPool();
} else {
 client = remember("dbPool", () => createPool());
}

const db = drizzle(client, { schema });

export default db;
