import { auth } from "@homebuddy-12/auth/server"; // Adjust path if needed
import { db } from "@homebuddy-12/db";
import { accounts, users } from "@homebuddy-12/db/schema";
import { eq } from "drizzle-orm";

async function testSignUp() {
  try {
    // We will use the internal auth API to sign up a test admin.
    const res = await auth.api.signUpEmail({
      body: {
        email: "testadmin@aiva.com",
        password: "password123",
        name: "Test Admin",
      },
    });

    console.log("Signup success:", res);

    const user = await db.query.users.findFirst({
      where: eq(users.email, "testadmin@aiva.com"),
    });
    console.log("User:", user);

    const accountList = await db.query.accounts.findMany({
      where: eq(accounts.userId, user?.id),
    });
    console.log("Accounts:", accountList);
  } catch (e: any) {
    console.error("Signup failed:", e.message || e);
  }
}

testSignUp();
