import { auth } from "@homebuddy-12/auth";
import type { CanActivate, ExecutionContext } from "@nestjs/common";
import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { fromNodeHeaders } from "better-auth/node";

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    try {
      // Better Auth reads session from cookies or Authorization header.
      // fromNodeHeaders converts Node IncomingHttpHeaders -> Web Headers API.
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(request.headers),
      });

      if (!session?.user) {
        throw new UnauthorizedException("Not authenticated");
      }

      // Block banned users everywhere (admin plugin)
      if ((session.user as any).banned) {
        throw new UnauthorizedException("Your account has been banned");
      }

      // Attach to request — downstream decorators/guards read from here
      (request as any).user = session.user;
      (request as any).session = session.session;

      return true;
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      this.logger.error("Session validation failed", err as Error);
      throw new UnauthorizedException("Invalid or expired session");
    }
  }
}
