/**
 * VELTRA — Data Access Layer
 *
 * This module bridges the Zustand store (in-memory demo state) with the Prisma
 * database (real persistence). It provides functions that:
 *   1. Read from the database (replacing hardcoded seed data)
 *   2. Write to the database (replacing in-memory mutations)
 *   3. Sync changes back to the Zustand store for instant UI updates
 *
 * Architecture:
 *   ┌─────────────┐     ┌──────────────┐     ┌──────────────┐
 *   │  React UI   │ ←→  │ Zustand Store │ ←→  │ Prisma (DB)  │
 *   └─────────────┘     └──────────────┘     └──────────────┘
 *                             ↕
 *                        Data Access Layer
 *                        (this file)
 *
 * In production: every write goes through here → persists to DB → updates store.
 * In demo mode: writes stay in-memory (Zustand only) — no DB required.
 *
 * Usage:
 *   import { dataAccess } from "@/lib/data-access";
 *   await dataAccess.patients.create({ ... });
 *   await dataAccess.patients.list();
 */

import { db } from "./db";

/**
 * Check if we have a real database connection.
 * In demo mode (no DATABASE_URL or SQLite fallback), returns false.
 */
async function hasDatabase(): Promise<boolean> {
  try {
    if (!process.env.DATABASE_URL) return false;
    // Try a simple query — if it fails, we're in demo mode
    await db.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

export const dataAccess = {
  /**
   * Patients — CRUD operations
   */
  patients: {
    async list(tenantId: string) {
      if (!await hasDatabase()) return null;
      return db.patient.findMany({
        where: { tenantId },
        include: { timeline: true, flags: true },
        orderBy: { name: "asc" },
      });
    },

    async create(input: {
      tenantId: string;
      name: string;
      age: number;
      gender: "M" | "F";
      phone: string;
      conditions: string[];
      allergies?: string[];
      doctor: string;
    }) {
      if (!await hasDatabase()) return null;
      return db.patient.create({
        data: {
          ...input,
          // Initialize empty timeline
          timeline: { create: [] },
        },
        include: { timeline: true },
      });
    },

    async update(id: string, data: Record<string, unknown>) {
      if (!await hasDatabase()) return null;
      return db.patient.update({
        where: { id },
        data,
        include: { timeline: true, flags: true },
      });
    },

    async delete(id: string) {
      if (!await hasDatabase()) return null;
      return db.patient.delete({ where: { id } });
    },
  },

  /**
   * Users — CRUD operations
   */
  users: {
    async list(tenantId: string) {
      if (!await hasDatabase()) return null;
      return db.user.findMany({
        where: { tenantId },
        orderBy: { name: "asc" },
      });
    },

    async findByEmail(email: string) {
      if (!await hasDatabase()) return null;
      return db.user.findUnique({
        where: { email },
        include: { tenant: true },
      });
    },

    async create(input: {
      tenantId: string;
      name: string;
      email: string;
      passwordHash: string;
      role: string;
      title: string;
    }) {
      if (!await hasDatabase()) return null;
      return db.user.create({ data: input });
    },

    async updateStatus(id: string, status: "active" | "suspended" | "inactive") {
      if (!await hasDatabase()) return null;
      return db.user.update({ where: { id }, data: { status } });
    },

    async updateMfa(id: string, enabled: boolean) {
      if (!await hasDatabase()) return null;
      return db.user.update({ where: { id }, data: { mfaEnabled: enabled } });
    },
  },

  /**
   * Audit Log — append-only event log
   */
  auditLog: {
    async list(tenantId: string, limit = 100) {
      if (!await hasDatabase()) return null;
      return db.auditLog.findMany({
        where: { tenantId },
        orderBy: { timestamp: "desc" },
        take: limit,
      });
    },

    async create(input: {
      tenantId: string;
      userId: string;
      userName: string;
      userRole: string;
      action: string;
      target: string;
      category?: string;
      severity?: string;
    }) {
      if (!await hasDatabase()) return null;
      return db.auditLog.create({ data: input });
    },
  },

  /**
   * Appointments — CRUD
   */
  appointments: {
    async list(tenantId: string, date?: string) {
      if (!await hasDatabase()) return null;
      return db.appointment.findMany({
        where: { tenantId, ...(date ? { date } : {}) },
        orderBy: { time: "asc" },
      });
    },

    async create(input: {
      tenantId: string;
      patientId: string;
      patientName: string;
      doctor: string;
      time: string;
      date: string;
      duration: number;
      type: string;
      notes?: string;
    }) {
      if (!await hasDatabase()) return null;
      return db.appointment.create({ data: input });
    },

    async updateStatus(id: string, status: string) {
      if (!await hasDatabase()) return null;
      return db.appointment.update({ where: { id }, data: { status } });
    },
  },

  /**
   * Prescriptions — CRUD
   */
  prescriptions: {
    async listByPatient(patientId: string) {
      if (!await hasDatabase()) return null;
      return db.prescription.findMany({
        where: { patientId },
        orderBy: { timestamp: "desc" },
      });
    },

    async create(input: {
      tenantId: string;
      patientId: string;
      patientName: string;
      doctorId: string;
      doctorName: string;
      medication: string;
      dosage: string;
      frequency: string;
      duration: string;
      notes?: string;
    }) {
      if (!await hasDatabase()) return null;
      return db.prescription.create({ data: input });
    },
  },

  /**
   * Lab Results — CRUD
   */
  labResults: {
    async listByPatient(patientId: string) {
      if (!await hasDatabase()) return null;
      return db.labResult.findMany({
        where: { patientId },
        orderBy: { timestamp: "desc" },
      });
    },

    async create(input: {
      tenantId: string;
      patientId: string;
      patientName: string;
      testType: string;
      value: string;
      unit: string;
      normalRange: string;
      status: string;
      orderedBy: string;
      notes?: string;
    }) {
      if (!await hasDatabase()) return null;
      return db.labResult.create({ data: input });
    },
  },

  /**
   * Health check — is the database reachable?
   */
  async healthCheck(): Promise<boolean> {
    return hasDatabase();
  },
};

/**
 * Migration helper — seed the database from the Zustand store's initial data.
 * Run this once when setting up a new database.
 *
 * Usage (in a script):
 *   import { seedDatabase } from "@/lib/data-access";
 *   await seedDatabase();
 */
export async function seedDatabase(): Promise<{ success: boolean; error?: string }> {
  try {
    if (!await hasDatabase()) {
      return { success: false, error: "No database connection — running in demo mode" };
    }

    // Create default tenant
    const tenant = await db.tenant.upsert({
      where: { id: "default" },
      update: {},
      create: {
        id: "default",
        name: "Veltra Demo Clinic",
        tier: "PLATFORM",
      },
    });

    // Create default location
    await db.location.upsert({
      where: { id: "loc1" },
      update: {},
      create: {
        id: "loc1",
        tenantId: tenant.id,
        name: "Riyadh — Olaya",
        address: "Olaya St, Riyadh, Saudi Arabia",
        phone: "+966 11 200 3000",
        isPrimary: true,
      },
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
