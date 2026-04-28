import { Module } from "@nestjs/common";
import { TechnicianController } from "./technician.controller";
import { TechnicianService } from "./technician.service";
import { TechnicianSignupService } from "./technician-signup.service";

@Module({
  controllers: [TechnicianController],
  providers: [
    TechnicianService,
    TechnicianSignupService, // 👈 CRITICAL: Ensure this is listed here!
  ],
  exports: [TechnicianService, TechnicianSignupService], // Optional: only if used outside this module
})
export class TechnicianModule {}
