import { Type } from "class-transformer";
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsOptional,
  ValidateNested,
} from "class-validator";

export class InspectionLogDto {
  @IsIn(["plumbing", "electrical", "pest"])
  service_type!: "plumbing" | "electrical" | "pest";

  @IsDateString()
  date!: string;

  // ── Plumbing ──────────────────────────────
  @IsOptional()
  @IsBoolean()
  leak_detected?: boolean;

  @IsOptional()
  @IsIn(["good", "moderate", "bad"])
  pipe_condition?: "good" | "moderate" | "bad";

  // ── Electrical ────────────────────────────
  @IsOptional()
  @IsBoolean()
  voltage_issue?: boolean;

  @IsOptional()
  @IsIn(["good", "bad"])
  wiring_condition?: "good" | "bad";

  // ── Pest ──────────────────────────────────
  @IsOptional()
  @IsIn(["none", "low", "high"])
  pest_level?: "none" | "low" | "high";
}

export class AiRequestDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => InspectionLogDto)
  logs!: InspectionLogDto[];
}
