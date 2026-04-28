-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: add role + admin plugin fields to users, impersonatedBy to sessions
-- Run this AFTER generating Drizzle migration, or apply manually in order.
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Create the role enum (safe if exists)
DO $$ BEGIN
  CREATE TYPE "public"."user_role" AS ENUM ('customer', 'technician', 'admin');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2. Add role column to users (defaults all existing users to customer)
ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "role" "user_role" NOT NULL DEFAULT 'customer';

-- 3. Add ban fields for admin plugin
ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "banned" boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "ban_reason" text,
  ADD COLUMN IF NOT EXISTS "ban_expires" timestamp;

-- 4. Add impersonatedBy to sessions for admin plugin
ALTER TABLE "sessions"
  ADD COLUMN IF NOT EXISTS "impersonated_by" text;

-- 5. Index on role for fast filtering
CREATE INDEX IF NOT EXISTS "users_role_idx" ON "users" ("role");