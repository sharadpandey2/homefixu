import { Module } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "../../auth/guards/auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";

@Module({
  controllers: [AdminController],
  providers: [AdminService, AuthGuard, RolesGuard, Reflector],
})
export class AdminModule {}
