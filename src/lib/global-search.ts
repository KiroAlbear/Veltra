/**
 * VELTRA — Global Search Engine
 *
 * Searches across ALL clinic entities from a single query:
 *   - Patients (by name, phone, MRN, condition)
 *   - Appointments (by patient name, time, type, status)
 *   - Lab Results (by test type, patient name, status)
 *   - Prescriptions (by medication, patient name)
 *   - Messages (by content, patient name)
 *   - Documents (by title, patient name)
 *   - Invoices/Billing (by patient name, amount, status)
 *   - Audit Log (by action, target, actor)
 *   - Inventory/Medications (by name, supplier)
 *
 * Returns ranked results grouped by entity type, with relevance scoring.
 *
 * Usage:
 *   const results = globalSearch(query, state);
 *   // → { patients: [...], appointments: [...], labs: [...], ... }
 */
import type {
  Patient,
  Appointment,
  LabResult,
  Prescription,
  Document,
  Medication,
  InsuranceClaim,
  AuditEntry,
} from "./veltra-store";

export interface GlobalSearchState {
  patients: Patient[];
  appointments: Appointment[];
  labResults: LabResult[];
  prescriptions: Prescription[];
  documents: Document[];
  medications: Medication[];
  insuranceClaims: InsuranceClaim[];
  auditLog: AuditEntry[];
}

export interface SearchResult<T = any> {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle: string;
  detail?: string;
  score: number; // 0-100, higher = more relevant
  data: T; // the original entity
  actionLabel: string;
  actionTarget: string;
  actionPayload?: string; // e.g. patientId for selectPatient
}

export type SearchResultType =
  | "patient"
  | "appointment"
  | "lab"
  | "prescription"
  | "document"
  | "medication"
  | "claim"
  | "audit"
  | "message";

export interface GlobalSearchResults {
  query: string;
  total: number;
  byType: Record<SearchResultType, SearchResult[]>;
  top: SearchResult[]; // top 10 across all types, sorted by score
}

const TYPE_META: Record<SearchResultType, { label: string; icon: string }> = {
  patient:      { label: "Patients",      icon: "👤" },
  appointment:  { label: "Appointments",  icon: "📅" },
  lab:          { label: "Lab Results",   icon: "🧪" },
  prescription: { label: "Prescriptions", icon: "💊" },
  document:     { label: "Documents",     icon: "📄" },
  medication:   { label: "Medications",   icon: "💉" },
  claim:        { label: "Insurance",     icon: "🛡️" },
  audit:        { label: "Audit Log",     icon: "🔒" },
  message:      { label: "Messages",      icon: "💬" },
};

export const SEARCH_TYPE_META = TYPE_META;

/** Relevance score 0-100. Higher = better match. */
function scoreMatch(query: string, text: string): number {
  if (!text) return 0;
  const q = query.toLowerCase().trim();
  const t = text.toLowerCase();
  if (!q) return 0;
  if (t === q) return 100;
  if (t.startsWith(q)) return 90;
  if (t.includes(q)) {
    // Earlier in the string = higher score
    const idx = t.indexOf(q);
    return Math.max(60, 80 - idx);
  }
  // Token match — does every query token appear in text?
  const qTokens = q.split(/\s+/);
  const allMatch = qTokens.every((tok) => t.includes(tok));
  if (allMatch) return 70;
  // Partial token match
  const someMatch = qTokens.filter((tok) => t.includes(tok));
  if (someMatch.length > 0) return 30 + (someMatch.length / qTokens.length) * 20;
  return 0;
}

/**
 * Run a global search across all clinic data.
 * Pure function — no side effects.
 */
export function globalSearch(query: string, state: GlobalSearchState): GlobalSearchResults {
  const q = query.trim();
  const empty: GlobalSearchResults = {
    query: q,
    total: 0,
    byType: {
      patient: [], appointment: [], lab: [], prescription: [],
      document: [], medication: [], claim: [], audit: [], message: [],
    },
    top: [],
  };
  if (!q || q.length < 1) return empty;

  const results: SearchResult[] = [];

  // ===== Patients =====
  for (const p of state.patients) {
    const nameScore = scoreMatch(q, p.name);
    const phoneScore = scoreMatch(q, p.phone);
    const mrnScore = scoreMatch(q, p.id.toUpperCase());
    const condScore = Math.max(...p.conditions.map((c) => scoreMatch(q, c)));
    const score = Math.max(nameScore, phoneScore * 0.9, mrnScore * 0.85, condScore * 0.7);
    if (score > 0) {
      results.push({
        id: `pt-${p.id}`,
        type: "patient",
        title: p.name,
        subtitle: `${p.age}${p.gender} · MRN ${p.id.toUpperCase()} · ${p.conditions[0] || "No conditions"}`,
        detail: p.phone,
        score,
        data: p,
        actionLabel: "Open chart",
        actionTarget: "timeline",
        actionPayload: p.id,
      });
    }
  }

  // ===== Appointments =====
  for (const a of state.appointments) {
    const patientScore = scoreMatch(q, a.patientName);
    const typeScore = scoreMatch(q, a.type);
    const timeScore = scoreMatch(q, a.time);
    const statusScore = scoreMatch(q, a.status);
    const score = Math.max(patientScore, typeScore * 0.7, timeScore * 0.5, statusScore * 0.5);
    if (score > 0) {
      results.push({
        id: `ap-${a.id}`,
        type: "appointment",
        title: `${a.patientName} — ${a.time}`,
        subtitle: `${a.type} · ${a.status} · ${a.doctor}`,
        score,
        data: a,
        actionLabel: "Open schedule",
        actionTarget: "appointments",
        actionPayload: a.patientId,
      });
    }
  }

  // ===== Lab Results =====
  for (const lr of state.labResults) {
    const testScore = scoreMatch(q, lr.testType);
    const patientScore = scoreMatch(q, lr.patientName);
    const valueScore = scoreMatch(q, `${lr.value} ${lr.unit}`);
    const statusScore = scoreMatch(q, lr.status);
    const score = Math.max(testScore, patientScore * 0.85, valueScore * 0.6, statusScore * 0.5);
    if (score > 0) {
      results.push({
        id: `lr-${lr.id}`,
        type: "lab",
        title: `${lr.testType} — ${lr.value} ${lr.unit}`,
        subtitle: `${lr.patientName} · ${lr.status} · ordered by ${lr.orderedBy}`,
        detail: `Normal range: ${lr.normalRange}`,
        score,
        data: lr,
        actionLabel: "Open labs",
        actionTarget: "labs",
        actionPayload: lr.patientId,
      });
    }
  }

  // ===== Prescriptions =====
  for (const rx of state.prescriptions) {
    const medScore = scoreMatch(q, rx.medication);
    const patientScore = scoreMatch(q, rx.patientName);
    const doseScore = scoreMatch(q, rx.dosage);
    const score = Math.max(medScore, patientScore * 0.85, doseScore * 0.6);
    if (score > 0) {
      results.push({
        id: `rx-${rx.id}`,
        type: "prescription",
        title: `${rx.medication} ${rx.dosage}`,
        subtitle: `${rx.patientName} · ${rx.frequency} · ${rx.status}`,
        score,
        data: rx,
        actionLabel: "Open chart",
        actionTarget: "timeline",
        actionPayload: rx.patientId,
      });
    }
  }

  // ===== Documents =====
  for (const doc of state.documents) {
    const titleScore = scoreMatch(q, doc.name);
    const patientScore = scoreMatch(q, doc.patientName);
    const typeScore = scoreMatch(q, doc.type);
    const score = Math.max(titleScore, patientScore * 0.85, typeScore * 0.6);
    if (score > 0) {
      results.push({
        id: `doc-${doc.id}`,
        type: "document",
        title: doc.name,
        subtitle: `${doc.patientName} · ${doc.type}`,
        score,
        data: doc,
        actionLabel: "Open documents",
        actionTarget: "documents",
        actionPayload: doc.patientId,
      });
    }
  }

  // ===== Medications / Inventory =====
  for (const med of state.medications) {
    const nameScore = scoreMatch(q, med.name);
    const catScore = scoreMatch(q, med.category);
    const supScore = scoreMatch(q, med.supplier);
    const score = Math.max(nameScore, catScore * 0.6, supScore * 0.5);
    if (score > 0) {
      results.push({
        id: `med-${med.id}`,
        type: "medication",
        title: med.name,
        subtitle: `${med.category} · ${med.stock} ${med.unit} in stock · ${med.supplier}`,
        detail: med.stock <= med.minStock ? "⚠ Low stock" : undefined,
        score,
        data: med,
        actionLabel: "Open inventory",
        actionTarget: "inventory",
      });
    }
  }

  // ===== Insurance Claims =====
  for (const cl of state.insuranceClaims) {
    const patientScore = scoreMatch(q, cl.patientName);
    const providerScore = scoreMatch(q, cl.provider);
    const policyScore = scoreMatch(q, cl.policyNumber);
    const statusScore = scoreMatch(q, cl.status);
    const score = Math.max(patientScore, providerScore * 0.85, policyScore * 0.7, statusScore * 0.5);
    if (score > 0) {
      results.push({
        id: `cl-${cl.id}`,
        type: "claim",
        title: `${cl.provider} — $${cl.amount}`,
        subtitle: `${cl.patientName} · ${cl.status} · ${cl.policyNumber}`,
        score,
        data: cl,
        actionLabel: "Open claims",
        actionTarget: "claims",
        actionPayload: cl.patientId,
      });
    }
  }

  // ===== Audit Log =====
  for (const al of state.auditLog) {
    const actionScore = scoreMatch(q, al.action);
    const targetScore = scoreMatch(q, al.target);
    const userScore = scoreMatch(q, al.userName);
    const score = Math.max(actionScore, targetScore * 0.8, userScore * 0.7);
    if (score > 0) {
      results.push({
        id: `al-${al.id}`,
        type: "audit",
        title: al.action,
        subtitle: `${al.target} · ${al.userName} (${al.userRole})`,
        score,
        data: al,
        actionLabel: "Open audit",
        actionTarget: "audit",
      });
    }
  }

  // ===== Group by type =====
  const byType = empty.byType;
  for (const r of results) {
    byType[r.type].push(r);
  }
  // Sort each group by score
  for (const k of Object.keys(byType) as SearchResultType[]) {
    byType[k].sort((a, b) => b.score - a.score);
  }

  // Top 10 across all types
  const top = [...results].sort((a, b) => b.score - a.score).slice(0, 10);

  return {
    query: q,
    total: results.length,
    byType,
    top,
  };
}
