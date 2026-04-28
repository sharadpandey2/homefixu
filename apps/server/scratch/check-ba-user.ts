import path from "node:path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { auth } from "@homebuddy-12/auth";

async function checkSession() {
  const email = process.argv[2];
  if (!email) {
    console.error("Please provide an email");
    process.exit(1);
  }

  // We can't easily get a session without a request,
  // but we can check the user object Better Auth returns.
  const user = await auth.api.getUserByEmail({
    query: { email },
  });

  console.log("Better Auth User Object:", JSON.stringify(user, null, 2));
  process.exit(0);
}

checkSession();
