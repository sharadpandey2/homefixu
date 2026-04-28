import { createZodDto } from "nestjs-zod";
import { z } from "zod";

// Slot format: "09:00-11:00"
const timeSlotRegex = /^\d{2}:\d{2}-\d{2}:\d{2}$/;

export const CreateBookingSchema = z.object({
  propertyId: z.string().min(1),
  serviceId: z.string().min(1),
  scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format: YYYY-MM-DD"),
  scheduledSlot: z
    .string()
    .regex(timeSlotRegex, "Format: HH:MM-HH:MM (e.g. 09:00-11:00)"),
  notes: z.string().max(500).optional(),
});

export const RescheduleBookingSchema = z.object({
  scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  scheduledSlot: z.string().regex(timeSlotRegex, "Format: HH:MM-HH:MM"),
  reason: z.string().max(300).optional(),
});

export const CancelBookingSchema = z.object({
  reason: z.string().max(300).optional(),
});

// NOTE: No review DTO — bookings table has no rating/review columns.
// Reviews will be handled in a separate module if needed.

export class CreateBookingDto extends createZodDto(CreateBookingSchema) {}
export class RescheduleBookingDto extends createZodDto(
  RescheduleBookingSchema,
) {}
export class CancelBookingDto extends createZodDto(CancelBookingSchema) {}
