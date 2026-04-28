import path from "node:path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { db } from "@homebuddy-12/db";
import { users } from "@homebuddy-12/db/schema";
import { eq } from "drizzle-orm";

async function checkRole() {
  const email = process.argv[2];
  if (!email) {
    console.error("Please provide an email");
    process.exit(1);
  }

  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    console.log(`User with email ${email} not found`);
  } else {
    console.log(`User: ${user.email}, Role: ${user.role}`);
  }
  process.exit(0);
}

checkRole();
