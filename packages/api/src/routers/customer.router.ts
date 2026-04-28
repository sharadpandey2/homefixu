// packages/api/src/routers/customer.router.ts
import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

// Property schemas (matching your DTOs)
const PropertyType = z.enum(["apartment", "house", "villa", "office"]);
const AreaMeasurement = z.enum(["sqft", "gaz", "bhk"]);

const CreatePropertySchema = z.object({
  name: z.string().min(1).max(100),
  address: z.string().min(5).max(500),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  pincode: z.string().regex(/^\d{6}$/, "Invalid pincode"),
  propertyType: PropertyType,
  areaMeasurement: AreaMeasurement,
  areaValue: z.number().positive(),
  rooms: z.number().int().positive().optional(),
  isDefault: z.boolean().optional(),
});

const UpdatePropertySchema = CreatePropertySchema.partial();

const PropertyResponseSchema = z.object({
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

const ServiceResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  basePrice: z.number(),
  frequency: z.string(),
  duration: z.number(),
  materialPolicy: z.string(),
});

export const customerContract = c.router({
  // Properties
  createProperty: {
    method: "POST",
    path: "/customer/properties",
    responses: {
      201: PropertyResponseSchema,
      400: z.object({ message: z.string() }),
      401: z.object({ message: z.string() }),
    },
    body: CreatePropertySchema,
    summary: "Create a new property",
  },

  getProperties: {
    method: "GET",
    path: "/customer/properties",
    responses: {
      200: z.array(PropertyResponseSchema),
      401: z.object({ message: z.string() }),
    },
    summary: "Get all user properties",
  },

  getProperty: {
    method: "GET",
    path: "/customer/properties/:id",
    responses: {
      200: PropertyResponseSchema,
      401: z.object({ message: z.string() }),
      404: z.object({ message: z.string() }),
    },
    summary: "Get single property",
  },

  updateProperty: {
    method: "PATCH",
    path: "/customer/properties/:id",
    responses: {
      200: PropertyResponseSchema,
      400: z.object({ message: z.string() }),
      401: z.object({ message: z.string() }),
      404: z.object({ message: z.string() }),
    },
    body: UpdatePropertySchema,
    summary: "Update property",
  },

  deleteProperty: {
    method: "DELETE",
    path: "/customer/properties/:id",
    responses: {
      204: z.void(),
      401: z.object({ message: z.string() }),
      404: z.object({ message: z.string() }),
    },
    body: null,
    summary: "Delete property",
  },

  setDefaultProperty: {
    method: "PATCH",
    path: "/customer/properties/:id/default",
    responses: {
      200: PropertyResponseSchema,
      401: z.object({ message: z.string() }),
      404: z.object({ message: z.string() }),
    },
    body: null,
    summary: "Set property as default",
  },

  // Services
  getServices: {
    method: "GET",
    path: "/customer/services",
    responses: {
      200: z.array(ServiceResponseSchema),
      401: z.object({ message: z.string() }),
    },
    summary: "Get all available services",
  },

  getService: {
    method: "GET",
    path: "/customer/services/:id",
    responses: {
      200: ServiceResponseSchema,
      401: z.object({ message: z.string() }),
      404: z.object({ message: z.string() }),
    },
    summary: "Get single service",
  },
});
