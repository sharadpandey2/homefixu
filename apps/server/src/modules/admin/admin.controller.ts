import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { Roles } from "../../auth/decorators/roles.decorator";
import { AuthGuard } from "../../auth/guards/auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { AdminService } from "./admin.service";

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN CONTROLLER — all routes require role=admin
// Admin accounts are seeded manually in DB (no public signup).
// ═══════════════════════════════════════════════════════════════════════════

@Controller("admin")
@UseGuards(AuthGuard, RolesGuard)
@Roles("admin")
export class AdminController {
  constructor(
    @Inject(AdminService) private readonly adminService: AdminService,
  ) {
    console.log(
      "[AdminController] Initialized. AdminService defined:",
      !!this.adminService,
    );
  }

  @Get("technicians")
  async listTechnicians(@Query("kycStatus") kycStatus?: string) {
    return this.adminService.listTechnicians(kycStatus);
  }

  @Post("technicians")
  async createTechnician(@Body() body: any, @Req() req: any) {
    return this.adminService.createTechnician(body, req.headers);
  }

  @Get("technicians/:id/kyc")
  async getTechnicianKyc(@Param("id") technicianId: string) {
    return this.adminService.getTechnicianKyc(technicianId);
  }

  @Patch("technicians/:id/kyc/approve")
  async approveKyc(
    @Param("id") technicianId: string,
    @CurrentUser("id") adminId: string,
  ) {
    return this.adminService.approveKyc(technicianId, adminId);
  }

  @Patch("technicians/:id/kyc/reject")
  async rejectKyc(
    @Param("id") technicianId: string,
    @CurrentUser("id") adminId: string,
    @Body() body: { reason: string },
  ) {
    return this.adminService.rejectKyc(technicianId, adminId, body.reason);
  }

  @Get("stats")
  async getStats() {
    return this.adminService.getStats();
  }
}
