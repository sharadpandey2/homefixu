import { db } from "@homebuddy-12/db";
import {
  accounts,
  sessions,
  users,
  verifications,
} from "@homebuddy-12/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";

export const auth = betterAuth({
  // baseURL must point to the auth endpoints
  baseURL:
    process.env.BETTER_AUTH_URL ||
    (process.env.NEXT_PUBLIC_SERVER_URL
      ? `${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth`
      : undefined) ||
    "https://server-production-c3c4.up.railway.app/api/auth",

  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verifications,
    },
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  plugins: [
    admin({
      defaultRole: "customer",
      adminRoles: ["admin"],
    }),
  ],

  trustedOrigins: [
    // Local development
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:8080",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    // Production - custom domain
    "https://www.homefixu.in",
    "https://homefixu.in",
    "https://api.homefixu.in",
    // ✅ Production - Railway URLs (MUST be hardcoded - this is what blocks "Invalid origin")
    "https://web-production-797f8.up.railway.app",
    "https://server-production-c3c4.up.railway.app",
    // Extra from env vars
    process.env.NEXT_PUBLIC_APP_URL ?? "",
    process.env.NEXT_PUBLIC_SERVER_URL ?? "",
    process.env.BETTER_AUTH_URL ?? "",
    process.env.CORS_ORIGIN ?? "",
  ].filter(Boolean),

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },

  advanced: {
    // Use secure cookies in production (Railway uses HTTPS)
    useSecureCookies: process.env.NODE_ENV === "production",
    // Temporarily disable origin check to bypass "Invalid origin" while debugging
    disableOriginCheck: true,
  },
});

export type Auth = typeof auth;
export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;
