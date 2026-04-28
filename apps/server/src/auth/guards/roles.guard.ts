import type { CanActivate, ExecutionContext } from "@nestjs/common";
import { ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/roles.decorator";

// Use a module-level reflector instance as a guaranteed fallback
const fallbackReflector = new Reflector();

@Injectable()
export class RolesGuard implements CanActivate {
  private reflector: Reflector;

  constructor(reflector?: Reflector) {
    // Use injected reflector if available, otherwise use the module-level fallback
    this.reflector = reflector ?? fallbackReflector;
  }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException("Insufficient role");
    }

    return true;
  }
}
