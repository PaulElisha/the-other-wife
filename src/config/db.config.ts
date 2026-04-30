/** @format */

import {drizzle} from "drizzle-orm/node-postgres"
import { remember } from "@epic-web/remember"
import {Pool} from "pg"
import Env, { isProd } from "@config/env.config.js"
import * as schema from "@shared/schema.js";

let client;

const createPool = () =>  new Pool({
  connectionString: Env.DB_URL,
})

if(isProd()) {
  client = createPool()
} else {
  client = remember("dbPool", () => createPool())
}

const db = drizzle(client, { schema });

export default db;