import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

// ═══ ENUMS ═══

export enum TechnicianDomain {
  PLUMBING = "plumbing",
  ELECTRICAL = "electrical",
  PEST_CONTROL = "pest_control",
  HVAC = "hvac",
  STRUCTURAL = "structural",
  PAINTING = "painting",
  WATERPROOFING = "waterproofing",
  APPLIANCE = "appliance",
}

export enum KycStatus {
  NOT_SUBMITTED = "not_submitted",
  UNDER_REVIEW = "under_review",
  VERIFIED = "verified",
  REJECTED = "rejected",
}

export enum ApprovalStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export enum OverallCondition {
  GOOD = "good",
  FAIR = "fair",
  POOR = "poor",
  CRITICAL = "critical",
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. REGISTER TECHNICIAN DTO
// ═══════════════════════════════════════════════════════════════════════════════

export class RegisterTechnicianDto {
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @IsString()
  @Matches(/^[0-9]{10}$/, {
    message: "Phone must be a valid 10-digit number",
  })
  phone!: string;

  @IsEmail()
  email!: string;

  @IsEnum(TechnicianDomain)
  role!: TechnicianDomain;

  // Updated according to schema recommendation
  @IsInt()
  @Min(0)
  @Max(60)
  experienceYears!: number;

  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsString()
  @Matches(/^[0-9]{6}$/, {
    message: "Pincode must be a valid 6-digit number",
  })
  pincode!: string;

  @IsString()
  @MinLength(8, {
    message: "Password must be at least 8 characters",
  })
  @MaxLength(100)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: "Password must contain at least one letter and one number",
  })
  password!: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. UPDATE PROFILE DTO
// ═══════════════════════════════════════════════════════════════════════════════

export class UpdateTechnicianProfileDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  fullName?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{10}$/, {
    message: "Phone must be a valid 10-digit number",
  })
  phone?: string;

  @IsOptional()
  @IsEnum(TechnicianDomain)
  role?: TechnicianDomain;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(60)
  experienceYears?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  city?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{6}$/, {
    message: "Pincode must be a valid 6-digit number",
  })
  pincode?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. SUBMIT KYC DTO
// ═══════════════════════════════════════════════════════════════════════════════

export class SubmitKycDto {
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @IsOptional()
  @IsString()
  fatherName?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsString()
  @IsNotEmpty()
  address!: string;

  @IsString()
  @Matches(/^\d{12}$/, {
    message: "Aadhaar must be a valid 12-digit number",
  })
  aadhaarNumber!: string;

  @IsUrl()
  aadhaarFrontUrl!: string;

  @IsUrl()
  aadhaarBackUrl!: string;

  @IsString()
  @Matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, {
    message: "Invalid PAN Card format",
  })
  panNumber!: string;

  @IsUrl()
  panCardUrl!: string;

  @IsUrl()
  photoUrl!: string;

  @IsOptional()
  @IsUrl()
  addressProofUrl?: string;

  @IsOptional()
  @IsUrl()
  policeClearanceUrl?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. UPDATE AVAILABILITY DTO
// ═══════════════════════════════════════════════════════════════════════════════

export class UpdateAvailabilityDto {
  @IsOptional()
  @IsBoolean()
  workMonday?: boolean;

  @IsOptional()
  @IsBoolean()
  workTuesday?: boolean;

  @IsOptional()
  @IsBoolean()
  workWednesday?: boolean;

  @IsOptional()
  @IsBoolean()
  workThursday?: boolean;

  @IsOptional()
  @IsBoolean()
  workFriday?: boolean;

  @IsOptional()
  @IsBoolean()
  workSaturday?: boolean;

  @IsOptional()
  @IsBoolean()
  workSunday?: boolean;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: "Start time must be in HH:MM format",
  })
  startTime?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: "End time must be in HH:MM format",
  })
  endTime?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. REJECT BOOKING DTO
// ═══════════════════════════════════════════════════════════════════════════════

export class RejectBookingDto {
  @IsString()
  @IsNotEmpty()
  reason!: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. COMPLETE BOOKING DTO
// ═══════════════════════════════════════════════════════════════════════════════

export class CompleteBookingDto {
  @IsOptional()
  @IsString()
  providerNotes?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  materialCostPaise?: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. CREATE INSPECTION REPORT DTO
// ═══════════════════════════════════════════════════════════════════════════════

export class CreateInspectionDto {
  @IsString()
  @IsNotEmpty()
  bookingId!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  plumbingScore?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  electricalScore?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  structuralScore?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  pestControlScore?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  paintSealantScore?: number;

  @IsInt()
  @Min(0)
  @Max(100)
  overallScore!: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  plumbingIssues?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  electricalIssues?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  structuralIssues?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  pestIssues?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  paintIssues?: string[];

  @IsEnum(OverallCondition)
  overallCondition!: OverallCondition;

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  photos?: string[];

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsOptional()
  @IsString()
  technicianNotes?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// RESPONSE DTOs
// ═══════════════════════════════════════════════════════════════════════════════

export interface TechnicianProfileResponse {
  id: string;
  fullName: string;
  role: TechnicianDomain;
  employeeId: string | null;
  approvalStatus: ApprovalStatus;
  lastLoginAt: Date | null;
  passwordUpdatedAt: Date | null;
  phone: string;
  email: string;
  experienceYears: number;
  city: string;
  pincode: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface KycStatusResponse {
  technicianId: string;
  status: KycStatus;
  isAadhaarVerified: boolean;
  isPanVerified: boolean;
  isPoliceVerified: boolean;
  reviewedAt: Date | null;
  reviewedBy: string | null;
  rejectionReason: string | null;
}

export interface RegisterTechnicianResponse {
  message: string;
  technician: TechnicianProfileResponse;
  nextSteps: string[];
}

export interface SubmitKycResponse {
  message: string;
  kycStatus: KycStatusResponse;
  estimatedReviewTime: string;
}

export interface AvailabilityResponse {
  technicianId: string;
  workMonday: boolean;
  workTuesday: boolean;
  workWednesday: boolean;
  workThursday: boolean;
  workFriday: boolean;
  workSaturday: boolean;
  workSunday: boolean;
  startTime: string;
  endTime: string;
}

export interface TechnicianBookingResponse {
  id: string;
  status: string;
  scheduledDate: Date;
  scheduledSlot: string;
  totalPricePaise: number;
  notes: string | null;
  providerNotes: string | null;
  completedAt: Date | null;
  customer: {
    userId: string;
  };
  service: {
    id: string;
    name: string;
    category: string;
    durationMinutes: number;
  } | null;
  property: {
    id: string;
    name: string;
    addressLine1: string;
    city: string;
    pincode: string;
  } | null;
}

export interface InspectionResponse {
  id: string;
  bookingId: string;
  propertyId: string;
  technicianId: string | null;
  inspectedBy: string;
  inspectionDate: Date;
  plumbingScore: number | null;
  electricalScore: number | null;
  structuralScore: number | null;
  pestControlScore: number | null;
  paintSealantScore: number | null;
  overallScore: number | null;
  overallCondition: OverallCondition | null;
  photos: string[];
  remarks: string | null;
  technicianNotes: string | null;
  createdAt: Date;
}
