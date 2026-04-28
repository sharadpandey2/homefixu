import { auth } from "@homebuddy-12/auth/server";

async function testSignIn() {
  try {
    const res = await auth.api.signInEmail({
      body: {
        email: "63sharadpandey@gmail.com",
        password: "123456789",
      },
    });
    console.log("Login success!", res);
  } catch (e: any) {
    console.error("Login failed:", e.message || e);
  }
}

testSignIn();
