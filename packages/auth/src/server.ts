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
    // If deployed on Railway (usually sets RAILWAY_STATIC_URL or RAILWAY_PUBLIC_DOMAIN, or just check NODE_ENV)
    const isProd =
      process.env.NODE_ENV === "production" || process.env.RAILWAY_ENVIRONMENT;

    let url = process.env.BETTER_AUTH_URL;

    // If in production but URL is localhost or missing, force the Railway URL
    if (!url || (isProd && url.includes("localhost"))) {
      url = process.env.NEXT_PUBLIC_SERVER_URL;
      if (!url || (isProd && url.includes("localhost"))) {
        url = "https://server-production-c3c4.up.railway.app";
      }
    }

    url = url.replace(/\/+$/, "");
    if (!url.endsWith("/api/auth")) {
      url += "/api/auth";
    }
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
    // Production - Railway URLs
    "https://web-production-797f8.up.railway.app",
    "https://server-production-c3c4.up.railway.app",
    "http://web-production-797f8.up.railway.app",
    "http://server-production-c3c4.up.railway.app",
    "https://web-production-797f8-production.up.railway.app",
    "https://server-production-c3c4-production.up.railway.app",
    // Extra from env vars
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.NEXT_PUBLIC_SERVER_URL,
    process.env.BETTER_AUTH_URL,
    process.env.CORS_ORIGIN,
  ]
    .filter(Boolean)
    .map((url) => {
      try {
        return new URL(url!).origin;
      } catch (e) {
        return url!.replace(/\/+$/, "");
      }
    }),

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
