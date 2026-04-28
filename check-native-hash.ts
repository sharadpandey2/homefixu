import { auth } from "./packages/auth/src/server";

async function seeHash() {
  const password = "123456789";
  // We use the internal hashPassword from better-auth/crypto if possible,
  // or just sign up a user and check the DB.
  try {
    // Create a temporary user to see the hash
    const _res = await auth.api.signUpEmail({
      body: {
        email: "temp-hash-check@homebuddy.in",
        password: password,
        name: "Temp",
      },
    });
    console.log("Native Better Auth hash created successfully.");
  } catch (e) {
    console.error("Signup failed (maybe user exists):", e);
  }
}

seeHash();
