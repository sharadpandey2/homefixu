// apps/server/src/modules/dashboard/dashboard.controller.ts
import { Controller, Get, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { AuthGuard } from "../../auth/guards/auth.guard";
import type { DashboardService } from "./dashboard.service";

@Controller("customer/dashboard")
@UseGuards(AuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async getOverview(@CurrentUser("id") userId: string) {
    return this.dashboardService.getDashboardOverview(userId);
  }
}
