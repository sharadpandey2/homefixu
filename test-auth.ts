import { auth } from "./packages/auth/src/index";

async function test() {
  try {
    const res = await auth.api.signUpEmail({
      body: {
        email: "john90@test.com",
        password: "password123",
        name: "John Doe",
      },
    });
    console.log("Success:", res.user.id);
  } catch (err) {
    console.error("Error:", err);
  }
}
test();
