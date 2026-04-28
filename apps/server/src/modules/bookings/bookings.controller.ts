import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject, // 👈 1. Added Inject import
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { AuthGuard } from "../../auth/guards/auth.guard";
import { BookingsService } from "./bookings.service";
import type {
  CancelBookingDto,
  CreateBookingDto,
  RescheduleBookingDto,
} from "./dto/booking.dto";

@Controller("customer/bookings")
@UseGuards(AuthGuard)
export class BookingsController {
  constructor(
    // 👈 2. Forced dependency injection to prevent the 500 crash!
    @Inject(BookingsService)
    private readonly bookingsService: BookingsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@CurrentUser() user: any, @Body() dto: CreateBookingDto) {
    return this.bookingsService.createBooking(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: any, @Query("status") status?: string) {
    return this.bookingsService.listBookings(user.id, status);
  }

  @Get(":id")
  findOne(@CurrentUser() user: any, @Param("id") id: string) {
    return this.bookingsService.getBooking(user.id, id);
  }

  @Patch(":id/cancel")
  cancel(
    @CurrentUser() user: any,
    @Param("id") id: string,
    @Body() dto: CancelBookingDto,
  ) {
    return this.bookingsService.cancelBooking(user.id, id, dto);
  }

  @Patch(":id/reschedule")
  reschedule(
    @CurrentUser() user: any,
    @Param("id") id: string,
    @Body() dto: RescheduleBookingDto,
  ) {
    return this.bookingsService.rescheduleBooking(user.id, id, dto);
  }

  // Review endpoint kept but returns 400 until columns are added via migration
  @Post(":id/review")
  @HttpCode(HttpStatus.CREATED)
  review(@CurrentUser() user: any, @Param("id") id: string, @Body() body: any) {
    return this.bookingsService.addReview(user.id, id, body);
  }
}
