/**
 * VELTRA — Minister of Health & CME Extensions
 * 
 * These interfaces define the future of Veltra as a health system platform:
 * - Population health monitoring
 * - Outbreak detection
 * - Continuous medical education
 * - Lab/radiology ordering
 * - Drug interaction checking
 * - Knowledge base for doctors
 */

// ===== Minister of Health Dashboard =====
export interface PopulationHealthMetric {
  id: string;
  region: string;
  metric: "diabetes_prevalence" | "hypertension" | "obesity" | "vaccination_rate" | "maternal_mortality" | "infant_mortality";
  value: number;
  trend: "up" | "down" | "stable";
  targetValue: number;
  lastUpdated: string;
}

export interface OutbreakAlert {
  id: string;
  disease: string;
  region: string;
  cases: number;
  severity: "low" | "medium" | "high" | "critical";
  firstDetected: string;
  status: "monitoring" | "investigating" | "contained" | "resolved";
  affectedClinics: string[];
}

export interface DrugInteraction {
  drug1: string;
  drug2: string;
  severity: "contraindicated" | "major" | "moderate" | "minor";
  description: string;
  recommendation: string;
}

export interface LabOrder {
  id: string;
  patientId: string;
  patientName: string;
  orderedBy: string;
  tests: string[];
  priority: "routine" | "urgent" | "stat";
  status: "ordered" | "collected" | "in-progress" | "completed" | "cancelled";
  orderedAt: string;
  notes?: string;
}

export interface RadiologyOrder {
  id: string;
  patientId: string;
  patientName: string;
  orderedBy: string;
  modality: "X-Ray" | "CT" | "MRI" | "Ultrasound" | "Mammography" | "Fluoroscopy";
  bodyPart: string;
  contrast: boolean;
  priority: "routine" | "urgent" | "stat";
  status: "ordered" | "scheduled" | "in-progress" | "completed" | "cancelled";
  orderedAt: string;
  clinicalIndication?: string;
}

// ===== Continuous Medical Education (CME) =====
export interface CMECourse {
  id: string;
  title: string;
  category: "Cardiology" | "Oncology" | "Pediatrics" | "Pharmacology" | "Surgery" | "Emergency" | "Public Health" | "Ethics";
  description: string;
  durationMinutes: number;
  credits: number;
  difficulty: "Basic" | "Intermediate" | "Advanced";
  lastUpdated: string;
  enrolled: number;
  rating: number;
}

export interface MedicalDiscovery {
  id: string;
  title: string;
  category: "Drug Approval" | "Clinical Trial" | "Guideline Update" | "Device" | "Breakthrough";
  summary: string;
  source: string;
  publishedAt: string;
  relevance: "All Specialties" | string; // specific specialty
  readBy: string[]; // user IDs who read this
}

// ===== Known Drug Interactions Database =====
export const DRUG_INTERACTIONS: DrugInteraction[] = [
  { drug1: "Warfarin", drug2: "Aspirin", severity: "contraindicated", description: "Increased risk of bleeding", recommendation: "Avoid combination. Use alternative anticoagulant." },
  { drug1: "Warfarin", drug2: "Ibuprofen", severity: "major", description: "Increased anticoagulant effect", recommendation: "Monitor INR closely. Consider paracetamol instead." },
  { drug1: "Metformin", drug2: "Contrast Dye", severity: "contraindicated", description: "Risk of lactic acidosis", recommendation: "Stop metformin 48h before and after contrast imaging." },
  { drug1: "ACE Inhibitors", drug2: "Potassium Supplements", severity: "major", description: "Hyperkalemia risk", recommendation: "Monitor potassium levels weekly." },
  { drug1: "SSRIs", drug2: "MAOIs", severity: "contraindicated", description: "Serotonin syndrome risk", recommendation: "Minimum 14-day washout period required." },
  { drug1: "Statins", drug2: "Grapefruit Juice", severity: "moderate", description: "Increased statin levels", recommendation: "Avoid grapefruit juice with simvastatin or atorvastatin." },
  { drug1: "Penicillin", drug2: "Allopurinol", severity: "moderate", description: "Increased rash risk", recommendation: "Monitor for skin reactions." },
  { drug1: "Lisinopril", drug2: "Potassium-sparing Diuretics", severity: "major", description: "Severe hyperkalemia", recommendation: "Avoid combination or monitor frequently." },
  { drug1: "Insulin", drug2: "Beta-blockers", severity: "moderate", description: "Masked hypoglycemia symptoms", recommendation: "Monitor glucose more frequently." },
  { drug1: "Codeine", drug2: "Alcohol", severity: "major", description: "Respiratory depression", recommendation: "Avoid alcohol completely." },
];

// ===== Check drug interactions =====
export function checkDrugInteraction(drug1: string, drug2: string): DrugInteraction | null {
  const found = DRUG_INTERACTIONS.find(
    (di) =>
      (di.drug1.toLowerCase() === drug1.toLowerCase() && di.drug2.toLowerCase() === drug2.toLowerCase()) ||
      (di.drug1.toLowerCase() === drug2.toLowerCase() && di.drug2.toLowerCase() === drug1.toLowerCase())
  );
  return found || null;
}

export function checkAllergyWarning(medication: string, allergies: string[]): { allergy: string; severity: "critical" } | null {
  for (const allergy of allergies) {
    if (allergy === "None" || allergy === "") continue;
    if (medication.toLowerCase().includes(allergy.toLowerCase())) {
      return { allergy, severity: "critical" };
    }
    // Check common drug class matches
    if (allergy.toLowerCase().includes("penicillin") && medication.toLowerCase().match(/amoxicillin|ampicillin|penicillin|augmentin/)) {
      return { allergy: "Penicillin", severity: "critical" };
    }
    if (allergy.toLowerCase().includes("aspirin") && medication.toLowerCase().match(/aspirin|asa|salicylic/)) {
      return { allergy: "Aspirin", severity: "critical" };
    }
    if (allergy.toLowerCase().includes("sulfa") && medication.toLowerCase().match(/sulfameth|sulfadiazine|sulfasalazine|co-trimoxazole|bactrim|septra/)) {
      return { allergy: "Sulfa", severity: "critical" };
    }
    if (allergy.toLowerCase().includes("codeine") && medication.toLowerCase().match(/codeine|hydrocodone|oxycodone|tramadol/)) {
      return { allergy: "Codeine/Opioid class", severity: "critical" };
    }
  }
  return null;
}

// ===== Sample CME Courses =====
export const SAMPLE_CME_COURSES: CMECourse[] = [
  { id: "cme1", title: "Updated Guidelines for Type 2 Diabetes Management 2026", category: "Pharmacology", description: "Latest ADA/EASD consensus on GLP-1 agonists and SGLT2 inhibitors.", durationMinutes: 45, credits: 1.5, difficulty: "Intermediate", lastUpdated: "2026-06-15", enrolled: 342, rating: 4.8 },
  { id: "cme2", title: "Acute Coronary Syndrome: Rapid Recognition & Intervention", category: "Cardiology", description: "Identify STEMI vs NSTEMI, door-to-balloon time optimization.", durationMinutes: 60, credits: 2, difficulty: "Advanced", lastUpdated: "2026-05-20", enrolled: 198, rating: 4.9 },
  { id: "cme3", title: "Pediatric Vaccination Schedule Updates", category: "Pediatrics", description: "2026 immunization schedule changes and catch-up protocols.", durationMinutes: 30, credits: 1, difficulty: "Basic", lastUpdated: "2026-06-01", enrolled: 521, rating: 4.7 },
  { id: "cme4", title: "Antimicrobial Stewardship: Prescribing Wisely", category: "Pharmacology", description: "Reduce resistance. When to prescribe, when to wait.", durationMinutes: 40, credits: 1.5, difficulty: "Intermediate", lastUpdated: "2026-04-10", enrolled: 267, rating: 4.6 },
  { id: "cme5", title: "Telemedicine Best Practices Post-Pandemic", category: "Ethics", description: "Legal, ethical, and clinical considerations for remote care.", durationMinutes: 35, credits: 1, difficulty: "Basic", lastUpdated: "2026-03-15", enrolled: 412, rating: 4.5 },
];

// ===== Sample Medical Discoveries =====
export const SAMPLE_DISCOVERIES: MedicalDiscovery[] = [
  { id: "md1", title: "FDA Approves New GLP-1/GIP Dual Agonist for Obesity", category: "Drug Approval", summary: "Tirzepatide shows 22.5% weight loss in Phase 3 trials, surpassing semaglutide.", source: "FDA.gov", publishedAt: "2026-07-01", relevance: "All Specialties", readBy: [] },
  { id: "md2", title: "WHO Updates Hypertension Guidelines: Lower Target for High-Risk", category: "Guideline Update", summary: "Target BP <130/80 for patients with cardiovascular risk factors.", source: "WHO", publishedAt: "2026-06-20", relevance: "All Specialties", readBy: [] },
  { id: "md3", title: "Breakthrough: Blood Test Detects 12 Cancers Before Symptoms", category: "Breakthrough", summary: "MCED test shows 94% specificity in screening trial of 50,000 patients.", source: "Nature Medicine", publishedAt: "2026-06-10", relevance: "Oncology", readBy: [] },
  { id: "md4", title: "New Pediatric Sepsis Protocol Reduces Mortality by 31%", category: "Clinical Trial", summary: "Hour-1 bundle with lactate-guided resuscitation saves lives.", source: "NEJM", publishedAt: "2026-05-28", relevance: "Pediatrics", readBy: [] },
  { id: "md5", title: "AI-Assisted ECG Detection of Atrial Fibrillation", category: "Device", summary: "Smartwatch ECG achieves 97% sensitivity for silent AFib detection.", source: "JAMA Cardiology", publishedAt: "2026-05-15", relevance: "Cardiology", readBy: [] },
];
