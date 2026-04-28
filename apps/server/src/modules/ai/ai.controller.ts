import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject, // ✅ 1. Import Inject from @nestjs/common
  Post,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { AiService } from "./ai.service";
import type { AiRequestDto } from "./dto/ai-request.dto";

@Controller("ai")
export class AiController {
  constructor(
    // ✅ 2. Add @Inject(AiService) right before your variable
    @Inject(AiService) private readonly aiService: AiService,
  ) {}

  @Post("report")
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async generateReport(@Body() body: AiRequestDto) {
    return this.aiService.generateReport(body.logs);
  }
}
