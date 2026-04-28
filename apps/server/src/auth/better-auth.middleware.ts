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
    return this.handler(req, res);
  }
}
