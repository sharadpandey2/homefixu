import path from "node:path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { db } from "@homebuddy-12/db";

async function listTechnicians() {
  const techs = await db.query.technicianAccounts.findMany({
    limit: 5,
  });

  console.log("Recent Technicians:");
  techs.forEach((t) => console.log(`- ${t.email} (ID: ${t.id})`));
  process.exit(0);
}

listTechnicians();
