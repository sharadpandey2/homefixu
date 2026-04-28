import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// ─── Technician authentication + profile table ────────────────────────────────
export const technicianRoleEnum = pgEnum("technician_role", [
  "plumbing",
  "electrical",
  "pest_control",
  "hvac",
  "structural",
  "painting",
  "waterproofing",
  "appliance",
]);

export const technicianAccounts = pgTable("technician_accounts", {
  // Primary ID
  id: text("id").primaryKey(),

  // Auto-generated employee ID
  employeeId: text("employee_id").notNull().unique(),

  // Login credentials
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),

  // Personal details
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),

  // Technician specialization
  role: technicianRoleEnum("role").notNull(),

  // Experience
  experienceYears: text("experience_years").notNull(),

  // Location
  city: text("city").notNull(),
  pincode: text("pincode").notNull(),

  // Account status
  isActive: boolean("is_active").notNull().default(true),
  isVerified: boolean("is_verified").notNull().default(false),

  // Optional admin fields
  approvalStatus: text("approval_status").notNull().default("pending"), // pending / approved / rejected
  rejectionReason: text("rejection_reason"),

  // Security
  lastLoginAt: timestamp("last_login_at"),
  passwordUpdatedAt: timestamp("password_updated_at"),

  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

import { users } from "./auth";

// ═══════════════════════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════════════════════

export const planTierEnum = pgEnum("plan_tier", ["starter", "pro", "elite"]);

export const reportFrequencyEnum = pgEnum("report_frequency", [
  "quarterly", // every 3 months
  "monthly",
  "weekly",
]);

export const bookingStatusEnum = pgEnum("booking_status", [
  "pending",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
]);

export const serviceCategoryEnum = pgEnum("service_category", [
  "plumbing", // Monthly, labour only
  "electrical", // Monthly, labour only
  "pest_control", // Every 6 months
  "paint_and_sealant", // Once a year, material included
  "doorbell", // Smart doorbell with ad display
  "cctv", // On-demand, material cost on user
  "tank_cleaning", // Every 6 months
  "interior_design", // AI-powered interior design
  "general", // Misc services
]);

export const reportStatusEnum = pgEnum("report_status", [
  "generating",
  "ready",
  "failed",
]);

export const propertyTypeEnum = pgEnum("property_type", [
  "apartment",
  "independent_house",
  "villa",
  "row_house",
  "penthouse",
]);

export const areaMeasurementEnum = pgEnum("area_measurement", [
  "sqft",
  "gaz",
  "bhk",
]);

export const serviceFrequencyEnum = pgEnum("service_frequency", [
  "monthly",
  "quarterly", // every 3 months
  "biannual", // every 6 months
  "annual", // once a year
  "on_demand", // no fixed schedule
]);

export const materialPolicyEnum = pgEnum("material_policy", [
  "labour_only", // Plumbing, Electrical, CCTV — user pays material
  "all_inclusive", // Paint & Sealant — material included
  "no_charge", // Doorbell — free install, ad-supported
  "material_on_user", // CCTV — no labour charge, user buys material
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "created",
  "authorized",
  "captured",
  "refunded",
  "failed",
]);

export const sosStatusEnum = pgEnum("sos_status", [
  "triggered",
  "acknowledged",
  "dispatched",
  "resolved",
  "cancelled",
]);

export const sosCategoryEnum = pgEnum("sos_category", [
  "health_emergency",
  "plumbing_emergency",
  "electrical_emergency",
  "security_emergency",
  "fire_emergency",
  "other",
]);

export const doorbellStatusEnum = pgEnum("doorbell_status", [
  "online",
  "offline_user", // User turned off power
  "offline_error", // Network glitch or error
]);

export const notificationChannelEnum = pgEnum("notification_channel", [
  "app",
  "email",
  "sms",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "service_due",
  "service_completed",
  "package_expiry",
  "health_report_ready",
  "sos_update",
  "payment",
  "general",
]);

// ═══ NEW TECHNICIAN ENUMS ═══

export const technicianDomainEnum = pgEnum("technician_domain", [
  "plumbing",
  "electrical",
  "pest_control",
  "hvac",
  "structural",
  "painting",
  "waterproofing",
  "appliance",
]);

export const kycStatusEnum = pgEnum("kyc_status", [
  "not_submitted",
  "under_review",
  "verified",
  "rejected",
]);

// ═══════════════════════════════════════════════════════════════════════════════
// SUBSCRIPTION PLANS
// ═══════════════════════════════════════════════════════════════════════════════

export const plans = pgTable("plans", {
  id: text("id").primaryKey(),
  name: text("name").notNull(), // "Starter", "Pro", "Elite"
  tier: planTierEnum("tier").notNull().unique(),
  priceMonthlyPaise: integer("price_monthly_paise").notNull(), // ₹499 = 49900 paise
  priceYearlyPaise: integer("price_yearly_paise"), // Annual discount price
  servicesPerMonth: integer("services_per_month").notNull(),
  reportFrequency: reportFrequencyEnum("report_frequency").notNull(),
  maxProperties: integer("max_properties").notNull().default(1),
  hasSos: boolean("has_sos").notNull().default(false),
  hasDoorbell: boolean("has_doorbell").notNull().default(false),
  hasCctv: boolean("has_cctv").notNull().default(false),
  hasAiInterior: boolean("has_ai_interior").notNull().default(false),
  features: jsonb("features").$type<string[]>().default([]),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ═══════════════════════════════════════════════════════════════════════════════
// USER SUBSCRIPTIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const subscriptions = pgTable("subscriptions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  planId: text("plan_id")
    .notNull()
    .references(() => plans.id),
  // Razorpay integration
  razorpayCustomerId: text("razorpay_customer_id"),
  razorpaySubscriptionId: text("razorpay_subscription_id"),
  status: text("status").notNull().default("active"), // active, cancelled, past_due, trialing, expired
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  servicesUsedThisMonth: integer("services_used_this_month")
    .notNull()
    .default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ═══════════════════════════════════════════════════════════════════════════════
// PROPERTIES
// ═══════════════════════════════════════════════════════════════════════════════

export const properties = pgTable("properties", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // "My Apartment", "Parents' House"
  type: propertyTypeEnum("type").notNull(),
  addressLine1: text("address_line_1").notNull(),
  addressLine2: text("address_line_2"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  pincode: text("pincode").notNull(),
  yearBuilt: integer("year_built"),
  // Area can be in sqft, gaz, or BHK
  areaValue: real("area_value"), // numeric value (e.g., 1200, 3)
  areaMeasurement: areaMeasurementEnum("area_measurement"), // sqft, gaz, bhk
  totalRooms: integer("total_rooms"),
  totalBathrooms: integer("total_bathrooms"),
  totalFloors: integer("total_floors"),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ═══════════════════════════════════════════════════════════════════════════════
// SERVICE CATALOG
// ═══════════════════════════════════════════════════════════════════════════════

export const services = pgTable("services", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: serviceCategoryEnum("category").notNull(),
  frequency: serviceFrequencyEnum("frequency").notNull(),
  materialPolicy: materialPolicyEnum("material_policy").notNull(),
  basePricePaise: integer("base_price_paise").notNull(), // Labour charge in paise
  durationMinutes: integer("duration_minutes").notNull(),
  iconKey: text("icon_key"), // Phosphor icon identifier
  // What's included / excluded
  inclusions: jsonb("inclusions").$type<string[]>().default([]),
  exclusions: jsonb("exclusions").$type<string[]>().default([]),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ═══════════════════════════════════════════════════════════════════════════════
// TECHNICIANS (NEW)
// Service providers who perform inspections
// ═══════════════════════════════════════════════════════════════════════════════

export const technicians = pgTable("technicians", {
  id: text("id").primaryKey(),

  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),

  // Specialization
  domain: technicianDomainEnum("domain").notNull(),
  experienceYears: text("experience_years").notNull(), // "1-3", "5-10", etc.

  // Location
  city: text("city").notNull(),
  pincode: text("pincode").notNull(),

  // Employee ID (generated after verification)
  employeeId: text("employee_id").unique(),

  // Status
  isActive: boolean("is_active").notNull().default(false),
  isVerified: boolean("is_verified").notNull().default(false),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ═══════════════════════════════════════════════════════════════════════════════
// BOOKINGS
// ═══════════════════════════════════════════════════════════════════════════════

export const bookings = pgTable("bookings", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  propertyId: text("property_id")
    .notNull()
    .references(() => properties.id, { onDelete: "cascade" }),
  serviceId: text("service_id")
    .notNull()
    .references(() => services.id),
  status: bookingStatusEnum("status").notNull().default("pending"),
  scheduledDate: timestamp("scheduled_date").notNull(),
  scheduledSlot: text("scheduled_slot").notNull(), // "09:00-11:00"
  notes: text("notes"), // User notes
  providerNotes: text("provider_notes"), // Technician notes
  totalPricePaise: integer("total_price_paise").notNull(),
  materialCostPaise: integer("material_cost_paise").default(0), // User-borne material cost
  // Track if this booking counts toward due date
  isEarlyService: boolean("is_early_service").notNull().default(false),
  completedAt: timestamp("completed_at"),
  // Technician who performed service (NEW - can now link to technicians table)
  assignedTechnicianId: text("assigned_technician_id").references(
    () => technicians.id,
  ),
  technicianName: text("technician_name"),
  technicianPhone: text("technician_phone"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ═══════════════════════════════════════════════════════════════════════════════
// SERVICE DUE TRACKER
// Tracks when each service is next due for a property
// "If user takes any service early, that service due will complete"
// ═══════════════════════════════════════════════════════════════════════════════

export const serviceDues = pgTable("service_dues", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  propertyId: text("property_id")
    .notNull()
    .references(() => properties.id, { onDelete: "cascade" }),
  serviceId: text("service_id")
    .notNull()
    .references(() => services.id),
  lastServiceDate: timestamp("last_service_date"),
  nextDueDate: timestamp("next_due_date").notNull(),
  isOverdue: boolean("is_overdue").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ═══════════════════════════════════════════════════════════════════════════════
// INSPECTION REPORTS (UPDATED - now links to technicians)
// Each technician visit generates an inspection entry
// Health report is generated from minimum 3 months of inspections
// ═══════════════════════════════════════════════════════════════════════════════

export const inspectionReports = pgTable("inspection_reports", {
  id: text("id").primaryKey(),

  bookingId: text("booking_id")
    .notNull()
    .references(() => bookings.id, { onDelete: "cascade" }),

  propertyId: text("property_id")
    .notNull()
    .references(() => properties.id, { onDelete: "cascade" }),

  // Link to technician who did inspection (NEW)
  technicianId: text("technician_id").references(() => technicians.id),

  inspectedBy: text("inspected_by").notNull(), // Technician name
  inspectionDate: timestamp("inspection_date").notNull(),

  // Category-wise scores (0-100) - NEW individual fields
  plumbingScore: integer("plumbing_score"),
  electricalScore: integer("electrical_score"),
  structuralScore: integer("structural_score"),
  pestControlScore: integer("pest_control_score"),
  paintSealantScore: integer("paint_sealant_score"),
  overallScore: integer("overall_score"),

  // Issues found per category - NEW individual arrays
  plumbingIssues: jsonb("plumbing_issues").$type<string[]>(),
  electricalIssues: jsonb("electrical_issues").$type<string[]>(),
  structuralIssues: jsonb("structural_issues").$type<string[]>(),
  pestIssues: jsonb("pest_issues").$type<string[]>(),
  paintIssues: jsonb("paint_issues").$type<string[]>(),

  // Category-wise inspection scores (OLD FORMAT - keep for compatibility)
  categoryScores:
    jsonb("category_scores").$type<
      Record<string, { score: number; notes: string; issues: string[] }>
    >(),

  overallCondition: text("overall_condition"), // "good", "fair", "poor", "critical"
  photos: jsonb("photos").$type<string[]>().default([]), // R2 URLs
  remarks: text("remarks"),

  // Technician notes (NEW)
  technicianNotes: text("technician_notes"),

  // AI-processed data (NEW)
  aiSummary: text("ai_summary"),
  riskFlags: jsonb("risk_flags").$type<any[]>(),
  recommendations: jsonb("recommendations").$type<any[]>(),

  // Only admin can create/view this
  isAdminOnly: boolean("is_admin_only").notNull().default(true),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ═══════════════════════════════════════════════════════════════════════════════
// HOME HEALTH REPORTS (AI-generated, user-facing)
// Generated from minimum 3 months of inspection reports
// ═══════════════════════════════════════════════════════════════════════════════

export const healthReports = pgTable("health_reports", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  propertyId: text("property_id")
    .notNull()
    .references(() => properties.id, { onDelete: "cascade" }),
  status: reportStatusEnum("status").notNull().default("generating"),
  overallScore: integer("overall_score"), // 0–100
  categoryScores:
    jsonb("category_scores").$type<
      Record<
        string,
        {
          score: number;
          label: string;
          trend: "up" | "down" | "stable";
          issues: string[];
        }
      >
    >(),
  riskFlags:
    jsonb("risk_flags").$type<
      {
        severity: "low" | "medium" | "high" | "critical";
        title: string;
        description: string;
      }[]
    >(),
  recommendations:
    jsonb("recommendations").$type<
      {
        priority: number;
        title: string;
        description: string;
        estimatedCost: string;
        category: string;
      }[]
    >(),
  summary: text("summary"), // AI-generated narrative
  // Which inspection reports were used to generate this
  inspectionReportIds: jsonb("inspection_report_ids")
    .$type<string[]>()
    .default([]),
  reportPeriodStart: timestamp("report_period_start").notNull(),
  reportPeriodEnd: timestamp("report_period_end").notNull(),
  generatedAt: timestamp("generated_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ═══════════════════════════════════════════════════════════════════════════════
// TECHNICIAN eKYC (NEW)
// KYC verification documents and status
// ═══════════════════════════════════════════════════════════════════════════════

export const technicianKyc = pgTable("technician_kyc", {
  id: text("id").primaryKey(),

  technicianId: text("technician_id")
    .notNull()
    .references(() => technicianAccounts.id, { onDelete: "cascade" })
    .unique(),

  // Personal details
  fullName: text("full_name").notNull(),
  fatherName: text("father_name"),
  dateOfBirth: text("date_of_birth"),
  address: text("address"),

  // Aadhaar
  aadhaarNumber: text("aadhaar_number"),
  aadhaarFrontUrl: text("aadhaar_front_url"),
  aadhaarBackUrl: text("aadhaar_back_url"),
  isAadhaarVerified: boolean("is_aadhaar_verified").notNull().default(false),

  // PAN
  panNumber: text("pan_number"),
  panCardUrl: text("pan_card_url"),
  isPanVerified: boolean("is_pan_verified").notNull().default(false),

  // Photo
  photoUrl: text("photo_url"),

  // Address proof
  addressProofUrl: text("address_proof_url"),

  // Police verification
  policeClearanceUrl: text("police_clearance_url"),
  isPoliceVerified: boolean("is_police_verified").notNull().default(false),

  // Overall status
  status: kycStatusEnum("status").notNull().default("not_submitted"),

  // Admin review
  reviewedBy: text("reviewed_by"), // Admin user ID
  reviewedAt: timestamp("reviewed_at"),
  rejectionReason: text("rejection_reason"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ═══════════════════════════════════════════════════════════════════════════════
// TECHNICIAN AVAILABILITY (NEW)
// Working days and hours
// ═══════════════════════════════════════════════════════════════════════════════

export const technicianAvailability = pgTable("technician_availability", {
  id: text("id").primaryKey(),

  technicianId: text("technician_id")
    .notNull()
    .references(() => technicianAccounts.id, { onDelete: "cascade" })
    .unique(),

  // Working days
  workMonday: boolean("work_monday").notNull().default(true),
  workTuesday: boolean("work_tuesday").notNull().default(true),
  workWednesday: boolean("work_wednesday").notNull().default(true),
  workThursday: boolean("work_thursday").notNull().default(true),
  workFriday: boolean("work_friday").notNull().default(true),
  workSaturday: boolean("work_saturday").notNull().default(true),
  workSunday: boolean("work_sunday").notNull().default(false),

  // Working hours
  startTime: text("start_time").notNull().default("09:00"),
  endTime: text("end_time").notNull().default("18:00"),

  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ═══════════════════════════════════════════════════════════════════════════════
// PASSWORD RESET OTPs (NEW - for auth flow)
// ═══════════════════════════════════════════════════════════════════════════════

export const passwordResetOtps = pgTable("password_reset_otps", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  otpCode: text("otp_code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  isUsed: boolean("is_used").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ═══════════════════════════════════════════════════════════════════════════════
// PAYMENTS (Razorpay)
// ═══════════════════════════════════════════════════════════════════════════════

export const payments = pgTable("payments", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  subscriptionId: text("subscription_id").references(() => subscriptions.id),
  bookingId: text("booking_id").references(() => bookings.id),
  // Razorpay fields
  razorpayOrderId: text("razorpay_order_id"),
  razorpayPaymentId: text("razorpay_payment_id"),
  razorpaySignature: text("razorpay_signature"),
  amountPaise: integer("amount_paise").notNull(),
  currency: text("currency").notNull().default("INR"),
  status: paymentStatusEnum("status").notNull().default("created"),
  method: text("method"), // "upi", "card", "netbanking", "wallet"
  description: text("description"),
  receiptUrl: text("receipt_url"),
  failureReason: text("failure_reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ═══════════════════════════════════════════════════════════════════════════════
// SOS EMERGENCY
// Press button for 3 seconds in mobile app → triggers emergency
// ═══════════════════════════════════════════════════════════════════════════════

export const sosAlerts = pgTable("sos_alerts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  propertyId: text("property_id").references(() => properties.id),
  category: sosCategoryEnum("category").notNull(),
  status: sosStatusEnum("status").notNull().default("triggered"),
  description: text("description"),
  // Location at time of SOS
  latitude: real("latitude"),
  longitude: real("longitude"),
  // Response tracking
  acknowledgedAt: timestamp("acknowledged_at"),
  acknowledgedBy: text("acknowledged_by"), // Admin/responder name
  dispatchedAt: timestamp("dispatched_at"),
  resolvedAt: timestamp("resolved_at"),
  resolutionNotes: text("resolution_notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ═══════════════════════════════════════════════════════════════════════════════
// SMART DOORBELL
// Shows ads 24/7, tracks power status, visitor detection
// ═══════════════════════════════════════════════════════════════════════════════

export const doorbells = pgTable("doorbells", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  propertyId: text("property_id")
    .notNull()
    .references(() => properties.id, { onDelete: "cascade" }),
  deviceId: text("device_id").notNull().unique(), // Hardware device identifier
  status: doorbellStatusEnum("status").notNull().default("online"),
  lastOnlineAt: timestamp("last_online_at"),
  lastOfflineAt: timestamp("last_offline_at"),
  offlineReason: text("offline_reason"), // "user_powered_off" | "network_error" | "unknown"
  // Blinkit-like quick commerce integration
  blinkitEnabled: boolean("blinkit_enabled").notNull().default(false),
  installedAt: timestamp("installed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Doorbell ring events — "someone is at the door"
export const doorbellEvents = pgTable("doorbell_events", {
  id: text("id").primaryKey(),
  doorbellId: text("doorbell_id")
    .notNull()
    .references(() => doorbells.id, { onDelete: "cascade" }),
  eventType: text("event_type").notNull(), // "ring", "motion", "person_detected"
  snapshotUrl: text("snapshot_url"), // R2 URL of snapshot
  videoClipUrl: text("video_clip_url"), // R2 URL of short clip
  personDetected: boolean("person_detected").notNull().default(false),
  answeredByUser: boolean("answered_by_user").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ═══════════════════════════════════════════════════════════════════════════════
// DOORBELL ADVERTISEMENTS
// Horizontal and vertical bar ads shown 24/7 on doorbell screen
// Only from companies who pay for advertising
// ═══════════════════════════════════════════════════════════════════════════════

export const advertisers = pgTable("advertisers", {
  id: text("id").primaryKey(),
  companyName: text("company_name").notNull(),
  contactName: text("contact_name").notNull(),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone"),
  logoUrl: text("logo_url"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const advertisements = pgTable("advertisements", {
  id: text("id").primaryKey(),
  advertiserId: text("advertiser_id")
    .notNull()
    .references(() => advertisers.id, { onDelete: "cascade" }),
  title: text("title").notNull(), // Headline text
  subtitle: text("subtitle"),
  imageUrl: text("image_url"), // Banner image URL
  linkUrl: text("link_url"), // Click-through URL
  placement: text("placement").notNull(), // "horizontal_bar" | "vertical_bar"
  // Scheduling
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  // Targeting
  targetCities: jsonb("target_cities").$type<string[]>().default([]),
  targetPincodes: jsonb("target_pincodes").$type<string[]>().default([]),
  // Pricing
  dailyRatePaise: integer("daily_rate_paise").notNull(),
  totalPaidPaise: integer("total_paid_paise").notNull().default(0),
  // Stats
  impressionCount: integer("impression_count").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ═══════════════════════════════════════════════════════════════════════════════
// CCTV
// On-demand install, no labour charge, user pays material
// ═══════════════════════════════════════════════════════════════════════════════

export const cctvInstallations = pgTable("cctv_installations", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  propertyId: text("property_id")
    .notNull()
    .references(() => properties.id, { onDelete: "cascade" }),
  cameraCount: integer("camera_count").notNull(),
  locations: jsonb("locations").$type<string[]>().default([]), // "main_gate", "parking", "backyard"
  materialCostPaise: integer("material_cost_paise").notNull(), // User pays this
  labourCostPaise: integer("labour_cost_paise").notNull().default(0), // Free
  isActive: boolean("is_active").notNull().default(true),
  installedAt: timestamp("installed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ═══════════════════════════════════════════════════════════════════════════════
// AI INTERIOR DESIGN
// ═══════════════════════════════════════════════════════════════════════════════

export const interiorDesignRequests = pgTable("interior_design_requests", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  propertyId: text("property_id")
    .notNull()
    .references(() => properties.id, { onDelete: "cascade" }),
  roomType: text("room_type").notNull(), // "bedroom", "living_room", "kitchen", etc.
  style: text("style"), // "modern", "traditional", "minimalist", etc.
  budget: text("budget"), // "low", "medium", "high"
  currentPhotos: jsonb("current_photos").$type<string[]>().default([]),
  generatedDesigns: jsonb("generated_designs")
    .$type<{ imageUrl: string; description: string; estimatedCost: string }[]>()
    .default([]),
  userPrompt: text("user_prompt"), // Free-form description
  status: text("status").notNull().default("pending"), // pending, generating, ready, failed
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ═══════════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS
// App, Email, SMS — for service due, package expiry, reports, etc.
// ═══════════════════════════════════════════════════════════════════════════════

export const notifications = pgTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: notificationTypeEnum("type").notNull(),
  channel: notificationChannelEnum("channel").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  // Link to related entity
  relatedEntityType: text("related_entity_type"), // "booking", "report", "subscription", "sos"
  relatedEntityId: text("related_entity_id"),
  isRead: boolean("is_read").notNull().default(false),
  sentAt: timestamp("sent_at"),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
