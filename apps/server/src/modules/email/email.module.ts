// ═══════════════════════════════════════════════════════════════════════════════
// EMAIL MODULE - 3 Endpoints (Nodemailer)
// POST /api/email/send
// POST /api/email/booking-confirmation
// POST /api/email/report-ready
//
// ENV VARS:
//   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
//
// INSTALL: pnpm add nodemailer && pnpm add -D @types/nodemailer
// ═══════════════════════════════════════════════════════════════════════════════

import { db } from "@homebuddy-12/db";
import { bookings, properties, services } from "@homebuddy-12/db/schema";
import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  Module,
  Post,
  UseGuards,
} from "@nestjs/common";
import { eq, sql } from "drizzle-orm";
import * as nodemailer from "nodemailer";
import { AuthGuard } from "../../auth/guards/auth.guard";

// ═══ DTOs ═══

class SendEmailDto {
  to!: string;
  subject!: string;
  html!: string;
  text?: string;
}

class BookingConfirmationDto {
  bookingId!: string;
}

class ReportReadyDto {
  userId!: string;
  reportId!: string;
  propertyName!: string;
  overallScore!: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SERVICE
// ═══════════════════════════════════════════════════════════════════════════════

@Injectable()
class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  private getTransporter(): nodemailer.Transporter {
    if (this.transporter) return this.transporter;

    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
      this.logger.warn(
        "SMTP not configured — emails will be logged to console",
      );
      this.transporter = nodemailer.createTransport({ jsonTransport: true });
      return this.transporter;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    return this.transporter;
  }

  private get fromEmail(): string {
    return (
      process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@homebuddy.in"
    );
  }

  // ─── CORE: Send email ─────────────────────────────────────────────────────

  private async sendEmail(
    to: string,
    subject: string,
    html: string,
    text?: string,
  ) {
    const transporter = this.getTransporter();

    try {
      const info = await transporter.sendMail({
        from: this.fromEmail,
        to,
        subject,
        html,
        text: text ?? undefined,
      });

      if (!process.env.SMTP_HOST) {
        this.logger.warn(`[DEV MODE] Email to ${to}: ${subject}`);
        return { id: "dev-mode", status: "logged" };
      }

      this.logger.log(
        `Email sent to ${to}: ${subject} (messageId: ${info.messageId})`,
      );
      return { id: info.messageId, status: "sent" };
    } catch (error) {
      this.logger.error(`Email send failed: ${(error as Error).message}`);
      throw new InternalServerErrorException("Failed to send email");
    }
  }

  // ─── 1. SEND GENERIC EMAIL ────────────────────────────────────────────────

  async send(dto: SendEmailDto) {
    if (!dto.to || !dto.subject || !dto.html) {
      throw new BadRequestException("to, subject, and html are required");
    }

    const result = await this.sendEmail(
      dto.to,
      dto.subject,
      dto.html,
      dto.text,
    );

    return {
      message: "Email sent successfully",
      emailId: result.id,
    };
  }

  // ─── 2. BOOKING CONFIRMATION ──────────────────────────────────────────────

  async sendBookingConfirmation(dto: BookingConfirmationDto) {
    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, dto.bookingId),
    });

    if (!booking) throw new BadRequestException("Booking not found");

    const service = await db.query.services.findFirst({
      where: eq(services.id, booking.serviceId),
    });

    const property = await db.query.properties.findFirst({
      where: eq(properties.id, booking.propertyId),
    });

    // Use sql template for raw query
    const userResult = await db.execute(
      sql`SELECT email, name FROM "user" WHERE id = ${booking.userId} LIMIT 1`,
    );
    const user = (userResult as any)[0];

    if (!user) throw new BadRequestException("User not found");

    const scheduledDate = new Date(booking.scheduledDate).toLocaleDateString(
      "en-IN",
      {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      },
    );

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">Booking Confirmed! ✅</h2>
        <p>Hi ${user.name},</p>
        <p>Your booking has been confirmed. Here are the details:</p>
        <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>Service:</strong> ${service?.name ?? "N/A"}</p>
          <p><strong>Property:</strong> ${property?.name ?? "N/A"}</p>
          <p><strong>Date:</strong> ${scheduledDate}</p>
          <p><strong>Time Slot:</strong> ${booking.scheduledSlot}</p>
          <p><strong>Amount:</strong> ₹${(booking.totalPricePaise / 100).toFixed(2)}</p>
          ${booking.technicianName ? `<p><strong>Technician:</strong> ${booking.technicianName}</p>` : ""}
        </div>
        <p>Booking ID: <code>${booking.id}</code></p>
        <p style="color: #666; font-size: 14px;">If you need to reschedule or cancel, please do so from the app.</p>
      </div>
    `;

    const result = await this.sendEmail(
      user.email,
      `Booking Confirmed - ${service?.name ?? "Service"} on ${scheduledDate}`,
      html,
    );

    return {
      message: "Booking confirmation email sent",
      emailId: result.id,
      sentTo: user.email,
    };
  }

  // ─── 3. REPORT READY ─────────────────────────────────────────────────────

  async sendReportReady(dto: ReportReadyDto) {
    const userResult = await db.execute(
      sql`SELECT email, name FROM "user" WHERE id = ${dto.userId} LIMIT 1`,
    );
    const user = (userResult as any)[0];

    if (!user) throw new BadRequestException("User not found");

    const scoreColor =
      dto.overallScore >= 80
        ? "#22c55e"
        : dto.overallScore >= 60
          ? "#f59e0b"
          : "#ef4444";

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">Your Home Health Report is Ready! 📊</h2>
        <p>Hi ${user.name},</p>
        <p>A new health report for <strong>${dto.propertyName}</strong> is ready to view.</p>
        <div style="background: #f5f5f5; padding: 24px; border-radius: 8px; margin: 16px 0; text-align: center;">
          <p style="font-size: 14px; color: #666; margin: 0;">Overall Health Score</p>
          <p style="font-size: 48px; font-weight: bold; color: ${scoreColor}; margin: 8px 0;">${dto.overallScore}/100</p>
        </div>
        <p>Open the HomeBuddy app to view your detailed report with category-wise breakdown, risk flags, and recommendations.</p>
        <p>Report ID: <code>${dto.reportId}</code></p>
      </div>
    `;

    const result = await this.sendEmail(
      user.email,
      `Home Health Report Ready - ${dto.propertyName} (Score: ${dto.overallScore}/100)`,
      html,
    );

    return {
      message: "Report ready email sent",
      emailId: result.id,
      sentTo: user.email,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTROLLER
// ═══════════════════════════════════════════════════════════════════════════════

@Controller("email")
@UseGuards(AuthGuard)
class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post("send")
  @HttpCode(HttpStatus.OK)
  async send(@Body() dto: SendEmailDto) {
    return this.emailService.send(dto);
  }

  @Post("booking-confirmation")
  @HttpCode(HttpStatus.OK)
  async bookingConfirmation(@Body() dto: BookingConfirmationDto) {
    return this.emailService.sendBookingConfirmation(dto);
  }

  @Post("report-ready")
  @HttpCode(HttpStatus.OK)
  async reportReady(@Body() dto: ReportReadyDto) {
    return this.emailService.sendReportReady(dto);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODULE
// ═══════════════════════════════════════════════════════════════════════════════

@Module({
  controllers: [EmailController],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
