import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

export const technicianRouter = c.router({
  getDashboard: {
    method: "GET",
    path: "/technician/dashboard",
    responses: {
      200: z.object({
        todayJobs: z.number(),
        pendingRequests: z.number(),
        completedThisWeek: z.number(),
        technicianStatus: z.object({
          fullName: z.string(),
          approvalStatus: z.string(),
          isVerified: z.boolean(),
          isActive: z.boolean(),
        }),
      }),
    },
  },
  getSchedule: {
    method: "GET",
    path: "/technician/schedule",
    query: z.object({
      status: z.string().optional(),
      date: z.string().optional(),
    }),
    responses: {
      200: z.array(
        z.object({
          id: z.string(),
          booking_id: z.string(),
          service_name: z.string(),
          service_category: z.string(),
          customer_name: z.string(),
          customer_phone: z.string(),
          property_address: z.string(),
          property_city: z.string(),
          scheduled_date: z.string(),
          scheduled_slot: z.string(),
          status: z.string(),
          total_price: z.number(),
          special_instructions: z.string().nullable(),
        }),
      ),
    },
  },
  acceptBooking: {
    method: "POST",
    path: "/technician/bookings/:bookingId/accept",
    body: z.object({}),
    responses: {
      200: z.object({
        message: z.string(),
      }),
    },
  },
  rejectBooking: {
    method: "POST",
    path: "/technician/bookings/:bookingId/reject",
    body: z.object({
      reason: z.string().optional(),
    }),
    responses: {
      200: z.object({
        message: z.string(),
      }),
    },
  },
  login: {
    method: "POST",
    path: "/technician/login",
    body: z.object({
      email: z.string().email(),
      password: z.string(),
    }),
    responses: {
      200: z.object({
        message: z.string(),
      }),
      401: z.object({
        message: z.string(),
      }),
    },
    summary: "Login using technicianAccounts table",
  },
  startBooking: {
    method: "POST",
    path: "/technician/bookings/:bookingId/start",
    body: z.object({}),
    responses: {
      200: z.object({ message: z.string() }),
    },
  },
  completeBooking: {
    method: "POST",
    path: "/technician/bookings/:bookingId/complete",
    body: z.object({
      notes: z.string().optional(),
    }),
    responses: {
      200: z.object({ message: z.string() }),
    },
  },
});
