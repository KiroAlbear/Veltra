import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Engineering Constitution — Veltra",
  description: "The single source of truth for every decision made inside Veltra. Three Laws, Decision Priority, Security Principles, and Definition of Done.",
  openGraph: {
    title: "The Veltra Constitution",
    description: "Remember everything. Reduce every click. Never interrupt care.",
  },
};

export default function ConstitutionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
