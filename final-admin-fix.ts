import { auth } from "./packages/auth/src/server";

async function fixAdmin() {
  const email = "63sharadpandey@gmail.com";
  const password = "123456789";

  try {
    // We'll try to find the user first
    const user = await auth.api.listUsers({
      query: {
        filter: [{ field: "email", value: email, operator: "eq" }],
      },
    });

    if (user.users.length > 0) {
      const userId = user.users[0].id;
      console.log("Found admin user:", userId);

      // We'll update the password by using the internal API or just sign up a new one if it's easier.
      // Since we already have the user, we can't signUpEmail again.
      // Let's use the better-auth internal hash to get the correct string.
      // Actually, I'll just delete the user and re-create it using auth.api.signUpEmail
      // to ensure EVERY column is exactly as Better Auth wants it.

      await auth.api.deleteUser({
        body: { userId },
      });
      console.log("Deleted old admin record.");
    }

    const res = await auth.api.signUpEmail({
      body: {
        email: email,
        password: password,
        name: "Admin",
      },
    });

    // Promote to admin
    await auth.api.setRole({
      body: {
        userId: res.user.id,
        role: "admin",
      },
    });

    console.log("✅ Admin account recreated correctly via Better Auth API!");
    console.log("Email: 63sharadpandey@gmail.com");
    console.log("Password: 123456789");
  } catch (e: any) {
    console.error("Fix failed:", e.message || e);
  }
}

fixAdmin();
