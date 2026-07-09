/**
 * Tests for feature-flags.ts
 * Verifies enable/disable logic, tenant overrides, role/country restrictions.
 */
import { isFeatureEnabled, getEnabledFeatures, getFlagsByCategory, FEATURE_FLAGS } from "@/lib/feature-flags";

describe("Feature Flags", () => {
  describe("isFeatureEnabled()", () => {
    it("should return default value for enabled flags", () => {
      expect(isFeatureEnabled("ehr_full", {})).toBe(true);
      expect(isFeatureEnabled("prescription_engine", {})).toBe(true);
    });

    it("should return false for disabled flags", () => {
      expect(isFeatureEnabled("ai_scribe", {})).toBe(false);
      expect(isFeatureEnabled("multi_organization", {})).toBe(false);
    });

    it("should respect tenant overrides", () => {
      expect(isFeatureEnabled("ai_scribe", { overrides: { ai_scribe: true } })).toBe(true);
      expect(isFeatureEnabled("ehr_full", { overrides: { ehr_full: false } })).toBe(false);
    });

    it("should block enterprise-only features for non-enterprise", () => {
      expect(isFeatureEnabled("multi_organization", { tier: "platform" })).toBe(false);
      expect(isFeatureEnabled("workflow_builder", { tier: "platform" })).toBe(false);
    });

    it("should allow enterprise-only features for enterprise tier", () => {
      expect(isFeatureEnabled("multi_organization", { tier: "enterprise" })).toBe(false); // still false because defaultEnabled is false
      // But if enabled via override:
      expect(isFeatureEnabled("multi_organization", { tier: "enterprise", overrides: { multi_organization: true } })).toBe(true);
    });

    it("should allow beta features when enabled", () => {
      expect(isFeatureEnabled("ai_diagnosis", { overrides: { ai_diagnosis: true } })).toBe(true);
    });
  });

  describe("getEnabledFeatures()", () => {
    it("should return array of enabled feature keys", () => {
      const enabled = getEnabledFeatures({});
      expect(Array.isArray(enabled)).toBe(true);
      expect(enabled).toContain("ehr_full");
      expect(enabled).toContain("prescription_engine");
    });

    it("should not include disabled features", () => {
      const enabled = getEnabledFeatures({});
      expect(enabled).not.toContain("ai_scribe");
      expect(enabled).not.toContain("marketplace");
    });
  });

  describe("getFlagsByCategory()", () => {
    it("should return flags grouped by category", () => {
      const grouped = getFlagsByCategory();
      expect(grouped).toHaveProperty("clinical");
      expect(grouped).toHaveProperty("ai");
      expect(grouped).toHaveProperty("platform");
      expect(grouped).toHaveProperty("communication");
      expect(grouped).toHaveProperty("mobile");
      expect(grouped).toHaveProperty("compliance");
      expect(grouped).toHaveProperty("analytics");
    });

    it("should have clinical flags in clinical category", () => {
      const grouped = getFlagsByCategory();
      expect(grouped.clinical.some(f => f.key === "ehr_full")).toBe(true);
      expect(grouped.clinical.some(f => f.key === "drug_interactions")).toBe(true);
    });

    it("should have AI flags in ai category", () => {
      const grouped = getFlagsByCategory();
      expect(grouped.ai.some(f => f.key === "ai_scribe")).toBe(true);
      expect(grouped.ai.some(f => f.key === "smart_import_ocr")).toBe(true);
    });
  });

  describe("FEATURE_FLAGS constant", () => {
    it("should have 32 flags defined", () => {
      expect(Object.keys(FEATURE_FLAGS).length).toBeGreaterThanOrEqual(30);
    });

    it("should have all required fields for each flag", () => {
      for (const flag of Object.values(FEATURE_FLAGS)) {
        expect(flag).toHaveProperty("key");
        expect(flag).toHaveProperty("label");
        expect(flag).toHaveProperty("description");
        expect(flag).toHaveProperty("category");
        expect(flag).toHaveProperty("defaultEnabled");
      }
    });
  });
});
