import { auth } from "@homebuddy-12/auth";
import type { NestMiddleware } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import { toNodeHandler } from "better-auth/node";
import type { NextFunction, Request, Response } from "express";

// ═══════════════════════════════════════════════════════════════════════════
// BETTER AUTH MIDDLEWARE
// Mounts all Better Auth routes under /api/auth/*
//   POST /api/auth/sign-up/email
//   POST /api/auth/sign-in/email
//   POST /api/auth/sign-out
//   GET  /api/auth/get-session
//   ...and all admin plugin routes
// ═══════════════════════════════════════════════════════════════════════════
@Injectable()
export class BetterAuthMiddleware implements NestMiddleware {
  private readonly handler = toNodeHandler(auth);

  use(req: Request, res: Response, _next: NextFunction) {
    const origin = req.headers["origin"] ?? "(no origin header)";
    const method = req.method;
    const url = req.originalUrl ?? req.url;

    console.log(`[BetterAuth] ➡️  ${method} ${url}`);
    console.log(`[BetterAuth] 🌐 Origin header: "${origin}"`);

    // Intercept the response to log the outcome
    const originalWriteHead = res.writeHead.bind(res);
    (res as any).writeHead = function (
      statusCode: number,
      ...args: any[]
    ): Response {
      const isOriginError = statusCode === 403;
      if (isOriginError) {
        console.warn(
          `[BetterAuth] ❌ 403 returned — origin "${origin}" was rejected by Better Auth trustedOrigins`,
        );
      } else {
        console.log(
          `[BetterAuth] ✅ ${statusCode} — origin "${origin}" accepted`,
        );
      }
      return originalWriteHead(statusCode, ...args);
    };

    return this.handler(req, res);
  }
}
