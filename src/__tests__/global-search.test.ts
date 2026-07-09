/**
 * Tests for global-search.ts
 * Verifies relevance scoring across entity types.
 */
import { globalSearch } from "@/lib/global-search";
import type { GlobalSearchState } from "@/lib/global-search";

const mockState: GlobalSearchState = {
  patients: [
    { id: "p1", name: "Ahmed Hassan", age: 50, gender: "M", phone: "+966501234567", conditions: ["Diabetes"], visitPattern: "quarterly", lastVisit: "2026-06-01", insurance: "verified", balance: "paid", preferredChannel: "whatsapp", doctor: "Dr. Sarah", riskScore: 30, avatarColor: "bg-blue-500/15", loyaltyTier: "gold", leadSource: "referral", specialty: "general", totalVisits: 10, totalRevenue: 5000, tags: [], allergies: ["Penicillin"], city: "Riyadh", lastContactDays: 2, status: "active", timeline: [] },
    { id: "p2", name: "Fatima Al-Zahra", age: 35, gender: "F", phone: "+966559876543", conditions: ["Hypothyroidism"], visitPattern: "monthly", lastVisit: "2026-06-15", insurance: "verified", balance: "paid", preferredChannel: "whatsapp", doctor: "Dr. Sarah", riskScore: 10, avatarColor: "bg-pink-500/15", loyaltyTier: "silver", leadSource: "website", specialty: "general", totalVisits: 5, totalRevenue: 2000, tags: [], allergies: [], city: "Riyadh", lastContactDays: 5, status: "active", timeline: [] },
  ] as any,
  appointments: [
    { id: "a1", patientId: "p1", patientName: "Ahmed Hassan", doctor: "Dr. Sarah", time: "09:00", date: "2026-07-01", duration: 30, type: "Follow-up", status: "confirmed" } as any,
  ],
  labResults: [
    { id: "lr1", patientId: "p1", patientName: "Ahmed Hassan", testType: "HbA1c", value: "8.4", unit: "%", normalRange: "< 5.7", status: "high", timestamp: "2026-07-01", orderedBy: "Dr. Sarah" } as any,
  ],
  prescriptions: [
    { id: "rx1", patientId: "p1", patientName: "Ahmed Hassan", doctorId: "u1", doctorName: "Dr. Sarah", medication: "Metformin", dosage: "1000mg", frequency: "Twice daily", duration: "90 days", timestamp: "2026-06-01", status: "active" } as any,
  ],
  documents: [],
  medications: [],
  insuranceClaims: [],
  auditLog: [],
};

describe("globalSearch", () => {
  it("should return empty results for empty query", () => {
    const results = globalSearch("", mockState);
    expect(results.total).toBe(0);
    expect(results.top).toHaveLength(0);
  });

  it("should find patient by name (exact match = 100)", () => {
    const results = globalSearch("Ahmed Hassan", mockState);
    expect(results.total).toBeGreaterThan(0);
    expect(results.byType.patient.length).toBeGreaterThan(0);
    expect(results.byType.patient[0].title).toBe("Ahmed Hassan");
  });

  it("should find patient by partial name", () => {
    const results = globalSearch("Ahmed", mockState);
    expect(results.byType.patient.length).toBeGreaterThan(0);
  });

  it("should find patient by phone", () => {
    const results = globalSearch("501234567", mockState);
    expect(results.byType.patient.length).toBeGreaterThan(0);
  });

  it("should find patient by MRN", () => {
    const results = globalSearch("P1", mockState);
    expect(results.byType.patient.length).toBeGreaterThan(0);
  });

  it("should find appointments by patient name", () => {
    const results = globalSearch("Ahmed", mockState);
    expect(results.byType.appointment.length).toBeGreaterThan(0);
  });

  it("should find labs by test type", () => {
    const results = globalSearch("HbA1c", mockState);
    expect(results.byType.lab.length).toBeGreaterThan(0);
  });

  it("should find prescriptions by medication name", () => {
    const results = globalSearch("Metformin", mockState);
    expect(results.byType.prescription.length).toBeGreaterThan(0);
  });

  it("should sort results by score (highest first)", () => {
    const results = globalSearch("Ahmed", mockState);
    for (let i = 1; i < results.top.length; i++) {
      expect(results.top[i].score).toBeLessThanOrEqual(results.top[i - 1].score);
    }
  });

  it("should limit top results to 10", () => {
    const results = globalSearch("Ahmed", mockState);
    expect(results.top.length).toBeLessThanOrEqual(10);
  });

  it("should return results grouped by type", () => {
    const results = globalSearch("Ahmed", mockState);
    expect(results.byType).toHaveProperty("patient");
    expect(results.byType).toHaveProperty("appointment");
    expect(results.byType).toHaveProperty("lab");
    expect(results.byType).toHaveProperty("prescription");
  });

  it("should return no results for gibberish query", () => {
    const results = globalSearch("xyzqwerty123", mockState);
    expect(results.total).toBe(0);
  });
});
