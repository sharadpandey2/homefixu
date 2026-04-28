CREATE TYPE "public"."user_role" AS ENUM('customer', 'technician', 'admin');--> statement-breakpoint
CREATE TYPE "public"."area_measurement" AS ENUM('sqft', 'gaz', 'bhk');--> statement-breakpoint
CREATE TYPE "public"."booking_status" AS ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."doorbell_status" AS ENUM('online', 'offline_user', 'offline_error');--> statement-breakpoint
CREATE TYPE "public"."kyc_status" AS ENUM('not_submitted', 'under_review', 'verified', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."material_policy" AS ENUM('labour_only', 'all_inclusive', 'no_charge', 'material_on_user');--> statement-breakpoint
CREATE TYPE "public"."notification_channel" AS ENUM('app', 'email', 'sms');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('service_due', 'service_completed', 'package_expiry', 'health_report_ready', 'sos_update', 'payment', 'general');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('created', 'authorized', 'captured', 'refunded', 'failed');--> statement-breakpoint
CREATE TYPE "public"."plan_tier" AS ENUM('starter', 'pro', 'elite');--> statement-breakpoint
CREATE TYPE "public"."property_type" AS ENUM('apartment', 'independent_house', 'villa', 'row_house', 'penthouse');--> statement-breakpoint
CREATE TYPE "public"."report_frequency" AS ENUM('quarterly', 'monthly', 'weekly');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('generating', 'ready', 'failed');--> statement-breakpoint
CREATE TYPE "public"."service_category" AS ENUM('plumbing', 'electrical', 'pest_control', 'paint_and_sealant', 'doorbell', 'cctv', 'tank_cleaning', 'interior_design', 'general');--> statement-breakpoint
CREATE TYPE "public"."service_frequency" AS ENUM('monthly', 'quarterly', 'biannual', 'annual', 'on_demand');--> statement-breakpoint
CREATE TYPE "public"."sos_category" AS ENUM('health_emergency', 'plumbing_emergency', 'electrical_emergency', 'security_emergency', 'fire_emergency', 'other');--> statement-breakpoint
CREATE TYPE "public"."sos_status" AS ENUM('triggered', 'acknowledged', 'dispatched', 'resolved', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."technician_domain" AS ENUM('plumbing', 'electrical', 'pest_control', 'hvac', 'structural', 'painting', 'waterproofing', 'appliance');--> statement-breakpoint
CREATE TYPE "public"."technician_role" AS ENUM('plumbing', 'electrical', 'pest_control', 'hvac', 'structural', 'painting', 'waterproofing', 'appliance');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"phone" text,
	"role" "user_role" DEFAULT 'customer' NOT NULL,
	"banned" boolean DEFAULT false NOT NULL,
	"ban_reason" text,
	"ban_expires" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "advertisements" (
	"id" text PRIMARY KEY NOT NULL,
	"advertiser_id" text NOT NULL,
	"title" text NOT NULL,
	"subtitle" text,
	"image_url" text,
	"link_url" text,
	"placement" text NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"target_cities" jsonb DEFAULT '[]'::jsonb,
	"target_pincodes" jsonb DEFAULT '[]'::jsonb,
	"daily_rate_paise" integer NOT NULL,
	"total_paid_paise" integer DEFAULT 0 NOT NULL,
	"impression_count" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "advertisers" (
	"id" text PRIMARY KEY NOT NULL,
	"company_name" text NOT NULL,
	"contact_name" text NOT NULL,
	"contact_email" text NOT NULL,
	"contact_phone" text,
	"logo_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"property_id" text NOT NULL,
	"service_id" text NOT NULL,
	"status" "booking_status" DEFAULT 'pending' NOT NULL,
	"scheduled_date" timestamp NOT NULL,
	"scheduled_slot" text NOT NULL,
	"notes" text,
	"provider_notes" text,
	"total_price_paise" integer NOT NULL,
	"material_cost_paise" integer DEFAULT 0,
	"is_early_service" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp,
	"assigned_technician_id" text,
	"technician_name" text,
	"technician_phone" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cctv_installations" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"property_id" text NOT NULL,
	"camera_count" integer NOT NULL,
	"locations" jsonb DEFAULT '[]'::jsonb,
	"material_cost_paise" integer NOT NULL,
	"labour_cost_paise" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"installed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "doorbell_events" (
	"id" text PRIMARY KEY NOT NULL,
	"doorbell_id" text NOT NULL,
	"event_type" text NOT NULL,
	"snapshot_url" text,
	"video_clip_url" text,
	"person_detected" boolean DEFAULT false NOT NULL,
	"answered_by_user" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "doorbells" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"property_id" text NOT NULL,
	"device_id" text NOT NULL,
	"status" "doorbell_status" DEFAULT 'online' NOT NULL,
	"last_online_at" timestamp,
	"last_offline_at" timestamp,
	"offline_reason" text,
	"blinkit_enabled" boolean DEFAULT false NOT NULL,
	"installed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "doorbells_device_id_unique" UNIQUE("device_id")
);
--> statement-breakpoint
CREATE TABLE "health_reports" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"property_id" text NOT NULL,
	"status" "report_status" DEFAULT 'generating' NOT NULL,
	"overall_score" integer,
	"category_scores" jsonb,
	"risk_flags" jsonb,
	"recommendations" jsonb,
	"summary" text,
	"inspection_report_ids" jsonb DEFAULT '[]'::jsonb,
	"report_period_start" timestamp NOT NULL,
	"report_period_end" timestamp NOT NULL,
	"generated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inspection_reports" (
	"id" text PRIMARY KEY NOT NULL,
	"booking_id" text NOT NULL,
	"property_id" text NOT NULL,
	"technician_id" text,
	"inspected_by" text NOT NULL,
	"inspection_date" timestamp NOT NULL,
	"plumbing_score" integer,
	"electrical_score" integer,
	"structural_score" integer,
	"pest_control_score" integer,
	"paint_sealant_score" integer,
	"overall_score" integer,
	"plumbing_issues" jsonb,
	"electrical_issues" jsonb,
	"structural_issues" jsonb,
	"pest_issues" jsonb,
	"paint_issues" jsonb,
	"category_scores" jsonb,
	"overall_condition" text,
	"photos" jsonb DEFAULT '[]'::jsonb,
	"remarks" text,
	"technician_notes" text,
	"ai_summary" text,
	"risk_flags" jsonb,
	"recommendations" jsonb,
	"is_admin_only" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interior_design_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"property_id" text NOT NULL,
	"room_type" text NOT NULL,
	"style" text,
	"budget" text,
	"current_photos" jsonb DEFAULT '[]'::jsonb,
	"generated_designs" jsonb DEFAULT '[]'::jsonb,
	"user_prompt" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" "notification_type" NOT NULL,
	"channel" "notification_channel" NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"related_entity_type" text,
	"related_entity_id" text,
	"is_read" boolean DEFAULT false NOT NULL,
	"sent_at" timestamp,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_reset_otps" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"otp_code" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"is_used" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"subscription_id" text,
	"booking_id" text,
	"razorpay_order_id" text,
	"razorpay_payment_id" text,
	"razorpay_signature" text,
	"amount_paise" integer NOT NULL,
	"currency" text DEFAULT 'INR' NOT NULL,
	"status" "payment_status" DEFAULT 'created' NOT NULL,
	"method" text,
	"description" text,
	"receipt_url" text,
	"failure_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"tier" "plan_tier" NOT NULL,
	"price_monthly_paise" integer NOT NULL,
	"price_yearly_paise" integer,
	"services_per_month" integer NOT NULL,
	"report_frequency" "report_frequency" NOT NULL,
	"max_properties" integer DEFAULT 1 NOT NULL,
	"has_sos" boolean DEFAULT false NOT NULL,
	"has_doorbell" boolean DEFAULT false NOT NULL,
	"has_cctv" boolean DEFAULT false NOT NULL,
	"has_ai_interior" boolean DEFAULT false NOT NULL,
	"features" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "plans_tier_unique" UNIQUE("tier")
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"type" "property_type" NOT NULL,
	"address_line_1" text NOT NULL,
	"address_line_2" text,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"pincode" text NOT NULL,
	"year_built" integer,
	"area_value" real,
	"area_measurement" "area_measurement",
	"total_rooms" integer,
	"total_bathrooms" integer,
	"total_floors" integer,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_dues" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"property_id" text NOT NULL,
	"service_id" text NOT NULL,
	"last_service_date" timestamp,
	"next_due_date" timestamp NOT NULL,
	"is_overdue" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"category" "service_category" NOT NULL,
	"frequency" "service_frequency" NOT NULL,
	"material_policy" "material_policy" NOT NULL,
	"base_price_paise" integer NOT NULL,
	"duration_minutes" integer NOT NULL,
	"icon_key" text,
	"inclusions" jsonb DEFAULT '[]'::jsonb,
	"exclusions" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sos_alerts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"property_id" text,
	"category" "sos_category" NOT NULL,
	"status" "sos_status" DEFAULT 'triggered' NOT NULL,
	"description" text,
	"latitude" real,
	"longitude" real,
	"acknowledged_at" timestamp,
	"acknowledged_by" text,
	"dispatched_at" timestamp,
	"resolved_at" timestamp,
	"resolution_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"plan_id" text NOT NULL,
	"razorpay_customer_id" text,
	"razorpay_subscription_id" text,
	"status" text DEFAULT 'active' NOT NULL,
	"current_period_start" timestamp NOT NULL,
	"current_period_end" timestamp NOT NULL,
	"services_used_this_month" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "technician_accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"employee_id" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"full_name" text NOT NULL,
	"phone" text NOT NULL,
	"role" "technician_role" NOT NULL,
	"experience_years" text NOT NULL,
	"city" text NOT NULL,
	"pincode" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"approval_status" text DEFAULT 'pending' NOT NULL,
	"rejection_reason" text,
	"last_login_at" timestamp,
	"password_updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "technician_accounts_employee_id_unique" UNIQUE("employee_id"),
	CONSTRAINT "technician_accounts_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "technician_availability" (
	"id" text PRIMARY KEY NOT NULL,
	"technician_id" text NOT NULL,
	"work_monday" boolean DEFAULT true NOT NULL,
	"work_tuesday" boolean DEFAULT true NOT NULL,
	"work_wednesday" boolean DEFAULT true NOT NULL,
	"work_thursday" boolean DEFAULT true NOT NULL,
	"work_friday" boolean DEFAULT true NOT NULL,
	"work_saturday" boolean DEFAULT true NOT NULL,
	"work_sunday" boolean DEFAULT false NOT NULL,
	"start_time" text DEFAULT '09:00' NOT NULL,
	"end_time" text DEFAULT '18:00' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "technician_availability_technician_id_unique" UNIQUE("technician_id")
);
--> statement-breakpoint
CREATE TABLE "technician_kyc" (
	"id" text PRIMARY KEY NOT NULL,
	"technician_id" text NOT NULL,
	"full_name" text NOT NULL,
	"father_name" text,
	"date_of_birth" text,
	"address" text,
	"aadhaar_number" text,
	"aadhaar_front_url" text,
	"aadhaar_back_url" text,
	"is_aadhaar_verified" boolean DEFAULT false NOT NULL,
	"pan_number" text,
	"pan_card_url" text,
	"is_pan_verified" boolean DEFAULT false NOT NULL,
	"photo_url" text,
	"address_proof_url" text,
	"police_clearance_url" text,
	"is_police_verified" boolean DEFAULT false NOT NULL,
	"status" "kyc_status" DEFAULT 'not_submitted' NOT NULL,
	"reviewed_by" text,
	"reviewed_at" timestamp,
	"rejection_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "technician_kyc_technician_id_unique" UNIQUE("technician_id")
);
--> statement-breakpoint
CREATE TABLE "technicians" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"domain" "technician_domain" NOT NULL,
	"experience_years" text NOT NULL,
	"city" text NOT NULL,
	"pincode" text NOT NULL,
	"employee_id" text,
	"is_active" boolean DEFAULT false NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "technicians_employee_id_unique" UNIQUE("employee_id")
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "advertisements" ADD CONSTRAINT "advertisements_advertiser_id_advertisers_id_fk" FOREIGN KEY ("advertiser_id") REFERENCES "public"."advertisers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_assigned_technician_id_technicians_id_fk" FOREIGN KEY ("assigned_technician_id") REFERENCES "public"."technicians"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cctv_installations" ADD CONSTRAINT "cctv_installations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cctv_installations" ADD CONSTRAINT "cctv_installations_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doorbell_events" ADD CONSTRAINT "doorbell_events_doorbell_id_doorbells_id_fk" FOREIGN KEY ("doorbell_id") REFERENCES "public"."doorbells"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doorbells" ADD CONSTRAINT "doorbells_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doorbells" ADD CONSTRAINT "doorbells_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "health_reports" ADD CONSTRAINT "health_reports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "health_reports" ADD CONSTRAINT "health_reports_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspection_reports" ADD CONSTRAINT "inspection_reports_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspection_reports" ADD CONSTRAINT "inspection_reports_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspection_reports" ADD CONSTRAINT "inspection_reports_technician_id_technicians_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."technicians"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interior_design_requests" ADD CONSTRAINT "interior_design_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interior_design_requests" ADD CONSTRAINT "interior_design_requests_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_dues" ADD CONSTRAINT "service_dues_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_dues" ADD CONSTRAINT "service_dues_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_dues" ADD CONSTRAINT "service_dues_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sos_alerts" ADD CONSTRAINT "sos_alerts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sos_alerts" ADD CONSTRAINT "sos_alerts_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technician_availability" ADD CONSTRAINT "technician_availability_technician_id_technicians_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."technicians"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technician_kyc" ADD CONSTRAINT "technician_kyc_technician_id_technicians_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."technicians"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technicians" ADD CONSTRAINT "technicians_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;