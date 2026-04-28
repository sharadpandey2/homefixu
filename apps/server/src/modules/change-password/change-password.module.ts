// ═══════════════════════════════════════════════════════════════════════════════
// CHANGE PASSWORD - 1 Endpoint (Authenticated)
// POST /api/auth/change-password
// ═══════════════════════════════════════════════════════════════════════════════

import { db } from "@homebuddy-12/db";
import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Injectable,
  Logger,
  Module,
  Post,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { sql } from "drizzle-orm";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { AuthGuard } from "../../auth/guards/auth.guard";

// ═══ DTO ═══

class ChangePasswordDto {
  currentPassword!: string;
  newPassword!: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SERVICE
// ═══════════════════════════════════════════════════════════════════════════════

@Injectable()
class ChangePasswordService {
  private readonly logger = new Logger(ChangePasswordService.name);

  async changePassword(userId: string, dto: ChangePasswordDto) {
    if (!dto.currentPassword || !dto.newPassword) {
      throw new BadRequestException(
        "Current password and new password are required",
      );
    }

    if (dto.newPassword.length < 8) {
      throw new BadRequestException(
        "New password must be at least 8 characters",
      );
    }

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException(
        "New password must be different from current password",
      );
    }

    // Get current password hash from Better Auth account table
    const result = await db.execute(
      sql`SELECT id, password FROM "account" WHERE "userId" = ${userId} AND "providerId" = 'credential' LIMIT 1`,
    );
    const account = (result as any)[0];

    if (!account) {
      throw new BadRequestException("No credential account found");
    }

    const bcrypt = await import("bcryptjs");

    // Verify current password
    const isValid = await bcrypt.compare(dto.currentPassword, account.password);
    if (!isValid) {
      throw new UnauthorizedException("Current password is incorrect");
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await db.execute(
      sql`UPDATE "account" SET "password" = ${hashedPassword}, "updated_at" = NOW() WHERE id = ${account.id}`,
    );

    this.logger.log(`Password changed for user: ${userId}`);

    return {
      message: "Password changed successfully",
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTROLLER
// ═══════════════════════════════════════════════════════════════════════════════

@Controller("auth")
@UseGuards(AuthGuard)
class ChangePasswordController {
  constructor(private readonly changePasswordService: ChangePasswordService) {}

  @Post("change-password")
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser("id") userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.changePasswordService.changePassword(userId, dto);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODULE
// ═══════════════════════════════════════════════════════════════════════════════

@Module({
  controllers: [ChangePasswordController],
  providers: [ChangePasswordService],
})
export class ChangePasswordModule {}
