import { Transform } from "class-transformer";
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

// ─── Must match technician_accounts.role enum ───
export const TECHNICIAN_ROLES = [
  "plumbing",
  "electrical",
  "pest_control",
  "hvac",
  "structural",
  "painting",
  "waterproofing",
  "appliance",
] as const;

// ─── Must match technician_accounts.experienceYears ───
export const EXPERIENCE_RANGES = ["0-1", "1-3", "3-5", "5-10", "10+"] as const;

export type TechnicianRole = (typeof TECHNICIAN_ROLES)[number];
export type ExperienceRange = (typeof EXPERIENCE_RANGES)[number];

export class TechnicianSignupDto {
  // ─── Login credentials ───

  @IsString()
  @IsNotEmpty()
  @MinLength(2, {
    message: "Full name must be at least 2 characters",
  })
  fullName!: string;

  @IsEmail({}, { message: "Invalid email format" })
  @Transform(({ value }) => String(value).toLowerCase().trim())
  email!: string;

  @IsString()
  @MinLength(8, {
    message: "Password must be at least 8 characters",
  })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: "Password must contain at least one letter and one number",
  })
  password!: string;

  // ─── Technician profile ───

  @IsString()
  @Matches(/^\+?\d[\d\s-]{8,14}$/, {
    message: "Invalid phone number",
  })
  phone!: string;

  @IsString()
  @IsIn(TECHNICIAN_ROLES, {
    message: `Role must be one of: ${TECHNICIAN_ROLES.join(", ")}`,
  })
  role!: TechnicianRole;

  @IsString()
  @IsIn(EXPERIENCE_RANGES, {
    message: `Experience must be one of: ${EXPERIENCE_RANGES.join(", ")}`,
  })
  experienceYears!: ExperienceRange;

  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(15, {
    message: "Postal code cannot exceed 15 characters",
  })
  pincode!: string;
}

export interface TechnicianSignupResponse {
  message: string;

  // technician_accounts.id
  technicianId: string;

  // Auto-generated employee ID
  employeeId: string;

  role: TechnicianRole;

  nextSteps: string[];
}
