import { NextRequest, NextResponse } from "next/server";
import { withApiProtection } from "@/lib/api-middleware";

/**
 * GET /api/export?patientId=p1
 * 
 * Exports all patient data as JSON (GDPR right to data portability).
 * In production: verify JWT + tenant access before exporting.
 */
export const GET = withApiProtection(async (req: NextRequest) => {
  const url = new URL(req.url);
  const patientId = url.searchParams.get("patientId");

  if (!patientId) {
    return NextResponse.json(
      { data: null, error: { code: "MISSING_PARAM", message: "patientId is required" } },
      { status: 400 }
    );
  }

  // In production: fetch from database via dataAccess
  // In demo: return a structured export template
  const exportData = {
    meta: {
      exportedAt: new Date().toISOString(),
      format: "FHIR-compatible JSON",
      version: "1.0",
      patientId,
    },
    patient: {
      resourceType: "Patient",
      id: patientId,
      // In production: full patient demographics
    },
    encounters: [],
    conditions: [],
    medications: [],
    observations: [],  // labs + vitals
    allergyIntolerances: [],
    immunizations: [],
    documentReferences: [],
    // Audit trail of this export (for compliance)
    auditEntry: {
      action: "DATA_EXPORT",
      timestamp: new Date().toISOString(),
      actor: "patient", // or userId
      reason: "GDPR Article 20 — Right to data portability",
    },
  };

  return NextResponse.json({
    data: exportData,
    error: null,
  }, {
    headers: {
      "Content-Disposition": `attachment; filename="patient-${patientId}-export.json"`,
    },
  });
}, { rateLimit: "api", csrf: true });
