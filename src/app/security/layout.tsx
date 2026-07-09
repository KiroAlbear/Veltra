import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security & Compliance — Veltra",
  description: "HIPAA, GDPR, NPHIES, PDPL compliant. Encryption at rest and in transit. Audit logging, role-based access, and data residency for healthcare clinics.",
  openGraph: {
    title: "Security & Compliance — Veltra",
    description: "Your patients trust you. We protect that trust.",
  },
};

export default function SecurityLayout({ children }: { children: React.ReactNode }) {
  return children;
}
