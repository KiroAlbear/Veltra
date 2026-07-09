/**
 * VELTRA — EHR (Electronic Health Record) Types
 *
 * Comprehensive clinical data models beyond the basic Patient interface.
 * These power the full clinical workflow: SOAP notes, history, procedures,
 * vaccinations, chronic disease tracking, family history.
 *
 * Used by: Timeline screen (EHR tab), Patient Portal (medical records),
 * Clinical Decision Support, AI Scribe.
 */

// ===== SOAP Note =====
export interface SoapNote {
  id: string;
  patientId: string;
  patientName: string;
  visitId?: string;
  visitDate: string;
  doctorId: string;
  doctorName: string;

  // S — Subjective
  chiefComplaint: string;
  historyOfPresentIllness: string;
  reviewOfSystems?: string;

  // O — Objective
  vitalSigns?: {
    bp?: string;
    hr?: number;
    temp?: number;
    rr?: number;
    spo2?: number;
    weight?: number;
    height?: number;
    bmi?: number;
  };
  physicalExam?: string;
  observation?: string;

  // A — Assessment
  diagnoses: DiagnosisEntry[];
  differentialDiagnoses?: string[];

  // P — Plan
  plan: string;
  orders?: {
    labs?: string[];
    imaging?: string[];
    referrals?: string[];
    procedures?: string[];
  };
  followUp?: {
    timeframe: string;
    reason: string;
  };

  // ICD-10 coding
  icd10Codes?: Icd10Code[];

  // Metadata
  status: "draft" | "signed" | "amended";
  signedAt?: string;
  amendedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DiagnosisEntry {
  id: string;
  diagnosis: string;
  icd10Code?: string;
  status: "active" | "resolved" | "chronic" | "recurrent";
  onsetDate?: string;
  notes?: string;
}

export interface Icd10Code {
  code: string;
  description: string;
  confidence?: number;
}

// ===== Medical History =====
export interface MedicalHistory {
  // Past medical history
  conditions: HistoryCondition[];
  // Surgical history
  surgeries: SurgeryEntry[];
  // Family history
  familyHistory: FamilyHistoryEntry[];
  // Medication history (all meds ever prescribed, not just active)
  medicationHistory: MedicationHistoryEntry[];
  // Allergy history
  allergies: AllergyEntry[];
  // Vaccination records
  vaccinations: VaccinationEntry[];
  // Chronic disease tracking
  chronicDiseases: ChronicDiseaseEntry[];
  // Procedures
  procedures: ProcedureEntry[];
  // Social history
  socialHistory?: SocialHistory;
  // Obstetric history (if applicable)
  obstetricHistory?: ObstetricHistory;
}

export interface HistoryCondition {
  id: string;
  condition: string;
  icd10Code?: string;
  status: "active" | "resolved" | "chronic";
  onsetDate: string;
  resolvedDate?: string;
  notes?: string;
}

export interface SurgeryEntry {
  id: string;
  procedure: string;
  date: string;
  surgeon?: string;
  hospital?: string;
  complications?: string;
  notes?: string;
}

export interface FamilyHistoryEntry {
  id: string;
  relation: "father" | "mother" | "sibling" | "child" | "grandparent" | "other";
  relationDetail?: string;
  condition: string;
  ageOfOnset?: number;
  status?: "alive" | "deceased";
  ageOfDeath?: number;
  notes?: string;
}

export interface MedicationHistoryEntry {
  id: string;
  medication: string;
  dosage: string;
  startDate: string;
  endDate?: string;
  reason: string;
  prescriber: string;
  outcome?: "effective" | "ineffective" | "adverse_reaction" | "discontinued" | "ongoing";
  notes?: string;
}

export interface AllergyEntry {
  id: string;
  allergen: string;
  type: "drug" | "food" | "environmental" | "latex" | "other";
  severity: "mild" | "moderate" | "severe" | "anaphylaxis";
  reaction: string;
  firstObserved: string;
  status: "active" | "resolved";
  notes?: string;
}

export interface VaccinationEntry {
  id: string;
  vaccine: string;
  date: string;
  doseNumber?: number;
  route?: "IM" | "SC" | "oral" | "intranasal";
  site?: "left_arm" | "right_arm" | "left_thigh" | "right_thigh" | "other";
  manufacturer?: string;
  lotNumber?: string;
  administeredBy: string;
  nextDue?: string;
  notes?: string;
}

export interface ChronicDiseaseEntry {
  id: string;
  disease: string;
  icd10Code?: string;
  diagnosedDate: string;
  currentStatus: "controlled" | "uncontrolled" | "improving" | "worsening" | "stable";
  severity: "mild" | "moderate" | "severe";
  lastAssessment: string;
  nextAssessmentDue: string;
  treatmentGoals?: string;
  currentTreatment?: string;
  metrics?: { label: string; value: string; target: string; trend: "up" | "down" | "stable" }[];
  notes?: string;
}

export interface ProcedureEntry {
  id: string;
  procedure: string;
  cptCode?: string;
  date: string;
  performedBy: string;
  location: string;
  indication: string;
  findings?: string;
  complications?: string;
  anesthesia?: "local" | "regional" | "general" | "none" | "sedation";
  notes?: string;
}

export interface SocialHistory {
  smokingStatus?: "never" | "former" | "current";
  cigarettesPerDay?: number;
  yearsSmoked?: number;
  quitDate?: string;
  alcoholUse?: "never" | "occasional" | "moderate" | "heavy" | "former";
  drinksPerWeek?: number;
  drugUse?: "never" | "former" | "current";
  drugDetails?: string;
  occupation?: string;
  exerciseFrequency?: "none" | "rare" | "weekly" | "daily";
  exerciseType?: string;
  diet?: string;
  caffeineIntake?: string;
  sleepHours?: number;
  sexualHistory?: string;
  travelHistory?: string;
  livingSituation?: string;
  educationLevel?: string;
}

export interface ObstetricHistory {
  gravidity?: number; // total pregnancies
  parity?: number;    // births > 20 weeks
  abortions?: number; // spontaneous + induced
  livingChildren?: number;
  deliveries: DeliveryEntry[];
}

export interface DeliveryEntry {
  id: string;
  date: string;
  gestationalAge?: number; // weeks
  deliveryType: "vaginal" | "cesarean" | "vacuum" | "forceps" | "vbac";
  birthWeight?: number; // grams
  complications?: string;
  babyGender?: "M" | "F";
  notes?: string;
}

// ===== Lab Trends =====
export interface LabTrend {
  testType: string;
  unit: string;
  normalRange: string;
  values: {
    date: string;
    value: string;
    status: "normal" | "high" | "low" | "critical";
  }[];
  trend: "improving" | "worsening" | "stable";
  deltaFromLast?: number; // percentage change
  lastValue: string;
  lastStatus: "normal" | "high" | "low" | "critical";
  lastDate: string;
}

// ===== Clinical Decision Support =====
export interface ClinicalSuggestion {
  id: string;
  type: "lab_order" | "imaging_order" | "referral" | "medication_review" | "follow_up" | "screening" | "vaccination" | "lifestyle";
  priority: "routine" | "important" | "urgent";
  title: string;
  description: string;
  reasoning: string;
  evidence: string;
  confidence: number; // 0-1
  actionLabel: string;
  actionTarget?: string;
  dismissed?: boolean;
  accepted?: boolean;
}
