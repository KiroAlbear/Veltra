/**
 * Tests for drug-safety.ts
 * Verifies drug interaction, allergy, pregnancy, pediatric, renal, and duplicate therapy checks.
 */
import { drugSafetyService } from "@/lib/drug-safety";

describe("DrugSafetyService", () => {
  const baseInput = {
    medication: "Metformin",
    dosage: "1000mg",
    patientAllergies: [] as string[],
    currentMedications: [] as string[],
  };

  describe("check()", () => {
    it("should return safe=true when no conflicts", async () => {
      const result = await drugSafetyService.check(baseInput);
      expect(result.safe).toBe(true);
      expect(result.alerts).toHaveLength(0);
      expect(result.recommendation).toBe("prescribe");
    });

    it("should detect direct allergy match", async () => {
      const result = await drugSafetyService.check({
        ...baseInput,
        medication: "Penicillin",
        patientAllergies: ["Penicillin"],
      });
      expect(result.safe).toBe(false);
      expect(result.alerts.some(a => a.type === "allergy" && a.severity === "critical")).toBe(true);
      expect(result.recommendation).toBe("do_not_prescribe");
    });

    it("should detect Sulfa cross-reactivity", async () => {
      const result = await drugSafetyService.check({
        ...baseInput,
        medication: "Sulfamethoxazole",
        patientAllergies: ["Sulfa"],
      });
      expect(result.alerts.some(a => a.type === "allergy")).toBe(true);
    });

    it("should detect warfarin + aspirin interaction", async () => {
      const result = await drugSafetyService.check({
        ...baseInput,
        medication: "Warfarin",
        currentMedications: ["Aspirin"],
      });
      expect(result.alerts.some(a => a.type === "drug_interaction" && a.severity === "critical")).toBe(true);
    });

    it("should detect metoprolol + verapamil interaction", async () => {
      const result = await drugSafetyService.check({
        ...baseInput,
        medication: "Metoprolol",
        currentMedications: ["Verapamil"],
      });
      expect(result.alerts.some(a => a.type === "drug_interaction" && a.severity === "critical")).toBe(true);
    });

    it("should warn about pregnancy for Category X drugs", async () => {
      const result = await drugSafetyService.check({
        ...baseInput,
        medication: "Warfarin",
        isPregnant: true,
      });
      expect(result.alerts.some(a => a.type === "pregnancy" && a.severity === "critical")).toBe(true);
    });

    it("should warn about isotretinoin in pregnancy", async () => {
      const result = await drugSafetyService.check({
        ...baseInput,
        medication: "Isotretinoin",
        isPregnant: true,
      });
      expect(result.alerts.some(a => a.type === "pregnancy")).toBe(true);
    });

    it("should warn about tetracycline in children under 8", async () => {
      const result = await drugSafetyService.check({
        ...baseInput,
        medication: "Tetracycline",
        patientAge: 5,
      });
      expect(result.alerts.some(a => a.type === "pediatric")).toBe(true);
    });

    it("should NOT warn about tetracycline in adults", async () => {
      const result = await drugSafetyService.check({
        ...baseInput,
        medication: "Tetracycline",
        patientAge: 30,
      });
      expect(result.alerts.some(a => a.type === "pediatric")).toBe(false);
    });

    it("should warn about metformin with high creatinine", async () => {
      const result = await drugSafetyService.check({
        ...baseInput,
        medication: "Metformin",
        creatinine: 150,
      });
      expect(result.alerts.some(a => a.type === "renal")).toBe(true);
    });

    it("should NOT warn about metformin with normal creatinine", async () => {
      const result = await drugSafetyService.check({
        ...baseInput,
        medication: "Metformin",
        creatinine: 80,
      });
      expect(result.alerts.some(a => a.type === "renal")).toBe(false);
    });

    it("should detect duplicate therapy (two statins)", async () => {
      const result = await drugSafetyService.check({
        ...baseInput,
        medication: "Rosuvastatin",
        currentMedications: ["Atorvastatin"],
      });
      expect(result.alerts.some(a => a.type === "duplicate")).toBe(true);
    });

    it("should calculate risk score correctly", async () => {
      const result = await drugSafetyService.check({
        ...baseInput,
        medication: "Warfarin",
        patientAllergies: ["Warfarin"],
        currentMedications: ["Aspirin"],
        isPregnant: true,
      });
      expect(result.riskScore).toBeGreaterThanOrEqual(100);
      expect(result.recommendation).toBe("do_not_prescribe");
    });

    it("should return safe for paracetamol with no conflicts", async () => {
      const result = await drugSafetyService.check({
        ...baseInput,
        medication: "Paracetamol",
      });
      expect(result.safe).toBe(true);
      expect(result.riskScore).toBe(0);
    });
  });
});
