import { Injectable, Logger } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    const smtpPort = this.configService.get<number>("SMTP_PORT", 587);

    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>("SMTP_HOST"),
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for 587
      auth: {
        user: this.configService.get<string>("SMTP_USER"),
        pass: this.configService.get<string>("SMTP_PASS"),
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Verify SMTP connection on startup
    this.transporter.verify((error, _success) => {
      if (error) {
        this.logger.error(
          `SMTP configuration error: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.log("SMTP server is ready to send emails");
      }
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const info = await this.transporter.sendMail({
        from: options.from || this.configService.get<string>("SMTP_FROM"),
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: this.stripHtml(options.html), // plain text fallback
      });

      this.logger.log(
        `Email sent successfully to ${options.to}: ${info.messageId}`,
      );

      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${options.to}: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }

  // Converts HTML to plain text for fallback
  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>?/gm, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  // Email Templates
  async sendVerificationEmail(email: string, token: string): Promise<boolean> {
    const verificationUrl = `${this.configService.get("APP_URL")}/verify-email?token=${token}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #E8A741 0%, #D89028 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #E8A741; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏠 Welcome to Homefixu!</h1>
            </div>
            <div class="content">
              <h2>Verify Your Email Address</h2>
              <p>Thank you for registering with Homefixu. Please verify your email address to get started.</p>
              <p>Click the button below to verify your email:</p>
              <a href="${verificationUrl}" class="button">Verify Email</a>
              <p>Or copy and paste this link in your browser:</p>
              <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
              <p><strong>Note:</strong> This link will expire in 24 hours.</p>
            </div>
            <div class="footer">
              <p>© 2026 Homefixu. All rights reserved.</p>
              <p>If you didn't create an account, please ignore this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: "Verify Your Homefixu Account",
      html,
    });
  }

  async sendPasswordResetOTP(email: string, otp: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #E8A741 0%, #D89028 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px dashed #E8A741; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0; }
            .otp-code { font-size: 32px; font-weight: bold; color: #E8A741; letter-spacing: 5px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset</h1>
            </div>
            <div class="content">
              <h2>Reset Your Password</h2>
              <p>You requested to reset your password. Use the OTP below:</p>
              <div class="otp-box">
                <p style="margin: 0; color: #666;">Your OTP Code:</p>
                <div class="otp-code">${otp}</div>
              </div>
              <p><strong>Note:</strong> This OTP will expire in 5 minutes.</p>
              <p>If you didn't request this, please ignore this email or contact support if you have concerns.</p>
            </div>
            <div class="footer">
              <p>© 2026 Homefixu. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: "Password Reset OTP - Homefixu",
      html,
    });
  }

  async sendBookingConfirmation(
    email: string,
    bookingDetails: {
      service: string;
      date: string;
      time: string;
      property: string;
    },
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #E8A741 0%, #D89028 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .booking-details { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Booking Confirmed!</h1>
            </div>
            <div class="content">
              <h2>Your Service is Scheduled</h2>
              <p>Thank you for booking with Homefixu. Your service has been confirmed.</p>
              <div class="booking-details">
                <div class="detail-row">
                  <strong>Service:</strong>
                  <span>${bookingDetails.service}</span>
                </div>
                <div class="detail-row">
                  <strong>Property:</strong>
                  <span>${bookingDetails.property}</span>
                </div>
                <div class="detail-row">
                  <strong>Date:</strong>
                  <span>${bookingDetails.date}</span>
                </div>
                <div class="detail-row">
                  <strong>Time:</strong>
                  <span>${bookingDetails.time}</span>
                </div>
              </div>
              <p>A technician will be assigned shortly. You'll receive a notification once assigned.</p>
            </div>
            <div class="footer">
              <p>© 2026 Homefixu. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: "Booking Confirmation - Homefixu",
      html,
    });
  }

  async sendHealthReportReady(
    email: string,
    _reportId: string,
  ): Promise<boolean> {
    const reportUrl = `${this.configService.get("APP_URL")}/dashboard/reports`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #E8A741 0%, #D89028 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #E8A741; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 Your Home Health Report is Ready!</h1>
            </div>
            <div class="content">
              <h2>Report Generated</h2>
              <p>Your home health report has been generated by our AI system based on the technician's inspection.</p>
              <p>View your detailed report to see:</p>
              <ul>
                <li>Overall health score</li>
                <li>Category-wise breakdown</li>
                <li>Risk flags and vulnerabilities</li>
                <li>Recommended repairs and maintenance</li>
              </ul>
              <a href="${reportUrl}" class="button">View Report</a>
            </div>
            <div class="footer">
              <p>© 2026 Homefixu. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: "Your Home Health Report is Ready - Homefixu",
      html,
    });
  }
}
