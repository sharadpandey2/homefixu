import type { ExecutionContext } from "@nestjs/common";
import { createParamDecorator, UnauthorizedException } from "@nestjs/common";
import type { Request } from "express";
import type { UserRole } from "./roles.decorator";

export interface CurrentUserData {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  emailVerified: boolean;
}

/**
 * Extract the current user from the request (populated by AuthGuard).
 *
 * @example
 *   getProfile(@CurrentUser() user: CurrentUserData) { ... }
 *   getProfile(@CurrentUser('id') userId: string) { ... }
 */
export const CurrentUser = createParamDecorator(
  (field: keyof CurrentUserData | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = (request as any).user as CurrentUserData | undefined;

    if (!user) {
      throw new UnauthorizedException(
        "User not found on request. Ensure AuthGuard runs before this handler.",
      );
    }

    return field ? user[field] : user;
  },
);
