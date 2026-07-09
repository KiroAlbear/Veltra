"use client";

import { motion } from "framer-motion";
import { ArrowRight, Shield, Brain, Heart, Code, Eye, Lock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const EASE = [0.16, 1, 0.3, 1] as const;

const THREE_LAWS = [
  { law: "Remember everything.", desc: "Every action creates memory. Every memory becomes context for the next decision." },
  { law: "Reduce every click.", desc: "Three clicks or fewer to any primary action. Friction is the enemy of care." },
  { law: "Never interrupt care.", desc: "A doctor's flow through a patient visit is sacred. Beauty serves the experience — never the other way around." },
];

const PRODUCT_PHILOSOPHY = [
  { phase: "Work", status: "Available Today", desc: "The operational foundation. Every workflow, appointment, and record — running without friction." },
  { phase: "Memory", status: "Coming Next", desc: "Everything the clinic has ever done becomes searchable, connected, and ready to act on." },
  { phase: "Judgment", status: "Future", desc: "Veltra surfaces what matters before you ask. Predicts what comes next." },
];

const DECISION_PRIORITY = [
  { n: "01", en: "Patient Safety" },
  { n: "02", en: "Clinical Workflow" },
  { n: "03", en: "Simplicity" },
  { n: "04", en: "Reliability" },
  { n: "05", en: "Performance" },
  { n: "06", en: "Developer Experience" },
  { n: "07", en: "Visual Design" },
];

const DESIGN_PRINCIPLES = [
  "One focal point per screen. The eye knows where to land within 200ms.",
  "Three clicks or fewer to any primary action.",
  "Every destructive action requires confirmation.",
  "No infinite animations except the LIVE pulse.",
  "Every empty state is designed, not defaulted.",
  "Mobile-first, then expanded.",
  "Touch targets minimum 44×44px.",
  "All text meets WCAG AA contrast.",
];

const ENGINEERING_PRINCIPLES = [
  "Always assume healthcare data is sensitive.",
  "Server-side validation on every mutation. Never trust the client.",
  "Every action is audit-logged: userId, action, target, timestamp.",
  "Migrations are forward-only. Down migrations are forbidden in production.",
  "Cursor-based pagination, never offset-based.",
  "No blocking the main thread for > 50ms.",
  "Every table has tenantId. Row-Level Security on every tenant-scoped table.",
  "The system must be operable for 20 years without a full rewrite.",
];

const BRAND_VOICE_DO = ["Reliable.", "Quiet.", "Confident.", "Human.", "Professional."];
const BRAND_VOICE_DONT = ["Revolutionary", "Game-changing", "Disruptive", "World's best", "Leverage", "Seamless", "Intelligent"];

const DEFINITION_OF_DONE = [
  "Works on Desktop", "Works on Laptop", "Works on Tablet", "Works on Mobile",
  "Accessible", "Responsive", "Production Ready", "Secure",
  "Fast", "Tested", "Reusable Components", "Documented",
];

export default function ConstitutionPage() {
  return (
    <div className="min-h-screen bg-background veltra-ambient">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border/20">
        <div className="mx-auto max-w-3xl px-6 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <img src="/logo-symbol.png" alt="Veltra" className="object-cover h-7 w-7 rounded-lg veltra-shadow" />
            <span className="text-body font-semibold tracking-tight text-foreground">Veltra</span>
            <span className="text-micro text-muted-foreground/60 normal-case tracking-normal ml-2">/ Constitution</span>
          </a>
          <a href="/">
            <Button size="sm" variant="ghost" className="h-8 text-caption text-muted-foreground hover:text-foreground">
              Back to home
            </Button>
          </a>
        </div>
      </nav>

      <div className="mx-auto max-w-3xl px-6 py-20">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE }}>
          <p className="text-micro text-veltra-emerald mb-4">Veltra Engineering Constitution · v1.0</p>
          <h1 className="text-[3rem] sm:text-[3.5rem] leading-[1.05] tracking-[-0.035em] font-semibold text-foreground">
            <span className="text-editorial-italic text-muted-foreground">The</span> Constitution.
          </h1>
          <p className="text-body text-muted-foreground mt-6 max-w-xl leading-relaxed">
            The single source of truth for every decision made inside Veltra — code, design, copy, data, security, and direction. This is the contract that every engineer, designer, and product manager must obey before writing a single line of code.
          </p>
        </motion.div>

        {/* Three Laws */}
        <motion.section initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: EASE }} className="mt-24">
          <p className="text-micro text-veltra-emerald mb-6">The Three Laws</p>
          <div className="space-y-6">
            {THREE_LAWS.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: EASE }}
                className="flex gap-4"
              >
                <span className="text-[2rem] font-semibold tabular text-veltra-emerald/40 leading-none flex-shrink-0">{i + 1}</span>
                <div>
                  <p className="text-[1.5rem] leading-tight tracking-[-0.02em] font-semibold text-foreground">{item.law}</p>
                  <p className="text-body text-muted-foreground mt-2 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <p className="text-caption text-muted-foreground/70 mt-8 italic">
            If any new feature breaks one of these three, it is not built.
          </p>
        </motion.section>

        {/* Mission */}
        <motion.section initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: EASE }} className="mt-24">
          <p className="text-micro text-veltra-emerald mb-4">Mission</p>
          <h2 className="text-[2rem] leading-tight tracking-[-0.02em] font-semibold text-foreground">
            To become <span className="text-editorial-italic text-muted-foreground">the operating system of healthcare.</span>
          </h2>
          <p className="text-body text-muted-foreground mt-6 leading-relaxed">
            Every decision must move Veltra closer to that. If a proposed feature does not move Veltra closer to becoming the operating system of healthcare, it does not ship.
          </p>
        </motion.section>

        {/* North Star */}
        <motion.section initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: EASE }} className="mt-24">
          <p className="text-micro text-veltra-emerald mb-4">North Star</p>
          <blockquote className="border-l-2 border-veltra-emerald pl-6 py-2">
            <p className="text-[1.5rem] leading-tight tracking-[-0.02em] font-medium text-foreground">
              "When someone opens Veltra, they should immediately feel: <span className="text-editorial-italic text-muted-foreground">'This clinic already runs itself.'</span>"
            </p>
          </blockquote>
          <p className="text-caption text-muted-foreground mt-4">
            Every decision, every feature, every line of code — this is where it points.
          </p>
        </motion.section>

        {/* Product Philosophy — Work / Memory / Judgment */}
        <motion.section initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: EASE }} className="mt-24">
          <p className="text-micro text-veltra-emerald mb-4">Product Philosophy</p>
          <h2 className="text-[2rem] leading-tight tracking-[-0.02em] font-semibold text-foreground mb-8">
            Three phases. <span className="text-editorial-italic text-muted-foreground">One direction.</span>
          </h2>
          <div className="space-y-4">
            {PRODUCT_PHILOSOPHY.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: EASE }}
                className="veltra-glass rounded-2xl p-6 veltra-shadow"
              >
                <div className="flex items-baseline justify-between mb-2">
                  <div className="flex items-baseline gap-3">
                    <span className="text-[1.5rem] font-semibold tracking-tight text-foreground">{item.phase}</span>
                  </div>
                  <span className={`text-micro font-medium normal-case tracking-normal px-2 py-0.5 rounded-md ${
                    item.status === "Available Today" ? "bg-veltra-emerald/15 text-veltra-emerald" :
                    item.status === "Coming Next" ? "bg-amber-500/15 text-amber-300" :
                    "bg-foreground/[0.05] text-muted-foreground"
                  }`}>{item.status}</span>
                </div>
                <p className="text-body text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Decision Priority */}
        <motion.section initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: EASE }} className="mt-24">
          <p className="text-micro text-veltra-emerald mb-4">Decision Priority</p>
          <h2 className="text-[2rem] leading-tight tracking-[-0.02em] font-semibold text-foreground mb-2">
            When there is a trade-off, <span className="text-editorial-italic text-muted-foreground">this is the order.</span>
          </h2>
          <p className="text-caption text-muted-foreground mb-8">Never sacrifice a higher priority for a lower one.</p>
          <div className="space-y-1">
            {DECISION_PRIORITY.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05, ease: EASE }}
                className="flex items-center gap-4 py-3 border-b border-border/20"
              >
                <span className="text-micro text-muted-foreground/60 tabular normal-case tracking-normal w-8">{item.n}</span>
                <span className="text-body font-medium text-foreground flex-1">{item.en}</span>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Design Principles */}
        <motion.section initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: EASE }} className="mt-24">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="h-3.5 w-3.5 text-veltra-emerald" />
            <p className="text-micro text-veltra-emerald">Design Principles</p>
          </div>
          <h2 className="text-[2rem] leading-tight tracking-[-0.02em] font-semibold text-foreground mb-8">
            Calm. <span className="text-editorial-italic text-muted-foreground">Quiet. Honest.</span>
          </h2>
          <ul className="space-y-3">
            {DESIGN_PRINCIPLES.map((p, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.04, ease: EASE }}
                className="flex items-start gap-3"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-veltra-emerald flex-shrink-0 mt-2.5" />
                <span className="text-body text-foreground leading-relaxed">{p}</span>
              </motion.li>
            ))}
          </ul>
        </motion.section>

        {/* Engineering Principles */}
        <motion.section initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: EASE }} className="mt-24">
          <div className="flex items-center gap-2 mb-4">
            <Code className="h-3.5 w-3.5 text-veltra-emerald" />
            <p className="text-micro text-veltra-emerald">Engineering Principles</p>
          </div>
          <h2 className="text-[2rem] leading-tight tracking-[-0.02em] font-semibold text-foreground mb-8">
            Built to last <span className="text-editorial-italic text-muted-foreground">20 years.</span>
          </h2>
          <ul className="space-y-3">
            {ENGINEERING_PRINCIPLES.map((p, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.04, ease: EASE }}
                className="flex items-start gap-3"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-veltra-emerald flex-shrink-0 mt-2.5" />
                <span className="text-body text-foreground leading-relaxed">{p}</span>
              </motion.li>
            ))}
          </ul>
        </motion.section>

        {/* Brand Voice */}
        <motion.section initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: EASE }} className="mt-24">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="h-3.5 w-3.5 text-veltra-emerald" />
            <p className="text-micro text-veltra-emerald">Brand Voice</p>
          </div>
          <h2 className="text-[2rem] leading-tight tracking-[-0.02em] font-semibold text-foreground mb-8">
            Veltra speaks <span className="text-editorial-italic text-muted-foreground">calmly.</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="veltra-glass rounded-2xl p-6 veltra-shadow">
              <p className="text-micro text-veltra-emerald mb-3">Always</p>
              <div className="flex flex-wrap gap-2">
                {BRAND_VOICE_DO.map((word) => (
                  <span key={word} className="text-caption font-medium text-foreground px-2.5 py-1 rounded-md bg-veltra-emerald/10 text-veltra-emerald">{word}</span>
                ))}
              </div>
            </div>
            <div className="veltra-glass rounded-2xl p-6 veltra-shadow">
              <p className="text-micro text-red-400 mb-3">Never</p>
              <div className="flex flex-wrap gap-2">
                {BRAND_VOICE_DONT.map((word) => (
                  <span key={word} className="text-caption text-muted-foreground line-through px-2.5 py-1 rounded-md bg-foreground/[0.04]">{word}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-6 p-6 rounded-2xl bg-foreground/[0.03] border-l-2 border-veltra-emerald">
            <p className="text-caption text-muted-foreground mb-2">The Pronoun Rule</p>
            <p className="text-body text-foreground">
              Veltra never says "I" or "we." Past tense. Third person. No subject.
            </p>
            <p className="text-body text-foreground font-medium mt-3">
              "Appointment booked." — not "We booked your appointment."
            </p>
          </div>
        </motion.section>

        {/* Definition of Done */}
        <motion.section initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: EASE }} className="mt-24">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-3.5 w-3.5 text-veltra-emerald" />
            <p className="text-micro text-veltra-emerald">Definition of Done</p>
          </div>
          <h2 className="text-[2rem] leading-tight tracking-[-0.02em] font-semibold text-foreground mb-2">
            A feature is only complete <span className="text-editorial-italic text-muted-foreground">when all 12 are true.</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-8">
            {DEFINITION_OF_DONE.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.04, ease: EASE }}
                className="flex items-center gap-2 p-3 rounded-lg bg-foreground/[0.03]"
              >
                <span className="h-4 w-4 rounded-full bg-veltra-emerald/20 flex items-center justify-center flex-shrink-0">
                  <svg className="h-2.5 w-2.5 text-veltra-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="text-caption text-foreground font-medium">{item}</span>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Security Principles */}
        <motion.section initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: EASE }} className="mt-24">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-3.5 w-3.5 text-veltra-emerald" />
            <p className="text-micro text-veltra-emerald">Security Principles</p>
          </div>
          <h2 className="text-[2rem] leading-tight tracking-[-0.02em] font-semibold text-foreground mb-2">
            Always assume <span className="text-editorial-italic text-muted-foreground">healthcare data is sensitive.</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-8">
            {["HIPAA", "GDPR", "NPHIES", "PDPL", "DHA", "DOH"].map((cert) => (
              <div key={cert} className="veltra-glass rounded-xl p-4 veltra-shadow text-center">
                <Shield className="h-4 w-4 text-veltra-emerald mx-auto mb-2" />
                <p className="text-caption font-semibold text-foreground">{cert}</p>
                <p className="text-micro text-muted-foreground/70 normal-case tracking-normal mt-0.5">Ready</p>
              </div>
            ))}
          </div>
          <ul className="space-y-3 mt-8">
            {[
              "Least privilege — every user, every service, every token gets the minimum access required.",
              "Server-side validation on every mutation. Never trust the client.",
              "Audit logging — every PHI access, every mutation, every login is logged.",
              "Encryption at rest (AES-256) and in transit (TLS 1.3).",
              "Right to erasure — any patient can request deletion.",
            ].map((p, i) => (
              <li key={i} className="flex items-start gap-3">
                <Lock className="h-3.5 w-3.5 text-veltra-emerald flex-shrink-0 mt-1" />
                <span className="text-body text-foreground leading-relaxed">{p}</span>
              </li>
            ))}
          </ul>
        </motion.section>

        {/* Clinical Principles */}
        <motion.section initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: EASE }} className="mt-24">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="h-3.5 w-3.5 text-veltra-emerald" />
            <p className="text-micro text-veltra-emerald">Clinical Principles</p>
          </div>
          <h2 className="text-[2rem] leading-tight tracking-[-0.02em] font-semibold text-foreground mb-8">
            Care <span className="text-editorial-italic text-muted-foreground">over code.</span>
          </h2>
          <ul className="space-y-4">
            {[
              { t: "Nothing important is ever forgotten.", d: "A patient's allergy, a medication interaction, a missed appointment and the reason given — all preserved." },
              { t: "The doctor's flow is sacred.", d: "No interrupting a patient visit for an operational notification. The brief is read in the morning, not during a consultation." },
              { t: "Memory compounds.", d: "A single lab result is data. Six months of lab results is insight. Two years is pattern recognition." },
              { t: "Memory is private to the clinic.", d: "Patient data does not leave the clinic's tenant — except for Network Memory, which is anonymized and aggregated." },
            ].map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: EASE }}
                className="flex gap-4"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-veltra-emerald flex-shrink-0 mt-3" />
                <div>
                  <p className="text-body font-semibold text-foreground">{item.t}</p>
                  <p className="text-caption text-muted-foreground mt-1 leading-relaxed">{item.d}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        </motion.section>

        {/* Final Principle */}
        <motion.section initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: EASE }} className="mt-32 text-center">
          <p className="text-micro text-veltra-emerald mb-4">Final Principle</p>
          <blockquote className="text-[2rem] sm:text-[2.5rem] leading-tight tracking-[-0.03em] font-semibold text-foreground max-w-xl mx-auto">
            If a proposed feature makes the product <span className="text-editorial-italic text-muted-foreground">more complicated than valuable,</span> reject it.
          </blockquote>
          <div className="mt-16 pt-12 border-t border-border/20">
            <p className="text-[1.5rem] tracking-[-0.02em] font-semibold text-foreground">
              Technology disappears.
            </p>
            <p className="text-[1.5rem] tracking-[-0.02em] font-semibold text-editorial-italic text-veltra-emerald mt-1">
              Care remains.
            </p>
            <p className="text-micro text-muted-foreground/60 normal-case tracking-normal mt-8">— Veltra, 2026</p>
          </div>
        </motion.section>

        {/* CTA */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: EASE }} className="mt-24 text-center">
          <a href="/">
            <Button variant="outline" className="h-11 px-7 veltra-shadow border-0 bg-foreground/[0.04] text-foreground font-medium">
              <ArrowRight className="mr-1.5 h-4 w-4 rotate-180" /> Back to Veltra
            </Button>
          </a>
        </motion.div>
      </div>
    </div>
  );
}
