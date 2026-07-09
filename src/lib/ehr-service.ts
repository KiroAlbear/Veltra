/**
 * VELTRA — EHR Service
 *
 * CRUD operations for Electronic Health Record data.
 * Manages: SOAP notes, medical history, lab trends, clinical suggestions.
 *
 * In demo mode: returns seed data.
 * In production: uses Prisma dataAccess layer.
 */

import type {
  SoapNote, MedicalHistory, LabTrend, ClinicalSuggestion,
  DiagnosisEntry, ChronicDiseaseEntry, VaccinationEntry,
} from "./ehr-types";
import type { LabResult, Patient, Prescription, Vital } from "./veltra-store";

// ===== SOAP Notes =====

export function createSoapNote(input: Omit<SoapNote, "id" | "createdAt" | "updatedAt" | "status">): SoapNote {
  return {
    ...input,
    id: `soap-${Date.now()}`,
    status: "draft",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Demo SOAP notes for Ahmed Hassan
const DEMO_SOAP_NOTES: SoapNote[] = [
  {
    id: "soap-1",
    patientId: "p1",
    patientName: "Ahmed Hassan",
    visitDate: "2026-04-10T09:00:00Z",
    doctorId: "u1",
    doctorName: "Dr. Sarah Carter",
    chiefComplaint: "Routine diabetes follow-up. Patient reports increased thirst and frequent urination over past 2 weeks.",
    historyOfPresentIllness: "45M with T2DM diagnosed 5 years ago. Currently on Metformin 1000mg BID and Lisinopril 10mg daily. Reports poor adherence to diet. No chest pain, no shortness of breath. Denies blurry vision or numbness.",
    reviewOfSystems: "Constitutional: mild fatigue. GI: increased urination. Neuro: negative. CV: negative. Resp: negative.",
    vitalSigns: { bp: "142/88", hr: 78, temp: 36.8, weight: 84, bmi: 28.5 },
    physicalExam: "General: alert, no acute distress. CV: RRR, no murmurs. Lungs: clear bilaterally. Ext: no edema. Neuro: intact. Fundoscopic: no retinopathy.",
    diagnoses: [
      { id: "d1", diagnosis: "Type 2 Diabetes Mellitus", icd10Code: "E11.9", status: "chronic", onsetDate: "2021-03-15" },
      { id: "d2", diagnosis: "Essential Hypertension", icd10Code: "I10", status: "chronic", onsetDate: "2021-06-20" },
    ],
    differentialDiagnoses: ["Diabetic nephropathy — check creatinine", "Hypertensive urgency — monitor BP"],
    plan: "1. Continue Metformin 1000mg BID\n2. Continue Lisinopril 10mg daily\n3. Order HbA1c, lipid panel, BMP, urine microalbumin\n4. Refer to ophthalmology for annual retinal exam\n5. Follow-up in 3 months\n6. Dietary counseling — reinforce low-carb diet",
    orders: {
      labs: ["HbA1c", "Lipid Panel", "BMP", "Urine Microalbumin"],
      referrals: ["Ophthalmology — retinal exam"],
    },
    followUp: { timeframe: "3 months", reason: "Diabetes management review + lab results" },
    icd10Codes: [
      { code: "E11.9", description: "Type 2 diabetes mellitus without complications" },
      { code: "I10", description: "Essential (primary) hypertension" },
    ],
    status: "signed",
    signedAt: "2026-04-10T09:35:00Z",
    createdAt: "2026-04-10T09:00:00Z",
    updatedAt: "2026-04-10T09:35:00Z",
  },
  {
    id: "soap-2",
    patientId: "p1",
    patientName: "Ahmed Hassan",
    visitDate: "2026-01-15T10:00:00Z",
    doctorId: "u1",
    doctorName: "Dr. Sarah Carter",
    chiefComplaint: "3-month diabetes check. Patient reports feeling well, no new complaints.",
    historyOfPresentIllness: "45M with T2DM on Metformin 1000mg BID. Reports good medication adherence. Diet moderate. Exercise 2x/week. No polyuria, no polydipsia currently. Last HbA1c 7.1% (3 months ago).",
    vitalSigns: { bp: "135/82", hr: 72, temp: 36.7, weight: 83, bmi: 28.2 },
    physicalExam: "General: well-appearing. CV: RRR. Lungs: clear. Ext: no edema, no neuropathy. Foot exam: intact sensation.",
    diagnoses: [
      { id: "d1", diagnosis: "Type 2 Diabetes Mellitus", icd10Code: "E11.9", status: "chronic", onsetDate: "2021-03-15" },
      { id: "d2", diagnosis: "Essential Hypertension", icd10Code: "I10", status: "chronic", onsetDate: "2021-06-20" },
    ],
    plan: "1. Continue current medications\n2. Recheck HbA1c in 3 months\n3. Encourage exercise 3x/week\n4. Annual labs: lipid panel, BMP\n5. Follow-up in 3 months",
    orders: { labs: ["HbA1c"] },
    followUp: { timeframe: "3 months", reason: "Routine diabetes follow-up" },
    icd10Codes: [{ code: "E11.9", description: "Type 2 diabetes mellitus without complications" }],
    status: "signed",
    signedAt: "2026-01-15T10:25:00Z",
    createdAt: "2026-01-15T10:00:00Z",
    updatedAt: "2026-01-15T10:25:00Z",
  },
];

export function getSoapNotes(patientId: string): SoapNote[] {
  return DEMO_SOAP_NOTES.filter((s) => s.patientId === patientId)
    .sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());
}

// ===== Medical History =====

const DEMO_MEDICAL_HISTORY: MedicalHistory = {
  conditions: [
    { id: "c1", condition: "Type 2 Diabetes Mellitus", icd10Code: "E11.9", status: "chronic", onsetDate: "2021-03-15", notes: "HbA1c trending up: 7.1 → 7.9 → 8.4" },
    { id: "c2", condition: "Essential Hypertension", icd10Code: "I10", status: "chronic", onsetDate: "2021-06-20" },
    { id: "c3", condition: "Hyperlipidemia", icd10Code: "E78.5", status: "active", onsetDate: "2021-06-20" },
  ],
  surgeries: [
    { id: "s1", procedure: "Appendectomy", date: "2005-08-12", surgeon: "Dr. Smith", hospital: "Riyadh General", notes: "Uncomplicated recovery" },
  ],
  familyHistory: [
    { id: "fh1", relation: "father", condition: "Type 2 Diabetes", ageOfOnset: 50, status: "alive", notes: "Insulin-dependent" },
    { id: "fh2", relation: "mother", condition: "Hypertension", ageOfOnset: 55, status: "alive" },
    { id: "fh3", relation: "father", condition: "Coronary Artery Disease", ageOfOnset: 58, status: "deceased", ageOfDeath: 72, notes: "MI at 60" },
    { id: "fh4", relation: "sibling", condition: "Type 2 Diabetes", ageOfOnset: 42, status: "alive" },
  ],
  medicationHistory: [
    { id: "mh1", medication: "Metformin", dosage: "500mg BID", startDate: "2021-03-15", endDate: "2021-06-01", reason: "T2DM", prescriber: "Dr. Sarah Carter", outcome: "effective", notes: "Up-titrated to 1000mg" },
    { id: "mh2", medication: "Metformin", dosage: "1000mg BID", startDate: "2021-06-01", reason: "T2DM", prescriber: "Dr. Sarah Carter", outcome: "ongoing" },
    { id: "mh3", medication: "Lisinopril", dosage: "10mg daily", startDate: "2021-06-20", reason: "Hypertension", prescriber: "Dr. Sarah Carter", outcome: "ongoing" },
    { id: "mh4", medication: "Atorvastatin", dosage: "20mg HS", startDate: "2021-06-20", endDate: "2022-01-10", reason: "Hyperlipidemia", prescriber: "Dr. Sarah Carter", outcome: "discontinued", notes: "Patient stopped — muscle aches" },
  ],
  allergies: [
    { id: "a1", allergen: "Sulfa", type: "drug", severity: "severe", reaction: "Skin rash, hives", firstObserved: "2015-03-20", status: "active", notes: "Avoid all sulfa drugs" },
  ],
  vaccinations: [
    { id: "v1", vaccine: "Influenza (Quadrivalent)", date: "2025-10-15", route: "IM", site: "left_arm", administeredBy: "Nurse Layla", nextDue: "2026-10-15" },
    { id: "v2", vaccine: "COVID-19 (Booster)", date: "2025-09-01", doseNumber: 4, route: "IM", site: "right_arm", manufacturer: "Pfizer", administeredBy: "Dr. Sarah Carter" },
    { id: "v3", vaccine: "Tetanus/Diphtheria", date: "2023-05-10", route: "IM", site: "left_arm", administeredBy: "Dr. Sarah Carter", nextDue: "2033-05-10" },
    { id: "v4", vaccine: "Hepatitis B (Series)", date: "2020-01-15", doseNumber: 3, route: "IM", administeredBy: "Dr. Ahmed", notes: "Series complete" },
  ],
  chronicDiseases: [
    {
      id: "cd1", disease: "Type 2 Diabetes Mellitus", icd10Code: "E11.9",
      diagnosedDate: "2021-03-15", currentStatus: "uncontrolled", severity: "moderate",
      lastAssessment: "2026-07-01", nextAssessmentDue: "2026-10-01",
      treatmentGoals: "HbA1c < 7.0%, Fasting glucose < 7.0 mmol/L",
      currentTreatment: "Metformin 1000mg BID, diet, exercise",
      metrics: [
        { label: "HbA1c", value: "8.4%", target: "< 7.0%", trend: "up" },
        { label: "Fasting Glucose", value: "9.2 mmol/L", target: "< 7.0", trend: "up" },
        { label: "BMI", value: "28.5", target: "< 25", trend: "stable" },
      ],
      notes: "Patient needs medication review. Consider adding SGLT2 inhibitor or GLP-1 agonist.",
    },
    {
      id: "cd2", disease: "Essential Hypertension", icd10Code: "I10",
      diagnosedDate: "2021-06-20", currentStatus: "uncontrolled", severity: "mild",
      lastAssessment: "2026-07-01", nextAssessmentDue: "2026-10-01",
      treatmentGoals: "BP < 130/80",
      currentTreatment: "Lisinopril 10mg daily",
      metrics: [
        { label: "Systolic BP", value: "145", target: "< 130", trend: "up" },
        { label: "Diastolic BP", value: "90", target: "< 80", trend: "stable" },
      ],
      notes: "BP elevated despite ACE inhibitor. Consider dose increase or add CCB.",
    },
  ],
  procedures: [
    { id: "p1", procedure: "Skin Lesion Excision", cptCode: "17000", date: "2024-03-15", performedBy: "Dr. Sarah Carter", location: "Veltra Clinic — Olaya", indication: "Suspicious nevus", findings: "Benign nevus, margins clear", anesthesia: "local" },
  ],
  socialHistory: {
    smokingStatus: "former",
    cigarettesPerDay: 10,
    yearsSmoked: 15,
    quitDate: "2018-01-01",
    alcoholUse: "occasional",
    drinksPerWeek: 2,
    drugUse: "never",
    occupation: "Accountant",
    exerciseFrequency: "weekly",
    exerciseType: "Walking 30 min",
    diet: "Moderate carb, high sugar intake",
    caffeineIntake: "3 cups coffee/day",
    sleepHours: 6,
    livingSituation: "Lives with wife and 2 children",
    educationLevel: "University graduate",
  },
  obstetricHistory: undefined,
};

export function getMedicalHistory(patientId: string): MedicalHistory {
  // In production, this would fetch from database
  // For demo, return the same history for all patients
  return DEMO_MEDICAL_HISTORY;
}

// ===== Lab Trends =====

export function computeLabTrends(labResults: LabResult[], patientId: string): LabTrend[] {
  const patientLabs = labResults
    .filter((l) => l.patientId === patientId)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Group by test type
  const byTestType: Record<string, LabResult[]> = {};
  for (const lab of patientLabs) {
    if (!byTestType[lab.testType]) byTestType[lab.testType] = [];
    byTestType[lab.testType].push(lab);
  }

  const trends: LabTrend[] = [];

  for (const [testType, labs] of Object.entries(byTestType)) {
    if (labs.length === 0) continue;

    const last = labs[labs.length - 1];
    const prev = labs.length > 1 ? labs[labs.length - 2] : null;

    // Compute trend
    let trend: LabTrend["trend"] = "stable";
    let deltaFromLast: number | undefined;

    if (prev) {
      const lastVal = parseFloat(last.value);
      const prevVal = parseFloat(prev.value);
      if (!isNaN(lastVal) && !isNaN(prevVal) && prevVal !== 0) {
        deltaFromLast = Math.round(((lastVal - prevVal) / prevVal) * 100);
        if (deltaFromLast > 5) trend = "worsening";
        else if (deltaFromLast < -5) trend = "improving";
        else trend = "stable";
      }
    }

    trends.push({
      testType,
      unit: last.unit,
      normalRange: last.normalRange,
      values: labs.map((l) => ({
        date: l.timestamp,
        value: l.value,
        status: l.status as "normal" | "high" | "low" | "critical",
      })),
      trend,
      deltaFromLast,
      lastValue: last.value,
      lastStatus: last.status as "normal" | "high" | "low" | "critical",
      lastDate: last.timestamp,
    });
  }

  return trends;
}

// ===== Clinical Decision Support =====

export function generateClinicalSuggestions(
  patient: Patient,
  medicalHistory: MedicalHistory,
  labTrends: LabTrend[],
  activePrescriptions: Prescription[]
): ClinicalSuggestion[] {
  const suggestions: ClinicalSuggestion[] = [];

  // 1. Diabetes management
  const diabetes = medicalHistory.chronicDiseases.find((d) => d.disease.includes("Diabetes"));
  if (diabetes && diabetes.currentStatus === "uncontrolled") {
    const hba1cTrend = labTrends.find((t) => t.testType.includes("HbA1c"));
    if (hba1cTrend && hba1cTrend.lastStatus !== "normal") {
      suggestions.push({
        id: "sug-1",
        type: "medication_review",
        priority: "important",
        title: "Diabetes medication review needed",
        description: `HbA1c is ${hba1cTrend.lastValue} (target: < 7.0%). Trend: ${hba1cTrend.trend}. Consider adding SGLT2 inhibitor or GLP-1 agonist.`,
        reasoning: `Patient's HbA1c has been trending ${hba1cTrend.trend} (${hba1cTrend.deltaFromLast ? (hba1cTrend.deltaFromLast > 0 ? "+" : "") + hba1cTrend.deltaFromLast + "%" : "N/A"} from last). Current Metformin monotherapy insufficient.`,
        evidence: `HbA1c: ${hba1cTrend.values.map((v) => `${v.value} (${new Date(v.date).toLocaleDateString("en-US", { month: "short", year: "2-digit" })})`).join(" → ")}`,
        confidence: 0.92,
        actionLabel: "Review medications",
        actionTarget: "timeline",
      });
    }
  }

  // 2. Hypertension management
  const htn = medicalHistory.chronicDiseases.find((d) => d.disease.includes("Hypertension"));
  if (htn && htn.currentStatus === "uncontrolled") {
    suggestions.push({
      id: "sug-2",
      type: "medication_review",
      priority: "important",
      title: "Blood pressure not at target",
      description: `BP is ${htn.metrics?.find(m => m.label.includes("Systolic"))?.value}/${htn.metrics?.find(m => m.label.includes("Diastolic"))?.value} (target: < 130/80). Consider increasing Lisinopril or adding CCB.`,
      reasoning: "ACE inhibitor monotherapy insufficient. JNC 8 guidelines recommend titration or combination therapy.",
      evidence: "Current: Lisinopril 10mg daily. Last 3 BP readings above target.",
      confidence: 0.88,
      actionLabel: "Adjust BP meds",
      actionTarget: "timeline",
    });
  }

  // 3. Overdue labs
  const diabetesM = medicalHistory.chronicDiseases.find((d) => d.disease.includes("Diabetes"));
  if (diabetesM) {
    const lastHba1c = labTrends.find((t) => t.testType.includes("HbA1c"));
    if (lastHba1c) {
      const daysSince = Math.floor((Date.now() - new Date(lastHba1c.lastDate).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSince > 90) {
        suggestions.push({
          id: "sug-3",
          type: "lab_order",
          priority: "routine",
          title: "HbA1c overdue",
          description: `Last HbA1c was ${daysSince} days ago. Recommended every 3 months for uncontrolled diabetes.`,
          reasoning: "ADA guidelines: HbA1c every 3 months for patients not at target.",
          evidence: `Last test: ${lastHba1c.lastValue} on ${new Date(lastHba1c.lastDate).toLocaleDateString()}`,
          confidence: 0.95,
          actionLabel: "Order HbA1c",
          actionTarget: "labs",
        });
      }
    }
  }

  // 4. Annual screening
  const lastLipidPanel = labTrends.find((t) => t.testType.includes("Cholesterol") || t.testType.includes("LDL"));
  if (lastLipidPanel) {
    const daysSince = Math.floor((Date.now() - new Date(lastLipidPanel.lastDate).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince > 365) {
      suggestions.push({
        id: "sug-4",
        type: "lab_order",
        priority: "routine",
        title: "Annual lipid panel due",
        description: "Last lipid panel was over 1 year ago. Recommended annually for diabetic patients.",
        reasoning: "ADA + AHA guidelines: annual lipid profile for patients with diabetes.",
        evidence: `Last LDL: ${lastLipidPanel.lastValue} ${lastLipidPanel.unit}`,
        confidence: 0.90,
        actionLabel: "Order lipid panel",
        actionTarget: "labs",
      });
    }
  }

  // 5. Vaccination reminders
  const fluVax = medicalHistory.vaccinations.find((v) => v.vaccine.includes("Influenza"));
  if (fluVax && fluVax.nextDue) {
    const dueDate = new Date(fluVax.nextDue);
    if (dueDate < new Date()) {
      suggestions.push({
        id: "sug-5",
        type: "vaccination",
        priority: "routine",
        title: "Annual flu vaccine due",
        description: "Patient is due for annual influenza vaccination.",
        reasoning: "CDC recommends annual flu vaccine for all adults, especially diabetics.",
        evidence: `Last flu vaccine: ${new Date(fluVax.date).toLocaleDateString()}`,
        confidence: 0.97,
        actionLabel: "Schedule vaccination",
      });
    }
  }

  // 6. Ophthalmology referral
  const eyeReferral = medicalHistory.procedures.find((p) => p.procedure.includes("eye") || p.procedure.includes("retinal"));
  if (!eyeReferral && diabetes) {
    suggestions.push({
      id: "sug-6",
      type: "referral",
      priority: "important",
      title: "Annual retinal exam needed",
      description: "Diabetic patient has no documented retinal exam. Refer to ophthalmology.",
      reasoning: "ADA: annual dilated eye exam for all diabetic patients to screen for retinopathy.",
      evidence: "No retinal exam found in procedure history.",
      confidence: 0.93,
      actionLabel: "Refer to ophthalmology",
    });
  }

  // 7. Allergy alert
  if (patient.allergies && patient.allergies.length > 0) {
    suggestions.push({
      id: "sug-7",
      type: "medication_review",
      priority: "urgent",
      title: `Active allergy: ${patient.allergies.join(", ")}`,
      description: "Ensure all prescriptions are checked against patient allergies before prescribing.",
      reasoning: "Patient has documented severe allergies. Drug safety checking is mandatory.",
      evidence: `Allergies: ${patient.allergies.join(", ")}`,
      confidence: 1.0,
      actionLabel: "View allergies",
      actionTarget: "timeline",
    });
  }

  return suggestions;
}
