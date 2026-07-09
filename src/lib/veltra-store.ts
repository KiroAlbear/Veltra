/**
 * Veltra Demo Store
 *
 * Single source of truth for the entire demo.
 * Every screen reads from this store. Every mutation flows through it.
 * That's how "add appointment → flows everywhere" actually works.
 *
 * Demo Reset = re-seed from INITIAL_DEMO_STATE.
 * Live Mode = same store, just labeled differently (the data is still demo data,
 *   but the user has "claimed" ownership of it during this session).
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { SPECIALTIES, type SpecialtyConfig, type SpecialtyId } from "./specialties";
import { TIERS as SUB_TIERS, type TierId, type TierConfig } from "./subscription-tiers";
import type { Language } from "./i18n";

// ===== Types =====
export type Priority = "high" | "medium" | "low";
export type Channel = "call" | "whatsapp" | "sms" | "in-person";
export type AppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "checked-in"
  | "in-room"
  | "completed"
  | "no-show"
  | "cancelled";

export type TimelineEventType =
  | "call"
  | "booking"
  | "reminder"
  | "check-in"
  | "diagnosis"
  | "lab"
  | "prescription"
  | "payment"
  | "follow-up"
  | "note";

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  timestamp: string; // ISO
  title: string;
  description?: string;
  actor: string; // "Veltra" | "Dr. Sarah" | "Reception" | patient name
  metadata?: Record<string, string>;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: "M" | "F";
  phone: string;
  conditions: string[]; // ["Diabetic", "Hypertension"]
  visitPattern: string; // "Usually visits every 90 days"
  lastVisit: string; // ISO date
  nextVisit?: string; // ISO date
  insurance: "verified" | "pending" | "none";
  balance: "paid" | "due" | "overdue";
  balanceAmount?: number;
  preferredChannel: Channel;
  doctor: string;
  riskScore: number; // 0-100, no-show risk
  avatarColor: string; // tailwind bg class
  timeline: TimelineEvent[];
  // 2030 fields
  loyaltyTier: "platinum" | "gold" | "silver" | "bronze";
  leadSource: "whatsapp" | "website" | "voice" | "google" | "meta" | "referral" | "walk-in";
  specialty: string;
  totalVisits: number;
  totalRevenue: number;
  tags: string[];
  allergies: string[]; // ["Penicillin", "Aspirin"] — CRITICAL for patient safety
  city: string;
  lastContactDays: number;
  status: "active" | "inactive" | "new";
  /**
   * Care Quality signals — operational flags, NOT personal ratings.
   * Set by doctor/staff during visits. Used for care coordination.
   */
  flags?: PatientFlag[];
  /**
   * Latest vital signs snapshot — used to compute Health Score.
   * Updated whenever nurse/doctor records new vitals.
   */
  latestVitals?: {
    bp_systolic?: number;
    bp_diastolic?: number;
    heartRate?: number;
    temperature?: number;
    bloodSugar?: number;
    oxygenLevel?: number;
    weight?: number;
    timestamp: string;
  };
}

/**
 * Operational flag on a patient — NOT a personal rating.
 * Used for care coordination (e.g. "needs translation", "high fall risk").
 */
export interface PatientFlag {
  id: string;
  category: "attendance" | "medication" | "communication" | "clinical" | "financial";
  value: string; // e.g. "frequently_late", "non_adherent", "needs_interpreter", "fall_risk", "outstanding_balance"
  label: string; // human-readable: "Frequently late", "Non-adherent to medication"
  severity: "info" | "warning" | "critical";
  setBy: string; // user ID
  setAt: string; // ISO timestamp
  notes?: string;
}

/**
 * Care Quality metrics — computed from visit data, NOT patient ratings.
 * Replaces the concept of "star ratings" with operational quality signals.
 * The doctor never sees a single number — they see a breakdown they can act on.
 */
export interface CareQualityScore {
  communication: number;       // 0-100 — from patient feedback ("Did the doctor explain clearly?")
  empathy: number;             // 0-100 — from patient feedback ("Did you feel respected?")
  clinicalCompliance: number;  // 0-100 — % of visits following clinical guidelines
  documentation: number;       // 0-100 — % of visits with complete SOAP notes
  waitingTime: number;         // 0-100 — inverse of average wait (lower wait = higher score)
  patientUnderstanding: number;// 0-100 — from patient feedback ("Do you understand the plan?")
  followUpCompletion: number;  // 0-100 — % of recommended follow-ups that happened
  prescriptionAccuracy: number;// 0-100 — % of prescriptions without interaction alerts
  overall: number;             // 0-100 — weighted average
  trend: "up" | "down" | "stable"; // vs last month
  sampleSize: number;          // how many visits contributed
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctor: string;
  time: string; // "09:00"
  date: string; // ISO date (today)
  duration: number; // minutes
  type: string; // "Consultation" | "Follow-up" | "Lab Review"
  status: AppointmentStatus;
  notes?: string;
}

export interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "action";
  category: "critical" | "medical" | "financial" | "inventory" | "appointment" | "system";
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  /** Optional: patient or resource this notification refers to */
  patientId?: string;
  actionLabel?: string;
  actionTarget?: string;
}

export interface ActivityEntry {
  id: string;
  type: TimelineEventType;
  description: string;
  timestamp: string;
  actor: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
  timestamp: string;
  status: "active" | "completed" | "cancelled";
}

export interface LabResult {
  id: string;
  patientId: string;
  patientName: string;
  testType: string;
  value: string;
  unit: string;
  normalRange: string;
  status: "normal" | "high" | "low" | "critical";
  timestamp: string;
  orderedBy: string;
  notes?: string;
}

export interface Vital {
  id: string;
  patientId: string;
  patientName: string;
  recordedBy: string;
  recordedByRole: string;
  bp_systolic?: number;
  bp_diastolic?: number;
  heartRate?: number;
  temperature?: number;
  bloodSugar?: number;
  oxygenLevel?: number;
  weight?: number;
  notes?: string;
  timestamp: string;
}

export interface VoiceNote {
  id: string;
  patientId: string;
  patientName: string;
  recordedBy: string;
  durationSec: number;
  transcript: string;
  timestamp: string;
}

// ===== Production types =====

export interface ClinicLocation {
  id: string;
  name: string;
  address: string;
  phone: string;
  isPrimary: boolean;
}

export interface InsuranceClaim {
  id: string;
  patientId: string;
  patientName: string;
  provider: string;
  policyNumber: string;
  serviceType: string;
  amount: number;
  status: "pending" | "submitted" | "approved" | "rejected" | "paid";
  submittedAt: string;
  resolvedAt?: string;
  notes?: string;
}

export interface Document {
  id: string;
  patientId: string;
  patientName: string;
  name: string;
  type: "xray" | "lab-report" | "prescription" | "consent" | "other";
  uploadedBy: string;
  uploadedAt: string;
  size: string;
  url?: string;
}

export interface EmailLog {
  id: string;
  to: string;
  patientName: string;
  subject: string;
  body: string;
  sentAt: string;
  type: "appointment" | "reminder" | "lab-result" | "billing" | "welcome";
}

export interface Medication {
  id: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  minStock: number;
  price: number;
  expiryDate: string;
  supplier: string;
}

export interface DoctorHours {
  doctorId: string;
  doctorName: string;
  monday: { start: string; end: string } | null;
  tuesday: { start: string; end: string } | null;
  wednesday: { start: string; end: string } | null;
  thursday: { start: string; end: string } | null;
  friday: { start: string; end: string } | null;
  saturday: { start: string; end: string } | null;
  sunday: { start: string; end: string } | null;
}

export interface RecurringPattern {
  id: string;
  patientId: string;
  patientName: string;
  type: string;
  frequency: "weekly" | "monthly" | "quarterly" | "custom";
  intervalDays: number;
  nextDate: string;
  doctor: string;
  active: boolean;
}

export interface WhatsAppMessage {
  id: string;
  patientId: string;
  patientName: string;
  direction: "outbound" | "inbound";
  message: string;
  timestamp: string;
  status: "sent" | "delivered" | "read";
  sentBy: string;
}

export interface Brief {
  greeting: string;
  doctorName: string;
  dateLabel: string;
  priorities: { id: string; level: Priority; text: string; done: boolean }[];
  expectedRevenue: number;
  firstAppointment: string;
  lastAppointment: string;
  waitingPatients: number;
  noShowRiskCount: number;
  completedYesterdayPct: number;
}

export type Role =
  | "admin"
  | "doctor"
  | "receptionist"
  | "nurse"
  | "pharmacist"
  | "lab_tech"
  | "radiologist"
  | "finance"
  | "it_support"
  | "operations";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // demo only — plain text
  role: Role;
  avatarColor: string;
  initials: string;
  title: string;
  // User management fields
  status?: "active" | "suspended" | "inactive";
  mfaEnabled?: boolean;
  lastLogin?: string;
}

export interface AuditEntry {
  id: string;
  userId: string;
  userName: string;
  userRole: Role;
  action: string;
  target: string;
  timestamp: string;
}

interface VeltraState {
  // mode
  mode: "demo" | "live";
  language: Language;
  // auth
  users: User[];
  currentUser: User | null;
  auditLog: AuditEntry[];
  // data
  patients: Patient[];
  appointments: Appointment[];
  notifications: Notification[];
  activities: ActivityEntry[];
  prescriptions: Prescription[];
  labResults: LabResult[];
  vitals: Vital[];
  voiceNotes: VoiceNote[];
  // production data
  locations: ClinicLocation[];
  currentLocationId: string;
  insuranceClaims: InsuranceClaim[];
  documents: Document[];
  emailLogs: EmailLog[];
  medications: Medication[];
  doctorHours: DoctorHours[];
  recurringPatterns: RecurringPattern[];
  whatsappMessages: WhatsAppMessage[];
  twoFactorEnabled: boolean;
  twoFactorPending: boolean;
  // specialty
  activeSpecialty: SpecialtyConfig;
  // subscription tier
  activeTierId: TierId;
  activeTier: TierConfig;
  // demo access gate
  demoAccessGranted: boolean;
  // brief (Today's Brief data)
  brief: Brief;
  // ui
  activeView: "brief" | "patients" | "appointments" | "timeline" | "audit" | "settings" | "calendar" | "labs" | "billing" | "reports" | "claims" | "documents" | "inventory" | "portal" | "availability" | "recurring" | "messages" | "intake" | "import" | "migrate" | "security" | "users";
  selectedPatientId: string | null;
  hasSeenWelcome: boolean;
  // undo stack
  undoStack: { label: string; undo: () => void }[];
  // actions
  setView: (v: VeltraState["activeView"]) => void;
  selectPatient: (id: string | null) => void;
  login: (email: string, password: string) => boolean;
  loginAs: (userId: string) => void;
  logout: () => void;
  logAction: (action: string, target: string) => void;
  setLanguage: (lang: Language) => void;
  addAppointment: (input: {
    patientId: string;
    time: string;
    type: string;
    doctor: string;
    notes?: string;
  }) => void;
  confirmAppointment: (id: string) => void;
  checkIn: (id: string) => void;
  completeAppointment: (id: string) => void;
  cancelAppointment: (id: string) => void;
  addPrescription: (input: Omit<Prescription, "id" | "timestamp" | "status">) => void;
  cancelPrescription: (id: string) => void;
  addLabResult: (input: Omit<LabResult, "id" | "timestamp">) => void;
  addVital: (input: Omit<Vital, "id" | "timestamp">) => void;
  addVoiceNote: (input: Omit<VoiceNote, "id" | "timestamp">) => void;
  addPatient: (input: { name: string; age: number; gender: "M" | "F"; phone: string; conditions?: string[]; doctor: string; preferredChannel: Channel }) => void;
  addPatientNote: (patientId: string, note: string) => void;
  recordPayment: (input: { patientId: string; amount: number; method: string; notes?: string }) => void;
  // production actions
  rescheduleAppointment: (id: string, newTime: string, newDate?: string) => void;
  switchLocation: (locationId: string) => void;
  addLocation: (input: Omit<ClinicLocation, "id">) => void;
  submitClaim: (input: Omit<InsuranceClaim, "id" | "submittedAt" | "status">) => void;
  updateClaimStatus: (id: string, status: InsuranceClaim["status"]) => void;
  uploadDocument: (input: Omit<Document, "id" | "uploadedAt">) => void;
  sendEmail: (input: Omit<EmailLog, "id" | "sentAt">) => void;
  adjustMedicationStock: (id: string, delta: number) => void;
  addMedication: (input: Omit<Medication, "id">) => void;
  updateDoctorHours: (doctorId: string, hours: Partial<DoctorHours>) => void;
  createRecurring: (input: Omit<RecurringPattern, "id" | "active">) => void;
  toggleRecurring: (id: string) => void;
  sendWhatsApp: (input: { patientId: string; patientName: string; message: string }) => void;
  verifyTwoFactor: (code: string) => boolean;
  toggleTwoFactor: () => void;
  setSpecialty: (id: SpecialtyId) => void;
  setActiveTier: (id: TierId) => void;
  grantDemoAccess: () => void;
  revokeDemoAccess: () => void;
  markPriorityDone: (id: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  resetDemo: () => void;
  dismissWelcome: () => void;
  pushUndo: (label: string, undo: () => void) => void;
  popUndo: () => void;
  clearUndo: () => void;
}

// ===== Permission Matrix (§5.2) =====
// Granular permissions — every gate checks a permission flag, never a role string.
// To add a new role, add an entry here and seed a demo user (no other code changes).
export const PERMISSIONS: Record<Role, {
  canView: string[];              // screens this role can see
  canBook: boolean;               // schedule appointments
  canConfirm: boolean;
  canCheckIn: boolean;
  canComplete: boolean;
  canCancel: boolean;
  canEditPatient: boolean;        // edit demographics
  canPrescribe: boolean;          // write prescriptions
  canRecordVitals: boolean;       // enter vitals
  canOrderLab: boolean;           // order lab tests
  canOrderImaging: boolean;       // order radiology
  canDispense: boolean;           // pharmacy dispense
  canAdjustInventory: boolean;    // pharmacy stock +/- adjustment
  canEnterLabResult: boolean;     // lab_tech enters results
  canEnterImagingReport: boolean; // radiologist writes report
  canManageBilling: boolean;      // create invoices, collect payments
  canManageClaims: boolean;       // submit insurance claims
  canViewFinancials: boolean;     // see billing/claims/reports (financial data)
  canViewAudit: boolean;          // see audit log
  canViewSecurityAudit: boolean;  // see security-category events (IT only)
  canResetDemo: boolean;          // destructive — admin only
  canManageUsers: boolean;        // invite/suspend/deactivate
  canVoiceNote: boolean;
  canExport: boolean;
  canImportFiles: boolean;        // Smart Import Center
}> = {
  admin: {
    canView: ["brief", "patients", "appointments", "timeline", "audit", "settings", "calendar", "labs", "billing", "reports", "claims", "documents", "inventory", "availability", "recurring", "messages", "security", "users"],
    canBook: true, canConfirm: true, canCheckIn: true, canComplete: true, canCancel: true,
    canEditPatient: true, canPrescribe: true, canRecordVitals: true, canOrderLab: true, canOrderImaging: true,
    canDispense: true, canAdjustInventory: true, canEnterLabResult: true, canEnterImagingReport: true,
    canManageBilling: true, canManageClaims: true, canViewFinancials: true,
    canViewAudit: true, canViewSecurityAudit: true, canResetDemo: true, canManageUsers: true,
    canVoiceNote: true, canExport: true, canImportFiles: true,
  },
  doctor: {
    // Clinical only — no billing, no claims, no reports, no inventory, no audit
    canView: ["brief", "patients", "appointments", "timeline", "settings", "calendar", "documents", "messages", "labs", "availability", "recurring"],
    canBook: true, canConfirm: true, canCheckIn: false, canComplete: true, canCancel: true,
    canEditPatient: true, canPrescribe: true, canRecordVitals: false, canOrderLab: true, canOrderImaging: true,
    canDispense: false, canAdjustInventory: false, canEnterLabResult: false, canEnterImagingReport: false,
    canManageBilling: false, canManageClaims: false, canViewFinancials: false,
    canViewAudit: false, canViewSecurityAudit: false, canResetDemo: false, canManageUsers: false,
    canVoiceNote: true, canExport: true, canImportFiles: true,
  },
  receptionist: {
    // Scheduling only — no billing, no claims, no clinical actions
    canView: ["brief", "patients", "appointments", "timeline", "settings", "calendar", "documents", "messages"],
    canBook: true, canConfirm: true, canCheckIn: true, canComplete: false, canCancel: true,
    canEditPatient: true, canPrescribe: false, canRecordVitals: false, canOrderLab: false, canOrderImaging: false,
    canDispense: false, canAdjustInventory: false, canEnterLabResult: false, canEnterImagingReport: false,
    canManageBilling: false, canManageClaims: false, canViewFinancials: false,
    canViewAudit: false, canViewSecurityAudit: false, canResetDemo: false, canManageUsers: false,
    canVoiceNote: false, canExport: false, canImportFiles: true,
  },
  nurse: {
    // Vitals + patient monitoring — no billing, no prescribing
    canView: ["brief", "patients", "appointments", "timeline", "settings", "labs", "documents", "messages"],
    canBook: false, canConfirm: false, canCheckIn: true, canComplete: false, canCancel: false,
    canEditPatient: false, canPrescribe: false, canRecordVitals: true, canOrderLab: false, canOrderImaging: false,
    canDispense: false, canAdjustInventory: false, canEnterLabResult: false, canEnterImagingReport: false,
    canManageBilling: false, canManageClaims: false, canViewFinancials: false,
    canViewAudit: false, canViewSecurityAudit: false, canResetDemo: false, canManageUsers: false,
    canVoiceNote: true, canExport: false, canImportFiles: false,
  },
  pharmacist: {
    // Pharmacy only — inventory + dispense prescriptions, view patients for context
    canView: ["brief", "patients", "timeline", "settings", "inventory", "documents", "messages"],
    canBook: false, canConfirm: false, canCheckIn: false, canComplete: false, canCancel: false,
    canEditPatient: false, canPrescribe: false, canRecordVitals: false, canOrderLab: false, canOrderImaging: false,
    canDispense: true, canAdjustInventory: true, canEnterLabResult: false, canEnterImagingReport: false,
    canManageBilling: false, canManageClaims: false, canViewFinancials: false,
    canViewAudit: false, canViewSecurityAudit: false, canResetDemo: false, canManageUsers: false,
    canVoiceNote: false, canExport: false, canImportFiles: false,
  },
  lab_tech: {
    // Lab only — see lab orders, enter results
    canView: ["brief", "patients", "timeline", "settings", "labs", "documents"],
    canBook: false, canConfirm: false, canCheckIn: false, canComplete: false, canCancel: false,
    canEditPatient: false, canPrescribe: false, canRecordVitals: false, canOrderLab: false, canOrderImaging: false,
    canDispense: false, canAdjustInventory: false, canEnterLabResult: true, canEnterImagingReport: false,
    canManageBilling: false, canManageClaims: false, canViewFinancials: false,
    canViewAudit: false, canViewSecurityAudit: false, canResetDemo: false, canManageUsers: false,
    canVoiceNote: false, canExport: false, canImportFiles: true,
  },
  radiologist: {
    // Radiology only — see imaging orders, write reports
    canView: ["brief", "patients", "timeline", "settings", "labs", "documents"],
    canBook: false, canConfirm: false, canCheckIn: false, canComplete: false, canCancel: false,
    canEditPatient: false, canPrescribe: false, canRecordVitals: false, canOrderLab: false, canOrderImaging: false,
    canDispense: false, canAdjustInventory: false, canEnterLabResult: false, canEnterImagingReport: true,
    canManageBilling: false, canManageClaims: false, canViewFinancials: false,
    canViewAudit: false, canViewSecurityAudit: false, canResetDemo: false, canManageUsers: false,
    canVoiceNote: false, canExport: false, canImportFiles: true,
  },
  finance: {
    // Financial only — billing, claims, reports. No clinical, no inventory, no patients
    canView: ["brief", "appointments", "settings", "calendar", "billing", "reports", "claims", "recurring"],
    canBook: false, canConfirm: false, canCheckIn: false, canComplete: false, canCancel: false,
    canEditPatient: false, canPrescribe: false, canRecordVitals: false, canOrderLab: false, canOrderImaging: false,
    canDispense: false, canAdjustInventory: false, canEnterLabResult: false, canEnterImagingReport: false,
    canManageBilling: true, canManageClaims: true, canViewFinancials: true,
    canViewAudit: false, canViewSecurityAudit: false, canResetDemo: false, canManageUsers: false,
    canVoiceNote: false, canExport: true, canImportFiles: false,
  },
  it_support: {
    // IT only — system status + security audit + own settings + security center (no user management)
    canView: ["brief", "settings", "audit", "security"],
    canBook: false, canConfirm: false, canCheckIn: false, canComplete: false, canCancel: false,
    canEditPatient: false, canPrescribe: false, canRecordVitals: false, canOrderLab: false, canOrderImaging: false,
    canDispense: false, canAdjustInventory: false, canEnterLabResult: false, canEnterImagingReport: false,
    canManageBilling: false, canManageClaims: false, canViewFinancials: false,
    canViewAudit: true, canViewSecurityAudit: true, canResetDemo: false, canManageUsers: false,
    canVoiceNote: false, canExport: false, canImportFiles: false,
  },
  operations: {
    // Operations only — billing + inventory + reports, no clinical data
    canView: ["brief", "appointments", "settings", "calendar", "billing", "reports", "inventory", "availability", "recurring"],
    canBook: true, canConfirm: true, canCheckIn: false, canComplete: false, canCancel: true,
    canEditPatient: false, canPrescribe: false, canRecordVitals: false, canOrderLab: false, canOrderImaging: false,
    canDispense: false, canAdjustInventory: true, canEnterLabResult: false, canEnterImagingReport: false,
    canManageBilling: true, canManageClaims: false, canViewFinancials: true,
    canViewAudit: false, canViewSecurityAudit: false, canResetDemo: false, canManageUsers: false,
    canVoiceNote: false, canExport: true, canImportFiles: false,
  },
};

export function canAccess(role: Role | undefined, screen: string): boolean {
  if (!role) return false;
  return PERMISSIONS[role].canView.includes(screen);
}

/**
 * Tier-aware access check.
 * A screen is only visible if BOTH the role allows it AND the active subscription tier enables it.
 * This is what makes Platform / Enterprise feel different.
 */
export function canAccessWithTier(role: Role | undefined, screen: string, tierScreens: string[]): boolean {
  if (!role) return false;
  if (!tierScreens.includes(screen)) return false;
  return PERMISSIONS[role].canView.includes(screen);
}

export function canDo(role: Role | undefined, action: keyof typeof PERMISSIONS[Role]): boolean {
  if (!role) return false;
  return PERMISSIONS[role][action] as boolean;
}

// ===== Seed Data =====
const today = new Date();
const todayISO = today.toISOString().split("T")[0];
const daysAgo = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return d.toISOString();
};
const daysAhead = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + n);
  return d.toISOString();
};
const fmtTime = (d: Date) => d.toISOString();

function makeInitialPatients(): Patient[] {
  return [
    {
      id: "p1",
      name: "Ahmed Hassan",
      age: 54,
      gender: "M",
      phone: "+966 50 123 4567",
      conditions: ["Diabetic", "Hypertension"],
      visitPattern: "Usually visits every 90 days",
      lastVisit: daysAgo(87),
      nextVisit: daysAhead(1),
      insurance: "verified",
      balance: "overdue",
      balanceAmount: 320,
      preferredChannel: "whatsapp",
      doctor: "Dr. Sarah",
      riskScore: 72,
      avatarColor: "bg-amber-500/15 text-amber-300",
      loyaltyTier: 'gold',
      leadSource: 'whatsapp',
      specialty: 'Endocrinology',
      totalVisits: 14,
      totalRevenue: 4900,
      tags: ['Chronic', 'Insulin'],
      allergies: ['Sulfa'],
      city: 'Riyadh',
      lastContactDays: 2,
      status: 'active',
      flags: [
        { id: "fl1", category: "attendance", value: "frequently_late", label: "Frequently late", severity: "warning", setBy: "Dr. Sarah", setAt: daysAgo(87), notes: "Arrived 15+ min late to last 3 appointments" },
        { id: "fl2", category: "medication", value: "needs_coaching", label: "Needs medication coaching", severity: "warning", setBy: "Dr. Sarah", setAt: daysAgo(30), notes: "Missed doses — HbA1c rising" },
        { id: "fl3", category: "clinical", value: "diabetic", label: "Diabetic — needs regular monitoring", severity: "info", setBy: "Dr. Sarah", setAt: daysAgo(365) },
        { id: "fl4", category: "financial", value: "outstanding_balance", label: "Outstanding balance", severity: "warning", setBy: "Reception", setAt: daysAgo(14), notes: "$320 overdue 14 days" },
      ],
      latestVitals: {
        bp_systolic: 145,
        bp_diastolic: 90,
        heartRate: 78,
        bloodSugar: 9.2,
        oxygenLevel: 97,
        weight: 84,
        timestamp: daysAgo(7),
      },
      timeline: [
        { id: "t1", type: "call", timestamp: daysAgo(88), title: "Called to book", description: "Inbound call, answered in 4 seconds.", actor: "Veltra" },
        { id: "t2", type: "booking", timestamp: daysAgo(88), title: "Appointment booked", description: "Tuesday 09:00, follow-up.", actor: "Veltra" },
        { id: "t3", type: "reminder", timestamp: daysAgo(87), title: "Reminder sent", description: "WhatsApp, 24h before.", actor: "Veltra" },
        { id: "t4", type: "check-in", timestamp: daysAgo(87), title: "Checked in", description: "On time. Wait: 6 min.", actor: "Reception" },
        { id: "t5", type: "diagnosis", timestamp: daysAgo(87), title: "Diagnosis reviewed", description: "HbA1c 8.1%, insulin adjustment.", actor: "Dr. Sarah" },
        { id: "t6", type: "lab", timestamp: daysAgo(87), title: "Lab ordered", description: "HbA1c, lipid panel.", actor: "Dr. Sarah" },
        { id: "t7", type: "prescription", timestamp: daysAgo(87), title: "Prescription", description: "Metformin 1000mg, renewed.", actor: "Dr. Sarah" },
        { id: "t8", type: "payment", timestamp: daysAgo(87), title: "Partial payment", description: "$180 of $500. Balance carried.", actor: "Reception" },
        { id: "t9", type: "follow-up", timestamp: daysAgo(87), title: "Follow-up scheduled", description: "Tomorrow, 09:00.", actor: "Veltra" },
      ],
    },
    {
      id: "p2",
      name: "Fatima Al-Zahra",
      age: 34,
      gender: "F",
      phone: "+966 55 987 6543",
      conditions: ["Thyroid"],
      visitPattern: "Usually visits every 180 days",
      lastVisit: daysAgo(45),
      nextVisit: daysAhead(0),
      insurance: "verified",
      balance: "paid",
      preferredChannel: "whatsapp",
      doctor: "Dr. Sarah",
      riskScore: 12,
      avatarColor: "bg-rose-500/15 text-rose-300",
      loyaltyTier: 'silver',
      leadSource: 'referral',
      specialty: 'Endocrinology',
      totalVisits: 6,
      totalRevenue: 2100,
      tags: ['Thyroid'],
      allergies: [],
      city: 'Riyadh',
      lastContactDays: 45,
      status: 'active',
      timeline: [
        { id: "f1", type: "call", timestamp: daysAgo(46), title: "Called to book", actor: "Veltra" },
        { id: "f2", type: "booking", timestamp: daysAgo(46), title: "Booked", actor: "Veltra" },
        { id: "f3", type: "reminder", timestamp: daysAgo(45), title: "Reminder sent", actor: "Veltra" },
        { id: "f4", type: "check-in", timestamp: daysAgo(45), title: "Checked in", actor: "Reception" },
        { id: "f5", type: "diagnosis", timestamp: daysAgo(45), title: "Thyroid panel reviewed", actor: "Dr. Sarah" },
        { id: "f6", type: "payment", timestamp: daysAgo(45), title: "Paid in full", actor: "Reception" },
      ],
    },
    {
      id: "p3",
      name: "Khalid Al-Otaibi",
      age: 61,
      gender: "M",
      phone: "+966 53 444 2211",
      conditions: ["Cardiac", "Diabetic"],
      visitPattern: "Usually visits every 30 days",
      lastVisit: daysAgo(28),
      nextVisit: daysAhead(2),
      insurance: "pending",
      balance: "due",
      balanceAmount: 240,
      preferredChannel: "call",
      doctor: "Dr. Omar",
      riskScore: 88,
      avatarColor: "bg-emerald-500/15 text-emerald-300",
      loyaltyTier: 'platinum',
      leadSource: 'voice',
      specialty: 'Cardiology',
      totalVisits: 28,
      totalRevenue: 11200,
      tags: ['Cardiac', 'High-Value', 'Chronic'],
      allergies: ['Aspirin'],
      city: 'Jeddah',
      lastContactDays: 1,
      status: 'active',
      timeline: [
        { id: "k1", type: "call", timestamp: daysAgo(29), title: "Called", actor: "Veltra" },
        { id: "k2", type: "booking", timestamp: daysAgo(29), title: "Booked", actor: "Veltra" },
        { id: "k3", type: "check-in", timestamp: daysAgo(28), title: "Checked in", actor: "Reception" },
        { id: "k4", type: "lab", timestamp: daysAgo(28), title: "ECG + lipid panel", actor: "Dr. Omar" },
        { id: "k5", type: "prescription", timestamp: daysAgo(28), title: "Atorvastatin adjusted", actor: "Dr. Omar" },
        { id: "k6", type: "follow-up", timestamp: daysAgo(28), title: "Follow-up in 2 days", actor: "Veltra" },
      ],
    },
    {
      id: "p4",
      name: "Noura Al-Saud",
      age: 28,
      gender: "F",
      phone: "+966 56 222 3344",
      conditions: [],
      visitPattern: "New patient",
      lastVisit: daysAgo(7),
      insurance: "verified",
      balance: "paid",
      preferredChannel: "sms",
      doctor: "Dr. Sarah",
      riskScore: 8,
      avatarColor: "bg-violet-500/15 text-violet-300",
      loyaltyTier: 'bronze',
      leadSource: 'google',
      specialty: 'General',
      totalVisits: 1,
      totalRevenue: 350,
      tags: ['New'],
      allergies: [],
      city: 'Riyadh',
      lastContactDays: 7,
      status: 'new',
      timeline: [
        { id: "n1", type: "booking", timestamp: daysAgo(8), title: "First booking", actor: "Veltra" },
        { id: "n2", type: "check-in", timestamp: daysAgo(7), title: "Checked in", actor: "Reception" },
        { id: "n3", type: "diagnosis", timestamp: daysAgo(7), title: "Initial consult", actor: "Dr. Sarah" },
        { id: "n4", type: "payment", timestamp: daysAgo(7), title: "Paid", actor: "Reception" },
      ],
    },
    {
      id: "p5",
      name: "Yusuf Al-Ghamdi",
      age: 47,
      gender: "M",
      phone: "+966 50 888 7777",
      conditions: ["Asthma"],
      visitPattern: "Usually visits every 120 days",
      lastVisit: daysAgo(95),
      nextVisit: undefined,
      insurance: "none",
      balance: "paid",
      preferredChannel: "whatsapp",
      doctor: "Dr. Omar",
      riskScore: 45,
      avatarColor: "bg-sky-500/15 text-sky-300",
      loyaltyTier: 'silver',
      leadSource: 'website',
      specialty: 'Pulmonology',
      totalVisits: 8,
      totalRevenue: 2800,
      tags: ['Asthma', 'Chronic'],
      allergies: ['Penicillin'],
      city: 'Singapore',
      lastContactDays: 95,
      status: 'inactive',
      timeline: [
        { id: "y1", type: "call", timestamp: daysAgo(96), title: "Called", actor: "Veltra" },
        { id: "y2", type: "booking", timestamp: daysAgo(96), title: "Booked", actor: "Veltra" },
        { id: "y3", type: "check-in", timestamp: daysAgo(95), title: "Checked in", actor: "Reception" },
        { id: "y4", type: "prescription", timestamp: daysAgo(95), title: "Inhaler renewed", actor: "Dr. Omar" },
        { id: "y5", type: "payment", timestamp: daysAgo(95), title: "Cash payment", actor: "Reception" },
      ],
    },
    {
      id: "p6",
      name: "Mariam Al-Qahtani",
      age: 39,
      gender: "F",
      phone: "+966 55 111 9090",
      conditions: ["Migraine"],
      visitPattern: "Usually visits every 60 days",
      lastVisit: daysAgo(58),
      nextVisit: daysAhead(3),
      insurance: "verified",
      balance: "paid",
      preferredChannel: "whatsapp",
      doctor: "Dr. Sarah",
      riskScore: 22,
      avatarColor: "bg-orange-500/15 text-orange-300",
      loyaltyTier: 'gold',
      leadSource: 'meta',
      specialty: 'Neurology',
      totalVisits: 12,
      totalRevenue: 4200,
      tags: ['Migraine', 'Recurring'],
      allergies: ['Codeine'],
      city: 'Riyadh',
      lastContactDays: 58,
      status: 'active',
      timeline: [
        { id: "m1", type: "booking", timestamp: daysAgo(59), title: "Booked", actor: "Veltra" },
        { id: "m2", type: "check-in", timestamp: daysAgo(58), title: "Checked in", actor: "Reception" },
        { id: "m3", type: "diagnosis", timestamp: daysAgo(58), title: "Migraine review", actor: "Dr. Sarah" },
        { id: "m4", type: "payment", timestamp: daysAgo(58), title: "Paid", actor: "Reception" },
      ],
    },
  ];
}

function makeInitialAppointments(): Appointment[] {
  return [
    { id: "a1", patientId: "p2", patientName: "Fatima Al-Zahra", doctor: "Dr. Sarah", time: "09:00", date: todayISO, duration: 30, type: "Skin Consult", status: "confirmed", notes: "" },
    { id: "a2", patientId: "p4", patientName: "Noura Al-Saud", doctor: "Dr. Sarah", time: "10:15", date: todayISO, duration: 20, type: "Follow-up", status: "scheduled", notes: "" },
    { id: "a3", patientId: "p3", patientName: "Khalid Al-Otaibi", doctor: "Dr. Omar", time: "11:30", date: todayISO, duration: 45, type: "Cardiac Review", status: "confirmed", notes: "ECG due" },
    { id: "a4", patientId: "p5", patientName: "Yusuf Al-Ghamdi", doctor: "Dr. Omar", time: "13:00", date: todayISO, duration: 30, type: "Asthma Follow-up", status: "scheduled", notes: "" },
    { id: "a5", patientId: "p6", patientName: "Mariam Al-Qahtani", doctor: "Dr. Sarah", time: "14:30", date: todayISO, duration: 30, type: "Migraine Review", status: "confirmed", notes: "" },
    { id: "a6", patientId: "p1", patientName: "Ahmed Hassan", doctor: "Dr. Sarah", time: "16:00", date: todayISO, duration: 45, type: "Diabetic Follow-up", status: "scheduled", notes: "HbA1c result pending" },
  ];
}

function makeInitialNotifications(): Notification[] {
  return [
    { id: "n1", type: "action",   category: "appointment", title: "3 appointments need confirmation", description: "Today's schedule has 3 unconfirmed appointments.", timestamp: fmtTime(new Date(today.getTime() - 8 * 60 * 1000)), read: false, actionLabel: "Open schedule", actionTarget: "appointments" },
    { id: "n2", type: "warning",  category: "financial",   title: "Ahmed Hassan — payment overdue 14 days", description: "$320 balance from last visit. Patient prefers WhatsApp.", timestamp: fmtTime(new Date(today.getTime() - 32 * 60 * 1000)), read: false, patientId: "p1", actionLabel: "Open billing", actionTarget: "billing" },
    { id: "n3", type: "info",     category: "medical",     title: "Lab result received", description: "Khalid Al-Otaibi — lipid panel. Trending up.", timestamp: fmtTime(new Date(today.getTime() - 95 * 60 * 1000)), read: false, patientId: "p3", actionLabel: "Review lab", actionTarget: "labs" },
    { id: "n4", type: "success",  category: "system",      title: "Reminder sent", description: "WhatsApp reminders sent to 4 patients for tomorrow.", timestamp: fmtTime(new Date(today.getTime() - 180 * 60 * 1000)), read: true },
  ];
}

function makeInitialActivities(): ActivityEntry[] {
  return [
    { id: "ac1", type: "reminder", description: "Reminder sent to Fatima Al-Zahra (WhatsApp)", timestamp: fmtTime(new Date(today.getTime() - 12 * 60 * 1000)), actor: "Veltra" },
    { id: "ac2", type: "call", description: "Incoming call — Ahmed Hassan. Answered.", timestamp: fmtTime(new Date(today.getTime() - 38 * 60 * 1000)), actor: "Veltra" },
    { id: "ac3", type: "booking", description: "Appointment booked — Noura Al-Saud, 10:15", timestamp: fmtTime(new Date(today.getTime() - 52 * 60 * 1000)), actor: "Veltra" },
    { id: "ac4", type: "payment", description: "Payment collected — Mariam Al-Qahtani, $180", timestamp: fmtTime(new Date(today.getTime() - 95 * 60 * 1000)), actor: "Reception" },
    { id: "ac5", type: "lab", description: "Lab result received — Khalid Al-Otaibi", timestamp: fmtTime(new Date(today.getTime() - 130 * 60 * 1000)), actor: "Al-Borg Lab" },
    { id: "ac6", type: "follow-up", description: "Follow-up scheduled — Ahmed Hassan, tomorrow 09:00", timestamp: fmtTime(new Date(today.getTime() - 200 * 60 * 1000)), actor: "Veltra" },
  ];
}

function makeInitialBrief(): Brief {
  return {
    greeting: "Good morning",
    doctorName: "Dr. Sarah",
    dateLabel: today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }),
    priorities: [
      { id: "b1", level: "high", text: "Confirm 3 appointments", done: false },
      { id: "b2", level: "high", text: "Review 2 lab results", done: false },
      { id: "b3", level: "medium", text: "Call back Ahmed Hassan (payment overdue)", done: false },
      { id: "b4", level: "low", text: "Approve 4 follow-up reminders", done: false },
    ],
    expectedRevenue: 5420,
    firstAppointment: "09:00",
    lastAppointment: "16:00",
    waitingPatients: 0,
    noShowRiskCount: 2,
    completedYesterdayPct: 96,
  };
}

function makeInitialUsers(): User[] {
  // 33 users: 12 doctors, 6 receptionists, 8 nurses, 2 pharmacists, 1 lab tech, 1 radiologist, 3 admins
  const avatarColors = [
    "bg-emerald-500/15 text-emerald-300", "bg-blue-500/15 text-blue-300",
    "bg-cyan-500/15 text-cyan-300", "bg-pink-500/15 text-pink-300",
    "bg-indigo-500/15 text-indigo-300", "bg-amber-500/15 text-amber-300",
    "bg-violet-500/15 text-violet-300", "bg-teal-500/15 text-teal-300",
    "bg-orange-500/15 text-orange-300", "bg-rose-500/15 text-rose-300",
    "bg-lime-500/15 text-lime-300", "bg-sky-500/15 text-sky-300",
  ];
  const rawUsers = [
    // Doctors (12)
    { id: "u1", name: "Dr. Sarah Carter", email: "sarah@veltrahealth.co", password: "Veltra2026", role: "doctor", avatarColor: avatarColors[0], initials: "SC", title: "Dr. Carter — Senior Physician", status: "active", mfaEnabled: true, lastLogin: "2 min ago" },
    { id: "u2", name: "Dr. Emily Chen", email: "emily@veltrahealth.co", password: "Veltra2026", role: "doctor", avatarColor: avatarColors[1], initials: "EC", title: "Dr. Chen — Cardiologist", status: "active", mfaEnabled: true, lastLogin: "1 hr ago" },
    { id: "u6", name: "Dr. Omar Hassan", email: "omar@veltrahealth.co", password: "Veltra2026", role: "doctor", avatarColor: avatarColors[2], initials: "OH", title: "Dr. Hassan — Pulmonologist" },
    { id: "u7", name: "Dr. Priya Sharma", email: "priya@veltrahealth.co", password: "Veltra2026", role: "doctor", avatarColor: avatarColors[3], initials: "PS", title: "Dr. Sharma — Dermatologist" },
    { id: "u8", name: "Dr. Khalid Al-Rashid", email: "khalid@veltrahealth.co", password: "Veltra2026", role: "doctor", avatarColor: avatarColors[4], initials: "KR", title: "Dr. Al-Rashid — Orthopedic Surgeon" },
    { id: "u11", name: "Dr. Lisa Anderson", email: "lisa@veltrahealth.co", password: "Veltra2026", role: "doctor", avatarColor: avatarColors[5], initials: "LA", title: "Dr. Anderson — Pediatrician" },
    { id: "u12", name: "Dr. Ahmed Al-Farsi", email: "ahmed.dr@veltrahealth.co", password: "Veltra2026", role: "doctor", avatarColor: avatarColors[6], initials: "AF", title: "Dr. Al-Farsi — Neurologist" },
    { id: "u13", name: "Dr. Maria Garcia", email: "maria@veltrahealth.co", password: "Veltra2026", role: "doctor", avatarColor: avatarColors[7], initials: "MG", title: "Dr. Garcia — Endocrinologist" },
    { id: "u14", name: "Dr. David Kim", email: "david@veltrahealth.co", password: "Veltra2026", role: "doctor", avatarColor: avatarColors[8], initials: "DK", title: "Dr. Kim — Gastroenterologist" },
    { id: "u15", name: "Dr. Fatima Zahra", email: "fatima.dr@veltrahealth.co", password: "Veltra2026", role: "doctor", avatarColor: avatarColors[9], initials: "FZ", title: "Dr. Zahra — OBGYN" },
    { id: "u16", name: "Dr. Robert Taylor", email: "robert@veltrahealth.co", password: "Veltra2026", role: "doctor", avatarColor: avatarColors[10], initials: "RT", title: "Dr. Taylor — ENT Specialist" },
    { id: "u17", name: "Dr. Aisha Mohammed", email: "aisha.dr@veltrahealth.co", password: "Veltra2026", role: "doctor", avatarColor: avatarColors[11], initials: "AM", title: "Dr. Mohammed — Oncologist" },
    // Receptionists (6)
    { id: "u3", name: "Sophia Martinez", email: "sophia@veltrahealth.co", password: "Veltra2026", role: "receptionist", avatarColor: avatarColors[5], initials: "SM", title: "Sophia — Reception Lead" },
    { id: "u9", name: "James Wilson", email: "james@veltrahealth.co", password: "Veltra2026", role: "receptionist", avatarColor: avatarColors[7], initials: "JW", title: "James — Receptionist" },
    { id: "u18", name: "Layla Ibrahim", email: "layla@veltrahealth.co", password: "Veltra2026", role: "receptionist", avatarColor: avatarColors[3], initials: "LI", title: "Layla — Receptionist" },
    { id: "u19", name: "Daniel Foster", email: "daniel@veltrahealth.co", password: "Veltra2026", role: "receptionist", avatarColor: avatarColors[4], initials: "DF", title: "Daniel — Receptionist" },
    { id: "u20", name: "Yuki Tanaka", email: "yuki@veltrahealth.co", password: "Veltra2026", role: "receptionist", avatarColor: avatarColors[6], initials: "YT", title: "Yuki — Receptionist" },
    { id: "u21", name: "Carlos Mendez", email: "carlos@veltrahealth.co", password: "Veltra2026", role: "receptionist", avatarColor: avatarColors[8], initials: "CM", title: "Carlos — Receptionist" },
    // Nurses (8)
    { id: "u4", name: "Olivia Bennett", email: "olivia@veltrahealth.co", password: "Veltra2026", role: "nurse", avatarColor: avatarColors[6], initials: "OB", title: "Olivia — Head Nurse" },
    { id: "u10", name: "Nadia Ahmed", email: "nadia@veltrahealth.co", password: "Veltra2026", role: "nurse", avatarColor: avatarColors[8], initials: "NA", title: "Nadia — Nurse" },
    { id: "u22", name: "Rachel Green", email: "rachel@veltrahealth.co", password: "Veltra2026", role: "nurse", avatarColor: avatarColors[3], initials: "RG", title: "Rachel — Nurse" },
    { id: "u23", name: "Mohammed Ali", email: "mohammed.n@veltrahealth.co", password: "Veltra2026", role: "nurse", avatarColor: avatarColors[2], initials: "MA", title: "Mohammed — Nurse" },
    { id: "u24", name: "Grace Park", email: "grace@veltrahealth.co", password: "Veltra2026", role: "nurse", avatarColor: avatarColors[7], initials: "GP", title: "Grace — Nurse" },
    { id: "u25", name: "Hassan Youssef", email: "hassan@veltrahealth.co", password: "Veltra2026", role: "nurse", avatarColor: avatarColors[5], initials: "HY", title: "Hassan — Nurse" },
    { id: "u26", name: "Emma Thompson", email: "emma@veltrahealth.co", password: "Veltra2026", role: "nurse", avatarColor: avatarColors[9], initials: "ET", title: "Emma — Nurse" },
    { id: "u27", name: "Sara Lindqvist", email: "sara.n@veltrahealth.co", password: "Veltra2026", role: "nurse", avatarColor: avatarColors[10], initials: "SL", title: "Sara — Nurse" },
    // Pharmacists (2)
    { id: "u28", name: "Victor Okoye", email: "victor@veltrahealth.co", password: "Veltra2026", role: "pharmacist", avatarColor: avatarColors[4], initials: "VO", title: "Victor — Pharmacist" },
    { id: "u29", name: "Amira Saleh", email: "amira@veltrahealth.co", password: "Veltra2026", role: "pharmacist", avatarColor: avatarColors[1], initials: "AS", title: "Amira — Pharmacist" },
    // Lab Tech (1)
    { id: "u30", name: "Kevin O'Brien", email: "kevin@veltrahealth.co", password: "Veltra2026", role: "lab_tech", avatarColor: avatarColors[11], initials: "KO", title: "Kevin — Lab Technician" },
    // Radiologist (1)
    { id: "u31", name: "Dr. Sunita Patel", email: "sunita@veltrahealth.co", password: "Veltra2026", role: "radiologist", avatarColor: avatarColors[0], initials: "SP", title: "Dr. Patel — Radiologist" },
    // Admins (3)
    { id: "u5", name: "Admin", email: "admin@veltrahealth.co", password: "Veltra2026", role: "admin", avatarColor: avatarColors[9], initials: "AD", title: "Administrator", status: "active", mfaEnabled: true, lastLogin: "3 hrs ago" },
    { id: "u32", name: "IT Support", email: "it@veltrahealth.co", password: "Veltra2026", role: "it_support", avatarColor: avatarColors[7], initials: "IT", title: "IT Support", status: "active", mfaEnabled: true, lastLogin: "1 day ago" },
    { id: "u33", name: "Operations", email: "ops@veltrahealth.co", password: "Veltra2026", role: "operations", avatarColor: avatarColors[8], initials: "OP", title: "Operations Manager", status: "active", mfaEnabled: true, lastLogin: "4 hrs ago" },
    // Specialized roles (4)
    { id: "u34", name: "Karim Pharmacy", email: "pharmacy@veltrahealth.co", password: "Veltra2026", role: "pharmacist", avatarColor: avatarColors[2], initials: "KP", title: "Lead Pharmacist", status: "active", mfaEnabled: false, lastLogin: "Yesterday" },
    { id: "u35", name: "Layla Lab", email: "lab@veltrahealth.co", password: "Veltra2026", role: "lab_tech", avatarColor: avatarColors[3], initials: "LL", title: "Lab Technician", status: "active", mfaEnabled: true, lastLogin: "2 hrs ago" },
    { id: "u36", name: "Sara Billing", email: "finance@veltrahealth.co", password: "Veltra2026", role: "finance", avatarColor: avatarColors[4], initials: "SB", title: "Finance Officer", status: "active", mfaEnabled: true, lastLogin: "Yesterday" },
  ];
  // Default fields for any user missing them — ensures User Management screen
  // shows consistent data instead of "Never" + "MFA Off" for 27 of 33 users.
  return (rawUsers as User[]).map((u) => ({
    ...u,
    status: u.status ?? ("active" as const),
    mfaEnabled: u.mfaEnabled ?? (Math.random() > 0.4),
    lastLogin: u.lastLogin ?? ["2 min ago", "1 hr ago", "3 hrs ago", "Yesterday", "2 days ago", "1 week ago"][Math.floor(Math.random() * 6)],
  }));
}

function makeInitialAuditLog(): AuditEntry[] {
  return [
    // Clinical events
    { id: "al1", userId: "u1", userName: "Dr. Sarah Carter", userRole: "doctor", action: "Completed appointment", target: "Patient — 09:00", timestamp: daysAgo(0) },
    { id: "al2", userId: "u3", userName: "Sophia Martinez", userRole: "receptionist", action: "Checked in patient", target: "Patient — 11:30", timestamp: daysAgo(0) },
    { id: "al3", userId: "u1", userName: "Dr. Sarah Carter", userRole: "doctor", action: "Confirmed appointment", target: "Patient — 10:15", timestamp: daysAgo(0) },
    { id: "al4", userId: "u3", userName: "Sophia Martinez", userRole: "receptionist", action: "Booked appointment", target: "Patient — 13:00", timestamp: daysAgo(1) },
    { id: "al5", userId: "u5", userName: "Admin", userRole: "admin", action: "Reset demo data", target: "All clinic data", timestamp: daysAgo(2) },
    // System / IT events — only visible to it_support + admin
    { id: "al6",  userId: "u32", userName: "IT Support", userRole: "it_support", action: "Database backup",       target: "Daily backup completed (2.4 GB)",           timestamp: daysAgo(0) },
    { id: "al7",  userId: "u32", userName: "IT Support", userRole: "it_support", action: "Service restarted",     target: "API gateway — uptime restored",            timestamp: daysAgo(0) },
    { id: "al8",  userId: "u32", userName: "IT Support", userRole: "it_support", action: "Failed login",          target: "Unknown user — IP 188.55.22.10 — blocked",  timestamp: daysAgo(0) },
    { id: "al9",  userId: "u32", userName: "IT Support", userRole: "it_support", action: "User added",            target: "Dr. Maria Garcia (Endocrinologist)",        timestamp: daysAgo(1) },
    { id: "al10", userId: "u32", userName: "IT Support", userRole: "it_support", action: "Password reset",        target: "Sophia Martinez (receptionist)",            timestamp: daysAgo(1) },
    { id: "al11", userId: "u32", userName: "IT Support", userRole: "it_support", action: "MFA enabled",            target: "Dr. Omar Hassan",                            timestamp: daysAgo(2) },
    { id: "al12", userId: "u32", userName: "IT Support", userRole: "it_support", action: "Webhook failed",         target: "WhatsApp gateway — retrying",                timestamp: daysAgo(2) },
    { id: "al13", userId: "u32", userName: "IT Support", userRole: "it_support", action: "License expired",        target: "Printer HP-LJ-04 — awaiting renewal",        timestamp: daysAgo(3) },
    { id: "al14", userId: "u32", userName: "IT Support", userRole: "it_support", action: "Device synced",          target: "iPad Dr. Sarah — Veltra v0.2.0",             timestamp: daysAgo(3) },
    // Operational events — admin + operations
    { id: "al15", userId: "u33", userName: "Operations", userRole: "operations", action: "Payment collected",      target: "Ahmed Hassan — $80 (card)",                  timestamp: daysAgo(0) },
    { id: "al16", userId: "u33", userName: "Operations", userRole: "operations", action: "Adjusted stock",         target: "Insulin Glargine: +50 vials",                timestamp: daysAgo(0) },
  ];
}

function makeInitialPrescriptions(): Prescription[] {
  return [
    { id: "rx1", patientId: "p1", patientName: "Ahmed Hassan", doctorId: "u1", doctorName: "Dr. Sarah", medication: "Metformin", dosage: "1000mg", frequency: "Twice daily", duration: "90 days", notes: "Take with meals", timestamp: daysAgo(87), status: "active" },
    { id: "rx2", patientId: "p1", patientName: "Ahmed Hassan", doctorId: "u1", doctorName: "Dr. Sarah", medication: "Lisinopril", dosage: "10mg", frequency: "Once daily", duration: "90 days", timestamp: daysAgo(87), status: "active" },
    { id: "rx3", patientId: "p3", patientName: "Khalid Al-Otaibi", doctorId: "u2", doctorName: "Dr. Omar", medication: "Atorvastatin", dosage: "20mg", frequency: "Once at bedtime", duration: "30 days", timestamp: daysAgo(28), status: "active" },
    { id: "rx4", patientId: "p5", patientName: "Yusuf Al-Ghamdi", doctorId: "u2", doctorName: "Dr. Omar", medication: "Salbutamol Inhaler", dosage: "100mcg", frequency: "As needed", duration: "2 puffs PRN", timestamp: daysAgo(95), status: "active" },
    { id: "rx5", patientId: "p6", patientName: "Mariam Al-Qahtani", doctorId: "u1", doctorName: "Dr. Sarah", medication: "Sumatriptan", dosage: "50mg", frequency: "As needed", duration: "At migraine onset", timestamp: daysAgo(58), status: "active" },
  ];
}

function makeInitialLabResults(): LabResult[] {
  return [
    { id: "lr1", patientId: "p1", patientName: "Ahmed Hassan", testType: "HbA1c", value: "8.4", unit: "%", normalRange: "< 5.7", status: "high", timestamp: daysAgo(0), orderedBy: "Dr. Sarah", notes: "Trending up from 7.9%" },
    { id: "lr2", patientId: "p3", patientName: "Khalid Al-Otaibi", testType: "Total Cholesterol", value: "6.2", unit: "mmol/L", normalRange: "< 5.0", status: "high", timestamp: daysAgo(0), orderedBy: "Dr. Omar" },
    { id: "lr3", patientId: "p3", patientName: "Khalid Al-Otaibi", testType: "LDL", value: "4.1", unit: "mmol/L", normalRange: "< 2.6", status: "high", timestamp: daysAgo(0), orderedBy: "Dr. Omar" },
    { id: "lr4", patientId: "p2", patientName: "Fatima Al-Zahra", testType: "TSH", value: "2.1", unit: "mIU/L", normalRange: "0.4 - 4.0", status: "normal", timestamp: daysAgo(45), orderedBy: "Dr. Sarah" },
    { id: "lr5", patientId: "p5", patientName: "Yusuf Al-Ghamdi", testType: "Peak Flow", value: "480", unit: "L/min", normalRange: "> 500", status: "low", timestamp: daysAgo(95), orderedBy: "Dr. Omar" },
    { id: "lr6", patientId: "p1", patientName: "Ahmed Hassan", testType: "Fasting Glucose", value: "9.2", unit: "mmol/L", normalRange: "3.9 - 5.5", status: "critical", timestamp: daysAgo(0), orderedBy: "Dr. Sarah", notes: "Requires insulin review" },
  ];
}

function makeInitialVitals(): Vital[] {
  return [
    { id: "v1", patientId: "p1", patientName: "Ahmed Hassan", recordedBy: "Mariam Saleh", recordedByRole: "nurse", bp_systolic: 142, bp_diastolic: 88, heartRate: 78, temperature: 36.8, bloodSugar: 9.2, oxygenLevel: 97, weight: 84, timestamp: daysAgo(0) },
    { id: "v2", patientId: "p3", patientName: "Khalid Al-Otaibi", recordedBy: "Mariam Saleh", recordedByRole: "nurse", bp_systolic: 135, bp_diastolic: 82, heartRate: 72, temperature: 36.6, oxygenLevel: 98, weight: 78, timestamp: daysAgo(0) },
    { id: "v3", patientId: "p2", patientName: "Fatima Al-Zahra", recordedBy: "Mariam Saleh", recordedByRole: "nurse", bp_systolic: 118, bp_diastolic: 75, heartRate: 68, temperature: 36.7, oxygenLevel: 99, weight: 62, timestamp: daysAgo(45) },
    { id: "v4", patientId: "p5", patientName: "Yusuf Al-Ghamdi", recordedBy: "Mariam Saleh", recordedByRole: "nurse", bp_systolic: 128, bp_diastolic: 80, heartRate: 82, temperature: 36.9, oxygenLevel: 95, notes: "Mild wheezing", timestamp: daysAgo(95) },
  ];
}

function makeInitialVoiceNotes(): VoiceNote[] {
  return [
    { id: "vn1", patientId: "p1", patientName: "Ahmed Hassan", recordedBy: "Dr. Sarah", durationSec: 42, transcript: "Patient reports increased thirst and urination over past two weeks. Consider insulin adjustment. Follow up in 30 days.", timestamp: daysAgo(0) },
    { id: "vn2", patientId: "p3", patientName: "Khalid Al-Otaibi", recordedBy: "Dr. Omar", durationSec: 28, transcript: "ECG shows normal sinus rhythm. Lipid panel elevated — increase statin dose to 40mg.", timestamp: daysAgo(28) },
  ];
}

function makeInitialLocations(): ClinicLocation[] {
  return [
    { id: "loc1", name: "Riyadh — Olaya", address: "Olaya St, Riyadh, Saudi Arabia", phone: "+966 11 200 3000", isPrimary: true },
    { id: "loc2", name: "Dubai — DIFC", address: "DIFC Gate, Dubai, UAE", phone: "+971 4 200 4000", isPrimary: false },
    { id: "loc3", name: "London — Harley St", address: "Harley St, London, UK", phone: "+44 20 200 5000", isPrimary: false },
    { id: "loc4", name: "Singapore — Marina Bay", address: "Marina Bay, Singapore", phone: "+65 6200 6000", isPrimary: false },
    { id: "loc5", name: "New York — 5th Ave", address: "5th Ave, New York, USA", phone: "+1 212 200 7000", isPrimary: false },
  ];
}

function makeInitialClaims(): InsuranceClaim[] {
  return [
    { id: "cl1", patientId: "p1", patientName: "Ahmed Hassan", provider: "Bupa Arabia", policyNumber: "BUPA-2024-001234", serviceType: "Consultation + Labs", amount: 450, status: "approved", submittedAt: daysAgo(5), resolvedAt: daysAgo(3) },
    { id: "cl2", patientId: "p3", patientName: "Khalid Al-Otaibi", provider: "Tawuniya", policyNumber: "TAW-2024-005678", serviceType: "ECG + Lipid Panel", amount: 680, status: "submitted", submittedAt: daysAgo(1) },
    { id: "cl3", patientId: "p2", patientName: "Fatima Al-Zahra", provider: "MedGulf", policyNumber: "MG-2024-009012", serviceType: "Thyroid Panel", amount: 320, status: "pending", submittedAt: daysAgo(0) },
    { id: "cl4", patientId: "p6", patientName: "Mariam Al-Qahtani", provider: "Bupa Arabia", policyNumber: "BUPA-2024-003456", serviceType: "Migraine Review", amount: 280, status: "paid", submittedAt: daysAgo(30), resolvedAt: daysAgo(25) },
    { id: "cl5", patientId: "p5", patientName: "Yusuf Al-Ghamdi", provider: "Tawuniya", policyNumber: "TAW-2024-007890", serviceType: "Asthma Inhaler", amount: 150, status: "rejected", submittedAt: daysAgo(10), resolvedAt: daysAgo(7), notes: "Policy expired" },
  ];
}

function makeInitialDocuments(): Document[] {
  return [
    { id: "doc1", patientId: "p1", patientName: "Ahmed Hassan", name: "Chest X-Ray.jpg", type: "xray", uploadedBy: "Dr. Sarah", uploadedAt: daysAgo(87), size: "2.4 MB" },
    { id: "doc2", patientId: "p1", patientName: "Ahmed Hassan", name: "HbA1c Report.pdf", type: "lab-report", uploadedBy: "Dr. Sarah", uploadedAt: daysAgo(0), size: "180 KB" },
    { id: "doc3", patientId: "p3", patientName: "Khalid Al-Otaibi", name: "ECG Results.pdf", type: "lab-report", uploadedBy: "Dr. Omar", uploadedAt: daysAgo(28), size: "320 KB" },
    { id: "doc4", patientId: "p2", patientName: "Fatima Al-Zahra", name: "Consent Form.pdf", type: "consent", uploadedBy: "Layla Hassan", uploadedAt: daysAgo(45), size: "95 KB" },
  ];
}

function makeInitialEmailLogs(): EmailLog[] {
  return [
    { id: "em1", to: "ahmed.hassan@email.com", patientName: "Ahmed Hassan", subject: "Appointment reminder — tomorrow 09:00", body: "Dear Ahmed, this is a reminder for your appointment tomorrow at 09:00 with Dr. Sarah.", sentAt: daysAgo(1), type: "reminder" },
    { id: "em2", to: "khalid.otaibi@email.com", patientName: "Khalid Al-Otaibi", subject: "Lab results available", body: "Your lab results are now available. Please review them in your patient portal.", sentAt: daysAgo(0), type: "lab-result" },
    { id: "em3", to: "fatima.zahra@email.com", patientName: "Fatima Al-Zahra", subject: "Payment receipt — $350", body: "Thank you for your payment. Your receipt is attached.", sentAt: daysAgo(45), type: "billing" },
  ];
}

function makeInitialMedications(): Medication[] {
  return [
    { id: "med1", name: "Metformin 1000mg", category: "Diabetic", stock: 240, unit: "tablets", minStock: 100, price: 0.45, expiryDate: "2027-03-15", supplier: "Saudi Pharmaceutical" },
    { id: "med2", name: "Lisinopril 10mg", category: "Cardiac", stock: 180, unit: "tablets", minStock: 80, price: 0.32, expiryDate: "2026-11-20", supplier: "Tabuk Pharma" },
    { id: "med3", name: "Atorvastatin 20mg", category: "Cardiac", stock: 45, unit: "tablets", minStock: 60, price: 0.55, expiryDate: "2026-08-10", supplier: "Saudi Pharmaceutical" },
    { id: "med4", name: "Salbutamol Inhaler", category: "Respiratory", stock: 12, unit: "inhalers", minStock: 15, price: 8.50, expiryDate: "2027-01-30", supplier: "GlaxoSmithKline" },
    { id: "med5", name: "Sumatriptan 50mg", category: "Neurology", stock: 90, unit: "tablets", minStock: 40, price: 1.20, expiryDate: "2026-12-05", supplier: "Tabuk Pharma" },
    { id: "med6", name: "Insulin Glargine", category: "Diabetic", stock: 8, unit: "vials", minStock: 20, price: 25.00, expiryDate: "2026-09-18", supplier: "Sanofi" },
  ];
}

function makeInitialDoctorHours(): DoctorHours[] {
  return [
    { doctorId: "u1", doctorName: "Dr. Sarah Carter", monday: { start: "08:00", end: "17:00" }, tuesday: { start: "08:00", end: "17:00" }, wednesday: { start: "08:00", end: "17:00" }, thursday: { start: "08:00", end: "17:00" }, friday: null, saturday: { start: "09:00", end: "14:00" }, sunday: null },
    { doctorId: "u2", doctorName: "Dr. Emily Chen", monday: { start: "10:00", end: "18:00" }, tuesday: null, wednesday: { start: "10:00", end: "18:00" }, thursday: { start: "10:00", end: "18:00" }, friday: null, saturday: null, sunday: { start: "10:00", end: "15:00" } },
    { doctorId: "u6", doctorName: "Dr. Omar Hassan", monday: { start: "09:00", end: "16:00" }, tuesday: { start: "09:00", end: "16:00" }, wednesday: null, thursday: { start: "09:00", end: "16:00" }, friday: { start: "09:00", end: "13:00" }, saturday: null, sunday: null },
    { doctorId: "u7", doctorName: "Dr. Priya Sharma", monday: { start: "13:00", end: "20:00" }, tuesday: { start: "13:00", end: "20:00" }, wednesday: { start: "13:00", end: "20:00" }, thursday: null, friday: { start: "13:00", end: "20:00" }, saturday: { start: "10:00", end: "16:00" }, sunday: null },
    { doctorId: "u8", doctorName: "Dr. Khalid Al-Rashid", monday: { start: "07:00", end: "15:00" }, tuesday: { start: "07:00", end: "15:00" }, wednesday: { start: "07:00", end: "15:00" }, thursday: { start: "07:00", end: "15:00" }, friday: null, saturday: { start: "08:00", end: "12:00" }, sunday: null },
    { doctorId: "u11", doctorName: "Dr. Lisa Anderson", monday: { start: "09:00", end: "17:00" }, tuesday: { start: "09:00", end: "17:00" }, wednesday: { start: "09:00", end: "17:00" }, thursday: { start: "09:00", end: "17:00" }, friday: { start: "09:00", end: "13:00" }, saturday: null, sunday: null },
    { doctorId: "u12", doctorName: "Dr. Ahmed Al-Farsi", monday: { start: "10:00", end: "18:00" }, tuesday: { start: "10:00", end: "18:00" }, wednesday: null, thursday: { start: "10:00", end: "18:00" }, friday: { start: "10:00", end: "14:00" }, saturday: null, sunday: null },
    { doctorId: "u13", doctorName: "Dr. Maria Garcia", monday: { start: "08:00", end: "16:00" }, tuesday: { start: "08:00", end: "16:00" }, wednesday: { start: "08:00", end: "16:00" }, thursday: null, friday: null, saturday: { start: "09:00", end: "15:00" }, sunday: null },
    { doctorId: "u14", doctorName: "Dr. David Kim", monday: null, tuesday: { start: "11:00", end: "19:00" }, wednesday: { start: "11:00", end: "19:00" }, thursday: { start: "11:00", end: "19:00" }, friday: { start: "11:00", end: "19:00" }, saturday: null, sunday: null },
    { doctorId: "u15", doctorName: "Dr. Fatima Zahra", monday: { start: "09:00", end: "17:00" }, tuesday: { start: "09:00", end: "17:00" }, wednesday: { start: "09:00", end: "17:00" }, thursday: { start: "09:00", end: "17:00" }, friday: null, saturday: { start: "10:00", end: "16:00" }, sunday: null },
    { doctorId: "u16", doctorName: "Dr. Robert Taylor", monday: { start: "08:30", end: "16:30" }, tuesday: { start: "08:30", end: "16:30" }, wednesday: null, thursday: { start: "08:30", end: "16:30" }, friday: { start: "08:30", end: "13:00" }, saturday: null, sunday: null },
    { doctorId: "u17", doctorName: "Dr. Aisha Mohammed", monday: { start: "12:00", end: "20:00" }, tuesday: { start: "12:00", end: "20:00" }, wednesday: { start: "12:00", end: "20:00" }, thursday: { start: "12:00", end: "20:00" }, friday: null, saturday: null, sunday: null },
    { doctorId: "u31", doctorName: "Dr. Sunita Patel", monday: { start: "08:00", end: "14:00" }, tuesday: { start: "08:00", end: "14:00" }, wednesday: { start: "08:00", end: "14:00" }, thursday: { start: "08:00", end: "14:00" }, friday: { start: "08:00", end: "12:00" }, saturday: null, sunday: null },
  ];
}

function makeInitialRecurring(): RecurringPattern[] {
  return [
    { id: "rec1", patientId: "p1", patientName: "Ahmed Hassan", type: "Diabetic Follow-up", frequency: "quarterly", intervalDays: 90, nextDate: daysAhead(3), doctor: "Dr. Sarah", active: true },
    { id: "rec2", patientId: "p3", patientName: "Khalid Al-Otaibi", type: "Cardiac Review", frequency: "monthly", intervalDays: 30, nextDate: daysAhead(2), doctor: "Dr. Omar", active: true },
    { id: "rec3", patientId: "p5", patientName: "Yusuf Al-Ghamdi", type: "Asthma Check", frequency: "quarterly", intervalDays: 120, nextDate: daysAhead(25), doctor: "Dr. Omar", active: true },
  ];
}

function makeInitialWhatsAppMessages(): WhatsAppMessage[] {
  return [
    { id: "wa1", patientId: "p1", patientName: "Ahmed Hassan", direction: "outbound", message: "Reminder: Your appointment is tomorrow at 09:00 with Dr. Sarah. Reply 1 to confirm, 2 to reschedule.", timestamp: daysAgo(1), status: "read", sentBy: "Veltra" },
    { id: "wa2", patientId: "p1", patientName: "Ahmed Hassan", direction: "inbound", message: "1", timestamp: daysAgo(1), status: "read", sentBy: "Ahmed Hassan" },
    { id: "wa3", patientId: "p3", patientName: "Khalid Al-Otaibi", direction: "outbound", message: "Your lab results are ready. Please schedule a follow-up. Track results: v.veltra.health/labs/cl3", timestamp: daysAgo(0), status: "delivered", sentBy: "Veltra" },
    { id: "wa4", patientId: "p2", patientName: "Fatima Al-Zahra", direction: "outbound", message: "Payment receipt sent. Thank you for visiting Veltra Clinic.", timestamp: daysAgo(45), status: "read", sentBy: "Veltra" },
  ];
}

// ===== Specialty dataset builder =====
// Generates a complete, internally coherent demo dataset for any specialty.
// Same engine — different vocabulary per specialty.
const AVATAR_COLORS = [
  "bg-amber-500/15 text-amber-300",
  "bg-rose-500/15 text-rose-300",
  "bg-emerald-500/15 text-emerald-300",
  "bg-violet-500/15 text-violet-300",
  "bg-sky-500/15 text-sky-300",
  "bg-orange-500/15 text-orange-300",
];
const TIERS = ["platinum", "gold", "silver", "bronze"] as const;
const SOURCES = ["whatsapp", "website", "voice", "google", "meta", "referral", "walk-in"] as const;
const CITIES = ["London", "Dubai", "Riyadh", "Singapore", "New York"];
const APPT_TIMES = ["09:00", "09:30", "10:15", "11:00", "11:45", "13:30", "14:15", "15:00", "15:45", "16:30"];
const APPT_STATUSES: AppointmentStatus[] = ["completed", "checked-in", "confirmed", "scheduled", "scheduled", "confirmed"];
const LAB_STATUSES: LabResult["status"][] = ["normal", "high", "low", "normal", "critical", "normal", "high"];

function buildSpecialtyDataset(specialty: SpecialtyConfig) {
  const dr = specialty.doctorName;
  const names = specialty.patientNames;
  const conditions = specialty.conditions;
  const procedures = specialty.procedures;
  const labs = specialty.labTypes;
  const billing = specialty.billingItems;
  const events = specialty.timelineEvents;

  // Patients
  const patients: Patient[] = names.map((name, i) => {
    const id = `p${i + 1}`;
    const condition = conditions[i % conditions.length];
    const tag2 = conditions[(i + 1) % conditions.length];
    const age = 28 + ((i * 7) % 35);
    const gender: "M" | "F" = i % 2 === 0 ? "M" : "F";
    const tier = TIERS[i % TIERS.length];
    const source = SOURCES[i % SOURCES.length];
    const visits = 1 + ((i * 3) % 24);
    const balance: Patient["balance"] = i === 0 ? "overdue" : i === 2 ? "due" : "paid";
    const balanceAmount = balance === "paid" ? undefined : billing[i % billing.length].price;
    const totalRevenue = visits * billing[i % billing.length].price;
    const lastVisitDays = 5 + i * 12;
    const tl: TimelineEvent[] = [
      { id: `${id}-tl1`, type: "booking", timestamp: daysAgo(lastVisitDays + 2), title: "Booked", description: `${procedures[i % procedures.length]} scheduled`, actor: "Veltra" },
      { id: `${id}-tl2`, type: "check-in", timestamp: daysAgo(lastVisitDays), title: "Checked in", description: events[0], actor: "Reception" },
      { id: `${id}-tl3`, type: "diagnosis", timestamp: daysAgo(lastVisitDays), title: "Consultation", description: `Assessed ${condition}`, actor: dr },
      { id: `${id}-tl4`, type: "lab", timestamp: daysAgo(lastVisitDays), title: labs[i % labs.length], description: "Result on file", actor: dr },
      { id: `${id}-tl5`, type: "prescription", timestamp: daysAgo(lastVisitDays), title: "Treatment plan", description: events[events.length - 1] || "Follow-up scheduled", actor: dr },
    ];
    return {
      id, name, age, gender,
      phone: [`+966 50 12${i} ${1000 + i * 7}`, `+971 50 12${i} ${1000 + i * 7}`, `+44 7700 90${i}${i}${i}`][i % 3],
      conditions: [condition, tag2],
      visitPattern: `Usually visits every ${30 + i * 15} days`,
      lastVisit: daysAgo(lastVisitDays),
      nextVisit: i < 4 ? daysAhead(i + 1) : undefined,
      insurance: i === 1 ? "pending" : i === 4 ? "none" : "verified",
      balance,
      balanceAmount,
      preferredChannel: i % 2 === 0 ? "whatsapp" : "call",
      doctor: dr,
      riskScore: 25 + ((i * 13) % 60),
      avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
      timeline: tl,
      loyaltyTier: tier,
      leadSource: source,
      specialty: specialty.name,
      totalVisits: visits,
      totalRevenue,
      tags: [condition, tag2, i === 0 ? "High-Value" : "Active"],
      allergies: [],
      city: CITIES[i % CITIES.length],
      lastContactDays: i,
      status: i === names.length - 1 ? "new" : "active",
    };
  });

  // Appointments — today, mix of statuses
  const appointments: Appointment[] = names.slice(0, 6).map((name, i) => ({
    id: `a${i + 1}`,
    patientId: `p${i + 1}`,
    patientName: name,
    doctor: dr,
    time: APPT_TIMES[i % APPT_TIMES.length],
    date: todayISO,
    duration: 30,
    type: procedures[i % procedures.length],
    status: APPT_STATUSES[i % APPT_STATUSES.length],
    notes: i === 0 ? `${conditions[0]} follow-up` : undefined,
  }));

  // Lab results — using specialty lab types
  const labResults: LabResult[] = names.slice(0, 5).map((name, i) => {
    const testType = labs[i % labs.length];
    const status = LAB_STATUSES[i % LAB_STATUSES.length];
    const valueMap: Record<string, string> = {
      normal: "Normal", high: "Elevated", low: "Below range", critical: "Critical",
    };
    return {
      id: `lr${i + 1}`,
      patientId: `p${i + 1}`,
      patientName: name,
      testType,
      value: valueMap[status] || "Stable",
      unit: "result",
      normalRange: "Within reference",
      status,
      timestamp: daysAgo(i),
      orderedBy: dr,
      notes: i === 0 ? `Trending from last visit — ${conditions[0]}` : undefined,
    };
  });

  // Prescriptions
  const prescriptions: Prescription[] = names.slice(0, 4).map((name, i) => ({
    id: `rx${i + 1}`,
    patientId: `p${i + 1}`,
    patientName: name,
    doctorId: "u1",
    doctorName: dr,
    medication: conditions[i % conditions.length],
    dosage: `${100 + i * 25}mg`,
    frequency: i % 2 === 0 ? "Twice daily" : "Once daily",
    duration: "30 days",
    notes: `For ${conditions[i % conditions.length]}`,
    timestamp: daysAgo(i * 7),
    status: "active" as const,
  }));

  // Vitals
  const vitals: Vital[] = names.slice(0, 4).map((name, i) => ({
    id: `v${i + 1}`,
    patientId: `p${i + 1}`,
    patientName: name,
    recordedBy: "Mariam Saleh",
    recordedByRole: "nurse",
    bp_systolic: 110 + i * 6,
    bp_diastolic: 70 + i * 3,
    heartRate: 68 + i * 4,
    temperature: 36.6 + i * 0.1,
    oxygenLevel: 97 - i,
    weight: 60 + i * 6,
    timestamp: daysAgo(i),
  }));

  // Voice notes
  const voiceNotes: VoiceNote[] = names.slice(0, 3).map((name, i) => ({
    id: `vn${i + 1}`,
    patientId: `p${i + 1}`,
    patientName: name,
    recordedBy: dr,
    durationSec: 28 + i * 12,
    transcript: `${name} reports ${conditions[i % conditions.length].toLowerCase()} ${events[events.length - 1]?.toLowerCase() || "stable"}. Plan: ${procedures[i % procedures.length]} next visit.`,
    timestamp: daysAgo(i),
  }));

  // Activities
  const activities: ActivityEntry[] = [
    { id: `ac${Date.now()}-1`, type: "booking", description: `${names[0]} booked ${procedures[0]}`, timestamp: daysAgo(0), actor: "Veltra" },
    { id: `ac${Date.now()}-2`, type: "check-in", description: `${names[1]} checked in for ${procedures[1] || procedures[0]}`, timestamp: daysAgo(0), actor: "Reception" },
    { id: `ac${Date.now()}-3`, type: "lab", description: `${labs[0]} result received for ${names[0]}`, timestamp: daysAgo(0), actor: dr },
    { id: `ac${Date.now()}-4`, type: "prescription", description: `Treatment plan updated for ${names[2]}`, timestamp: daysAgo(0), actor: dr },
    { id: `ac${Date.now()}-5`, type: "reminder", description: `${events[0] || "Follow-up"} reminder sent to ${names[3]}`, timestamp: daysAgo(0), actor: "Veltra" },
    { id: `ac${Date.now()}-6`, type: "payment", description: `Payment collected from ${names[4]}`, timestamp: daysAgo(0), actor: "Veltra" },
    { id: `ac${Date.now()}-7`, type: "follow-up", description: `${names[0]} ${events[events.length - 1]?.toLowerCase() || "follow-up scheduled"}`, timestamp: daysAgo(1), actor: dr },
    { id: `ac${Date.now()}-8`, type: "note", description: `Voice note recorded for ${names[1]}`, timestamp: daysAgo(1), actor: dr },
  ];

  // Notifications
  const notifications: Notification[] = [
    { id: `n${Date.now()}-1`, type: "warning",  category: "medical",     title: `${labs[0]} flagged`,           description: `${names[0]}'s result needs review`,        timestamp: daysAgo(0), read: false, patientId: "p1", actionLabel: "Review lab", actionTarget: "labs" },
    { id: `n${Date.now()}-2`, type: "action",   category: "appointment", title: "Confirm 3 appointments",       description: `Pending confirmations for today`,          timestamp: daysAgo(0), read: false, actionLabel: "Open schedule", actionTarget: "appointments" },
    { id: `n${Date.now()}-3`, type: "success",  category: "appointment", title: `${names[2]} checked in`,       description: `Room ready`,                                timestamp: daysAgo(0), read: false, patientId: "p3" },
    { id: `n${Date.now()}-4`, type: "info",     category: "medical",     title: `${events[2] || "Follow-up"} reminder`, description: `${names[3]} due in 14 days`,        timestamp: daysAgo(0), read: false, patientId: "p4" },
    { id: `n${Date.now()}-5`, type: "warning",  category: "inventory",   title: "Low stock: Insulin Glargine",  description: `5 vials left (min 10)`,                     timestamp: daysAgo(0), read: false, actionLabel: "Restock", actionTarget: "inventory" },
    { id: `n${Date.now()}-6`, type: "action",   category: "critical",    title: "Drug interaction alert",       description: `Metformin × Penicillin allergy for ${names[0]}`, timestamp: daysAgo(0), read: false, patientId: "p1", actionLabel: "Review prescription", actionTarget: "timeline" },
    { id: `n${Date.now()}-7`, type: "info",     category: "financial",   title: "Insurance claim approved",     description: `Bupa Arabia — $240 for ${names[2]}`,        timestamp: daysAgo(0), read: true, patientId: "p3" },
    { id: `n${Date.now()}-8`, type: "success",  category: "system",      title: "Backup completed",             description: `Daily backup (2.4 GB) successful`,          timestamp: daysAgo(0), read: true },
  ];

  // Insurance claims
  const insuranceClaims: InsuranceClaim[] = names.slice(0, 4).map((name, i) => ({
    id: `cl${i + 1}`,
    patientId: `p${i + 1}`,
    patientName: name,
    provider: ["Bupa Arabia", "Tawuniya", "MedGulf", "Cigna"][i % 4],
    policyNumber: `POL-2026-${1000 + i}`,
    serviceType: procedures[i % procedures.length],
    amount: billing[i % billing.length].price,
    status: (["approved", "submitted", "pending", "paid"] as const)[i % 4],
    submittedAt: daysAgo(i + 1),
    resolvedAt: i === 0 || i === 3 ? daysAgo(i) : undefined,
  }));

  // Documents
  const documents: Document[] = names.slice(0, 4).map((name, i) => ({
    id: `doc${i + 1}`,
    patientId: `p${i + 1}`,
    patientName: name,
    name: `${labs[i % labs.length]} Report.pdf`,
    type: "lab-report" as const,
    uploadedBy: dr,
    uploadedAt: daysAgo(i),
    size: `${100 + i * 60} KB`,
  }));

  // Recurring patterns
  const recurringPatterns: RecurringPattern[] = names.slice(0, 3).map((name, i) => ({
    id: `rec${i + 1}`,
    patientId: `p${i + 1}`,
    patientName: name,
    type: `${conditions[i % conditions.length]} Follow-up`,
    frequency: "quarterly" as const,
    intervalDays: 90,
    nextDate: daysAhead(i + 5),
    doctor: dr,
    active: true,
  }));

  // WhatsApp messages
  const whatsappMessages: WhatsAppMessage[] = [
    { id: `wa${Date.now()}-1`, patientId: "p1", patientName: names[0], direction: "outbound", message: `Reminder: Your appointment is tomorrow at ${APPT_TIMES[0]} with ${dr}. Reply 1 to confirm.`, timestamp: daysAgo(1), status: "read", sentBy: "Veltra" },
    { id: `wa${Date.now()}-2`, patientId: "p1", patientName: names[0], direction: "inbound", message: "1", timestamp: daysAgo(1), status: "read", sentBy: names[0] },
    { id: `wa${Date.now()}-3`, patientId: "p2", patientName: names[1], direction: "outbound", message: `Your ${labs[0]} result is ready. Track: v.veltra.health/labs`, timestamp: daysAgo(0), status: "delivered", sentBy: "Veltra" },
  ];

  // Brief
  const brief: Brief = {
    greeting: "Good morning",
    doctorName: dr,
    dateLabel: today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }),
    priorities: [
      { id: "b1", level: "high", text: `Confirm ${appointments.filter(a => a.status === "scheduled").length} appointments`, done: false },
      { id: "b2", level: "high", text: `Review ${labResults.filter(l => l.status === "critical" || l.status === "high").length} lab results`, done: false },
      { id: "b3", level: "medium", text: `Call back ${names[0]} (balance overdue)`, done: false },
      { id: "b4", level: "low", text: `Approve ${recurringPatterns.length} follow-up reminders`, done: false },
    ],
    expectedRevenue: specialty.brief.revenue,
    firstAppointment: APPT_TIMES[0],
    lastAppointment: APPT_TIMES[Math.min(appointments.length - 1, APPT_TIMES.length - 1)],
    waitingPatients: appointments.filter(a => a.status === "checked-in").length,
    noShowRiskCount: 2,
    completedYesterdayPct: 96,
  };

  // Audit log additions (preserve existing, prepend specialty switch)
  const auditAddition: AuditEntry = {
    id: `al-${Date.now()}`,
    userId: "u1",
    userName: "Sarah Al-Amri",
    userRole: "doctor",
    action: "Switched specialty demo",
    target: specialty.name,
    timestamp: new Date().toISOString(),
  };

  return {
    patients,
    appointments,
    labResults,
    prescriptions,
    vitals,
    voiceNotes,
    activities,
    notifications,
    insuranceClaims,
    documents,
    recurringPatterns,
    whatsappMessages,
    brief,
    auditAddition,
  };
}

const INITIAL_STATE = {
  mode: "demo" as const,
  language: "en" as const,
  users: makeInitialUsers(),
  currentUser: null as User | null,
  auditLog: makeInitialAuditLog(),
  patients: makeInitialPatients(),
  appointments: makeInitialAppointments(),
  notifications: makeInitialNotifications(),
  activities: makeInitialActivities(),
  prescriptions: makeInitialPrescriptions(),
  labResults: makeInitialLabResults(),
  vitals: makeInitialVitals(),
  voiceNotes: makeInitialVoiceNotes(),
  locations: makeInitialLocations(),
  currentLocationId: "loc1" as string,
  insuranceClaims: makeInitialClaims(),
  documents: makeInitialDocuments(),
  emailLogs: makeInitialEmailLogs(),
  medications: makeInitialMedications(),
  doctorHours: makeInitialDoctorHours(),
  recurringPatterns: makeInitialRecurring(),
  whatsappMessages: makeInitialWhatsAppMessages(),
  twoFactorEnabled: false as boolean,
  twoFactorPending: false as boolean,
  activeSpecialty: SPECIALTIES[0] as SpecialtyConfig,
  activeTierId: "platform" as TierId,
  activeTier: SUB_TIERS[0] as TierConfig,
  demoAccessGranted: false as boolean,
  brief: makeInitialBrief(),
  activeView: "brief" as const,
  selectedPatientId: null as string | null,
  hasSeenWelcome: false as boolean,
  undoStack: [] as { label: string; undo: () => void }[],
};

// ===== Store =====
export const useVeltra = create<VeltraState>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,
      brief: makeInitialBrief(),

      setView: (v) => set({ activeView: v, selectedPatientId: v === "timeline" ? get().selectedPatientId : null }),
      selectPatient: (id) => set({ selectedPatientId: id, activeView: id ? "timeline" : "patients" }),

      login: (email, password) => {
        const user = get().users.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );
        if (user) {
          set({ currentUser: user, activeView: "brief" });
          get().logAction("Logged in", `${user.role} session`);
          return true;
        }
        return false;
      },

      loginAs: (userId) => {
        const user = get().users.find((u) => u.id === userId);
        if (user) {
          set({ currentUser: user, activeView: "brief", hasSeenWelcome: true });
          get().logAction("Logged in (demo)", `${user.role} session`);
        }
      },

      logout: () => {
        const u = get().currentUser;
        if (u) get().logAction("Logged out", `${u.role} session`);
        set({
          currentUser: null,
          activeView: "brief",
          selectedPatientId: null,
          undoStack: [],
          // Reset per-session security state on logout
          twoFactorEnabled: false,
          twoFactorPending: false,
        });
      },

      logAction: (action, target) => {
        const u = get().currentUser;
        if (!u) return;
        const entry: AuditEntry = {
          id: `al-${Date.now()}`,
          userId: u.id,
          userName: u.name,
          userRole: u.role,
          action,
          target,
          timestamp: new Date().toISOString(),
        };
        set((s) => ({ auditLog: [entry, ...s.auditLog].slice(0, 50) }));
      },

      addAppointment: ({ patientId, time, type, doctor, notes }) => {
        const patient = get().patients.find((p) => p.id === patientId);
        if (!patient) return;
        get().logAction("Booked appointment", `${patient.name} — ${time}`);
        const newAppt: Appointment = {
          id: `appt-${Date.now()}`,
          patientId,
          patientName: patient.name,
          doctor,
          time,
          date: todayISO,
          duration: 30,
          type,
          status: "scheduled",
          notes: notes || "",
        };
        const newEvent: TimelineEvent = {
          id: `ev-${Date.now()}`,
          type: "booking",
          timestamp: new Date().toISOString(),
          title: "Appointment booked",
          description: `${type} · ${time} · ${doctor}`,
          actor: "Veltra",
        };
        const newActivity: ActivityEntry = {
          id: `act-${Date.now()}`,
          type: "booking",
          description: `Appointment booked — ${patient.name}, ${time}`,
          timestamp: new Date().toISOString(),
          actor: "You",
        };
        const newNotif: Notification = {
          id: `nt-${Date.now()}`,
          type: "success",
          category: "appointment",
          title: "Appointment booked",
          description: `${patient.name} — ${type} at ${time}. Reminder scheduled 24h before.`,
          timestamp: new Date().toISOString(),
          read: false,
          patientId,
          actionLabel: "Open schedule",
          actionTarget: "appointments",
        };

        // Send real notification (non-blocking, falls back to demo).
        // Only send if patient has a usable channel — skip for call/in-person
        // to avoid sending empty emails or wrong-channel messages.
        try {
          const channel = patient.preferredChannel === "whatsapp" ? "whatsapp" :
                          patient.preferredChannel === "sms" ? "sms" : null;
          if (channel && patient.phone) {
            import("./notifications").then(({ sendAppointmentReminder }) => {
              sendAppointmentReminder(
                patient.name,
                patient.phone,
                "",
                time,
                doctor,
                channel
              ).catch(() => {});
            }).catch(() => {});
          }
        } catch {
          // Notifications are optional — appointment still works
        }

        set((s) => ({
          appointments: [...s.appointments, newAppt].sort((a, b) => a.time.localeCompare(b.time)),
          patients: s.patients.map((p) =>
            p.id === patientId
              ? { ...p, nextVisit: todayISO, timeline: [...p.timeline, newEvent] }
              : p
          ),
          activities: [newActivity, ...s.activities],
          notifications: [newNotif, ...s.notifications],
          // recompute expected revenue
          brief: {
            ...s.brief,
            expectedRevenue: s.brief.expectedRevenue + 350, // average appt value
            lastAppointment: time > s.brief.lastAppointment ? time : s.brief.lastAppointment,
          },
        }));
      },

      confirmAppointment: (id) => {
        const appt = get().appointments.find((a) => a.id === id);
        if (!appt) return;
        get().logAction("Confirmed appointment", `${appt.patientName} — ${appt.time}`);
        set((s) => ({
          appointments: s.appointments.map((a) =>
            a.id === id ? { ...a, status: "confirmed" as AppointmentStatus } : a
          ),
          activities: [
            {
              id: `act-${Date.now()}`,
              type: "note",
              description: `Appointment confirmed — ${appt.patientName}`,
              timestamp: new Date().toISOString(),
              actor: get().currentUser?.name || "You",
            },
            ...s.activities,
          ],
        }));
      },

      checkIn: (id) => {
        const appt = get().appointments.find((a) => a.id === id);
        if (!appt) return;
        get().logAction("Checked in patient", `${appt.patientName} — ${appt.time}`);
        set((s) => {
          const a = s.appointments.find((x) => x.id === id);
          if (!a) return s;
          const newEvent: TimelineEvent = {
            id: `ev-${Date.now()}`,
            type: "check-in",
            timestamp: new Date().toISOString(),
            title: "Checked in",
            description: `On time. Wait clock started.`,
            actor: "Reception",
          };
          return {
            appointments: s.appointments.map((x) =>
              x.id === id ? { ...x, status: "checked-in" as AppointmentStatus } : x
            ),
            patients: s.patients.map((p) =>
              p.id === a.patientId ? { ...p, timeline: [...p.timeline, newEvent] } : p
            ),
            brief: { ...s.brief, waitingPatients: s.brief.waitingPatients + 1 },
            activities: [
              {
                id: `act-${Date.now()}`,
                type: "check-in",
                description: `Checked in — ${a.patientName}`,
                timestamp: new Date().toISOString(),
                actor: get().currentUser?.name || "Reception",
              },
              ...s.activities,
            ],
          };
        });
      },

      completeAppointment: (id) => {
        const appt = get().appointments.find((a) => a.id === id);
        if (!appt) return;
        get().logAction("Completed appointment", `${appt.patientName} — ${appt.time}`);
        set((s) => {
          const a = s.appointments.find((x) => x.id === id);
          if (!a) return s;
          const newEvent: TimelineEvent = {
            id: `ev-${Date.now()}`,
            type: "payment",
            timestamp: new Date().toISOString(),
            title: "Visit completed",
            description: `${a.type} · Payment collected.`,
            actor: get().currentUser?.name || "Doctor",
          };
          const isWaiting = a.status === "checked-in";
          return {
            appointments: s.appointments.map((x) =>
              x.id === id ? { ...x, status: "completed" as AppointmentStatus } : x
            ),
            patients: s.patients.map((p) =>
              p.id === a.patientId ? { ...p, timeline: [...p.timeline, newEvent], lastVisit: new Date().toISOString() } : p
            ),
            brief: {
              ...s.brief,
              waitingPatients: isWaiting ? Math.max(0, s.brief.waitingPatients - 1) : s.brief.waitingPatients,
            },
            activities: [
              {
                id: `act-${Date.now()}`,
                type: "payment",
                description: `Visit completed — ${a.patientName}. $350 collected.`,
                timestamp: new Date().toISOString(),
                actor: get().currentUser?.name || "Doctor",
              },
              ...s.activities,
            ],
          };
        });
      },

      cancelAppointment: (id) => {
        const prev = get().appointments.find((a) => a.id === id);
        const prevStatus = prev?.status;
        if (prev) get().logAction("Cancelled appointment", `${prev.patientName} — ${prev.time}`);
        set((s) => ({
          appointments: s.appointments.map((a) =>
            a.id === id ? { ...a, status: "cancelled" as AppointmentStatus } : a
          ),
        }));
        if (prevStatus && prevStatus !== "cancelled") {
          get().pushUndo("Cancel appointment", () => {
            set((s) => ({
              appointments: s.appointments.map((a) =>
                a.id === id ? { ...a, status: prevStatus as AppointmentStatus } : a
              ),
            }));
          });
        }
      },

      markPriorityDone: (id) =>
        set((s) => ({
          brief: {
            ...s.brief,
            priorities: s.brief.priorities.map((p) =>
              p.id === id ? { ...p, done: true } : p
            ),
          },
        })),

      markNotificationRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),

      markAllNotificationsRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),

      setLanguage: (lang) => {
        set({ language: lang });
        if (typeof document !== "undefined") {
          document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
          document.documentElement.lang = lang;
        }
      },

      addPrescription: (input) => {
        const rx: Prescription = { ...input, id: `rx-${Date.now()}`, timestamp: new Date().toISOString(), status: "active" };
        get().logAction("Prescribed medication", `${input.medication} ${input.dosage} — ${input.patientName}`);
        set((s) => ({ prescriptions: [rx, ...s.prescriptions] }));
      },

      cancelPrescription: (id) => {
        const rx = get().prescriptions.find((p) => p.id === id);
        if (rx) get().logAction("Cancelled prescription", `${rx.medication} — ${rx.patientName}`);
        set((s) => ({
          prescriptions: s.prescriptions.map((p) => p.id === id ? { ...p, status: "cancelled" as const } : p),
        }));
      },

      addLabResult: (input) => {
        const lr: LabResult = { ...input, id: `lr-${Date.now()}`, timestamp: new Date().toISOString() };
        get().logAction("Lab result added", `${input.testType} ${input.value}${input.unit} — ${input.patientName}`);
        set((s) => ({ labResults: [lr, ...s.labResults] }));
      },

      addVital: (input) => {
        const v: Vital = { ...input, id: `v-${Date.now()}`, timestamp: new Date().toISOString() };
        get().logAction("Vitals recorded", input.patientName);
        set((s) => ({ vitals: [v, ...s.vitals] }));
      },

      addVoiceNote: (input) => {
        const vn: VoiceNote = { ...input, id: `vn-${Date.now()}`, timestamp: new Date().toISOString() };
        get().logAction("Voice note recorded", `${input.durationSec}s — ${input.patientName}`);
        set((s) => ({ voiceNotes: [vn, ...s.voiceNotes] }));
      },

      addPatient: ({ name, age, gender, phone, conditions, doctor, preferredChannel }) => {
        const colors = ["bg-amber-500/15 text-amber-300", "bg-rose-500/15 text-rose-300", "bg-emerald-500/15 text-emerald-300", "bg-violet-500/15 text-violet-300", "bg-sky-500/15 text-sky-300", "bg-orange-500/15 text-orange-300"];
        const newPatient: Patient = {
          id: `p-${Date.now()}`,
          name, age, gender, phone,
          conditions: conditions || [],
          visitPattern: "New patient",
          lastVisit: new Date().toISOString(),
          insurance: "none",
          balance: "paid",
          preferredChannel,
          doctor,
          riskScore: 0,
          avatarColor: colors[Math.floor(Math.random() * colors.length)],
          timeline: [
            { id: `ev-${Date.now()}`, type: "note", timestamp: new Date().toISOString(), title: "Patient registered", description: "Added to clinic system.", actor: get().currentUser?.name || "System" },
          ],
          loyaltyTier: "bronze",
          leadSource: "walk-in",
          specialty: "General",
          totalVisits: 0,
          totalRevenue: 0,
          tags: ["New"],
          allergies: [],
          city: "Riyadh",
          lastContactDays: 0,
          status: "new",
        };
        get().logAction("Registered patient", name);
        set((s) => ({ patients: [...s.patients, newPatient] }));
      },

      addPatientNote: (patientId, note) => {
        const patient = get().patients.find((p) => p.id === patientId);
        if (!patient) return;
        const event: TimelineEvent = {
          id: `ev-${Date.now()}`,
          type: "note",
          timestamp: new Date().toISOString(),
          title: "Clinical note",
          description: note,
          actor: get().currentUser?.name || "Unknown",
        };
        get().logAction("Added clinical note", patient.name);
        set((s) => ({
          patients: s.patients.map((p) =>
            p.id === patientId ? { ...p, timeline: [...p.timeline, event] } : p
          ),
        }));
      },

      recordPayment: ({ patientId, amount, method, notes }) => {
        const patient = get().patients.find((p) => p.id === patientId);
        if (!patient) return;
        const event: TimelineEvent = {
          id: `ev-${Date.now()}`,
          type: "payment",
          timestamp: new Date().toISOString(),
          title: "Payment collected",
          description: `$${amount} via ${method}${notes ? ` — ${notes}` : ""}`,
          actor: get().currentUser?.name || "Reception",
        };
        get().logAction("Payment collected", `$${amount} — ${patient.name} (${method})`);
        set((s) => ({
          patients: s.patients.map((p) =>
            p.id === patientId
              ? {
                  ...p,
                  timeline: [...p.timeline, event],
                  balance: amount >= (p.balanceAmount || 0) ? "paid" as const : p.balance,
                  balanceAmount: Math.max(0, (p.balanceAmount || 0) - amount),
                }
              : p
          ),
          activities: [
            { id: `act-${Date.now()}`, type: "payment", description: `Payment collected — ${patient.name}, $${amount} (${method})`, timestamp: new Date().toISOString(), actor: get().currentUser?.name || "Reception" },
            ...s.activities,
          ],
        }));
      },

      // ===== Production actions =====

      rescheduleAppointment: (id, newTime, newDate) => {
        const appt = get().appointments.find((a) => a.id === id);
        if (!appt) return;
        get().logAction("Rescheduled appointment", `${appt.patientName} — ${appt.time} → ${newTime}`);
        set((s) => ({
          appointments: s.appointments.map((a) =>
            a.id === id ? { ...a, time: newTime, date: newDate || a.date, status: "confirmed" as AppointmentStatus } : a
          ),
          activities: [
            { id: `act-${Date.now()}`, type: "booking", description: `Rescheduled — ${appt.patientName} to ${newTime}`, timestamp: new Date().toISOString(), actor: get().currentUser?.name || "Unknown" },
            ...s.activities,
          ],
        }));
      },

      switchLocation: (locationId) => {
        const loc = get().locations.find((l) => l.id === locationId);
        if (loc) get().logAction("Switched location", loc.name);
        set({ currentLocationId: locationId });
      },

      addLocation: (input) => {
        const loc: ClinicLocation = { ...input, id: `loc-${Date.now()}` };
        get().logAction("Added location", input.name);
        set((s) => ({ locations: [...s.locations, loc] }));
      },

      submitClaim: (input) => {
        const claim: InsuranceClaim = { ...input, id: `cl-${Date.now()}`, submittedAt: new Date().toISOString(), status: "submitted" };
        get().logAction("Submitted insurance claim", `${input.provider} — ${input.patientName} ($${input.amount})`);
        set((s) => ({ insuranceClaims: [claim, ...s.insuranceClaims] }));
      },

      updateClaimStatus: (id, status) => {
        const claim = get().insuranceClaims.find((c) => c.id === id);
        if (claim) get().logAction(`Claim ${status}`, `${claim.provider} — ${claim.patientName}`);
        set((s) => ({
          insuranceClaims: s.insuranceClaims.map((c) =>
            c.id === id ? { ...c, status, resolvedAt: ["approved", "rejected", "paid"].includes(status) ? new Date().toISOString() : c.resolvedAt } : c
          ),
        }));
      },

      uploadDocument: (input) => {
        const doc: Document = { ...input, id: `doc-${Date.now()}`, uploadedAt: new Date().toISOString() };
        get().logAction("Uploaded document", `${input.name} — ${input.patientName}`);
        set((s) => ({ documents: [doc, ...s.documents] }));
      },

      sendEmail: (input) => {
        const email: EmailLog = { ...input, id: `em-${Date.now()}`, sentAt: new Date().toISOString() };
        get().logAction("Sent email", `${input.subject} — ${input.patientName}`);
        set((s) => ({ emailLogs: [email, ...s.emailLogs] }));
      },

      adjustMedicationStock: (id, delta) => {
        const med = get().medications.find((m) => m.id === id);
        if (med) get().logAction("Adjusted stock", `${med.name}: ${delta > 0 ? "+" : ""}${delta} ${med.unit}`);
        set((s) => ({
          medications: s.medications.map((m) =>
            m.id === id ? { ...m, stock: Math.max(0, m.stock + delta) } : m
          ),
        }));
      },

      addMedication: (input) => {
        const med: Medication = { ...input, id: `med-${Date.now()}` };
        get().logAction("Added medication", input.name);
        set((s) => ({ medications: [...s.medications, med] }));
      },

      updateDoctorHours: (doctorId, hours) => {
        get().logAction("Updated doctor hours", doctorId);
        set((s) => ({
          doctorHours: s.doctorHours.map((d) => d.doctorId === doctorId ? { ...d, ...hours } : d),
        }));
      },

      createRecurring: (input) => {
        const rec: RecurringPattern = { ...input, id: `rec-${Date.now()}`, active: true };
        get().logAction("Created recurring appointment", `${input.type} — ${input.patientName}`);
        set((s) => ({ recurringPatterns: [...s.recurringPatterns, rec] }));
      },

      toggleRecurring: (id) => {
        const rec = get().recurringPatterns.find((r) => r.id === id);
        if (rec) get().logAction("Toggled recurring", `${rec.type} — ${rec.patientName}`);
        set((s) => ({
          recurringPatterns: s.recurringPatterns.map((r) => r.id === id ? { ...r, active: !r.active } : r),
        }));
      },

      sendWhatsApp: (input) => {
        const msg: WhatsAppMessage = {
          id: `wa-${Date.now()}`,
          patientId: input.patientId,
          patientName: input.patientName,
          direction: "outbound",
          message: input.message,
          timestamp: new Date().toISOString(),
          status: "sent",
          sentBy: get().currentUser?.name || "Veltra",
        };
        get().logAction("Sent WhatsApp", `${input.patientName}: "${input.message.substring(0, 50)}..."`);
        set((s) => ({ whatsappMessages: [...s.whatsappMessages, msg] }));
      },

      verifyTwoFactor: (code) => {
        // Demo: any 6-digit code works
        if (code.length === 6) {
          set({ twoFactorPending: false });
          return true;
        }
        return false;
      },

      toggleTwoFactor: () => {
        const enabled = !get().twoFactorEnabled;
        set({ twoFactorEnabled: enabled });
        get().logAction(enabled ? "Enabled 2FA" : "Disabled 2FA", "Security setting");
      },

      setSpecialty: (id) => {
        const specialty = SPECIALTIES.find((s) => s.id === id) || SPECIALTIES[0];
        const dataset = buildSpecialtyDataset(specialty);
        set((s) => ({
          activeSpecialty: specialty,
          patients: dataset.patients,
          appointments: dataset.appointments,
          labResults: dataset.labResults,
          prescriptions: dataset.prescriptions,
          vitals: dataset.vitals,
          voiceNotes: dataset.voiceNotes,
          activities: dataset.activities,
          notifications: dataset.notifications,
          insuranceClaims: dataset.insuranceClaims,
          documents: dataset.documents,
          recurringPatterns: dataset.recurringPatterns,
          whatsappMessages: dataset.whatsappMessages,
          brief: dataset.brief,
          auditLog: [dataset.auditAddition, ...s.auditLog].slice(0, 50),
          selectedPatientId: null,
        }));
        get().logAction("Switched specialty demo", specialty.name);
      },

      setActiveTier: (id) => {
        const tier = SUB_TIERS.find((t) => t.id === id) || SUB_TIERS[0];
        // Build locations based on tier limits
        const locCount = tier.limits.locations === "unlimited" ? 5 : tier.limits.locations;
        const baseCities = [
          { name: "Riyadh — Olaya", address: "Olaya St, Riyadh", phone: "+966 11 200 3000" },
          { name: "Jeddah — Tahlia", address: "Tahlia St, Jeddah", phone: "+966 12 200 4000" },
          { name: "Dubai — DIFC", address: "DIFC Gate, Dubai", phone: "+971 4 200 5000" },
          { name: "London — Harley St", address: "Harley St, London", phone: "+44 20 200 6000" },
          { name: "New York — 5th Ave", address: "5th Ave, New York", phone: "+1 212 200 7000" },
        ];
        const newLocations: ClinicLocation[] = baseCities.slice(0, locCount).map((c, i) => ({
          id: `loc${i + 1}`,
          name: c.name,
          address: c.address,
          phone: c.phone,
          isPrimary: i === 0,
        }));
        set({
          activeTierId: id,
          activeTier: tier,
          locations: newLocations,
          currentLocationId: newLocations[0]?.id || "loc1",
        });
        get().logAction("Switched subscription tier", `${tier.name} · ${locCount} location${locCount > 1 ? "s" : ""}`);
      },

      grantDemoAccess: () => {
        set({ demoAccessGranted: true });
      },

      revokeDemoAccess: () => {
        set({ demoAccessGranted: false });
      },

      resetDemo: () =>
        set({
          ...INITIAL_STATE,
          brief: makeInitialBrief(),
          mode: "demo",
          hasSeenWelcome: true,
        }),

      dismissWelcome: () => set({ hasSeenWelcome: true }),

      pushUndo: (label, undo) =>
        set((s) => ({
          undoStack: [...s.undoStack, { label, undo }].slice(-5),
        })),

      popUndo: () => {
        const stack = get().undoStack;
        if (stack.length === 0) return;
        const last = stack[stack.length - 1];
        last.undo();
        set({ undoStack: stack.slice(0, -1) });
      },

      clearUndo: () => set({ undoStack: [] }),
    }),
    {
      name: "veltra-demo-store",
      version: 10,
      storage: createJSONStorage(() => localStorage),
      merge: (persistedState, currentState) => {
        const merged = { ...currentState, ...(persistedState as object) };
        // CRITICAL: Always use the latest users from code, NOT from localStorage
        // This fixes the old @veltra.demo emails being stuck
        merged.users = makeInitialUsers();
        // Always use latest doctorHours (fixes name mismatches)
        merged.doctorHours = makeInitialDoctorHours();
        // Ensure critical fields are never undefined (migration safety)
        if (!merged.activeTier || !merged.activeTierId) {
          merged.activeTierId = "platform" as TierId;
          merged.activeTier = SUB_TIERS[0] as TierConfig;
        }
        if (merged.demoAccessGranted === undefined) {
          merged.demoAccessGranted = false;
        }
        if (!merged.activeSpecialty) {
          merged.activeSpecialty = SPECIALTIES[0];
        }
        if (!merged.locations || merged.locations.length === 0) {
          merged.locations = makeInitialLocations();
          merged.currentLocationId = "loc1";
        }
        if (!merged.brief) {
          merged.brief = makeInitialBrief();
        }
        if (!merged.users || merged.users.length === 0) {
          merged.users = makeInitialUsers();
        }
        return merged;
      },
      partialize: (s) => ({
        mode: s.mode,
        language: s.language,
        users: s.users,
        currentUser: s.currentUser,
        auditLog: s.auditLog,
        patients: s.patients,
        appointments: s.appointments,
        notifications: s.notifications,
        activities: s.activities,
        prescriptions: s.prescriptions,
        labResults: s.labResults,
        vitals: s.vitals,
        voiceNotes: s.voiceNotes,
        locations: s.locations,
        currentLocationId: s.currentLocationId,
        insuranceClaims: s.insuranceClaims,
        documents: s.documents,
        emailLogs: s.emailLogs,
        medications: s.medications,
        doctorHours: s.doctorHours,
        recurringPatterns: s.recurringPatterns,
        whatsappMessages: s.whatsappMessages,
        twoFactorEnabled: s.twoFactorEnabled,
        activeSpecialty: s.activeSpecialty,
        activeTierId: s.activeTierId,
        activeTier: s.activeTier,
        demoAccessGranted: s.demoAccessGranted,
        brief: s.brief,
        hasSeenWelcome: s.hasSeenWelcome,
        activeView: s.activeView,
        selectedPatientId: s.selectedPatientId,
      }),
    }
  )
);

// ===== Selectors / helpers =====
export function getPatient(id: string | null, patients: Patient[]): Patient | null {
  if (!id) return null;
  return patients.find((p) => p.id === id) || null;
}

export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
