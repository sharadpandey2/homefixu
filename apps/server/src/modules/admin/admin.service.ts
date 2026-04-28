import { randomBytes } from "node:crypto";
import { auth } from "@homebuddy-12/auth";
import { db } from "@homebuddy-12/db";
import {
  technicianAccounts,
  technicianKyc,
  technicians,
} from "@homebuddy-12/db/schema";
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { fromNodeHeaders } from "better-auth/node";
import { desc, eq, sql } from "drizzle-orm";

const generateEmployeeId = (): string =>
  `HB-TECH-${randomBytes(3).toString("hex").toUpperCase()}`;

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  async createTechnician(data: any, incomingHeaders: any) {
    const {
      fullName,
      email,
      password,
      phone,
      role,
      experienceYears,
      city,
      pincode,
    } = data;

    if (!fullName || !email || !password) {
      throw new BadRequestException(
        "Name, email (Login ID), and password are required",
      );
    }

    try {
      // 1. Create User via Better Auth API
      // This handles password hashing correctly and populates users + accounts tables
      const user = await auth.api
        .createUser({
          headers: fromNodeHeaders(incomingHeaders),
          body: {
            email,
            password,
            name: fullName,
            role: "technician",
            emailVerified: true,
          },
        })
        .catch((err) => {
          this.logger.error("Better Auth createUser failed", err);
          throw new BadRequestException(err?.message || "Auth API Error");
        });

      if (!user) {
        throw new BadRequestException("Failed to create user via Auth API");
      }

      const userId = user.user.id;
      const employeeId = generateEmployeeId();
      const techProfileId = randomBytes(16).toString("hex");

      // 2. Create Technician Profile (for business lists)
      await db.insert(technicians).values({
        id: techProfileId,
        userId,
        name: fullName,
        email,
        phone: phone || "0000000000",
        domain: (role as any) || "electrical",
        experienceYears: experienceYears || "0",
        city: city || "Unknown",
        pincode: pincode || "000000",
        isActive: true,
        isVerified: true,
        employeeId,
      });

      // 3. Create Technician Account (Legacy/Direct)
      // We still store the passwordHash here for legacy purposes if needed,
      // but the main login uses Better Auth's account.
      const passwordHash = await bcrypt.hash(password, 10);
      await db.insert(technicianAccounts).values({
        id: randomBytes(16).toString("hex"),
        employeeId,
        email,
        passwordHash,
        fullName,
        phone: phone || "0000000000",
        role: (role as any) || "electrical",
        experienceYears: experienceYears || "0",
        city: city || "Unknown",
        pincode: pincode || "000000",
        isActive: true,
        isVerified: true,
        approvalStatus: "approved",
      });

      return { message: "Technician created successfully", employeeId, userId };
    } catch (error: any) {
      this.logger.error(
        `FAILED TO CREATE TECHNICIAN: ${error.message}`,
        error.stack,
      );
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(
        `Internal Server Error during creation: ${error.message}`,
      );
    }
  }

  async listTechnicians(kycStatus?: string) {
    // Basic listing — refine pagination later
    const rows = await db
      .select({
        id: technicians.id,
        userId: technicians.userId,
        name: technicians.name,
        email: technicians.email,
        phone: technicians.phone,
        domain: technicians.domain,
        city: technicians.city,
        isVerified: technicians.isVerified,
        isActive: technicians.isActive,
        employeeId: technicians.employeeId,
        kycStatus: technicianKyc.status,
        createdAt: technicians.createdAt,
      })
      .from(technicians)
      .leftJoin(technicianKyc, eq(technicianKyc.technicianId, technicians.id))
      .orderBy(desc(technicians.createdAt));

    if (kycStatus) {
      return rows.filter((r) => r.kycStatus === kycStatus);
    }
    return rows;
  }

  async getTechnicianKyc(technicianId: string) {
    const tech = await db.query.technicians.findFirst({
      where: eq(technicians.id, technicianId),
    });
    if (!tech) throw new NotFoundException("Technician not found");

    const kyc = await db.query.technicianKyc.findFirst({
      where: eq(technicianKyc.technicianId, technicianId),
    });
    if (!kyc) throw new NotFoundException("KYC record not found");

    return { technician: tech, kyc };
  }

  async approveKyc(technicianId: string, adminId: string) {
    const kyc = await db.query.technicianKyc.findFirst({
      where: eq(technicianKyc.technicianId, technicianId),
    });
    if (!kyc) throw new NotFoundException("KYC record not found");

    if (kyc.status !== "under_review") {
      throw new BadRequestException(
        `Cannot approve KYC with status '${kyc.status}'. Must be 'under_review'`,
      );
    }

    const employeeId = generateEmployeeId();
    const now = new Date();

    await db.transaction(async (tx) => {
      await tx
        .update(technicianKyc)
        .set({
          status: "verified",
          isAadhaarVerified: true,
          isPanVerified: true,
          isPoliceVerified: true,
          reviewedBy: adminId,
          reviewedAt: now,
          updatedAt: now,
        })
        .where(eq(technicianKyc.technicianId, technicianId));

      await tx
        .update(technicians)
        .set({
          isVerified: true,
          isActive: true,
          employeeId,
          updatedAt: now,
        })
        .where(eq(technicians.id, technicianId));
    });

    this.logger.log(
      `KYC approved for technician ${technicianId} by admin ${adminId}, employeeId=${employeeId}`,
    );

    return { message: "KYC approved", technicianId, employeeId };
  }

  async rejectKyc(technicianId: string, adminId: string, reason: string) {
    if (!reason || reason.trim().length < 5) {
      throw new BadRequestException(
        "Rejection reason must be at least 5 characters",
      );
    }

    const kyc = await db.query.technicianKyc.findFirst({
      where: eq(technicianKyc.technicianId, technicianId),
    });
    if (!kyc) throw new NotFoundException("KYC record not found");

    if (kyc.status !== "under_review") {
      throw new BadRequestException(
        `Cannot reject KYC with status '${kyc.status}'. Must be 'under_review'`,
      );
    }

    await db
      .update(technicianKyc)
      .set({
        status: "rejected",
        reviewedBy: adminId,
        reviewedAt: new Date(),
        rejectionReason: reason,
        updatedAt: new Date(),
      })
      .where(eq(technicianKyc.technicianId, technicianId));

    this.logger.log(
      `KYC rejected for technician ${technicianId} by admin ${adminId}`,
    );

    return { message: "KYC rejected", technicianId };
  }

  async getStats() {
    const [userCounts, bookingCounts, pendingKyc] = await Promise.all([
      db.execute(sql`
        SELECT role, COUNT(*)::int as count
        FROM users
        GROUP BY role
      `),
      db.execute(sql`
        SELECT status, COUNT(*)::int as count
        FROM bookings
        GROUP BY status
      `),
      db.execute(sql`
        SELECT COUNT(*)::int as count
        FROM technician_kyc
        WHERE status = 'under_review'
      `),
    ]);

    return {
      users: (userCounts as any).rows ?? userCounts,
      bookings: (bookingCounts as any).rows ?? bookingCounts,
      pendingKyc: ((pendingKyc as any).rows ?? pendingKyc)[0]?.count ?? 0,
    };
  }
}
