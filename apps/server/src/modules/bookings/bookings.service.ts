import { db } from "@homebuddy-12/db";
import {
  bookings,
  properties,
  serviceDues,
  services,
  technicians,
} from "@homebuddy-12/db/schema";
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { and, asc, eq, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import type {
  CancelBookingDto,
  CreateBookingDto,
  RescheduleBookingDto,
} from "./dto/booking.dto";

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["in_progress", "cancelled"],
  in_progress: ["completed"],
  completed: [],
  cancelled: [],
};

@Injectable()
export class BookingsService {
  // ─── CREATE BOOKING ─────────────────────────────────────────────────────────
  async createBooking(userId: string, dto: CreateBookingDto) {
    // 1. Verify property belongs to user
    const property = await db.query.properties.findFirst({
      where: and(
        eq(properties.id, dto.propertyId),
        eq(properties.userId, userId),
      ),
    });
    if (!property) throw new NotFoundException("Property not found");

    // 2. Verify service exists and is active
    const service = await db.query.services.findFirst({
      where: and(eq(services.id, dto.serviceId), eq(services.isActive, true)),
    });
    if (!service) throw new NotFoundException("Service not found");

    // 3. Build scheduled timestamp from date + slot start time
    // scheduledDate = "2026-04-10", scheduledSlot = "09:00-11:00"
    const slotStartTime = dto.scheduledSlot.split("-")[0]; // "09:00"
    const scheduledAt = new Date(`${dto.scheduledDate}T${slotStartTime}:00`);
    if (scheduledAt <= new Date()) {
      throw new BadRequestException("Scheduled time must be in the future");
    }

    // 4. Auto-assign technician with fewest bookings on that date
    const availableTechnicians = await db
      .select({
        id: technicians.id,
        name: technicians.name,
        phone: technicians.phone,
      })
      .from(technicians)
      .where(
        and(eq(technicians.isActive, true), eq(technicians.isVerified, true)),
      )
      .orderBy(
        asc(
          sql`(
            SELECT COUNT(*) FROM bookings b
            WHERE b.assigned_technician_id = ${technicians.id}
            AND DATE(b.scheduled_date) = ${dto.scheduledDate}::date
          )`,
        ),
      )
      .limit(1);

    const assignedTechnician = availableTechnicians[0] ?? null;

    // 5. Create booking (price in paise from service catalog)
    const [booking] = await db
      .insert(bookings)
      .values({
        id: nanoid(),
        userId,
        propertyId: dto.propertyId,
        serviceId: dto.serviceId,
        assignedTechnicianId: assignedTechnician?.id ?? null,
        technicianName: assignedTechnician?.name ?? null,
        technicianPhone: assignedTechnician?.phone ?? null,
        scheduledDate: scheduledAt, // timestamp column
        scheduledSlot: dto.scheduledSlot, // "09:00-11:00"
        status: "pending",
        totalPricePaise: service.basePricePaise,
        notes: dto.notes ?? null,
      })
      .returning();

    // 6. Upsert service_due record
    await this.upsertServiceDue(
      userId,
      dto.propertyId,
      dto.serviceId,
      scheduledAt,
    );

    return this.format(booking, service, property);
  }

  // ─── LIST BOOKINGS ───────────────────────────────────────────────────────────
  async listBookings(userId: string, status?: string) {
    const conditions = [eq(bookings.userId, userId)];
    if (status) conditions.push(eq(bookings.status, status as any));

    const results = await db.query.bookings.findMany({
      where: and(...conditions),
      with: { service: true, property: true },
      orderBy: (b, { desc }) => [desc(b.createdAt)],
    });

    return results.map((b) => this.format(b, b.service, b.property));
  }

  // ─── GET SINGLE BOOKING ──────────────────────────────────────────────────────
  async getBooking(userId: string, bookingId: string) {
    const booking = await db.query.bookings.findFirst({
      where: and(eq(bookings.id, bookingId), eq(bookings.userId, userId)),
      with: { service: true, property: true },
    });
    if (!booking) throw new NotFoundException("Booking not found");
    return this.format(booking, booking.service, booking.property);
  }

  // ─── CANCEL BOOKING ──────────────────────────────────────────────────────────
  async cancelBooking(
    userId: string,
    bookingId: string,
    dto: CancelBookingDto,
  ) {
    const booking = await this.findOwnedBooking(userId, bookingId);
    this.assertTransition(booking.status, "cancelled");

    // Append cancellation reason to notes if provided
    const newNotes = dto.reason
      ? `${booking.notes ? `${booking.notes}\n` : ""}Cancellation Reason: ${dto.reason}`
      : booking.notes;

    const [updated] = await db
      .update(bookings)
      .set({
        status: "cancelled",
        notes: newNotes,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId))
      .returning();

    // Safety check for TS warning
    if (!updated) throw new NotFoundException("Failed to cancel booking");

    return {
      id: updated.id,
      status: updated.status,
      message: "Booking cancelled successfully",
    };
  }

  // ─── RESCHEDULE BOOKING ──────────────────────────────────────────────────────
  async rescheduleBooking(
    userId: string,
    bookingId: string,
    dto: RescheduleBookingDto,
  ) {
    const booking = await this.findOwnedBooking(userId, bookingId);

    if (!["pending", "confirmed"].includes(booking.status)) {
      throw new BadRequestException(
        `Cannot reschedule a booking with status: ${booking.status}`,
      );
    }

    const slotStartTime = dto.scheduledSlot.split("-")[0];
    const newScheduledAt = new Date(`${dto.scheduledDate}T${slotStartTime}:00`);
    if (newScheduledAt <= new Date()) {
      throw new BadRequestException("New scheduled time must be in the future");
    }

    // Append reschedule reason to notes if provided
    const newNotes = dto.reason
      ? `${booking.notes ? `${booking.notes}\n` : ""}Reschedule Reason: ${dto.reason}`
      : booking.notes;

    const [updated] = await db
      .update(bookings)
      .set({
        scheduledDate: newScheduledAt,
        scheduledSlot: dto.scheduledSlot,
        notes: newNotes,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId))
      .returning();

    // Safety check for TS warning
    if (!updated) throw new NotFoundException("Failed to reschedule booking");

    // Keep service_due in sync
    await this.upsertServiceDue(
      userId,
      booking.propertyId,
      booking.serviceId,
      newScheduledAt,
    );

    return {
      id: updated.id,
      scheduledDate: updated.scheduledDate,
      scheduledSlot: updated.scheduledSlot,
      message: "Booking rescheduled successfully",
    };
  }

  // ─── ADD REVIEW ──────────────────────────────────────────────────────────────
  async addReview(_userId: string, _bookingId: string, _dto: any) {
    throw new BadRequestException(
      "Review feature not yet available. Add rating and review columns to bookings table first.",
    );
  }

  // ─── PRIVATE HELPERS ─────────────────────────────────────────────────────────
  private async findOwnedBooking(userId: string, bookingId: string) {
    const booking = await db.query.bookings.findFirst({
      where: and(eq(bookings.id, bookingId), eq(bookings.userId, userId)),
    });
    if (!booking) throw new NotFoundException("Booking not found");
    return booking;
  }

  private assertTransition(currentStatus: string, targetStatus: string) {
    if (!ALLOWED_TRANSITIONS[currentStatus]?.includes(targetStatus)) {
      throw new BadRequestException(
        `Cannot transition from '${currentStatus}' to '${targetStatus}'`,
      );
    }
  }

  private async upsertServiceDue(
    userId: string,
    propertyId: string,
    serviceId: string,
    scheduledAt: Date,
  ) {
    const existing = await db.query.serviceDues.findFirst({
      where: and(
        eq(serviceDues.userId, userId),
        eq(serviceDues.propertyId, propertyId),
        eq(serviceDues.serviceId, serviceId),
      ),
    });

    if (existing) {
      await db
        .update(serviceDues)
        .set({
          nextDueDate: scheduledAt,
          updatedAt: new Date(),
        })
        .where(eq(serviceDues.id, existing.id));
    } else {
      await db.insert(serviceDues).values({
        id: nanoid(),
        userId,
        propertyId,
        serviceId,
        nextDueDate: scheduledAt,
        // Optional: Leaving lastServiceDate null initially until booking is completed
      });
    }
  }

  private format(booking: any, service: any, property: any) {
    return {
      id: booking.id,
      status: booking.status,
      scheduledDate: booking.scheduledDate,
      scheduledSlot: booking.scheduledSlot, // "09:00-11:00"
      totalPricePaise: booking.totalPricePaise,
      totalPriceRupees: booking.totalPricePaise / 100, // convenience field
      materialCostPaise: booking.materialCostPaise ?? 0,
      notes: booking.notes ?? null,
      providerNotes: booking.providerNotes ?? null,
      isEarlyService: booking.isEarlyService,
      completedAt: booking.completedAt ?? null,
      createdAt: booking.createdAt,
      technician: booking.technicianName
        ? { name: booking.technicianName, phone: booking.technicianPhone }
        : null,
      service: service
        ? {
            id: service.id,
            name: service.name,
            category: service.category,
            durationMinutes: service.durationMinutes,
          }
        : null,
      property: property
        ? {
            id: property.id,
            name: property.name,
            addressLine1: property.addressLine1,
            city: property.city,
          }
        : null,
    };
  }
}
