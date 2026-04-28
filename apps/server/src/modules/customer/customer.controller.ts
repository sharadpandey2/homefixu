import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject, // 👈 1. Added Inject import
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import type { CurrentUserData } from "../../auth/decorators/current-user.decorator";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { AuthGuard } from "../../auth/guards/auth.guard";
import { CustomerService } from "./customer.service";
import type { CreatePropertyDto, UpdatePropertyDto } from "./dto/property.dto";
import { CreatePropertySchema, UpdatePropertySchema } from "./dto/property.dto";

@Controller("customer")
@UseGuards(AuthGuard)
export class CustomerController {
  constructor(
    // 👈 2. Forced dependency injection so it never returns undefined!
    @Inject(CustomerService)
    private readonly customerService: CustomerService,
  ) {}

  // ==================== PROPERTIES ====================

  @Post("properties")
  @HttpCode(HttpStatus.CREATED)
  async createProperty(
    @CurrentUser() user: CurrentUserData,
    @Body() body: unknown,
  ) {
    const data = CreatePropertySchema.parse(body) as CreatePropertyDto;
    return this.customerService.createProperty(user.id, data);
  }

  @Get("properties")
  async getProperties(@CurrentUser() user: CurrentUserData) {
    return this.customerService.getProperties(user.id);
  }

  @Get("properties/:id")
  async getProperty(
    @CurrentUser() user: CurrentUserData,
    @Param("id") id: string,
  ) {
    return this.customerService.getProperty(user.id, id);
  }

  @Patch("properties/:id")
  async updateProperty(
    @CurrentUser() user: CurrentUserData,
    @Param("id") id: string,
    @Body() body: unknown,
  ) {
    const data = UpdatePropertySchema.parse(body) as UpdatePropertyDto;
    return this.customerService.updateProperty(user.id, id, data);
  }

  @Delete("properties/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProperty(
    @CurrentUser() user: CurrentUserData,
    @Param("id") id: string,
  ) {
    await this.customerService.deleteProperty(user.id, id);
  }

  @Patch("properties/:id/set-default")
  async setDefaultProperty(
    @CurrentUser() user: CurrentUserData,
    @Param("id") id: string,
  ) {
    return this.customerService.setDefaultProperty(user.id, id);
  }

  // ==================== SERVICES ====================

  @Get("services")
  async getServices() {
    return this.customerService.getServices();
  }

  @Get("services/due")
  async getServicesDue(@CurrentUser() user: CurrentUserData) {
    return this.customerService.getServicesDue(user.id);
  }

  @Get("services/:id")
  async getService(@Param("id") id: string) {
    return this.customerService.getService(id);
  }

  // ==================== HEALTH REPORTS ====================

  // IMPORTANT: /latest MUST come before /:id to avoid "latest" being captured as an id param
  @Get("health-reports/latest")
  async getLatestHealthReport(@CurrentUser() user: CurrentUserData) {
    return this.customerService.getLatestHealthReport(user.id);
  }

  @Get("health-reports")
  async getHealthReports(@CurrentUser() user: CurrentUserData) {
    return this.customerService.getHealthReports(user.id);
  }

  @Get("health-reports/:id")
  async getHealthReport(
    @CurrentUser() user: CurrentUserData,
    @Param("id") id: string,
  ) {
    return this.customerService.getHealthReport(user.id, id);
  }
}
