import { db } from "./packages/db/src/index";
import {
  technicianAccounts,
  technicianAvailability,
  technicianKyc,
} from "./packages/db/src/schema/core";

async function test() {
  const technicianId = `tech_${Date.now()}`;
  try {
    await db.transaction(async (tx) => {
      await tx.insert(technicianAccounts).values({
        id: technicianId,
        employeeId: `EMP-${Date.now()}`,
        email: `test${Date.now()}@test.com`,
        passwordHash: "hash",
        fullName: "Test",
        phone: Date.now().toString().slice(-10),
        role: "plumbing",
        experienceYears: "1-3",
        city: "Delhi",
        pincode: "110001",
        isActive: true,
        isVerified: false,
        approvalStatus: "pending",
        rejectionReason: null,
        passwordUpdatedAt: new Date(),
      });

      await tx.insert(technicianKyc).values({
        id: `kyc_${Date.now()}`,
        technicianId,
        fullName: "Test",
        status: "not_submitted",
      });

      await tx.insert(technicianAvailability).values({
        id: `avail_${Date.now()}`,
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
    });
    console.log("Success!");
  } catch (err) {
    console.error("Error inserting:", err);
  }
}
test();
