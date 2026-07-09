/**
 * VELTRA — API Validation Schemas (Zod)
 * Every API endpoint must validate input against these schemas.
 * Never trust the client.
 */

import { z } from "zod";

// ===== Auth =====
export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  clinicName: z.string().min(2),
  tier: z.enum(["platform", "enterprise"]).default("platform"),
});

// ===== Patients =====
export const createPatientSchema = z.object({
  name: z.string().min(2, "Name required"),
  age: z.number().int().min(0).max(150).optional(),
  gender: z.enum(["M", "F"]).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  conditions: z.array(z.string()).default([]),
  medications: z.array(z.string()).default([]),
  allergies: z.array(z.string()).default([]),
  preferredChannel: z.enum(["whatsapp", "call", "sms", "in-person"]).default("whatsapp"),
});

export const updatePatientSchema = createPatientSchema.partial();

// ===== Appointments =====
export const createAppointmentSchema = z.object({
  patientId: z.string().min(1),
  doctorId: z.string().optional(),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Time must be HH:MM"),
  date: z.string().datetime(),
  duration: z.number().int().min(15).max(480).default(30),
  type: z.string().min(1),
  notes: z.string().optional(),
});

export const updateAppointmentStatusSchema = z.object({
  status: z.enum(["scheduled", "confirmed", "checked-in", "in-room", "completed", "no-show", "cancelled"]),
});

// ===== Intake (Dr. Balu's feature) =====
export const intakeSchema = z.object({
  // Demographics
  name: z.string().min(2),
  age: z.string().optional(),
  gender: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  // Symptoms
  chiefComplaint: z.string().optional(),
  duration: z.string().optional(),
  severity: z.number().int().min(1).max(10).optional(),
  previousTreatment: z.string().optional(),
  // History
  conditions: z.array(z.string()).default([]),
  medications: z.array(z.string()).default([]),
  allergies: z.array(z.string()).default([]),
  familyHistory: z.string().optional(),
  // Lifestyle (phone data)
  sleepHours: z.string().optional(),
  exerciseFreq: z.string().optional(),
  diet: z.string().optional(),
  smoking: z.string().optional(),
  alcohol: z.string().optional(),
  stressLevel: z.number().int().min(1).max(10).optional(),
  // Voice
  voiceTranscript: z.string().optional(),
  voiceDuration: z.number().int().min(0).optional(),
  // Consent
  consent: z.boolean().default(false),
});

// ===== Voice Notes (24/7 patient communication) =====
export const voiceNoteSchema = z.object({
  patientId: z.string().min(1),
  durationSec: z.number().int().min(1).max(3600),
  transcript: z.string().min(1),
  audioUrl: z.string().url().optional(),
});

// ===== WhatsApp =====
export const sendWhatsAppSchema = z.object({
  patientId: z.string().min(1),
  message: z.string().min(1).max(4096), // WhatsApp limit
});

// ===== Billing (Stripe) =====
export const createCheckoutSchema = z.object({
  tier: z.enum(["platform", "enterprise"]),
  billing: z.enum(["monthly", "annual", "3year"]),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

// ===== Pagination =====
export const paginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20),
});

// ===== Helpers =====
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type CreatePatientInput = z.infer<typeof createPatientSchema>;
export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type IntakeInput = z.infer<typeof intakeSchema>;
export type VoiceNoteInput = z.infer<typeof voiceNoteSchema>;
export type SendWhatsAppInput = z.infer<typeof sendWhatsAppSchema>;
export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>;
