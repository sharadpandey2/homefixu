// apps/server/src/modules/customer/dto/property.dto.ts - UPDATED
import { z } from "zod";

// Enums matching your EXACT database schema from core.ts
export const PropertyType = z.enum([
  "apartment",
  "independent_house",
  "villa",
  "row_house",
  "penthouse",
]);

export const AreaMeasurement = z.enum(["sqft", "gaz", "bhk"]);

// Create Property DTO
export const CreatePropertySchema = z.object({
  name: z.string().min(1).max(100),
  address: z.string().min(5).max(500),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  pincode: z.string().regex(/^\d{6}$/, "Invalid pincode"),
  propertyType: PropertyType,
  areaMeasurement: AreaMeasurement,
  areaValue: z.number().positive(),
  rooms: z.number().int().positive().optional(),
  isDefault: z.boolean().optional().default(false),
});

export type CreatePropertyDto = z.infer<typeof CreatePropertySchema>;

// Update Property DTO
export const UpdatePropertySchema = CreatePropertySchema.partial();
export type UpdatePropertyDto = z.infer<typeof UpdatePropertySchema>;

// Property Response DTO
export const PropertyResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  pincode: z.string(),
  propertyType: PropertyType,
  areaMeasurement: AreaMeasurement,
  areaValue: z.number(),
  rooms: z.number().nullable(),
  isDefault: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type PropertyResponseDto = z.infer<typeof PropertyResponseSchema>;
