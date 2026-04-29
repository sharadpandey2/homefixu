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
  // baseURL must point to the EXACT path where the auth handler is mounted
  baseURL: (() => {
    // Completely hardcoded for Railway production to prevent any env var mishaps
    const url = "https://server-production-c3c4.up.railway.app/api/auth";
    console.log("🔐 [BETTER AUTH INIT] baseURL set to:", url);
    return url;
  })(),

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

  trustedOrigins: (() => {
    const origins = [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:8080",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3001",
      "http://127.0.0.1:8080",
      "https://web-production-797f8.up.railway.app",
      "https://server-production-c3c4.up.railway.app",
      "https://homefixu-web.vercel.app",
      "https://homefixu.in",
      "https://www.homefixu.in",
      "https://api.homefixu.in",
    ];
    console.log("🔐 [BETTER AUTH INIT] trustedOrigins set to:", origins);
    return origins;
  })(),

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },

  advanced: {
    // Disable secure cookies and origin check temporarily for debugging
    useSecureCookies: true, // MUST be true for cross-site cookies
    disableOriginCheck: true,
    crossSubDomainCookies: {
      enabled: true,
    },
    defaultCrossSiteCookie: true,
  },
});

export type Auth = typeof auth;
export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;
