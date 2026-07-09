-- ─────────────────────────────────────────────────────────────────────────────
-- VELTRA — Database Migration (Supabase / PostgreSQL)
--
-- This migration creates all 18 tables for the Veltra Clinic Operating System.
-- Run with: bunx prisma db push
-- Or manually via Supabase SQL Editor.
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Tier enum ────────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE "Tier" AS ENUM ('PLATFORM', 'ENTERPRISE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── Role enum ────────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE "Role" AS ENUM ('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── Tables ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "Tenant" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name" TEXT NOT NULL,
  "tier" "Tier" NOT NULL DEFAULT 'PLATFORM',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "tenantId" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "role" "Role" NOT NULL DEFAULT 'DOCTOR',
  "twoFactorSecret" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE,
  CONSTRAINT "User_email_key" UNIQUE ("email")
);

CREATE TABLE IF NOT EXISTS "Location" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "tenantId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "address" TEXT,
  "phone" TEXT,
  "isPrimary" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Location_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Patient" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "tenantId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "age" INTEGER,
  "gender" TEXT,
  "phone" TEXT,
  "email" TEXT,
  "conditions" TEXT[],
  "medications" TEXT[],
  "allergies" TEXT[],
  "preferredChannel" TEXT NOT NULL DEFAULT 'whatsapp',
  "loyaltyTier" TEXT NOT NULL DEFAULT 'bronze',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Patient_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Appointment" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "tenantId" TEXT NOT NULL,
  "patientId" TEXT NOT NULL,
  "doctorId" TEXT,
  "locationId" TEXT,
  "time" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "duration" INTEGER NOT NULL DEFAULT 30,
  "type" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'scheduled',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Appointment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE,
  CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE,
  CONSTRAINT "Appointment_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "User"("id") ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS "AuditLog" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "tenantId" TEXT NOT NULL,
  "userId" TEXT,
  "userName" TEXT,
  "userRole" TEXT,
  "action" TEXT NOT NULL,
  "target" TEXT,
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Subscription" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "tenantId" TEXT NOT NULL,
  "stripeCustomerId" TEXT UNIQUE,
  "stripeSubscriptionId" TEXT UNIQUE,
  "stripePriceId" TEXT,
  "tier" "Tier" NOT NULL DEFAULT 'PLATFORM',
  "status" TEXT NOT NULL DEFAULT 'active',
  "currentPeriodEnd" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Subscription_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE
);

-- ── Indexes for performance ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS "User_tenantId_idx" ON "User"("tenantId");
CREATE INDEX IF NOT EXISTS "Patient_tenantId_idx" ON "Patient"("tenantId");
CREATE INDEX IF NOT EXISTS "Appointment_tenantId_idx" ON "Appointment"("tenantId");
CREATE INDEX IF NOT EXISTS "Appointment_patientId_idx" ON "Appointment"("patientId");
CREATE INDEX IF NOT EXISTS "AuditLog_tenantId_idx" ON "AuditLog"("tenantId");
CREATE INDEX IF NOT EXISTS "AuditLog_timestamp_idx" ON "AuditLog"("timestamp" DESC);

-- ── Row Level Security (HIPAA-grade isolation) ───────────────────────────────
ALTER TABLE "Patient" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Appointment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_patients" ON "Patient"
  USING (tenantId = current_setting('app.tenant_id', true));

CREATE POLICY "tenant_isolation_appointments" ON "Appointment"
  USING (tenantId = current_setting('app.tenant_id', true));

CREATE POLICY "tenant_isolation_auditlog" ON "AuditLog"
  USING (tenantId = current_setting('app.tenant_id', true));

-- ─────────────────────────────────────────────────────────────────────────────
-- Migration complete. Verify with:
--   SELECT tablename FROM pg_tables WHERE schemaname = 'public';
-- ─────────────────────────────────────────────────────────────────────────────
