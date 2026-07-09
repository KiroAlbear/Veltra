/**
 * VELTRA — Drug Interaction & Safety Service
 *
 * Real-time drug safety checking using:
 *   1. openFDA API (free, no key required) — drug interactions, adverse events
 *   2. RxNorm API (free, NIH) — drug name normalization, ingredients
 *   3. Built-in rule database — common interactions (always available)
 *
 * Checks performed when prescribing:
 *   - Drug-drug interactions (current medications × new medication)
 *   - Drug-allergy interactions (patient allergies × new medication)
 *   - Pregnancy warnings (if patient is pregnant)
 *   - Pediatric dosing (if patient is < 12 years)
 *   - Renal dosing adjustments (if creatinine/renal function available)
 *   - Duplicate therapy (same class already prescribed)
 *
 * Usage:
 *   import { drugSafetyService } from "@/lib/drug-safety";
 *   const result = await drugSafetyService.check({
 *     medication: "Metformin",
 *     patientAllergies: ["Sulfa"],
 *     currentMedications: ["Lisinopril"],
 *   });
 */

export interface SafetyCheckInput {
  medication: string;
  dosage?: string;
  patientAllergies: string[];
  currentMedications: string[];
  patientAge?: number;
  patientGender?: "M" | "F";
  isPregnant?: boolean;
  creatinine?: number; // µmol/L
}

export type AlertSeverity = "info" | "warning" | "critical";

export interface SafetyAlert {
  type: "drug_interaction" | "allergy" | "pregnancy" | "pediatric" | "renal" | "duplicate" | "dosage";
  severity: AlertSeverity;
  title: string;
  description: string;
  evidence: string;
  suggestion: string;
  /** The interacting drug or allergen */
  interactingWith?: string;
  /** Source: "openFDA" | "RxNorm" | "builtin" */
  source: "openfda" | "rxnorm" | "builtin";
}

export interface SafetyCheckResult {
  safe: boolean;
  alerts: SafetyAlert[];
  /** Overall risk score 0-100 (higher = more dangerous) */
  riskScore: number;
  /** Recommended action */
  recommendation: "prescribe" | "prescribe_with_caution" | "review_before_prescribing" | "do_not_prescribe";
  checkedAt: string;
  provider: "openfda" | "builtin" | "demo";
}

class DrugSafetyService {
  /**
   * Check a medication against patient's allergies, current meds, and conditions.
   */
  async check(input: SafetyCheckInput): Promise<SafetyCheckResult> {
    const alerts: SafetyAlert[] = [];

    // 1. Check allergies (always — built-in rules)
    const allergyAlerts = this.checkAllergies(input.medication, input.patientAllergies);
    alerts.push(...allergyAlerts);

    // 2. Check drug-drug interactions
    const interactionAlerts = await this.checkInteractions(input.medication, input.currentMedications);
    alerts.push(...interactionAlerts);

    // 3. Check pregnancy
    if (input.isPregnant) {
      const pregAlert = this.checkPregnancy(input.medication);
      if (pregAlert) alerts.push(pregAlert);
    }

    // 4. Check pediatric dosing
    if (input.patientAge !== undefined && input.patientAge < 12) {
      const pedAlert = this.checkPediatric(input.medication, input.patientAge);
      if (pedAlert) alerts.push(pedAlert);
    }

    // 5. Check renal function
    if (input.creatinine !== undefined && input.creatinine > 110) {
      const renalAlert = this.checkRenal(input.medication, input.creatinine);
      if (renalAlert) alerts.push(renalAlert);
    }

    // 6. Check duplicate therapy
    const duplicateAlerts = this.checkDuplicateTherapy(input.medication, input.currentMedications);
    alerts.push(...duplicateAlerts);

    // Calculate risk score
    const riskScore = this.calculateRiskScore(alerts);

    // Determine recommendation
    const hasCritical = alerts.some((a) => a.severity === "critical");
    const hasWarning = alerts.some((a) => a.severity === "warning");
    const recommendation: SafetyCheckResult["recommendation"] =
      hasCritical ? "do_not_prescribe" :
      riskScore >= 60 ? "review_before_prescribing" :
      hasWarning ? "prescribe_with_caution" :
      "prescribe";

    return {
      safe: !hasCritical,
      alerts,
      riskScore,
      recommendation,
      checkedAt: new Date().toISOString(),
      provider: "builtin",
    };
  }

  /**
   * Check if medication conflicts with patient allergies.
   */
  private checkAllergies(medication: string, allergies: string[]): SafetyAlert[] {
    const alerts: SafetyAlert[] = [];
    const med = medication.toLowerCase();

    for (const allergy of allergies) {
      const allergen = allergy.toLowerCase();

      // Direct name match
      if (med.includes(allergen)) {
        alerts.push({
          type: "allergy",
          severity: "critical",
          title: `Allergy conflict: ${medication} × ${allergy}`,
          description: `Patient is allergic to ${allergy}. Prescribing ${medication} may cause an allergic reaction.`,
          evidence: `Patient allergy: ${allergy}`,
          suggestion: `Choose an alternative medication from a different class.`,
          interactingWith: allergy,
          source: "builtin",
        });
        continue;
      }

      // Check drug class matches
      const classMatch = this.checkAllergyClass(med, allergen);
      if (classMatch) {
        alerts.push({
          type: "allergy",
          severity: "critical",
          title: `Allergy conflict: ${medication} is in the ${classMatch} class`,
          description: `Patient is allergic to ${allergy}, which is in the same drug class as ${medication}.`,
          evidence: `${allergy} and ${medication} are both ${classMatch}`,
          suggestion: `Use a medication from a different drug class.`,
          interactingWith: allergy,
          source: "builtin",
        });
      }
    }

    return alerts;
  }

  /**
   * Check drug class for cross-reactivity.
   */
  private checkAllergyClass(med: string, allergen: string): string | null {
    const classes: Record<string, string[]> = {
      "Penicillin": ["penicillin", "amoxicillin", "ampicillin", "augmentin", "amoxil"],
      "Sulfa": ["sulfamethoxazole", "sulfasalazine", "trimethoprim", "bactrim", "septra", "sulfa"],
      "NSAID": ["ibuprofen", "naproxen", "diclofenac", "aspirin", "celecoxib", "ketorolac"],
      "Statins": ["atorvastatin", "simvastatin", "rosuvastatin", "pravastatin"],
    };

    for (const [className, drugs] of Object.entries(classes)) {
      if (drugs.some((d) => allergen.includes(d)) && drugs.some((d) => med.includes(d))) {
        return className;
      }
    }
    return null;
  }

  /**
   * Check drug-drug interactions via openFDA API + built-in rules.
   */
  private async checkInteractions(medication: string, currentMedications: string[]): Promise<SafetyAlert[]> {
    const alerts: SafetyAlert[] = [];
    const med = medication.toLowerCase();

    // Built-in interaction rules (always available)
    const builtinInteractions: Record<string, { with: string[]; severity: AlertSeverity; description: string }> = {
      "metformin": {
        with: ["contrast dye", "alcohol"],
        severity: "warning",
        description: "Metformin + contrast dye increases risk of lactic acidosis. Hold metformin 48h before/after IV contrast.",
      },
      "warfarin": {
        with: ["aspirin", "ibuprofen", "amiodarone", "fluconazole", "metronidazole"],
        severity: "critical",
        description: "Warfarin interactions can cause life-threatening bleeding.",
      },
      "lisinopril": {
        with: ["potassium", "spironolactone"],
        severity: "warning",
        description: "ACE inhibitors + potassium-sparing drugs can cause hyperkalemia.",
      },
      "metoprolol": {
        with: ["verapamil", "diltiazem"],
        severity: "critical",
        description: "Beta-blockers + calcium channel blockers can cause severe bradycardia.",
      },
      "ciprofloxacin": {
        with: ["theophylline", "warfarin"],
        severity: "warning",
        description: "Ciprofloxacin increases levels of theophylline and warfarin.",
      },
    };

    // Check built-in rules
    for (const [drug, interaction] of Object.entries(builtinInteractions)) {
      if (med.includes(drug)) {
        for (const currentMed of currentMedications) {
          const current = currentMed.toLowerCase();
          if (interaction.with.some((w) => current.includes(w.toLowerCase()))) {
            alerts.push({
              type: "drug_interaction",
              severity: interaction.severity,
              title: `Interaction: ${medication} × ${currentMed}`,
              description: interaction.description,
              evidence: `Built-in drug interaction database`,
              suggestion: interaction.severity === "critical"
                ? "Do not prescribe together. Choose alternative."
                : "Monitor closely. Consider dose adjustment.",
              interactingWith: currentMed,
              source: "builtin",
            });
          }
        }
      }
    }

    // Try openFDA API (free, no key needed)
    try {
      const openFdaAlerts = await this.checkOpenFda(medication, currentMedications);
      alerts.push(...openFdaAlerts);
    } catch (error) {
      // openFDA is optional — built-in rules are sufficient for demo
      console.log("[DrugSafety] openFDA unavailable, using built-in rules only");
    }

    return alerts;
  }

  /**
   * Query openFDA API for drug interactions.
   * Free API — no key required.
   */
  private async checkOpenFda(medication: string, currentMedications: string[]): Promise<SafetyAlert[]> {
    const alerts: SafetyAlert[] = [];

    for (const currentMed of currentMedications) {
      try {
        const url = `https://api.fda.gov/drug/event.json?search=patient.drug.medicinalproduct:"${medication}"+AND+patient.drug.medicinalproduct:"${currentMed}"&limit=5`;
        const response = await fetch(url);

        if (!response.ok) continue;

        const data = await response.json();
        const eventCount = data.meta?.results?.total || 0;

        if (eventCount > 50) {
          alerts.push({
            type: "drug_interaction",
            severity: eventCount > 200 ? "warning" : "info",
            title: `Adverse events reported: ${medication} + ${currentMed}`,
            description: `${eventCount} adverse event reports in FDA database for this combination.`,
            evidence: `openFDA: ${eventCount} reports`,
            suggestion: "Review patient for risk factors. Monitor for adverse effects.",
            interactingWith: currentMed,
            source: "openfda",
          });
        }
      } catch {
        // Skip this med if FDA query fails
      }
    }

    return alerts;
  }

  /**
   * Check pregnancy category for medication.
   */
  private checkPregnancy(medication: string): SafetyAlert | null {
    const med = medication.toLowerCase();
    const pregnancyUnsafe: Record<string, { category: string; reason: string }> = {
      "warfarin": { category: "X", reason: "Known teratogen. Causes fetal warfarin syndrome." },
      "isotretinoin": { category: "X", reason: "Severe birth defects. Absolutely contraindicated in pregnancy." },
      "methotrexate": { category: "X", reason: "Abortifacient and teratogenic." },
      "lisinopril": { category: "D", reason: "ACE inhibitors can cause fetal harm in 2nd/3rd trimester." },
      "enalapril": { category: "D", reason: "ACE inhibitors can cause fetal harm in 2nd/3rd trimester." },
      "ibuprofen": { category: "C", reason: "NSAIDs should be avoided especially in 3rd trimester." },
      "tetracycline": { category: "D", reason: "Effects on fetal bone and teeth development." },
    };

    for (const [drug, info] of Object.entries(pregnancyUnsafe)) {
      if (med.includes(drug)) {
        return {
          type: "pregnancy",
          severity: info.category === "X" ? "critical" : "warning",
          title: `Pregnancy warning: ${medication} (Category ${info.category})`,
          description: info.reason,
          evidence: `Pregnancy category ${info.category}`,
          suggestion: info.category === "X"
            ? "Do not prescribe. Choose a pregnancy-safe alternative."
            : "Use only if benefit outweighs risk. Consider alternative.",
          source: "builtin",
        };
      }
    }

    return null;
  }

  /**
   * Check pediatric dosing safety.
   */
  private checkPediatric(medication: string, age: number): SafetyAlert | null {
    const med = medication.toLowerCase();

    const pediatricUnsafe: Record<string, { minAge: number; reason: string }> = {
      "tetracycline": { minAge: 8, reason: "Tetracyclines cause tooth discoloration in children < 8 years." },
      "ciprofloxacin": { minAge: 18, reason: "Fluoroquinolones risk cartilage damage in children/adolescents." },
      "aspirin": { minAge: 16, reason: "Aspirin risk of Reye's syndrome in children/teens with viral illness." },
      "ibuprofen": { minAge: 0.25, reason: "Avoid ibuprofen in infants < 3 months (risk of renal toxicity)." },
    };

    for (const [drug, info] of Object.entries(pediatricUnsafe)) {
      if (med.includes(drug) && age < info.minAge) {
        return {
          type: "pediatric",
          severity: "warning",
          title: `Pediatric warning: ${medication} not recommended for age ${age}`,
          description: info.reason,
          evidence: `Patient age: ${age} (minimum recommended: ${info.minAge})`,
          suggestion: "Use a pediatric-appropriate alternative.",
          source: "builtin",
        };
      }
    }

    return null;
  }

  /**
   * Check renal dosing adjustments.
   */
  private checkRenal(medication: string, creatinine: number): SafetyAlert | null {
    const med = medication.toLowerCase();

    const renalAdjusted: Record<string, { maxCreatinine: number; reason: string }> = {
      "metformin": { maxCreatinine: 130, reason: "Metformin contraindicated if renal impairment (creatinine > 130 µmol/L in men). Risk of lactic acidosis." },
      "allopurinol": { maxCreatinine: 110, reason: "Allopurinol dose must be reduced in renal impairment." },
      "gabapentin": { maxCreatinine: 110, reason: "Gabapentin requires dose adjustment in renal impairment." },
    };

    for (const [drug, info] of Object.entries(renalAdjusted)) {
      if (med.includes(drug) && creatinine > info.maxCreatinine) {
        return {
          type: "renal",
          severity: "warning",
          title: `Renal dosing required: ${medication}`,
          description: info.reason,
          evidence: `Patient creatinine: ${creatinine} µmol/L (threshold: ${info.maxCreatinine})`,
          suggestion: "Reduce dose or choose alternative. Monitor renal function.",
          source: "builtin",
        };
      }
    }

    return null;
  }

  /**
   * Check for duplicate therapy (same drug class already prescribed).
   */
  private checkDuplicateTherapy(medication: string, currentMedications: string[]): SafetyAlert[] {
    const alerts: SafetyAlert[] = [];
    const med = medication.toLowerCase();

    const drugClasses: Record<string, string[]> = {
      "Statins": ["atorvastatin", "simvastatin", "rosuvastatin", "pravastatin", "fluvastatin"],
      "ACE inhibitors": ["lisinopril", "enalapril", "ramipril", "captopril"],
      "ARBs": ["losartan", "valsartan", "telmisartan"],
      "Beta-blockers": ["metoprolol", "atenolol", "bisoprolol", "carvedilol"],
      "Metformin": ["metformin"],
      "SSRIs": ["sertraline", "fluoxetine", "citalopram", "escitalopram"],
    };

    for (const [className, drugs] of Object.entries(drugClasses)) {
      if (drugs.some((d) => med.includes(d))) {
        for (const currentMed of currentMedications) {
          const current = currentMed.toLowerCase();
          if (current !== med && drugs.some((d) => current.includes(d))) {
            alerts.push({
              type: "duplicate",
              severity: "info",
              title: `Duplicate therapy: ${medication} + ${currentMed}`,
              description: `Both medications are ${className}. Prescribing both may be duplicate therapy.`,
              evidence: `Both are ${className}`,
              suggestion: "Review if both are needed. Consider monotherapy.",
              interactingWith: currentMed,
              source: "builtin",
            });
          }
        }
      }
    }

    return alerts;
  }

  /**
   * Calculate risk score from alerts (0-100).
   */
  private calculateRiskScore(alerts: SafetyAlert[]): number {
    let score = 0;
    for (const alert of alerts) {
      if (alert.severity === "critical") score += 50;
      else if (alert.severity === "warning") score += 20;
      else if (alert.severity === "info") score += 5;
    }
    return Math.min(100, score);
  }

  /**
   * Search for medication by name (uses RxNorm API).
   * Returns normalized drug name + RxCUI.
   */
  async searchMedication(query: string): Promise<{ name: string; rxcui: string }[]> {
    try {
      const response = await fetch(
        `https://rxnav.nlm.nih.gov/REST/drugs.json?name=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      const group = data.drugGroup?.conceptGroup || [];
      const results: { name: string; rxcui: string }[] = [];

      for (const concept of group) {
        if (concept.conceptProperties) {
          for (const prop of concept.conceptProperties) {
            results.push({ name: prop.name, rxcui: prop.rxcui });
          }
        }
      }

      return results.slice(0, 10);
    } catch {
      return [];
    }
  }
}

export const drugSafetyService = new DrugSafetyService();
