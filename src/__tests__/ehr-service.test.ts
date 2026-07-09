/**
 * Tests for ehr-service.ts
 * Verifies SOAP notes retrieval, medical history, lab trends, and clinical suggestions.
 */
import { getSoapNotes, getMedicalHistory, computeLabTrends, generateClinicalSuggestions, createSoapNote } from "@/lib/ehr-service";
import type { LabResult } from "@/lib/veltra-store";

const mockPatient = {
  id: "p1",
  name: "Ahmed Hassan",
  age: 50,
  gender: "M" as const,
  phone: "+966501234567",
  conditions: ["Type 2 Diabetes Mellitus", "Essential Hypertension"],
  visitPattern: "quarterly",
  lastVisit: "2026-07-01",
  insurance: "verified" as const,
  balance: "paid" as const,
  preferredChannel: "whatsapp" as const,
  doctor: "Dr. Sarah Carter",
  riskScore: 30,
  avatarColor: "bg-blue-500/15",
  loyaltyTier: "gold" as const,
  leadSource: "referral" as const,
  specialty: "general",
  totalVisits: 10,
  totalRevenue: 5000,
  tags: [],
  allergies: ["Sulfa"],
  city: "Riyadh",
  lastContactDays: 2,
  status: "active" as const,
  timeline: [],
};

const mockLabResults: LabResult[] = [
  { id: "lr1", patientId: "p1", patientName: "Ahmed Hassan", testType: "HbA1c", value: "7.1", unit: "%", normalRange: "< 5.7", status: "high", timestamp: "2026-01-15T10:00:00Z", orderedBy: "Dr. Sarah" },
  { id: "lr2", patientId: "p1", patientName: "Ahmed Hassan", testType: "HbA1c", value: "7.9", unit: "%", normalRange: "< 5.7", status: "high", timestamp: "2026-04-10T09:00:00Z", orderedBy: "Dr. Sarah" },
  { id: "lr3", patientId: "p1", patientName: "Ahmed Hassan", testType: "HbA1c", value: "8.4", unit: "%", normalRange: "< 5.7", status: "high", timestamp: "2026-07-01T09:00:00Z", orderedBy: "Dr. Sarah" },
  { id: "lr4", patientId: "p1", patientName: "Ahmed Hassan", testType: "Total Cholesterol", value: "6.2", unit: "mmol/L", normalRange: "< 5.0", status: "high", timestamp: "2026-07-01T09:00:00Z", orderedBy: "Dr. Sarah" },
];

const mockPrescriptions = [
  { id: "rx1", patientId: "p1", patientName: "Ahmed Hassan", doctorId: "u1", doctorName: "Dr. Sarah", medication: "Metformin", dosage: "1000mg", frequency: "BID", duration: "ongoing", timestamp: "2026-01-15", status: "active" },
] as any;

describe("EHR Service", () => {
  describe("getSoapNotes()", () => {
    it("should return SOAP notes for patient p1", () => {
      const notes = getSoapNotes("p1");
      expect(notes.length).toBeGreaterThan(0);
    });

    it("should return notes sorted by date (newest first)", () => {
      const notes = getSoapNotes("p1");
      for (let i = 1; i < notes.length; i++) {
        expect(new Date(notes[i].visitDate).getTime()).toBeLessThanOrEqual(new Date(notes[i - 1].visitDate).getTime());
      }
    });

    it("should have SOAP structure (S/O/A/P)", () => {
      const notes = getSoapNotes("p1");
      const note = notes[0];
      expect(note).toHaveProperty("chiefComplaint"); // S
      expect(note).toHaveProperty("physicalExam");   // O
      expect(note).toHaveProperty("diagnoses");      // A
      expect(note).toHaveProperty("plan");           // P
    });

    it("should have ICD-10 codes", () => {
      const notes = getSoapNotes("p1");
      expect(notes[0].icd10Codes).toBeDefined();
      expect(notes[0].icd10Codes!.length).toBeGreaterThan(0);
    });

    it("should return empty for unknown patient", () => {
      const notes = getSoapNotes("unknown-patient");
      expect(notes).toHaveLength(0);
    });
  });

  describe("getMedicalHistory()", () => {
    it("should return medical history with all sections", () => {
      const history = getMedicalHistory("p1");
      expect(history).toHaveProperty("conditions");
      expect(history).toHaveProperty("surgeries");
      expect(history).toHaveProperty("familyHistory");
      expect(history).toHaveProperty("medicationHistory");
      expect(history).toHaveProperty("allergies");
      expect(history).toHaveProperty("vaccinations");
      expect(history).toHaveProperty("chronicDiseases");
      expect(history).toHaveProperty("procedures");
      expect(history).toHaveProperty("socialHistory");
    });

    it("should have chronic diseases with metrics", () => {
      const history = getMedicalHistory("p1");
      expect(history.chronicDiseases.length).toBeGreaterThan(0);
      const diabetes = history.chronicDiseases.find(d => d.disease.includes("Diabetes"));
      expect(diabetes).toBeDefined();
      expect(diabetes!.metrics).toBeDefined();
      expect(diabetes!.metrics!.length).toBeGreaterThan(0);
    });

    it("should have allergies with severity", () => {
      const history = getMedicalHistory("p1");
      expect(history.allergies.length).toBeGreaterThan(0);
      expect(history.allergies[0].severity).toBeDefined();
    });

    it("should have social history", () => {
      const history = getMedicalHistory("p1");
      expect(history.socialHistory).toBeDefined();
      expect(history.socialHistory!.smokingStatus).toBeDefined();
    });
  });

  describe("computeLabTrends()", () => {
    it("should group labs by test type", () => {
      const trends = computeLabTrends(mockLabResults, "p1");
      const testTypes = trends.map(t => t.testType);
      expect(testTypes).toContain("HbA1c");
      expect(testTypes).toContain("Total Cholesterol");
    });

    it("should compute trend direction (worsening for rising HbA1c)", () => {
      const trends = computeLabTrends(mockLabResults, "p1");
      const hba1cTrend = trends.find(t => t.testType === "HbA1c");
      expect(hba1cTrend).toBeDefined();
      expect(hba1cTrend!.trend).toBe("worsening");
    });

    it("should compute delta percentage from last test", () => {
      const trends = computeLabTrends(mockLabResults, "p1");
      const hba1cTrend = trends.find(t => t.testType === "HbA1c");
      expect(hba1cTrend!.deltaFromLast).toBeDefined();
      expect(hba1cTrend!.deltaFromLast!).toBeGreaterThan(0); // rising
    });

    it("should return last value and status", () => {
      const trends = computeLabTrends(mockLabResults, "p1");
      const hba1cTrend = trends.find(t => t.testType === "HbA1c");
      expect(hba1cTrend!.lastValue).toBe("8.4");
      expect(hba1cTrend!.lastStatus).toBe("high");
    });

    it("should return empty for patient with no labs", () => {
      const trends = computeLabTrends([], "p1");
      expect(trends).toHaveLength(0);
    });
  });

  describe("generateClinicalSuggestions()", () => {
    it("should generate suggestions for uncontrolled diabetic patient", () => {
      const history = getMedicalHistory("p1");
      const trends = computeLabTrends(mockLabResults, "p1");
      const suggestions = generateClinicalSuggestions(mockPatient as any, history, trends, mockPrescriptions);

      expect(suggestions.length).toBeGreaterThan(0);
    });

    it("should include allergy alert when patient has allergies", () => {
      const history = getMedicalHistory("p1");
      const trends = computeLabTrends(mockLabResults, "p1");
      const suggestions = generateClinicalSuggestions(mockPatient as any, history, trends, mockPrescriptions);

      const allergyAlert = suggestions.find(s => s.title.includes("allergy") || s.title.includes("Allergy"));
      expect(allergyAlert).toBeDefined();
      expect(allergyAlert!.priority).toBe("urgent");
    });

    it("should include medication review for uncontrolled diabetes", () => {
      const history = getMedicalHistory("p1");
      const trends = computeLabTrends(mockLabResults, "p1");
      const suggestions = generateClinicalSuggestions(mockPatient as any, history, trends, mockPrescriptions);

      const medReview = suggestions.find(s => s.type === "medication_review" && s.title.includes("Diabetes"));
      expect(medReview).toBeDefined();
    });

    it("should include retinal exam referral for diabetic", () => {
      const history = getMedicalHistory("p1");
      const trends = computeLabTrends(mockLabResults, "p1");
      const suggestions = generateClinicalSuggestions(mockPatient as any, history, trends, mockPrescriptions);

      const referral = suggestions.find(s => s.type === "referral" && s.title.includes("retinal"));
      expect(referral).toBeDefined();
    });

    it("should have confidence scores between 0 and 1", () => {
      const history = getMedicalHistory("p1");
      const trends = computeLabTrends(mockLabResults, "p1");
      const suggestions = generateClinicalSuggestions(mockPatient as any, history, trends, mockPrescriptions);

      for (const s of suggestions) {
        expect(s.confidence).toBeGreaterThanOrEqual(0);
        expect(s.confidence).toBeLessThanOrEqual(1);
      }
    });
  });

  describe("createSoapNote()", () => {
    it("should create a SOAP note with draft status", () => {
      const note = createSoapNote({
        patientId: "p1",
        patientName: "Test",
        visitDate: new Date().toISOString(),
        doctorId: "u1",
        doctorName: "Dr. Test",
        chiefComplaint: "Headache",
        historyOfPresentIllness: "2 weeks",
        diagnoses: [],
        plan: "Rest",
      });

      expect(note.status).toBe("draft");
      expect(note.id).toBeDefined();
      expect(note.chiefComplaint).toBe("Headache");
    });
  });
});
