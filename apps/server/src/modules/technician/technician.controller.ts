import { technicianRouter } from "@homebuddy-12/api";
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { TsRestHandler, tsRestHandler } from "@ts-rest/nest";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { AuthGuard } from "../../auth/guards/auth.guard";
import type {
  CreateInspectionDto,
  SubmitKycDto,
  UpdateAvailabilityDto,
  UpdateTechnicianProfileDto,
} from "./dto/technician.dto";
import { TechnicianService } from "./technician.service";
import { TechnicianSignupService } from "./technician-signup.service";

@Controller("technician")
export class TechnicianController {
  constructor(
    @Inject(TechnicianService)
    private readonly technicianService: TechnicianService,
    @Inject(TechnicianSignupService)
    private readonly technicianSignupService: TechnicianSignupService,
  ) {}

  // ═══════════════════════════════════════════════════════════════════════════════
  // PUBLIC ROUTES
  // ═══════════════════════════════════════════════════════════════════════════════

  @TsRestHandler(technicianRouter.login)
  async login() {
    return tsRestHandler(technicianRouter.login, async ({ body }) => {
      const result = await this.technicianSignupService.login(body);
      return { status: 200, body: result };
    });
  }

  // Optional future login route
  // @Post('login')
  // async login(@Body() dto: TechnicianLoginDto) {
  //   return this.technicianSignupService.login(dto);
  // }

  // ═══════════════════════════════════════════════════════════════════════════════
  // PROTECTED ROUTES
  // ═══════════════════════════════════════════════════════════════════════════════

  @Get("profile")
  @UseGuards(AuthGuard)
  async getProfile(@CurrentUser("id") technicianId: string) {
    return this.technicianService.getProfile(technicianId);
  }

  @Patch("profile")
  @UseGuards(AuthGuard)
  async updateProfile(
    @CurrentUser("id") technicianId: string,
    @Body() dto: UpdateTechnicianProfileDto,
  ) {
    return this.technicianService.updateProfile(technicianId, dto);
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // KYC
  // ═══════════════════════════════════════════════════════════════════════════════

  @Post("kyc/submit")
  @UseGuards(AuthGuard)
  async submitKyc(
    @CurrentUser("id") technicianId: string,
    @Body() dto: SubmitKycDto,
  ) {
    return this.technicianService.submitKyc(technicianId, dto);
  }

  @Get("kyc/status")
  @UseGuards(AuthGuard)
  async getKycStatus(@CurrentUser("id") technicianId: string) {
    return this.technicianService.getKycStatus(technicianId);
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // AVAILABILITY
  // ═══════════════════════════════════════════════════════════════════════════════

  @Get("availability")
  @UseGuards(AuthGuard)
  async getAvailability(@CurrentUser("id") technicianId: string) {
    return this.technicianService.getAvailability(technicianId);
  }

  @Patch("availability")
  @UseGuards(AuthGuard)
  async updateAvailability(
    @CurrentUser("id") technicianId: string,
    @Body() dto: UpdateAvailabilityDto,
  ) {
    return this.technicianService.updateAvailability(technicianId, dto);
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // BOOKINGS / SCHEDULE
  // ═══════════════════════════════════════════════════════════════════════════════

  @TsRestHandler(technicianRouter.getDashboard)
  @UseGuards(AuthGuard)
  async getDashboard(@CurrentUser("id") technicianId: string) {
    return tsRestHandler(technicianRouter.getDashboard, async () => {
      const stats = await this.technicianService.getDashboard(technicianId);
      return { status: 200, body: stats };
    });
  }

  @TsRestHandler(technicianRouter.getSchedule)
  @UseGuards(AuthGuard)
  async getSchedule(@CurrentUser("id") technicianId: string) {
    return tsRestHandler(technicianRouter.getSchedule, async ({ query }) => {
      const schedule = await this.technicianService.getSchedule(
        technicianId,
        query.status,
        query.date,
      );
      return { status: 200, body: schedule };
    });
  }

  @TsRestHandler(technicianRouter.acceptBooking)
  @UseGuards(AuthGuard)
  async acceptBooking(@CurrentUser("id") technicianId: string) {
    return tsRestHandler(technicianRouter.acceptBooking, async ({ params }) => {
      await this.technicianService.acceptBooking(
        technicianId,
        params.bookingId,
      );
      return { status: 200, body: { message: "Booking accepted" } };
    });
  }

  @TsRestHandler(technicianRouter.rejectBooking)
  @UseGuards(AuthGuard)
  async rejectBooking(@CurrentUser("id") technicianId: string) {
    return tsRestHandler(
      technicianRouter.rejectBooking,
      async ({ params, body }) => {
        await this.technicianService.rejectBooking(
          technicianId,
          params.bookingId,
          body,
        );
        return { status: 200, body: { message: "Booking rejected" } };
      },
    );
  }

  @TsRestHandler(technicianRouter.startBooking)
  @UseGuards(AuthGuard)
  async startBooking(@CurrentUser("id") technicianId: string) {
    return tsRestHandler(technicianRouter.startBooking, async ({ params }) => {
      await this.technicianService.startService(technicianId, params.bookingId);
      return { status: 200, body: { message: "Service started" } };
    });
  }

  @TsRestHandler(technicianRouter.completeBooking)
  @UseGuards(AuthGuard)
  async completeBooking(@CurrentUser("id") technicianId: string) {
    return tsRestHandler(
      technicianRouter.completeBooking,
      async ({ params, body }) => {
        await this.technicianService.completeService(
          technicianId,
          params.bookingId,
          body,
        );
        return { status: 200, body: { message: "Service completed" } };
      },
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // INSPECTIONS
  // ═══════════════════════════════════════════════════════════════════════════════

  @Post("inspections")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createInspection(
    @CurrentUser("id") technicianId: string,
    @Body() dto: CreateInspectionDto,
  ) {
    return this.technicianService.createInspection(technicianId, dto);
  }

  @Get("inspections")
  @UseGuards(AuthGuard)
  async listInspections(@CurrentUser("id") technicianId: string) {
    return this.technicianService.listInspections(technicianId);
  }

  @Get("inspections/:id")
  @UseGuards(AuthGuard)
  async getInspection(
    @CurrentUser("id") technicianId: string,
    @Param("id") inspectionId: string,
  ) {
    return this.technicianService.getInspection(technicianId, inspectionId);
  }
}
