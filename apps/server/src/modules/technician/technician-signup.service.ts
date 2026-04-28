import { randomBytes } from "node:crypto";
import { auth } from "@homebuddy-12/auth";
import { db } from "@homebuddy-12/db";
import {
  technicianAccounts,
  technicianAvailability,
  technicianKyc,
  users,
} from "@homebuddy-12/db/schema";
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { eq, or } from "drizzle-orm";

import type {
  RegisterTechnicianDto,
  RegisterTechnicianResponse,
} from "./dto/technician.dto";

const generateId = (prefix: string): string =>
  `${prefix}_${randomBytes(8).toString("hex")}`;

const generateEmployeeId = (): string =>
  `EMP-${Date.now().toString().slice(-6)}`;

const normalizePhone = (phone: string): string =>
  phone.replace(/\D/g, "").slice(-10);

@Injectable()
export class TechnicianSignupService {
  private readonly logger = new Logger(TechnicianSignupService.name);

  async signup(
    dto: RegisterTechnicianDto,
  ): Promise<RegisterTechnicianResponse> {
    const normalizedPhone = normalizePhone(dto.phone);
    const normalizedEmail = dto.email.toLowerCase().trim();

    // ═══════════════════════════════════════════════════════════════════════════
    // STEP 1: CHECK EXISTING EMAIL / PHONE
    // ═══════════════════════════════════════════════════════════════════════════

    const existingTechnician = await db.query.technicianAccounts.findFirst({
      where: or(
        eq(technicianAccounts.email, normalizedEmail),
        eq(technicianAccounts.phone, normalizedPhone),
      ),
    });

    if (existingTechnician) {
      if (existingTechnician.email === normalizedEmail) {
        throw new ConflictException("This email is already registered");
      }

      if (existingTechnician.phone === normalizedPhone) {
        throw new ConflictException("This phone number is already registered");
      }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // STEP 2: HASH PASSWORD
    // ═══════════════════════════════════════════════════════════════════════════

    let passwordHash: string;

    try {
      passwordHash = await bcrypt.hash(dto.password, 12);
    } catch (err) {
      this.logger.error("Password hashing failed", err);
      throw new InternalServerErrorException("Failed to process password");
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // STEP 3: CREATE TECHNICIAN
    // ═══════════════════════════════════════════════════════════════════════════

    const employeeId = generateEmployeeId();

    try {
      // 1. Create the Better Auth user/account using the internal API
      const authResult = await auth.api.signUpEmail({
        body: {
          email: normalizedEmail,
          password: dto.password,
          name: dto.fullName,
        },
      });

      const technicianId = authResult.user.id;

      // 2. Set the role to 'technician' in the core users table
      // (Required for Better Auth session management)
      await db
        .update(users)
        .set({ role: "technician" })
        .where(eq(users.id, technicianId));

      // 3. Technician account (custom data)
      await db.insert(technicianAccounts).values({
        id: technicianId,
        employeeId,
        email: normalizedEmail,
        passwordHash, // Still storing for custom use if needed
        fullName: dto.fullName,
        phone: normalizedPhone,
        role: dto.role,
        experienceYears: dto.experienceYears.toString(),
        city: dto.city,
        pincode: dto.pincode,
        isActive: true,
        isVerified: false,
        approvalStatus: "pending",
        rejectionReason: null,
        passwordUpdatedAt: new Date(),
      });

      // 4. Default KYC profile
      await db.insert(technicianKyc).values({
        id: generateId("kyc"),
        technicianId,
        fullName: dto.fullName,
        status: "not_submitted",
      });

      // 5. Default availability
      await db.insert(technicianAvailability).values({
        id: generateId("avail"),
        technicianId,
        workMonday: true,
        workTuesday: true,
        workWednesday: true,
        workThursday: true,
        workFriday: true,
        workSaturday: true,
        workSunday: false,
        startTime: "09:00",
        endTime: "18:00",
      });

      this.logger.log(
        `Technician registered successfully: technicianId=${technicianId}`,
      );

      return {
        message:
          "Registration successful. Complete KYC and await admin approval before accepting bookings.",
        technician: {
          id: technicianId,
          fullName: dto.fullName,
          role: dto.role,
          employeeId,
          approvalStatus: "pending",
          lastLoginAt: null,
          passwordUpdatedAt: new Date(),
          phone: normalizedPhone,
          email: normalizedEmail,
          experienceYears: dto.experienceYears,
          city: dto.city,
          pincode: dto.pincode,
          isActive: true,
          isVerified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        nextSteps: [
          "Log in using your registered email and password",
          "Submit KYC verification documents",
          "Wait for admin verification",
          "Update your working availability",
          "Begin accepting assigned service bookings",
        ],
      };
    } catch (err: any) {
      import("node:fs").then((fs) =>
        fs.writeFileSync("debug-err.txt", err.stack || err.message),
      );
      this.logger.error(
        `Technician registration failed for email=${normalizedEmail}`,
        err?.stack,
      );

      if (
        err?.message?.toLowerCase()?.includes("unique") ||
        err?.code === "23505"
      ) {
        throw new ConflictException(
          "Email, phone, or employee ID already exists",
        );
      }

      throw new InternalServerErrorException(
        `Registration failed: ${err.message}`,
      );
    }
  }

  async login(dto: { email: string; password: string }): Promise<any> {
    const normalizedEmail = dto.email.toLowerCase().trim();

    // 1. Find the technician in the technicianAccounts table as requested
    const technician = await db.query.technicianAccounts.findFirst({
      where: eq(technicianAccounts.email, normalizedEmail),
    });

    if (!technician) {
      this.logger.warn(
        `Login attempt for non-existent technician: ${normalizedEmail}`,
      );
      throw new ConflictException("Invalid credentials");
    }

    // 2. Verify password against the hash in technicianAccounts
    const isValid = await bcrypt.compare(dto.password, technician.passwordHash);
    if (!isValid) {
      this.logger.warn(`Invalid password for technician: ${normalizedEmail}`);
      throw new ConflictException("Invalid credentials");
    }

    // 3. Delegate to Better Auth for session creation
    // This will handle the users/accounts table and session generation
    return await auth.api.signInEmail({
      body: {
        email: normalizedEmail,
        password: dto.password,
      },
    });
  }
}
