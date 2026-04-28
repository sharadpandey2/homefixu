import { env } from "@homebuddy-12/env/server";
import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema/index.js";

// Fix for Node 24 fetch compatibility
neonConfig.fetchFunction = globalThis.fetch;

const sql = neon(env.DATABASE_URL);
export const db = drizzle(sql, { schema });
