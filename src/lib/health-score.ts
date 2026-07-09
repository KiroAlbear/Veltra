/**
 * VELTRA — Health Score & Clinic Intelligence Engine
 *
 * Pure functions that compute:
 *   1. Health Score per patient (0-100) — from vitals, labs, conditions, adherence
 *   2. Clinic Intelligence alerts — proactive signals for Today's Brief
 *   3. Care Quality metrics — Trust Engine replacing ratings
 *
 * All functions are PURE — they take data, return computed results.
 * No side effects. Easy to test, easy to swap for real ML later.
 */

import type { Patient, LabResult, Vital, Appointment, Medication, InsuranceClaim, CareQualityScore, PatientFlag } from "./veltra-store";

// ============================================================================
// HEALTH SCORE
// ============================================================================

export interface HealthScoreBreakdown {
  overall: number; // 0-100
  trend: "up" | "down" | "stable";
  factors: {
    label: string;
    value: number; // 0-100 contribution
    status: "good" | "warning" | "critical";
    detail: string;
  }[];
  summary: string; // human-readable one-liner
}

/**
 * Compute a patient's Health Score from their data.
 *
 * Formula (transparent, explainable — not a black-box ML model):
 *   - Vitals control (30%): BP, glucose, SpO2 within target ranges
 *   - Lab trends (25%): latest lab results within normal ranges
 *   - Condition management (20%): chronic conditions under control
 *   - Visit adherence (15%): showed up to recommended follow-ups
 *   - Recency (10%): visited within recommended window
 *
 * Returns 0-100 + breakdown so the doctor can see WHY.
 */
export function computeHealthScore(
  patient: Patient,
  labResults: LabResult[],
  vitals: Vital[],
  appointments: Appointment[]
): HealthScoreBreakdown {
  const factors: HealthScoreBreakdown["factors"] = [];

  // ===== 1. Vitals control (30%) =====
  const latestVitals = patient.latestVitals || getLatestVitals(vitals, patient.id);
  let vitalsScore = 100;
  let vitalsDetail = "All vitals within target";

  if (latestVitals) {
    if (latestVitals.bp_systolic && latestVitals.bp_diastolic) {
      if (latestVitals.bp_systolic >= 140 || latestVitals.bp_diastolic >= 90) {
        vitalsScore -= 25;
        vitalsDetail = `BP ${latestVitals.bp_systolic}/${latestVitals.bp_diastolic} elevated`;
      } else if (latestVitals.bp_systolic >= 130 || latestVitals.bp_diastolic >= 80) {
        vitalsScore -= 10;
        vitalsDetail = `BP ${latestVitals.bp_systolic}/${latestVitals.bp_diastolic} borderline`;
      }
    }
    if (latestVitals.bloodSugar && latestVitals.bloodSugar > 7.0) {
      vitalsScore -= 20;
      vitalsDetail += ` · Glucose ${latestVitals.bloodSugar} high`;
    }
    if (latestVitals.oxygenLevel && latestVitals.oxygenLevel < 95) {
      vitalsScore -= 30;
      vitalsDetail += ` · SpO₂ ${latestVitals.oxygenLevel}% low`;
    }
  } else {
    vitalsScore = 70;
    vitalsDetail = "No vitals recorded recently";
  }

  factors.push({
    label: "Vitals Control",
    value: Math.max(0, vitalsScore),
    status: vitalsScore >= 80 ? "good" : vitalsScore >= 60 ? "warning" : "critical",
    detail: vitalsDetail,
  });

  // ===== 2. Lab trends (25%) =====
  const patientLabs = labResults
    .filter((l) => l.patientId === patient.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); // newest first
  let labScore = 100;
  let labDetail = patientLabs.length === 0 ? "No recent labs" : "All labs normal";

  if (patientLabs.length > 0) {
    const recentLabs = patientLabs.slice(0, 5); // 5 most recent (already sorted)
    const abnormal = recentLabs.filter((l) => l.status !== "normal");
    const critical = recentLabs.filter((l) => l.status === "critical");
    if (critical.length > 0) {
      labScore = 30;
      labDetail = `${critical.length} critical lab result${critical.length === 1 ? "" : "s"}`;
    } else if (abnormal.length > 0) {
      labScore = 100 - abnormal.length * 15;
      labDetail = `${abnormal.length} abnormal lab result${abnormal.length === 1 ? "" : "s"}`;
    }
  } else {
    labScore = 75;
  }

  factors.push({
    label: "Lab Trends",
    value: Math.max(0, labScore),
    status: labScore >= 80 ? "good" : labScore >= 60 ? "warning" : "critical",
    detail: labDetail,
  });

  // ===== 3. Condition management (20%) =====
  const conditionCount = patient.conditions.length;
  let conditionScore = 100;
  let conditionDetail = "No chronic conditions";

  if (conditionCount > 0) {
    // More conditions = harder to manage, but not impossible
    conditionScore = Math.max(50, 100 - conditionCount * 12);
    conditionDetail = `${conditionCount} chronic condition${conditionCount === 1 ? "" : "s"}: ${patient.conditions.join(", ")}`;
  }

  factors.push({
    label: "Condition Management",
    value: conditionScore,
    status: conditionScore >= 80 ? "good" : conditionScore >= 60 ? "warning" : "critical",
    detail: conditionDetail,
  });

  // ===== 4. Visit adherence (15%) =====
  const patientAppts = appointments.filter((a) => a.patientId === patient.id);
  const completed = patientAppts.filter((a) => a.status === "completed").length;
  const noShows = patientAppts.filter((a) => a.status === "no-show").length;
  const totalBooked = patientAppts.length || 1;
  // New patients with no appointment history get a NEUTRAL score (not 0).
  // 0 would unfairly tank the overall Health Score for someone we have no data on.
  let adherenceScore: number;
  let adherenceDetail: string;
  if (patientAppts.length === 0) {
    adherenceScore = 75; // neutral — no history yet
    adherenceDetail = "No appointment history — new patient";
  } else {
    const adherenceRate = ((completed - noShows * 0.5) / totalBooked) * 100;
    adherenceScore = Math.max(0, Math.min(100, adherenceRate));
    adherenceDetail = `${completed} of ${patientAppts.length} visits attended${noShows > 0 ? ` · ${noShows} no-show${noShows === 1 ? "" : "s"}` : ""}`;
  }

  factors.push({
    label: "Visit Adherence",
    value: Math.round(adherenceScore),
    status: adherenceScore >= 80 ? "good" : adherenceScore >= 60 ? "warning" : "critical",
    detail: adherenceDetail,
  });

  // ===== 5. Recency (10%) =====
  const lastVisitDate = new Date(patient.lastVisit);
  const daysSinceVisit = Math.floor((Date.now() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24));
  let recencyScore = 100;
  let recencyDetail = "Seen recently";

  if (daysSinceVisit > 365) {
    recencyScore = 30;
    recencyDetail = `Last visit ${daysSinceVisit} days ago — overdue`;
  } else if (daysSinceVisit > 180) {
    recencyScore = 60;
    recencyDetail = `Last visit ${daysSinceVisit} days ago`;
  } else if (daysSinceVisit > 90) {
    recencyScore = 80;
    recencyDetail = `Last visit ${daysSinceVisit} days ago`;
  }

  factors.push({
    label: "Visit Recency",
    value: recencyScore,
    status: recencyScore >= 80 ? "good" : recencyScore >= 60 ? "warning" : "critical",
    detail: recencyDetail,
  });

  // ===== Weighted overall =====
  const weights = [0.30, 0.25, 0.20, 0.15, 0.10];
  const overall = Math.round(
    factors.reduce((sum, f, i) => sum + f.value * weights[i], 0)
  );

  // ===== Trend (simulated — would compare to previous period) =====
  const trend: HealthScoreBreakdown["trend"] =
    overall >= 85 ? "up" : overall >= 60 ? "stable" : "down";

  // ===== Summary =====
  const summary =
    overall >= 85 ? "Excellent health trajectory — keep it up" :
    overall >= 70 ? "Good control — minor adjustments needed" :
    overall >= 50 ? "Needs attention — schedule a review" :
    "Critical — immediate intervention recommended";

  return { overall, trend, factors, summary };
}

function getLatestVitals(vitals: Vital[], patientId: string): Patient["latestVitals"] | null {
  const patientVitals = vitals
    .filter((v) => v.patientId === patientId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  if (patientVitals.length === 0) return null;
  const latest = patientVitals[0];
  return {
    bp_systolic: latest.bp_systolic,
    bp_diastolic: latest.bp_diastolic,
    heartRate: latest.heartRate,
    temperature: latest.temperature,
    bloodSugar: latest.bloodSugar,
    oxygenLevel: latest.oxygenLevel,
    weight: latest.weight,
    timestamp: latest.timestamp,
  };
}

// ============================================================================
// CLINIC INTELLIGENCE — proactive alerts for Today's Brief
// ============================================================================

export interface IntelligenceAlert {
  id: string;
  category: "scheduling" | "inventory" | "financial" | "clinical" | "operational";
  severity: "info" | "warning" | "critical";
  title: string;
  detail: string;
  actionLabel?: string;
  actionTarget?: string;
  metric?: string; // e.g. "+18%", "-24%"
  trend?: "up" | "down" | "stable";
}

/**
 * Compute proactive intelligence alerts for Today's Brief.
 *
 * These are NOT pre-written strings — they're computed from REAL clinic data:
 *   - How many patients are at no-show risk today?
 *   - Which medications will run out within N days?
 *   - How many insurance claims are delayed?
 *   - Is revenue trending up or down vs last week?
 *   - Are there critical lab results awaiting review?
 *
 * The doctor doesn't search for problems. VELTRA brings problems to the doctor.
 */
export function computeClinicIntelligence(
  patients: Patient[],
  appointments: Appointment[],
  medications: Medication[],
  claims: InsuranceClaim[],
  labResults: LabResult[]
): IntelligenceAlert[] {
  const alerts: IntelligenceAlert[] = [];
  const today = new Date().toISOString().split("T")[0];

  // ===== 1. No-show risk =====
  const todaysAppts = appointments.filter(
    (a) => a.date === today && a.status !== "cancelled" && a.status !== "completed"
  );
  const noShowRisk = todaysAppts.filter((a) => {
    const patient = patients.find((p) => p.id === a.patientId);
    return patient && patient.riskScore >= 60;
  });
  if (noShowRisk.length > 0) {
    alerts.push({
      id: "intel-noshow",
      category: "scheduling",
      severity: noShowRisk.length >= 3 ? "warning" : "info",
      title: `${noShowRisk.length} patient${noShowRisk.length === 1 ? "" : "s"} at no-show risk today`,
      detail: `Confirm appointments: ${noShowRisk.map((a) => a.patientName).slice(0, 3).join(", ")}${noShowRisk.length > 3 ? ` +${noShowRisk.length - 3} more` : ""}`,
      actionLabel: "Open schedule",
      actionTarget: "appointments",
      metric: `${noShowRisk.length}`,
    });
  }

  // ===== 2. Inventory depletion =====
  const lowStock = medications.filter((m) => m.stock <= m.minStock);
  const criticalStock = medications.filter((m) => m.stock <= m.minStock * 0.5);
  if (criticalStock.length > 0) {
    alerts.push({
      id: "intel-inventory-critical",
      category: "inventory",
      severity: "critical",
      title: `${criticalStock.length} medication${criticalStock.length === 1 ? "" : "s"} critically low`,
      detail: `${criticalStock.map((m) => m.name).slice(0, 3).join(", ")} — will run out within days`,
      actionLabel: "Restock now",
      actionTarget: "inventory",
      metric: `${criticalStock.length} critical`,
    });
  } else if (lowStock.length > 0) {
    alerts.push({
      id: "intel-inventory-low",
      category: "inventory",
      severity: "warning",
      title: `${lowStock.length} medication${lowStock.length === 1 ? "" : "s"} below minimum stock`,
      detail: `${lowStock.map((m) => `${m.name} (${m.stock} ${m.unit})`).slice(0, 2).join(", ")}`,
      actionLabel: "Open inventory",
      actionTarget: "inventory",
    });
  }

  // ===== 3. Insurance claims delay =====
  const pendingClaims = claims.filter((c) => c.status === "pending" || c.status === "submitted");
  const stuckClaims = pendingClaims.filter((c) => {
    const submitted = new Date(c.submittedAt);
    const daysWaiting = Math.floor((Date.now() - submitted.getTime()) / (1000 * 60 * 60 * 24));
    return daysWaiting > 14;
  });
  if (stuckClaims.length > 0) {
    const totalStuck = stuckClaims.reduce((sum, c) => sum + c.amount, 0);
    alerts.push({
      id: "intel-claims-delay",
      category: "financial",
      severity: "warning",
      title: `${stuckClaims.length} insurance claim${stuckClaims.length === 1 ? "" : "s"} delayed >14 days`,
      detail: `$${totalStuck.toLocaleString()} pending — follow up with ${[...new Set(stuckClaims.map((c) => c.provider))].slice(0, 2).join(", ")}`,
      actionLabel: "Open claims",
      actionTarget: "claims",
      metric: `$${totalStuck.toLocaleString()}`,
    });
  }

  // ===== 4. Critical lab results awaiting review =====
  const criticalLabs = labResults.filter(
    (l) => l.status === "critical" && Date.now() - new Date(l.timestamp).getTime() < 24 * 60 * 60 * 1000
  );
  if (criticalLabs.length > 0) {
    alerts.push({
      id: "intel-critical-labs",
      category: "clinical",
      severity: "critical",
      title: `${criticalLabs.length} critical lab result${criticalLabs.length === 1 ? "" : "s"} need review`,
      detail: `${criticalLabs.map((l) => `${l.patientName} — ${l.testType}`).slice(0, 2).join(", ")}`,
      actionLabel: "Review labs",
      actionTarget: "labs",
      metric: `${criticalLabs.length} critical`,
    });
  }

  // ===== 5. Revenue trend (simulated — would compare to last week) =====
  const todayRevenue = appointments
    .filter((a) => a.date === today && a.status === "completed")
    .length * 350; // avg revenue per visit
  // Simulate last-week comparison
  const lastWeekRevenue = 2800; // would be computed from historical data
  const revenueDelta = ((todayRevenue - lastWeekRevenue) / lastWeekRevenue) * 100;
  if (Math.abs(revenueDelta) > 10) {
    alerts.push({
      id: "intel-revenue",
      category: "financial",
      severity: "info",
      title: `Today's revenue ${revenueDelta > 0 ? "up" : "down"} ${Math.abs(Math.round(revenueDelta))}% vs same day last week`,
      detail: `$${todayRevenue.toLocaleString()} projected today vs $${lastWeekRevenue.toLocaleString()} last week`,
      actionLabel: "Open reports",
      actionTarget: "reports",
      metric: `${revenueDelta > 0 ? "+" : ""}${Math.round(revenueDelta)}%`,
      trend: revenueDelta > 0 ? "up" : "down",
    });
  }

  // ===== 6. Patients overdue for follow-up =====
  const overdueFollowup = patients.filter((p) => {
    if (p.conditions.length === 0) return false;
    const lastVisit = new Date(p.lastVisit);
    const daysSince = Math.floor((Date.now() - lastVisit.getTime()) / (1000 * 60 * 60 * 24));
    return daysSince > 120 && p.status === "active";
  });
  if (overdueFollowup.length > 0) {
    alerts.push({
      id: "intel-overdue-followup",
      category: "clinical",
      severity: "warning",
      title: `${overdueFollowup.length} patient${overdueFollowup.length === 1 ? "" : "s"} overdue for follow-up (>120 days)`,
      detail: `${overdueFollowup.map((p) => p.name).slice(0, 3).join(", ")}${overdueFollowup.length > 3 ? ` +${overdueFollowup.length - 3} more` : ""}`,
      actionLabel: "Message patients",
      actionTarget: "messages",
      metric: `${overdueFollowup.length} overdue`,
    });
  }

  return alerts;
}

// ============================================================================
// CARE QUALITY — Trust Engine replacing ratings
// ============================================================================

/**
 * Compute Care Quality metrics for a clinic or doctor.
 *
 * These are NOT star ratings. They are operational signals:
 *   - Communication: from patient feedback ("Did the doctor explain clearly?")
 *   - Empathy: from patient feedback ("Did you feel respected?")
 *   - Clinical compliance: % of visits following clinical guidelines
 *   - Documentation: % of visits with complete SOAP notes
 *   - Waiting time: inverse of average wait
 *   - Patient understanding: from patient feedback
 *   - Follow-up completion: % of recommended follow-ups that happened
 *   - Prescription accuracy: % without interaction alerts
 *
 * For demo purposes, these are computed from simulated feedback data.
 * In production, they would come from:
 *   - Post-visit patient surveys (3 quick thumbs-up/down questions)
 *   - Visit metadata (timestamps, SOAP note completeness, alerts triggered)
 *   - Follow-up appointment tracking
 */
export function computeCareQuality(
  appointments: Appointment[],
  prescriptions: { status: string }[],
  patientFeedback?: { communication: number; empathy: number; understanding: number }[]
): CareQualityScore {
  const completedVisits = appointments.filter((a) => a.status === "completed");

  // If we have real feedback, use it. Otherwise simulate realistic values.
  const feedback = patientFeedback && patientFeedback.length > 0 ? patientFeedback : [
    { communication: 96, empathy: 94, understanding: 93 },
    { communication: 92, empathy: 95, understanding: 90 },
    { communication: 98, empathy: 97, understanding: 95 },
    { communication: 94, empathy: 92, understanding: 91 },
    { communication: 95, empathy: 96, understanding: 94 },
  ];
  const avg = (arr: number[]) => Math.round(arr.reduce((s, n) => s + n, 0) / arr.length);
  const communication = avg(feedback.map((f) => f.communication));
  const empathy = avg(feedback.map((f) => f.empathy));
  const patientUnderstanding = avg(feedback.map((f) => f.understanding));

  // Clinical compliance — % of visits that followed guidelines (simulated)
  const clinicalCompliance = Math.min(100, 85 + Math.round(completedVisits.length * 0.5));

  // Documentation — % of visits with complete notes (simulated based on visit count)
  const documentation = Math.min(100, 90 + Math.round(completedVisits.length * 0.3));

  // Waiting time — simulated (would be computed from check-in to visit-start)
  const waitingTime = 89; // would be: inverse of avg wait minutes

  // Follow-up completion — % of recommended follow-ups that actually happened
  const followUps = appointments.filter((a) => a.type?.toLowerCase().includes("follow"));
  const completedFollowUps = followUps.filter((a) => a.status === "completed").length;
  const followUpCompletion = followUps.length > 0
    ? Math.round((completedFollowUps / followUps.length) * 100)
    : 91;

  // Prescription accuracy — % without interaction alerts
  const totalRx = prescriptions.length || 1;
  const cleanRx = prescriptions.filter((p) => p.status === "active").length;
  const prescriptionAccuracy = Math.round((cleanRx / totalRx) * 100);

  // Weighted overall
  const overall = Math.round(
    communication * 0.15 +
    empathy * 0.10 +
    clinicalCompliance * 0.20 +
    documentation * 0.15 +
    waitingTime * 0.10 +
    patientUnderstanding * 0.10 +
    followUpCompletion * 0.10 +
    prescriptionAccuracy * 0.10
  );

  const trend: CareQualityScore["trend"] =
    overall >= 90 ? "up" : overall >= 75 ? "stable" : "down";

  return {
    communication,
    empathy,
    clinicalCompliance,
    documentation,
    waitingTime,
    patientUnderstanding,
    followUpCompletion,
    prescriptionAccuracy,
    overall,
    trend,
    sampleSize: completedVisits.length || feedback.length,
  };
}

// ============================================================================
// PATIENT FLAGS — operational tags (NOT personal ratings)
// ============================================================================

export const PATIENT_FLAG_PRESETS: Omit<PatientFlag, "id" | "setBy" | "setAt">[] = [
  // Attendance
  { category: "attendance", value: "punctual",          label: "Punctual — always on time",           severity: "info" },
  { category: "attendance", value: "frequently_late",   label: "Frequently late",                      severity: "warning" },
  { category: "attendance", value: "frequent_cancellations", label: "Frequent cancellations",           severity: "warning" },
  { category: "attendance", value: "no_show_risk",      label: "High no-show risk",                    severity: "critical" },

  // Medication
  { category: "medication", value: "adherent",          label: "Adherent to medication",               severity: "info" },
  { category: "medication", value: "needs_coaching",    label: "Needs medication coaching",            severity: "warning" },
  { category: "medication", value: "non_adherent",      label: "Non-adherent to medication",           severity: "critical" },

  // Communication
  { category: "communication", value: "responsive",     label: "Responsive — replies quickly",         severity: "info" },
  { category: "communication", value: "needs_phone",    label: "Needs phone follow-up",                severity: "warning" },
  { category: "communication", value: "needs_interpreter", label: "Needs interpreter",                 severity: "warning" },

  // Clinical
  { category: "clinical", value: "high_risk",           label: "High risk patient",                    severity: "critical" },
  { category: "clinical", value: "fall_risk",           label: "Fall risk",                            severity: "warning" },
  { category: "clinical", value: "diabetic",            label: "Diabetic — needs regular monitoring", severity: "info" },
  { category: "clinical", value: "hypertension",        label: "Hypertension — monitor BP",           severity: "info" },
  { category: "clinical", value: "elderly",             label: "Elderly — extra care needed",          severity: "info" },

  // Financial
  { category: "financial", value: "insurance_pending",  label: "Insurance pending",                    severity: "warning" },
  { category: "financial", value: "outstanding_balance", label: "Outstanding balance",                 severity: "warning" },
  { category: "financial", value: "financial_hardship", label: "Financial hardship — arrange plan",   severity: "info" },
];

export const FLAG_CATEGORY_META: Record<
  PatientFlag["category"],
  { label: string; color: string; icon: string }
> = {
  attendance:    { label: "Attendance",    color: "text-violet-400",  icon: "📅" },
  medication:    { label: "Medication",    color: "text-rose-400",    icon: "💊" },
  communication: { label: "Communication", color: "text-blue-400",    icon: "💬" },
  clinical:      { label: "Clinical",      color: "text-amber-400",   icon: "🩺" },
  financial:     { label: "Financial",     color: "text-emerald-400", icon: "💵" },
};

export const FLAG_SEVERITY_META: Record<
  PatientFlag["severity"],
  { bg: string; text: string; border: string }
> = {
  info:     { bg: "bg-foreground/[0.04]",       text: "text-muted-foreground", border: "border-border/40" },
  warning:  { bg: "bg-amber-500/10",            text: "text-amber-300",       border: "border-amber-500/20" },
  critical: { bg: "bg-red-500/10",              text: "text-red-300",         border: "border-red-500/20" },
};
