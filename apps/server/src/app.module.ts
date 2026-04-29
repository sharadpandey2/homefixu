import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";

import { AppService } from "./app.service";
import { LoggerService } from "./lib/logger";
import { StorageService } from "./lib/storage.service";
import { AdminModule } from "./modules/admin/admin.module";
// 👇 1. Import your new modules here
import { BookingsModule } from "./modules/bookings/bookings.module";
import { CustomerModule } from "./modules/customer/customer.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";
import { EmailModule } from "./modules/email/email.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { TechnicianModule } from "./modules/technician/technician.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env", ".env.local"],
    }),

    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),

    CustomerModule,
    TechnicianModule,
    AdminModule,
    DashboardModule,
    NotificationsModule,

    // 👇 2. Add them to the imports array so NestJS knows they exist!
    BookingsModule,
    EmailModule,
  ],

  controllers: [],

  providers: [AppService, LoggerService, StorageService],
})
export class AppModule {}
