// import { createAuthClient } from "better-auth/react";
// import { adminClient } from "better-auth/client/plugins";

// export const authClient = createAuthClient({
//   baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000",
//   plugins: [adminClient()],
// });

// export const { signIn, signUp, signOut, useSession, getSession } = authClient;

// // Access admin actions as `authClient.admin.xxx` at call sites,
// // e.g. authClient.admin.listUsers(), authClient.admin.setRole(...)

import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

// ⚠️ NEXT_PUBLIC_SERVER_URL must be set in Railway web service Variables
const AUTH_BASE_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  "https://server-production-c3c4.up.railway.app";

if (typeof window !== "undefined") {
  console.log("🔐 [AUTH-CLIENT] Connecting to:", AUTH_BASE_URL);
}

export const authClient = createAuthClient({
  baseURL: AUTH_BASE_URL,
  plugins: [adminClient()],
  fetchOptions: {
    credentials: "include", // Essential for cross-origin/subdomain cookies
  },
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;

// Admin usage examples:
// authClient.admin.listUsers()
// authClient.admin.setRole(...)
