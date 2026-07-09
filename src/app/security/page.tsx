"use client";

import { motion } from "framer-motion";
import { Shield, Lock, Eye, Database, Cloud, KeyRound, FileCheck, RefreshCw, Server, Globe, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const EASE = [0.16, 1, 0.3, 1] as const;

const COMPLIANCE = [
  { name: "HIPAA", region: "United States", desc: "Privacy Rule, Security Rule, Breach Notification" },
  { name: "GDPR", region: "European Union", desc: "Lawful basis, right to erasure, data portability" },
  { name: "NPHIES", region: "Saudi Arabia", desc: "National e-Health Information Exchange" },
  { name: "PDPL", region: "Saudi Arabia", desc: "Personal Data Protection Law" },
  { name: "DHA", region: "Dubai", desc: "Dubai Health Authority compliance" },
  { name: "DOH", region: "Abu Dhabi", desc: "Department of Health standards" },
];

const SECURITY_LAYERS = [
  {
    icon: Lock,
    title: "Encryption at Rest",
    desc: "AES-256 encryption for all databases, object storage, and backups. Patient data is unreadable without authorized access.",
  },
  {
    icon: Globe,
    title: "Encryption in Transit",
    desc: "TLS 1.3 for all connections. No HTTP except localhost. Every byte between you and Veltra is encrypted.",
  },
  {
    icon: KeyRound,
    title: "Authentication",
    desc: "Email + password with bcrypt hashing (12 rounds). Optional 2FA (TOTP) for admins. Session timeout after 8 hours of inactivity.",
  },
  {
    icon: Eye,
    title: "Role-Based Access",
    desc: "Four roles (Admin, Doctor, Receptionist, Nurse) — each sees only what they need. Permissions enforced server-side, not just hidden in the UI.",
  },
  {
    icon: FileCheck,
    title: "Audit Logging",
    desc: "Every PHI access, every login, every edit, every export — logged with userId, action, target, and timestamp. Immutable. 7-year retention.",
  },
  {
    icon: Database,
    title: "Multi-Tenant Isolation",
    desc: "Row-Level Security on every tenant-scoped table. Your data never leaks to another clinic. Cross-tenant queries require explicit admin bypass.",
  },
  {
    icon: RefreshCw,
    title: "Backups & Recovery",
    desc: "Full backup nightly. Incremental every 15 minutes. 30-day retention. Quarterly restore drills. 7-year cold storage for audit.",
  },
  {
    icon: Server,
    title: "Infrastructure",
    desc: "Hosted on Vercel (web) + Railway (backend). Cloudflare WAF + rate limiting. DDoS protection. 99.9% uptime SLA on Enterprise tier.",
  },
];

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-background veltra-ambient">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border/20">
        <div className="mx-auto max-w-4xl px-6 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <img src="/logo-symbol.png" alt="Veltra" className="object-cover h-7 w-7 rounded-lg veltra-shadow" />
            <span className="text-body font-semibold tracking-tight text-foreground">Veltra</span>
            <span className="text-micro text-muted-foreground/60 normal-case tracking-normal ml-2">/ Security</span>
          </a>
          <a href="/">
            <Button size="sm" variant="ghost" className="h-8 text-caption text-muted-foreground hover:text-foreground">
              Back to home
            </Button>
          </a>
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-6 py-20">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE }}>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-4 w-4 text-veltra-emerald" />
            <span className="text-micro text-veltra-emerald">Security & Compliance</span>
          </div>
          <h1 className="text-[3rem] sm:text-[3.5rem] leading-[1.05] tracking-[-0.035em] font-semibold text-foreground">
            <span className="text-editorial-italic text-muted-foreground">Your patients</span> trust you.
            <br />
            We protect that trust.
          </h1>
          <p className="text-body text-muted-foreground mt-6 max-w-2xl leading-relaxed">
            Healthcare data is sacred. Veltra is built from the ground up to protect it — with encryption, audit trails, and compliance frameworks that meet the standards of clinics in Saudi Arabia, the UAE, Europe, and North America.
          </p>
        </motion.div>

        {/* Compliance badges */}
        <motion.section initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: EASE }} className="mt-20">
          <p className="text-micro text-veltra-emerald mb-6">Compliance Frameworks</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {COMPLIANCE.map((cert, i) => (
              <motion.div
                key={cert.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05, ease: EASE }}
                className="veltra-glass rounded-2xl p-5 veltra-shadow"
              >
                <Shield className="h-5 w-5 text-veltra-emerald mb-3" />
                <p className="text-body font-semibold text-foreground">{cert.name}</p>
                <p className="text-micro text-muted-foreground normal-case tracking-normal mt-0.5">{cert.region}</p>
                <p className="text-caption text-muted-foreground mt-3 leading-relaxed">{cert.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Security layers */}
        <motion.section initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: EASE }} className="mt-24">
          <p className="text-micro text-veltra-emerald mb-4">How We Protect Your Data</p>
          <h2 className="text-[2rem] leading-tight tracking-[-0.02em] font-semibold text-foreground mb-12">
            Eight layers of <span className="text-editorial-italic text-muted-foreground">defense.</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {SECURITY_LAYERS.map((layer, i) => (
              <motion.div
                key={layer.title}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05, ease: EASE }}
                className="flex gap-4"
              >
                <div className="h-10 w-10 rounded-xl bg-veltra-emerald/10 flex items-center justify-center flex-shrink-0">
                  <layer.icon className="h-5 w-5 text-veltra-emerald" />
                </div>
                <div>
                  <p className="text-body font-semibold text-foreground">{layer.title}</p>
                  <p className="text-caption text-muted-foreground mt-1 leading-relaxed">{layer.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* The Three Rules */}
        <motion.section initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: EASE }} className="mt-24">
          <p className="text-micro text-veltra-emerald mb-4">Our Security Philosophy</p>
          <h2 className="text-[2rem] leading-tight tracking-[-0.02em] font-semibold text-foreground mb-8">
            Always assume <span className="text-editorial-italic text-muted-foreground">healthcare data is sensitive.</span>
          </h2>
          <div className="space-y-4">
            {[
              { rule: "Least privilege", desc: "Every user, every service, every token gets the minimum access required." },
              { rule: "Server-side validation", desc: "Never trust the client. Every mutation is validated on the server." },
              { rule: "PHI minimization in logs", desc: "Never log a full patient name or phone. Mask in logs: Ahmed H. +966 ••• 4567." },
              { rule: "Right to erasure", desc: "Any patient can request deletion. Hard-delete with audit trail of the deletion itself." },
              { rule: "Breach readiness", desc: "Every breach path has an alert. Every alert has an on-call owner." },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05, ease: EASE }}
                className="flex gap-4 py-3 border-b border-border/20"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-veltra-emerald flex-shrink-0 mt-2.5" />
                <div>
                  <p className="text-body font-semibold text-foreground">{item.rule}</p>
                  <p className="text-caption text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Data residency */}
        <motion.section initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: EASE }} className="mt-24">
          <p className="text-micro text-veltra-emerald mb-4">Data Residency</p>
          <h2 className="text-[2rem] leading-tight tracking-[-0.02em] font-semibold text-foreground mb-8">
            Your data stays <span className="text-editorial-italic text-muted-foreground">where it belongs.</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { region: "EU", city: "Frankfurt", use: "Default for GDPR" },
              { region: "KSA", city: "Riyadh", use: "For NPHIES" },
              { region: "UAE", city: "Dubai", use: "For DHA" },
            ].map((loc) => (
              <div key={loc.region} className="veltra-glass rounded-xl p-4 veltra-shadow">
                <Cloud className="h-4 w-4 text-veltra-emerald mb-2" />
                <p className="text-caption font-semibold text-foreground">{loc.region}</p>
                <p className="text-micro text-muted-foreground normal-case tracking-normal">{loc.city}</p>
                <p className="text-micro text-veltra-emerald normal-case tracking-normal mt-2">{loc.use}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Incident response */}
        <motion.section initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: EASE }} className="mt-24">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-4 w-4 text-veltra-emerald" />
            <p className="text-micro text-veltra-emerald">Incident Response</p>
          </div>
          <h2 className="text-[2rem] leading-tight tracking-[-0.02em] font-semibold text-foreground mb-8">
            If something goes wrong, <span className="text-editorial-italic text-muted-foreground">you'll know.</span>
          </h2>
          <div className="veltra-glass rounded-2xl p-6 veltra-shadow">
            <ol className="space-y-4">
              {[
                { step: "1", title: "Detection", desc: "Automated alerts on anomalous access patterns, failed auth spikes, or PHI exposure." },
                { step: "2", title: "Containment", desc: "Affected accounts suspended within 60 seconds. Tokens revoked. Access blocked." },
                { step: "3", title: "Notification", desc: "Affected clinics notified within 72 hours (HIPAA requirement). Regulators notified as required." },
                { step: "4", title: "Recovery", desc: "Restore from clean backup. Patch vulnerability. Post-incident review within 14 days." },
              ].map((item) => (
                <li key={item.step} className="flex gap-4">
                  <span className="h-7 w-7 rounded-full bg-veltra-emerald/15 text-veltra-emerald text-caption font-semibold flex items-center justify-center flex-shrink-0">{item.step}</span>
                  <div>
                    <p className="text-body font-semibold text-foreground">{item.title}</p>
                    <p className="text-caption text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </motion.section>

        {/* CTA */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: EASE }} className="mt-24 text-center">
          <p className="text-body text-muted-foreground mb-6">
            Questions about security? We're happy to walk you through it.
          </p>
          <a href="mailto:security@veltrahealth.co">
            <Button variant="outline" className="h-11 px-7 veltra-shadow border-0 bg-foreground/[0.04] text-foreground font-medium">
              Contact our security team
            </Button>
          </a>
          <p className="text-micro text-muted-foreground/60 normal-case tracking-normal mt-6">
            security@veltrahealth.co
          </p>
        </motion.div>
      </div>
    </div>
  );
}
