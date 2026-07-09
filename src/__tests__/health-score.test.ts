/**
 * Tests for health-score.ts
 * Verifies the 5-factor Health Score computation.
 */
import { computeHealthScore } from "@/lib/health-score";
import type { Patient, LabResult, Vital, Appointment } from "@/lib/veltra-store";

const mockPatient: Patient = {
  id: "p1",
  name: "Test Patient",
  age: 50,
  gender: "M",
  phone: "+1234567890",
  conditions: ["Diabetes"],
  visitPattern: "Every 90 days",
  lastVisit: new Date(Date.now() - 80 * 86400000).toISOString(), // 80 days ago
  insurance: "verified",
  balance: "paid",
  preferredChannel: "whatsapp",
  doctor: "Dr. Test",
  riskScore: 30,
  avatarColor: "bg-blue-500/15",
  loyaltyTier: "gold",
  leadSource: "referral",
  specialty: "general",
  totalVisits: 10,
  totalRevenue: 5000,
  tags: [],
  allergies: ["Penicillin"],
  city: "Riyadh",
  lastContactDays: 2,
  status: "active",
  timeline: [],
  latestVitals: {
    bp_systolic: 120,
    bp_diastolic: 80,
    heartRate: 72,
    bloodSugar: 5.5,
    oxygenLevel: 98,
    weight: 75,
    timestamp: new Date().toISOString(),
  },
};

const mockLabResults: LabResult[] = [
  { id: "lr1", patientId: "p1", patientName: "Test Patient", testType: "HbA1c", value: "6.5", unit: "%", normalRange: "< 5.7", status: "normal", timestamp: new Date().toISOString(), orderedBy: "Dr. Test" },
];

const mockVitals: Vital[] = [];

const mockAppointments: Appointment[] = [
  { id: "a1", patientId: "p1", patientName: "Test Patient", doctor: "Dr. Test", time: "09:00", date: "2026-07-01", duration: 30, type: "Follow-up", status: "completed" },
  { id: "a2", patientId: "p1", patientName: "Test Patient", doctor: "Dr. Test", time: "10:00", date: "2026-06-01", duration: 30, type: "Follow-up", status: "completed" },
];

describe("computeHealthScore", () => {
  it("should return a score between 0 and 100", () => {
    const result = computeHealthScore(mockPatient, mockLabResults, mockVitals, mockAppointments);
    expect(result.overall).toBeGreaterThanOrEqual(0);
    expect(result.overall).toBeLessThanOrEqual(100);
  });

  it("should return 5 factors", () => {
    const result = computeHealthScore(mockPatient, mockLabResults, mockVitals, mockAppointments);
    expect(result.factors).toHaveLength(5);
    expect(result.factors.map(f => f.label)).toEqual([
      "Vitals Control",
      "Lab Trends",
      "Condition Management",
      "Visit Adherence",
      "Visit Recency",
    ]);
  });

  it("should give high vitals score for normal BP and glucose", () => {
    const result = computeHealthScore(mockPatient, mockLabResults, mockVitals, mockAppointments);
    const vitalsFactor = result.factors.find(f => f.label === "Vitals Control");
    expect(vitalsFactor!.value).toBeGreaterThanOrEqual(80);
    expect(vitalsFactor!.status).toBe("good");
  });

  it("should penalize high blood pressure", () => {
    const hypertensivePatient = {
      ...mockPatient,
      latestVitals: { ...mockPatient.latestVitals!, bp_systolic: 150, bp_diastolic: 95 },
    };
    const result = computeHealthScore(hypertensivePatient, mockLabResults, mockVitals, mockAppointments);
    const vitalsFactor = result.factors.find(f => f.label === "Vitals Control");
    expect(vitalsFactor!.value).toBeLessThan(80);
  });

  it("should penalize high glucose", () => {
    const diabeticPatient = {
      ...mockPatient,
      latestVitals: { ...mockPatient.latestVitals!, bloodSugar: 12.0 },
    };
    const result = computeHealthScore(diabeticPatient, mockLabResults, mockVitals, mockAppointments);
    const vitalsFactor = result.factors.find(f => f.label === "Vitals Control");
    expect(vitalsFactor!.value).toBeLessThan(80);
  });

  it("should detect critical labs", () => {
    const criticalLabs: LabResult[] = [
      { id: "lr1", patientId: "p1", patientName: "Test", testType: "Glucose", value: "15.0", unit: "mmol/L", normalRange: "3.9-5.5", status: "critical", timestamp: new Date().toISOString(), orderedBy: "Dr. Test" },
    ];
    const result = computeHealthScore(mockPatient, criticalLabs, mockVitals, mockAppointments);
    const labFactor = result.factors.find(f => f.label === "Lab Trends");
    expect(labFactor!.value).toBeLessThanOrEqual(30);
    expect(labFactor!.status).toBe("critical");
  });

  it("should give neutral adherence (75) for new patients with no appointments", () => {
    const newPatient = { ...mockPatient, conditions: [] };
    const result = computeHealthScore(newPatient, [], [], []);
    const adherenceFactor = result.factors.find(f => f.label === "Visit Adherence");
    expect(adherenceFactor!.value).toBe(75);
  });

  it("should return a summary string", () => {
    const result = computeHealthScore(mockPatient, mockLabResults, mockVitals, mockAppointments);
    expect(typeof result.summary).toBe("string");
    expect(result.summary.length).toBeGreaterThan(10);
  });

  it("should return a trend value", () => {
    const result = computeHealthScore(mockPatient, mockLabResults, mockVitals, mockAppointments);
    expect(["up", "down", "stable"]).toContain(result.trend);
  });

  it("should handle patient with no vitals recorded", () => {
    const noVitalsPatient = { ...mockPatient, latestVitals: undefined };
    const result = computeHealthScore(noVitalsPatient, mockLabResults, mockVitals, mockAppointments);
    const vitalsFactor = result.factors.find(f => f.label === "Vitals Control");
    expect(vitalsFactor!.value).toBe(70); // no vitals → default 70
  });
});
