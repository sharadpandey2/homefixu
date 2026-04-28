import { randomBytes, randomInt } from "node:crypto";
import { db } from "@homebuddy-12/db";
import { passwordResetOtps } from "@homebuddy-12/db/schema";
import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Injectable,
  Logger,
  Module,
  NotFoundException,
  Post,
} from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";
import { and, desc, eq, sql } from "drizzle-orm";
import { EmailService } from "../../lib/email"; // Verify this path matches your structure

// ═══ DTOs ═══

class SendOtpDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}

class VerifyOtpDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  otpCode!: string;
}

class ResetPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  otpCode!: string;

  @IsString()
  @MinLength(8, { message: "Password must be at least 8 characters" })
  newPassword!: string;
}

// ═══ INTERFACES ═══

interface SendOtpResponse {
  message: string;
  expiresInMinutes: number;
}

interface VerifyOtpResponse {
  message: string;
  verified: boolean;
}

interface ResetPasswordResponse {
  message: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SERVICE
// ═══════════════════════════════════════════════════════════════════════════════

const generateId = (prefix: string): string =>
  `${prefix}_${randomBytes(8).toString("hex")}`;

@Injectable()
class ForgotPasswordService {
  private readonly logger = new Logger(ForgotPasswordService.name);

  // OTP valid for 10 minutes (Synced with EmailService template)
  private readonly OTP_EXPIRY_MINUTES = 10;
  private readonly MAX_OTP_PER_HOUR = 5;

  constructor(private readonly emailService: EmailService) {}

  // ─── 1. SEND OTP ──────────────────────────────────────────────────────────

  async sendOtp(dto: SendOtpDto): Promise<SendOtpResponse> {
    const res = (await db.execute(
      sql`SELECT id, email FROM "user" WHERE email = ${dto.email} LIMIT 1`,
    )) as any;

    const user = res?.rows ? res.rows[0] : res[0];

    if (!user) {
      return {
        message: "If this email is registered, you will receive an OTP shortly",
        expiresInMinutes: this.OTP_EXPIRY_MINUTES,
      };
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentOtps = await db
      .select()
      .from(passwordResetOtps)
      .where(eq(passwordResetOtps.email, dto.email));

    const recentCount = recentOtps.filter(
      (otp) => otp.createdAt >= oneHourAgo,
    ).length;

    if (recentCount >= this.MAX_OTP_PER_HOUR) {
      throw new BadRequestException(
        "Too many OTP requests. Please try again after some time",
      );
    }

    const otpCode = randomInt(100000, 999999).toString();
    const expiresAt = new Date(
      Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000,
    );

    await db.insert(passwordResetOtps).values({
      id: generateId("otp"),
      email: dto.email,
      otpCode,
      expiresAt,
      isUsed: false,
    });

    // Integrated Nodemailer via EmailService
    const emailSent = await this.emailService.sendPasswordResetOTP(
      dto.email,
      otpCode,
    );

    if (!emailSent) {
      this.logger.error(`Failed to send OTP email to ${dto.email}`);
      // We still return success to prevent email enumeration,
      // but logging it is crucial for debugging SMTP issues.
    }

    return {
      message: "If this email is registered, you will receive an OTP shortly",
      expiresInMinutes: this.OTP_EXPIRY_MINUTES,
    };
  }

  // ─── 2. VERIFY OTP ────────────────────────────────────────────────────────

  async verifyOtp(dto: VerifyOtpDto): Promise<VerifyOtpResponse> {
    const otp = await this.findValidOtp(dto.email, dto.otpCode);

    if (!otp) {
      throw new BadRequestException("Invalid or expired OTP");
    }

    return {
      message: "OTP verified successfully",
      verified: true,
    };
  }

  // ─── 3. RESET PASSWORD ────────────────────────────────────────────────────

  async resetPassword(dto: ResetPasswordDto): Promise<ResetPasswordResponse> {
    const otp = await this.findValidOtp(dto.email, dto.otpCode);
    if (!otp) {
      throw new BadRequestException("Invalid or expired OTP");
    }

    await db
      .update(passwordResetOtps)
      .set({ isUsed: true })
      .where(eq(passwordResetOtps.id, otp.id));

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    const res = (await db.execute(
      sql`SELECT id FROM "user" WHERE email = ${dto.email} LIMIT 1`,
    )) as any;

    const user = res?.rows ? res.rows[0] : res[0];

    if (!user) {
      throw new NotFoundException("User not found");
    }

    await db.execute(
      sql`UPDATE "account" 
          SET "password" = ${hashedPassword}, "updated_at" = NOW() 
          WHERE "user_id" = ${user.id} AND "provider_id" = 'credential'`,
    );

    this.logger.log(`Password reset for email: ${dto.email}`);

    return {
      message:
        "Password reset successfully. Please login with your new password",
    };
  }

  // ─── HELPER ────────────────────────────────────────────────────────────────

  private async findValidOtp(email: string, otpCode: string) {
    const otps = await db
      .select()
      .from(passwordResetOtps)
      .where(
        and(
          eq(passwordResetOtps.email, email),
          eq(passwordResetOtps.otpCode, otpCode),
          eq(passwordResetOtps.isUsed, false),
        ),
      )
      .orderBy(desc(passwordResetOtps.createdAt))
      .limit(1);

    const otp = otps[0];
    if (!otp) return null;

    if (new Date() > otp.expiresAt) return null;

    return otp;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTROLLER
// ═══════════════════════════════════════════════════════════════════════════════

@Controller("auth/forgot-password")
class ForgotPasswordController {
  constructor(private readonly forgotPasswordService: ForgotPasswordService) {}

  @Post("send-otp")
  @HttpCode(HttpStatus.OK)
  async sendOtp(@Body() dto: SendOtpDto) {
    return this.forgotPasswordService.sendOtp(dto);
  }

  @Post("verify-otp")
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.forgotPasswordService.verifyOtp(dto);
  }

  @Post("reset")
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.forgotPasswordService.resetPassword(dto);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODULE
// ═══════════════════════════════════════════════════════════════════════════════

@Module({
  controllers: [ForgotPasswordController],
  providers: [ForgotPasswordService, EmailService],
})
export class ForgotPasswordModule {}
