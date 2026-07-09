/**
 * VELTRA — Family Health Profile + Disease Learning System
 * 
 * Tracks entire family medical history, learns from new/rare diseases,
 * and provides space for continuous system improvement.
 */

// ===== Family Health Profile =====
export interface FamilyMember {
  id: string;
  name: string;
  relationship: "father" | "mother" | "spouse" | "sibling" | "child" | "grandparent" | "uncle" | "aunt" | "cousin" | "other";
  age: number;
  gender: "M" | "F";
  alive: boolean;
  ageAtDeath?: number;
  causeOfDeath?: string;
  conditions: string[]; // ["Diabetes", "Hypertension", "Heart Disease"]
  allergies: string[];
  medications: string[];
  surgeries: string[];
  lifestyle: {
    smoker: boolean;
    alcohol: "none" | "occasional" | "moderate" | "heavy";
    exercise: "sedentary" | "light" | "moderate" | "active";
    diet: "unknown" | "healthy" | "average" | "poor";
  };
  notes?: string;
}

export interface FamilyHealthProfile {
  familyId: string;
  primaryPatientId: string; // link to Patient
  familyName: string;
  members: FamilyMember[];
  sharedConditions: string[]; // conditions that appear in multiple members
  hereditaryRiskFlags: string[]; // ["Hereditary diabetes", "Cardiac risk"]
  lastUpdated: string;
}

// ===== Disease Learning System =====
export interface DiseaseEntry {
  id: string;
  name: string;
  alsoKnownAs: string[]; // alternative names
  category: "common" | "rare" | "ultra-rare" | "emerging" | "unknown";
  icd10Code?: string;
  description: string;
  symptoms: string[];
  riskFactors: string[];
  diagnosticCriteria: string[];
  treatments: string[];
  preventionMeasures: string[];
  knownDrugInteractions: string[];
  prognosis: string;
  firstDiscovered?: string; // for emerging diseases
  lastUpdated: string;
  confidence: "high" | "medium" | "low" | "unknown"; // how confident we are in this data
  needsMoreResearch: boolean; // flag for diseases we need to learn more about
  reportedCases?: number;
  affectedRegions?: string[];
}

export interface SystemLearningEntry {
  id: string;
  date: string;
  type: "new_disease" | "new_interaction" | "new_guideline" | "new_treatment" | "pattern_discovered" | "error_corrected";
  description: string;
  source: "doctor_input" | "research_paper" | "who_alert" | "fda_alert" | "system_pattern" | "user_feedback";
  confidence: "high" | "medium" | "low";
  verified: boolean;
  appliedTo: string[]; // patient IDs or "all"
  notes?: string;
}

// ===== Genetic/Hereditary Risk Assessment =====
export interface HereditaryRiskAssessment {
  patientId: string;
  familyHistoryAnalyzed: boolean;
  riskFactors: {
    condition: string;
    riskLevel: "low" | "moderate" | "high" | "very_high";
    affectedRelatives: string[]; // family member names
    recommendation: string;
    screeningAge?: number; // recommended age to start screening
    screeningFrequency?: string; // "annually", "every 2 years"
  }[];
  overallRiskScore: number; // 0-100
  lastAssessed: string;
}

// ===== Rare Disease Registry =====
export const RARE_DISEASES: DiseaseEntry[] = [
  {
    id: "rd1",
    name: "Wilson's Disease",
    alsoKnownAs: ["Hepatolenticular Degeneration"],
    category: "rare",
    icd10Code: "E83.01",
    description: "Genetic disorder causing copper accumulation in liver, brain, and eyes.",
    symptoms: ["Jaundice", "Tremors", "Personality changes", "Kayser-Fleischer rings", "Liver dysfunction"],
    riskFactors: ["Family history", "Genetic mutation ATP7B"],
    diagnosticCriteria: ["Low ceruloplasmin", "High urinary copper", "Liver biopsy", "Genetic testing"],
    treatments: ["Chelation therapy (penicillamine)", "Zinc acetate", "Liver transplant (severe cases)"],
    preventionMeasures: ["Genetic counseling", "Screening siblings"],
    knownDrugInteractions: ["Avoid copper supplements", "Monitor with neuroleptics"],
    prognosis: "Good with early treatment. Fatal if untreated.",
    lastUpdated: "2026-06-01",
    confidence: "high",
    needsMoreResearch: false,
    reportedCases: 1,
  },
  {
    id: "rd2",
    name: "Multiple Sclerosis",
    alsoKnownAs: ["MS", "Disseminated Sclerosis"],
    category: "rare",
    icd10Code: "G35",
    description: "Autoimmune disease affecting the central nervous system.",
    symptoms: ["Vision problems", "Numbness/tingling", "Fatigue", "Muscle weakness", "Cognitive changes"],
    riskFactors: ["Female", "Age 20-40", "Family history", "Low vitamin D", "Smoking"],
    diagnosticCriteria: ["MRI lesions", "CSF oligoclonal bands", "Evoked potentials", "McDonald criteria"],
    treatments: ["Disease-modifying therapy (DMT)", "Corticosteroids (acute)", "Physical therapy"],
    preventionMeasures: ["Vitamin D supplementation", "Smoking cessation"],
    knownDrugInteractions: ["Monitor with immunosuppressants"],
    prognosis: "Variable. Life expectancy near-normal with treatment.",
    lastUpdated: "2026-06-15",
    confidence: "high",
    needsMoreResearch: true,
    reportedCases: 0,
  },
  {
    id: "rd3",
    name: "Unknown Pathogen — Under Investigation",
    alsoKnownAs: ["Unidentified respiratory illness"],
    category: "emerging",
    description: "Novel respiratory symptoms not matching any known disease pattern. System flagged this for review.",
    symptoms: ["Persistent cough", "Low-grade fever", "Fatigue", "Atypical chest X-ray"],
    riskFactors: ["Unknown"],
    diagnosticCriteria: ["Rule out COVID-19, influenza, RSV", "Consider bronchoscopy", "Send samples to reference lab"],
    treatments: ["Supportive care", "Empiric antibiotics if bacterial suspected"],
    preventionMeasures: ["Isolation precautions", "Report to health authorities"],
    knownDrugInteractions: ["Unknown — monitor closely"],
    prognosis: "Unknown — under investigation",
    firstDiscovered: "2026-07-08",
    lastUpdated: "2026-07-08",
    confidence: "low",
    needsMoreResearch: true,
    affectedRegions: ["Riyadh"],
  },
];

// ===== Family Hereditary Risk Patterns =====
export const HEREDITARY_PATTERNS: { condition: string; inheritance: string; riskIfParent: string; screeningRecommendation: string }[] = [
  { condition: "Type 2 Diabetes", inheritance: "Multifactorial", riskIfParent: "40% if one parent, 70% if both", screeningRecommendation: "Annual fasting glucose from age 35, or 10 years before youngest family diagnosis" },
  { condition: "Hypertension", inheritance: "Multifactorial", riskIfParent: "30-50%", screeningRecommendation: "Annual BP check from age 18" },
  { condition: "Coronary Artery Disease", inheritance: "Multifactorial", riskIfParent: "50-75% if early onset", screeningRecommendation: "Lipid panel annually from age 20 if family history" },
  { condition: "Breast Cancer (BRCA)", inheritance: "Autosomal dominant", riskIfParent: "50-85% lifetime risk", screeningRecommendation: "Mammography at 25, MRI annually, genetic testing" },
  { condition: "Colorectal Cancer", inheritance: "Multifactorial / Lynch syndrome", riskIfParent: "15-80% depending on syndrome", screeningRecommendation: "Colonoscopy at 40 or 10 years before youngest family case" },
  { condition: "Sickle Cell Trait", inheritance: "Autosomal recessive", riskIfParent: "50% if one parent has trait", screeningRecommendation: "Genetic counseling before reproduction" },
  { condition: "Hemochromatosis", inheritance: "Autosomal recessive", riskIfParent: "25% if both carriers", screeningRecommendation: "Iron studies annually from age 30" },
  { condition: "Alzheimer's Disease", inheritance: "Multifactorial / APOE4", riskIfParent: "20-50%", screeningRecommendation: "Cognitive assessment annually from age 65" },
  { condition: "Asthma", inheritance: "Multifactorial", riskIfParent: "25-50%", screeningRecommendation: "Monitor respiratory symptoms from childhood" },
  { condition: "Thyroid Disease", inheritance: "Multifactorial / autoimmune", riskIfParent: "25-50%", screeningRecommendation: "TSH annually from age 35 if family history" },
];

// ===== Analyze family history for hereditary risks =====
export function analyzeHereditaryRisk(familyProfile: FamilyHealthProfile): HereditaryRiskAssessment {
  const riskFactors: HereditaryRiskAssessment["riskFactors"] = [];
  const allConditions = familyProfile.members.flatMap((m) => m.conditions);
  
  for (const pattern of HEREDITARY_PATTERNS) {
    const affectedMembers = familyProfile.members.filter((m) =>
      m.conditions.some((c) => c.toLowerCase().includes(pattern.condition.toLowerCase().split(" ")[0]))
    );
    
    if (affectedMembers.length > 0) {
      const riskLevel = affectedMembers.length >= 2 ? "high" : affectedMembers.length === 1 ? "moderate" : "low";
      riskFactors.push({
        condition: pattern.condition,
        riskLevel,
        affectedRelatives: affectedMembers.map((m) => `${m.name} (${m.relationship})`),
        recommendation: pattern.screeningRecommendation,
        screeningAge: pattern.condition.includes("Breast") ? 25 : pattern.condition.includes("Colon") ? 40 : 35,
        screeningFrequency: "annually",
      });
    }
  }
  
  // Calculate overall risk score
  const score = Math.min(
    100,
    riskFactors.reduce((sum, rf) => {
      const weight = rf.riskLevel === "very_high" ? 30 : rf.riskLevel === "high" ? 20 : rf.riskLevel === "moderate" ? 10 : 5;
      return sum + weight;
    }, 0)
  );
  
  return {
    patientId: familyProfile.primaryPatientId,
    familyHistoryAnalyzed: true,
    riskFactors,
    overallRiskScore: score,
    lastAssessed: new Date().toISOString(),
  };
}

// ===== System Learning — track what the system doesn't know =====
export function flagUnknownCondition(symptoms: string[], patientId: string): SystemLearningEntry {
  return {
    id: `learn-${Date.now()}`,
    date: new Date().toISOString(),
    type: "new_disease",
    description: `Unknown condition presented with symptoms: ${symptoms.join(", ")}. Patient: ${patientId}. System needs to learn this pattern.`,
    source: "system_pattern",
    confidence: "low",
    verified: false,
    appliedTo: [patientId],
    notes: "Flagged for review by medical team. May represent new disease pattern or rare condition.",
  };
}
