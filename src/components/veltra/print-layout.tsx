"use client";

/**
 * VeltraPrintLayout — Professional clinical print template
 *
 * Produces a print-ready document with:
 *   - Veltra logo + clinic name + location (header left)
 *   - Doctor name + title (header right)
 *   - Patient name + age + gender + MRN (sub-header)
 *   - Document title + date
 *   - Body content (passed as children)
 *   - Doctor signature + stamp box (footer left)
 *   - Patient signature line (footer right)
 *   - Handwritten note area (optional, when `withNoteSpace=true`)
 *   - Page numbers + clinic phone + veltrahealth.co
 *
 * This is what a doctor actually prints:
 *   - Prescription pad
 *   - Lab order
 *   - Visit summary
 *   - Referral letter
 *   - Medical certificate
 *
 * Used in: Timeline (patient chart), Brief (daily summary), and any
 * "Print" button on a clinical document.
 */
import { useVeltra, type Patient } from "@/lib/veltra-store";

interface VeltraPrintLayoutProps {
  /** Document type, e.g. "Prescription", "Lab Order", "Visit Summary" */
  title: string;
  /** ISO date string or human-readable date */
  date?: string;
  /** Patient being printed about (optional — Brief doesn't have one) */
  patient?: Patient;
  /** Show a blank box for handwritten notes (default: true) */
  withNoteSpace?: boolean;
  /** Show doctor signature + stamp area (default: true) */
  withSignature?: boolean;
  /** Children = body content */
  children: React.ReactNode;
}

export function VeltraPrintLayout({
  title,
  date,
  patient,
  withNoteSpace = true,
  withSignature = true,
  children,
}: VeltraPrintLayoutProps) {
  const currentUser = useVeltra((s) => s.currentUser);
  const currentLocationId = useVeltra((s) => s.currentLocationId);
  const locations = useVeltra((s) => s.locations);
  const clinic = locations.find((l) => l.id === currentLocationId) || locations[0];

  const today = date || new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Patient descriptor for header (e.g. "Ahmed Hassan · 45M · MRN P-001")
  const patientLine = patient
    ? `${patient.name} · ${patient.age}${patient.gender} · MRN ${patient.id.toUpperCase()}`
    : null;

  // Doctor descriptor for header right
  const doctorName = currentUser?.name || "—";
  const doctorTitle = currentUser?.title || "";

  return (
    <>
      {/* ===== PRINT HEADER ===== */}
      <div className="print-only veltra-print-header" style={{ display: "none" }}>
        {/* Left: Veltra logo + clinic info */}
        <div className="header-left">
          <div className="logo-row">
            <img
              src="/logo-symbol.png"
              alt="Veltra"
              className="logo-mark"
              style={{ width: "32px", height: "32px", borderRadius: "8px" }}
            />
            <div className="logo-text-block">
              <span className="logo-text">Veltra</span>
              <span className="logo-tagline">The Clinic Operating System</span>
            </div>
          </div>
          <div className="clinic-info">
            <strong>{clinic?.name || "Veltra Clinic"}</strong>
            <span>{clinic?.address || ""}</span>
            <span>Tel: {clinic?.phone || ""}</span>
          </div>
        </div>

        {/* Right: Document title + date + patient */}
        <div className="header-right">
          <h1 className="doc-title">{title}</h1>
          <p className="doc-date">{today}</p>
          {patientLine && <p className="doc-patient">{patientLine}</p>}
        </div>
      </div>

      {/* ===== DOCTOR STRIP (below header) ===== */}
      <div className="print-only veltra-doctor-strip" style={{ display: "none" }}>
        <div>
          <span className="strip-label">Physician:</span>{" "}
          <strong>{doctorName}</strong>
          {doctorTitle && <span className="strip-title"> · {doctorTitle}</span>}
        </div>
        <div className="strip-doc-id">License: _______________</div>
      </div>

      {/* ===== BODY ===== */}
      <div className="veltra-print-body">{children}</div>

      {/* ===== HANDWRITTEN NOTE SPACE ===== */}
      {withNoteSpace && (
        <div className="print-only veltra-note-space" style={{ display: "none" }}>
          <p className="note-label">Clinical Notes (handwritten):</p>
          <div className="note-lines">
            <div className="note-line" />
            <div className="note-line" />
            <div className="note-line" />
            <div className="note-line" />
          </div>
        </div>
      )}

      {/* ===== SIGNATURE + STAMP ===== */}
      {withSignature && (
        <div className="print-only veltra-signature-row" style={{ display: "none" }}>
          <div className="signature-block">
            <div className="stamp-box">
              <span className="stamp-label">Stamp</span>
            </div>
            <div className="signature-line">
              <span className="signature-name">{doctorName}</span>
              <span className="signature-role">Physician signature</span>
            </div>
          </div>
          <div className="signature-block patient">
            <div className="signature-line">
              <span className="signature-name">&nbsp;</span>
              <span className="signature-role">Patient / Guardian signature</span>
            </div>
          </div>
        </div>
      )}

      {/* ===== FOOTER ===== */}
      <div className="print-only veltra-print-footer" style={{ display: "none" }}>
        <span className="copyright">
          © {new Date().getFullYear()} {clinic?.name || "Veltra Clinic"} · Printed via Veltra
        </span>
        <span className="tagline">Technology disappears. Care remains.</span>
        <span className="page-num">veltrahealth.co</span>
      </div>
    </>
  );
}
