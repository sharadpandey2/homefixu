import { initContract } from "@ts-rest/core";
import { z } from "zod";

// 1. Import your modular routers here
// import { dashboardRouter } from "./routers/dashboard.router";
// import { customerRouter } from "./routers/customer.router"; // (If you have this)
import { technicianRouter } from "./routers/technician.router";

const c = initContract();

export const contract = c.router({
  // --- Your existing endpoints ---
  healthCheck: {
    method: "GET",
    path: "/health",
    responses: {
      200: z.literal("OK"),
    },
  },
  privateData: {
    method: "GET",
    path: "/private",
    responses: {
      200: z.object({
        message: z.string(),
        user: z.object({
          id: z.string(),
          email: z.string(),
          name: z.string().nullable(),
        }),
      }),
      401: z.object({
        message: z.string(),
      }),
    },
  },

  // 2. --- ADD YOUR NEW ROUTERS HERE ---
  // dashboard: dashboardRouter,
  technician: technicianRouter,
  // customer: customerRouter,
});

export type AppContract = typeof contract;

// 3. --- EXPORT THE ROUTERS FOR THE CONTROLLERS ---
// This is the exact line that fixes your error!
export { technicianRouter };
