/**
 * VELTRA — Feature Flags System
 *
 * Enables/disables features per:
 *   - Tenant (clinic-specific flags)
 *   - Role (admin-only features)
 *   - Country (regulatory compliance)
 *   - Beta (early access)
 *   - Pilot (specific customers)
 *
 * This lets us ship features to one customer without breaking others.
 *
 * Usage:
 *   if (featureFlags.isEnabled("ai_scribe", { tenantId, role })) { ... }
 *
 * Flags are defined here (single source of truth) and can be overridden
 * per-tenant in the database (tenant.featureOverrides JSON column).
 */

export type FeatureFlagKey =
  // Clinical
  | "ehr_full"
  | "prescription_engine"
  | "drug_interactions"
  | "clinical_decision_support"
  | "ai_scribe"
  | "ai_diagnosis"
  | "ai_risk_engine"
  | "ai_coding"
  | "smart_import_ocr"
  | "smart_import_llm"
  // Platform
  | "multi_organization"
  | "workflow_builder"
  | "form_builder"
  | "dashboard_builder"
  | "developer_api"
  | "webhooks"
  | "marketplace"
  | "white_label"
  // Communication
  | "whatsapp_integration"
  | "sms_reminders"
  | "email_notifications"
  | "telemedicine"
  // Mobile
  | "patient_app"
  | "doctor_app"
  | "reception_display"
  | "self_checkin_kiosk"
  // Compliance
  | "audit_trail"
  | "break_glass"
  | "data_versioning"
  | "offline_mode"
  // Analytics
  | "cost_dashboard"
  | "population_health"
  | "benchmarking";

export interface FeatureFlagConfig {
  key: FeatureFlagKey;
  label: string;
  description: string;
  category: "clinical" | "ai" | "platform" | "communication" | "mobile" | "compliance" | "analytics";
  defaultEnabled: boolean;
  /** Roles that can access this feature (empty = all roles) */
  roles?: string[];
  /** Countries where this feature is available (empty = all countries) */
  countries?: string[];
  /** Beta features show a "Beta" badge */
  beta?: boolean;
  /** Enterprise-only features */
  enterpriseOnly?: boolean;
}

/**
 * Master flag definitions — single source of truth.
 * Add new flags here, they automatically appear in Settings → Feature Flags.
 */
export const FEATURE_FLAGS: Record<FeatureFlagKey, FeatureFlagConfig> = {
  // ===== Clinical =====
  ehr_full: {
    key: "ehr_full", label: "Full EHR", description: "SOAP notes, surgical history, vaccinations, chronic disease tracking",
    category: "clinical", defaultEnabled: true,
  },
  prescription_engine: {
    key: "prescription_engine", label: "Prescription Engine", description: "Pregnancy check, pediatric/renal dose, generic alternatives",
    category: "clinical", defaultEnabled: true,
  },
  drug_interactions: {
    key: "drug_interactions", label: "Drug Interactions", description: "Real-time interaction checking against RxNorm database",
    category: "clinical", defaultEnabled: true,
  },
  clinical_decision_support: {
    key: "clinical_decision_support", label: "Clinical Decision Support", description: "AI suggests labs, diagnoses, and follow-ups based on patient data",
    category: "clinical", defaultEnabled: false, beta: true,
  },

  // ===== AI =====
  ai_scribe: {
    key: "ai_scribe", label: "AI Scribe", description: "Voice-to-SOAP notes during patient visits",
    category: "ai", defaultEnabled: false, beta: true,
  },
  ai_diagnosis: {
    key: "ai_diagnosis", label: "AI Diagnosis Suggestions", description: "Suggests differential diagnoses based on symptoms and history",
    category: "ai", defaultEnabled: false, beta: true,
  },
  ai_risk_engine: {
    key: "ai_risk_engine", label: "AI Risk Engine", description: "Predicts no-show, readmission, and disease progression risk",
    category: "ai", defaultEnabled: false, beta: true,
  },
  ai_coding: {
    key: "ai_coding", label: "AI Coding (ICD/SNOMED)", description: "Auto-suggests ICD-10, CPT, SNOMED codes from clinical notes",
    category: "ai", defaultEnabled: false, beta: true,
  },
  smart_import_ocr: {
    key: "smart_import_ocr", label: "Smart Import OCR", description: "Extract text from PDFs and scanned images",
    category: "ai", defaultEnabled: true,
  },
  smart_import_llm: {
    key: "smart_import_llm", label: "Smart Import AI Extraction", description: "LLM-powered medical entity extraction from uploaded files",
    category: "ai", defaultEnabled: true,
  },

  // ===== Platform =====
  multi_organization: {
    key: "multi_organization", label: "Multi-Organization", description: "Manage multiple clinics, branches, and departments from one account",
    category: "platform", defaultEnabled: false, enterpriseOnly: true,
  },
  workflow_builder: {
    key: "workflow_builder", label: "Workflow Builder", description: "No-code automation: drag-and-drop patient flows",
    category: "platform", defaultEnabled: false, enterpriseOnly: true,
  },
  form_builder: {
    key: "form_builder", label: "Form Builder", description: "Create custom clinical and intake forms without code",
    category: "platform", defaultEnabled: false, enterpriseOnly: true,
  },
  dashboard_builder: {
    key: "dashboard_builder", label: "Dashboard Builder", description: "Customize dashboards per role or user",
    category: "platform", defaultEnabled: false, enterpriseOnly: true,
  },
  developer_api: {
    key: "developer_api", label: "Developer API", description: "REST API + API keys for third-party integrations",
    category: "platform", defaultEnabled: true,
  },
  webhooks: {
    key: "webhooks", label: "Webhooks", description: "Send event notifications to external systems",
    category: "platform", defaultEnabled: true,
  },
  marketplace: {
    key: "marketplace", label: "Marketplace", description: "Install plugins and integrations from third parties",
    category: "platform", defaultEnabled: false, beta: true,
  },
  white_label: {
    key: "white_label", label: "White Label", description: "Custom branding, domain, and logo for your clinic network",
    category: "platform", defaultEnabled: false, enterpriseOnly: true,
  },

  // ===== Communication =====
  whatsapp_integration: {
    key: "whatsapp_integration", label: "WhatsApp Integration", description: "Send appointment reminders and patient messages via WhatsApp",
    category: "communication", defaultEnabled: true,
  },
  sms_reminders: {
    key: "sms_reminders", label: "SMS Reminders", description: "Send appointment reminders via SMS",
    category: "communication", defaultEnabled: true,
  },
  email_notifications: {
    key: "email_notifications", label: "Email Notifications", description: "Send lab results, invoices, and follow-ups via email",
    category: "communication", defaultEnabled: true,
  },
  telemedicine: {
    key: "telemedicine", label: "Telemedicine", description: "Video consultations within Veltra",
    category: "communication", defaultEnabled: false, beta: true,
  },

  // ===== Mobile =====
  patient_app: {
    key: "patient_app", label: "Patient App", description: "Patient portal web app (native mobile in Phase 5)",
    category: "mobile", defaultEnabled: true,
  },
  doctor_app: {
    key: "doctor_app", label: "Doctor Mobile App", description: "Native iOS/Android app for doctors",
    category: "mobile", defaultEnabled: false, beta: true,
  },
  reception_display: {
    key: "reception_display", label: "Reception Display", description: "Waiting room screen with queue and current patient",
    category: "mobile", defaultEnabled: false,
  },
  self_checkin_kiosk: {
    key: "self_checkin_kiosk", label: "Self Check-in Kiosk", description: "iPad kiosk for patient self check-in",
    category: "mobile", defaultEnabled: false,
  },

  // ===== Compliance =====
  audit_trail: {
    key: "audit_trail", label: "Audit Trail", description: "Every action logged, tamper-evident, 7-year retention",
    category: "compliance", defaultEnabled: true,
  },
  break_glass: {
    key: "break_glass", label: "Break-Glass Access", description: "Emergency elevated access with mandatory review",
    category: "compliance", defaultEnabled: true,
  },
  data_versioning: {
    key: "data_versioning", label: "Data Versioning", description: "Every medical record edit saved as a version — rollback to any point",
    category: "compliance", defaultEnabled: false, beta: true,
  },
  offline_mode: {
    key: "offline_mode", label: "Offline Mode", description: "Continue working without internet — sync when reconnected",
    category: "compliance", defaultEnabled: false, beta: true,
  },

  // ===== Analytics =====
  cost_dashboard: {
    key: "cost_dashboard", label: "Cost Dashboard", description: "Track AI/OCR/storage cost per request and per patient",
    category: "analytics", defaultEnabled: false, beta: true,
  },
  population_health: {
    key: "population_health", label: "Population Health", description: "Aggregate patient trends across your clinic",
    category: "analytics", defaultEnabled: false, beta: true,
  },
  benchmarking: {
    key: "benchmarking", label: "Benchmarking", description: "Compare your clinic's metrics against anonymized peers",
    category: "analytics", defaultEnabled: false, beta: true,
  },
};

export interface FeatureFlagContext {
  tenantId?: string;
  role?: string;
  country?: string;
  tier?: "platform" | "enterprise";
  /** Per-tenant overrides from database (tenant.featureOverrides) */
  overrides?: Partial<Record<FeatureFlagKey, boolean>>;
}

/**
 * Check if a feature flag is enabled for the given context.
 *
 * Priority (highest wins):
 *   1. Tenant override (from database)
 *   2. Enterprise-only check (tier must be "enterprise")
 *   3. Country restriction
 *   4. Role restriction
 *   5. Default enabled
 */
export function isFeatureEnabled(key: FeatureFlagKey, ctx: FeatureFlagContext = {}): boolean {
  const flag = FEATURE_FLAGS[key];
  if (!flag) return false;

  // 1. Tenant override (highest priority)
  if (ctx.overrides && key in ctx.overrides) {
    return ctx.overrides[key]!;
  }

  // 2. Enterprise-only check
  if (flag.enterpriseOnly && ctx.tier !== "enterprise") {
    return false;
  }

  // 3. Country restriction
  if (flag.countries && flag.countries.length > 0 && ctx.country) {
    if (!flag.countries.includes(ctx.country)) {
      return false;
    }
  }

  // 4. Role restriction
  if (flag.roles && flag.roles.length > 0 && ctx.role) {
    if (!flag.roles.includes(ctx.role)) {
      return false;
    }
  }

  // 5. Default
  return flag.defaultEnabled;
}

/**
 * Get all enabled features for a context — useful for showing/hiding UI sections.
 */
export function getEnabledFeatures(ctx: FeatureFlagContext = {}): FeatureFlagKey[] {
  return (Object.keys(FEATURE_FLAGS) as FeatureFlagKey[]).filter((key) =>
    isFeatureEnabled(key, ctx)
  );
}

/**
 * Get all flags grouped by category — for the Settings → Feature Flags admin screen.
 */
export function getFlagsByCategory(): Record<FeatureFlagConfig["category"], FeatureFlagConfig[]> {
  const grouped: Record<FeatureFlagConfig["category"], FeatureFlagConfig[]> = {
    clinical: [], ai: [], platform: [], communication: [], mobile: [], compliance: [], analytics: [],
  };
  for (const flag of Object.values(FEATURE_FLAGS)) {
    grouped[flag.category].push(flag);
  }
  return grouped;
}
