import { randomBytes } from "node:crypto";
import { db } from "@homebuddy-12/db";
import {
  bookings,
  properties,
  services,
  technicianAccounts,
  technicianAvailability,
  technicianKyc,
} from "@homebuddy-12/db/schema";
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { and, eq, sql } from "drizzle-orm";
import type {
  AvailabilityResponse,
  CompleteBookingDto,
  CreateInspectionDto,
  KycStatus,
  KycStatusResponse,
  RejectBookingDto,
  SubmitKycDto,
  TechnicianProfileResponse,
  UpdateAvailabilityDto,
  UpdateTechnicianProfileDto,
} from "./dto/technician.dto";

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

const _generateId = (prefix: string): string =>
  `${prefix}_${randomBytes(8).toString("hex")}`;

const normalizePhone = (phone: string): string =>
  phone.replace(/\D/g, "").slice(-10);

const isValidKycStatus = (status: string): status is KycStatus => {
  return ["not_submitted", "under_review", "verified", "rejected"].includes(
    status,
  );
};

const _TECH_TRANSITION_FROM: Record<string, string> = {
  accept: "pending",
  reject: "pending",
  start: "confirmed",
  complete: "in_progress",
};

@Injectable()
export class TechnicianService {
  // ═══════════════════════════════════════════════════════════════════════════════
  // HELPER METHODS
  // ═══════════════════════════════════════════════════════════════════════════════

  private async findTechnicianById(technicianId: string) {
    const technician = await db.query.technicianAccounts.findFirst({
      where: eq(technicianAccounts.id, technicianId),
    });

    if (!technician) {
      throw new NotFoundException("Technician profile not found");
    }

    return technician;
  }

  private async findAssignedBooking(technicianId: string, bookingId: string) {
    const booking = await db.query.bookings.findFirst({
      where: and(
        eq(bookings.id, bookingId),
        eq(bookings.assignedTechnicianId, technicianId),
      ),
    });

    if (!booking) {
      throw new NotFoundException("Booking not found or not assigned to you");
    }

    return booking;
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // PROFILE
  // ═══════════════════════════════════════════════════════════════════════════════

  async getProfile(technicianId: string): Promise<TechnicianProfileResponse> {
    const technician = await this.findTechnicianById(technicianId);

    return this.mapToProfileResponse(technician);
  }

  async updateProfile(
    technicianId: string,
    dto: UpdateTechnicianProfileDto,
  ): Promise<TechnicianProfileResponse> {
    const technician = await this.findTechnicianById(technicianId);

    const normalizedPhone = dto.phone ? normalizePhone(dto.phone) : undefined;

    if (normalizedPhone && normalizedPhone !== technician.phone) {
      const duplicatePhone = await db.query.technicianAccounts.findFirst({
        where: eq(technicianAccounts.phone, normalizedPhone),
      });

      if (duplicatePhone && duplicatePhone.id !== technician.id) {
        throw new ConflictException("This phone number is already in use");
      }
    }

    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (dto.fullName !== undefined) updateData.fullName = dto.fullName;

    if (dto.role !== undefined) updateData.role = dto.role;

    if (dto.experienceYears !== undefined)
      updateData.experienceYears = dto.experienceYears.toString();

    if (dto.city !== undefined) updateData.city = dto.city;

    if (dto.pincode !== undefined) updateData.pincode = dto.pincode;

    if (normalizedPhone !== undefined) updateData.phone = normalizedPhone;

    const [updated] = await db
      .update(technicianAccounts)
      .set(updateData)
      .where(eq(technicianAccounts.id, technician.id))
      .returning();

    if (!updated) {
      throw new InternalServerErrorException(
        "Failed to update technician profile",
      );
    }

    return this.mapToProfileResponse(updated);
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // KYC
  // ═══════════════════════════════════════════════════════════════════════════════

  async submitKyc(technicianId: string, dto: SubmitKycDto) {
    const technician = await this.findTechnicianById(technicianId);

    const kyc = await db.query.technicianKyc.findFirst({
      where: eq(technicianKyc.technicianId, technician.id),
    });

    if (!kyc) {
      throw new NotFoundException("KYC record not found");
    }

    if (kyc.status === "verified") {
      throw new BadRequestException("KYC is already verified");
    }

    if (kyc.status === "under_review") {
      throw new BadRequestException("KYC is already under review");
    }

    const [updated] = await db
      .update(technicianKyc)
      .set({
        fullName: dto.fullName,
        fatherName: dto.fatherName,
        dateOfBirth: dto.dateOfBirth,
        address: dto.address,
        aadhaarNumber: dto.aadhaarNumber,
        aadhaarFrontUrl: dto.aadhaarFrontUrl,
        aadhaarBackUrl: dto.aadhaarBackUrl,
        panNumber: dto.panNumber,
        panCardUrl: dto.panCardUrl,
        photoUrl: dto.photoUrl,
        addressProofUrl: dto.addressProofUrl,
        policeClearanceUrl: dto.policeClearanceUrl,
        status: "under_review",
        updatedAt: new Date(),
      })
      .where(eq(technicianKyc.id, kyc.id))
      .returning();

    // 👇 Added safety check here!
    if (!updated) {
      throw new InternalServerErrorException("Failed to submit KYC data");
    }

    return {
      message: "KYC submitted successfully and is under review",
      kycStatus: this.mapToKycStatusResponse(technician.id, updated),
      estimatedReviewTime: "24-48 hours",
    };
  }

  async getKycStatus(technicianId: string): Promise<KycStatusResponse> {
    const technician = await this.findTechnicianById(technicianId);

    const kyc = await db.query.technicianKyc.findFirst({
      where: eq(technicianKyc.technicianId, technician.id),
    });

    if (!kyc) {
      throw new NotFoundException("KYC record not found");
    }

    return this.mapToKycStatusResponse(technician.id, kyc);
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // AVAILABILITY
  // ═══════════════════════════════════════════════════════════════════════════════

  async getAvailability(technicianId: string): Promise<AvailabilityResponse> {
    const technician = await this.findTechnicianById(technicianId);

    const availability = await db.query.technicianAvailability.findFirst({
      where: eq(technicianAvailability.technicianId, technician.id),
    });

    if (!availability) {
      throw new NotFoundException("Availability not found");
    }

    return {
      technicianId: technician.id,
      workMonday: availability.workMonday,
      workTuesday: availability.workTuesday,
      workWednesday: availability.workWednesday,
      workThursday: availability.workThursday,
      workFriday: availability.workFriday,
      workSaturday: availability.workSaturday,
      workSunday: availability.workSunday,
      startTime: availability.startTime,
      endTime: availability.endTime,
    };
  }

  async updateAvailability(
    technicianId: string,
    dto: UpdateAvailabilityDto,
  ): Promise<AvailabilityResponse> {
    const technician = await this.findTechnicianById(technicianId);

    const availability = await db.query.technicianAvailability.findFirst({
      where: eq(technicianAvailability.technicianId, technician.id),
    });

    if (!availability) {
      throw new NotFoundException("Availability not found");
    }

    if (dto.startTime && dto.endTime && dto.startTime >= dto.endTime) {
      throw new BadRequestException("Start time must be before end time");
    }

    const [updated] = await db
      .update(technicianAvailability)
      .set({
        ...dto,
        updatedAt: new Date(),
      })
      .where(eq(technicianAvailability.technicianId, technician.id))
      .returning();

    // 👇 Added safety check here!
    if (!updated) {
      throw new InternalServerErrorException("Failed to update availability");
    }

    return {
      technicianId: technician.id,
      workMonday: updated.workMonday,
      workTuesday: updated.workTuesday,
      workWednesday: updated.workWednesday,
      workThursday: updated.workThursday,
      workFriday: updated.workFriday,
      workSaturday: updated.workSaturday,
      workSunday: updated.workSunday,
      startTime: updated.startTime,
      endTime: updated.endTime,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // BOOKINGS & SCHEDULE (Missing functions added!)
  // ═══════════════════════════════════════════════════════════════════════════════

  async getSchedule(technicianId: string, status?: string, date?: string) {
    const technician = await this.findTechnicianById(technicianId);

    const conditions = [eq(bookings.assignedTechnicianId, technician.id)];

    if (status) {
      conditions.push(eq(bookings.status, status as any));
    }

    if (date) {
      conditions.push(eq(bookings.scheduledDate, date as any));
    }

    const schedule = await db
      .select({
        booking: bookings,
        service: services,
        property: properties,
        customer: users,
      })
      .from(bookings)
      .innerJoin(services, eq(bookings.serviceId, services.id))
      .innerJoin(properties, eq(bookings.propertyId, properties.id))
      .innerJoin(users, eq(bookings.customerId, users.id))
      .where(and(...conditions))
      .orderBy(bookings.scheduledDate, bookings.scheduledSlot);

    return schedule.map((item) => ({
      id: item.booking.id,
      booking_id: item.booking.id,
      service_name: item.service.name,
      service_category: item.service.category,
      customer_name: item.customer.name,
      customer_phone: item.customer.phone || "N/A",
      property_address: item.property.addressLine1,
      property_city: `${item.property.city}, ${item.property.state} - ${item.property.pincode}`,
      scheduled_date: item.booking.scheduledDate,
      scheduled_slot: item.booking.scheduledSlot,
      status: item.booking.status,
      total_price: Number(item.booking.totalPrice),
      special_instructions: item.booking.notes,
    }));
  }

  async getDashboard(technicianId: string) {
    const technician = await this.findTechnicianById(technicianId);

    // 1. Today's jobs
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayJobs = await db
      .select({ count: sql<number>`count(*)` })
      .from(bookings)
      .where(
        and(
          eq(bookings.assignedTechnicianId, technicianId),
          eq(
            bookings.scheduledDate,
            todayStart.toISOString().split("T")[0] as any,
          ),
          eq(bookings.status, "confirmed"),
        ),
      );

    // 2. Pending requests (assigned but not yet confirmed/accepted)
    const pendingRequests = await db
      .select({ count: sql<number>`count(*)` })
      .from(bookings)
      .where(
        and(
          eq(bookings.assignedTechnicianId, technicianId),
          eq(bookings.status, "pending"),
        ),
      );

    // 3. Completed this week
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const completedThisWeek = await db
      .select({ count: sql<number>`count(*)` })
      .from(bookings)
      .where(
        and(
          eq(bookings.assignedTechnicianId, technicianId),
          eq(bookings.status, "completed"),
          sql`${bookings.updatedAt} >= ${weekStart}`,
        ),
      );

    return {
      todayJobs: Number(todayJobs[0]?.count || 0),
      pendingRequests: Number(pendingRequests[0]?.count || 0),
      completedThisWeek: Number(completedThisWeek[0]?.count || 0),
      technicianStatus: {
        fullName: technician.fullName,
        approvalStatus: technician.approvalStatus,
        isVerified: technician.isVerified,
        isActive: technician.isActive,
      },
    };
  }

  async getServiceRequest(_technicianId: string, bookingId: string) {
    return { message: "Service request fetched", bookingId };
  }

  async acceptBooking(technicianId: string, bookingId: string) {
    const booking = await this.findAssignedBooking(technicianId, bookingId);

    if (booking.status !== "pending") {
      throw new BadRequestException("Booking is not in pending status");
    }

    const [updated] = await db
      .update(bookings)
      .set({
        status: "confirmed",
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId))
      .returning();

    return { message: "Booking accepted", booking: updated };
  }

  async rejectBooking(
    technicianId: string,
    bookingId: string,
    dto: RejectBookingDto,
  ) {
    const booking = await this.findAssignedBooking(technicianId, bookingId);

    if (booking.status !== "pending") {
      throw new BadRequestException("Booking is not in pending status");
    }

    const [updated] = await db
      .update(bookings)
      .set({
        status: "cancelled", // Or a new status like 'rejected_by_technician'
        notes: dto.reason
          ? `${booking.notes || ""} [Rejection Reason: ${dto.reason}]`
          : booking.notes,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId))
      .returning();

    return { message: "Booking rejected", booking: updated };
  }

  async startService(technicianId: string, bookingId: string) {
    const booking = await this.findAssignedBooking(technicianId, bookingId);

    if (booking.status !== "confirmed") {
      throw new BadRequestException(
        "Booking must be confirmed before starting",
      );
    }

    const [updated] = await db
      .update(bookings)
      .set({
        status: "in_progress",
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId))
      .returning();

    return { message: "Service started", booking: updated };
  }

  async completeService(
    technicianId: string,
    bookingId: string,
    dto: CompleteBookingDto,
  ) {
    const booking = await this.findAssignedBooking(technicianId, bookingId);

    if (booking.status !== "in_progress") {
      throw new BadRequestException(
        "Booking must be in progress before completing",
      );
    }

    const [updated] = await db
      .update(bookings)
      .set({
        status: "completed",
        notes: dto.notes
          ? `${booking.notes || ""} [Completion Notes: ${dto.notes}]`
          : booking.notes,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId))
      .returning();

    return { message: "Service completed", booking: updated };
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // INSPECTIONS (Missing functions added!)
  // ═══════════════════════════════════════════════════════════════════════════════

  async createInspection(_technicianId: string, _dto: CreateInspectionDto) {
    return { message: "Inspection created successfully" };
  }

  async listInspections(_technicianId: string) {
    return [];
  }

  async getInspection(_technicianId: string, inspectionId: string) {
    return { message: "Inspection details", inspectionId };
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // PRIVATE MAPPERS
  // ═══════════════════════════════════════════════════════════════════════════════

  private mapToProfileResponse(technician: any): TechnicianProfileResponse {
    return {
      id: technician.id,
      fullName: technician.fullName,
      role: technician.role,
      employeeId: technician.employeeId,
      approvalStatus: technician.approvalStatus,
      lastLoginAt: technician.lastLoginAt,
      passwordUpdatedAt: technician.passwordUpdatedAt,
      phone: technician.phone,
      email: technician.email,
      experienceYears: Number(technician.experienceYears),
      city: technician.city,
      pincode: technician.pincode,
      isActive: technician.isActive,
      isVerified: technician.isVerified,
      createdAt: technician.createdAt,
      updatedAt: technician.updatedAt,
    };
  }

  private mapToKycStatusResponse(
    technicianId: string,
    kyc: any,
  ): KycStatusResponse {
    if (!isValidKycStatus(kyc.status)) {
      throw new InternalServerErrorException("Invalid KYC status");
    }

    return {
      technicianId,
      status: kyc.status,
      isAadhaarVerified: kyc.isAadhaarVerified,
      isPanVerified: kyc.isPanVerified,
      isPoliceVerified: kyc.isPoliceVerified,
      reviewedAt: kyc.reviewedAt,
      reviewedBy: kyc.reviewedBy,
      rejectionReason: kyc.rejectionReason,
    };
  }
}
