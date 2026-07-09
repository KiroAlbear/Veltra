"use client";

/**
 * VELTRA Landing Page V3 — The Healthcare Operating System
 *
 * Storytelling arc:
 *   Act 1 — Chaos (why we exist)
 *   Act 2 — Veltra enters (living clinic, import, intelligence)
 *   Act 3 — The clinic flows (security, enterprise, performance, mobile)
 *
 * Design DNA: Apple + Linear + Stripe + Notion + Raycast + Vercel
 * Philosophy: Technology disappears. Care remains.
 *
 * 12 sections, each answering ONE question:
 *   1. Hero — What is Veltra?
 *   2. Why Veltra Exists — Why does it matter?
 *   3. A Living Clinic — What does a day look like?
 *   4. Import Intelligence — How do I move my data?
 *   5. Clinical Intelligence — How does AI help?
 *   6. Global Search + Command — How do I find anything?
 *   7. Security — Can I trust it?
 *   8. Enterprise — Does it scale?
 *   9. Performance — What ROI?
 *   10. Mobile — Can I work from anywhere?
 *   11. Pricing — What does it cost?
 *   12. Final Statement — Why now?
 */
import { useVeltra } from "@/lib/veltra-store";
import { motion, useScroll, useMotionValueEvent, useInView, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, Phone, Calendar, DollarSign, Sparkles, Shield, Check,
  Clock, Lock, AlertTriangle, Activity, Zap, Heart, Brain, FileUp, FileText,
  Search, Command, Users, Stethoscope, FlaskConical, Pill, ChevronRight, TrendingUp,
  TrendingDown, Building2, Hospital, Server, Database, KeyRound, Eye, Cpu,
  Smartphone, Tablet, Watch, MessageCircle, Mic, Plus, X, Menu, LogIn,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { TIERS, type TierConfig, type TierId } from "@/lib/subscription-tiers";
import { SPECIALTIES } from "@/lib/specialties";
import { FadeIn, StaggerGroup, StaggerItem } from "./motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

type ModalType = "platform" | "security" | "privacy" | "terms" | "contact" | "why" | "status" | "changelog" | null;

export function LandingPageV3({ onEnter, onSignIn, onSpecialtySelect, onPatientPortal }: {
  onEnter: (userId?: string) => void;
  onSignIn: () => void;
  onSpecialtySelect?: () => void;
  onPatientPortal?: () => void;
}) {
  const [navVisible, setNavVisible] = useState(true);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { scrollY } = useScroll();
  const lastScroll = useRef(0);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = lastScroll.current;
    if (latest > previous && latest > 120) setNavVisible(false);
    else setNavVisible(true);
    lastScroll.current = latest;
  });

  const openModal = (type: ModalType) => setActiveModal(type);
  const closeModal = () => setActiveModal(null);

  return (
    <div className="min-h-screen bg-background veltra-ambient">
      {/* ===== STICKY NAV — minimal, Apple-grade ===== */}
      <motion.nav
        animate={{ y: navVisible ? 0 : -100 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="fixed top-0 inset-x-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border/20"
      >
        <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
          <a
            href="/"
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="flex items-center gap-2.5 veltra-transition hover:opacity-80"
            aria-label="Veltra home"
          >
            <img src="/logo-symbol.png" alt="Veltra" className="object-cover h-7 w-7 rounded-lg veltra-shadow" />
            <span className="text-body font-semibold tracking-tight text-foreground">Veltra</span>
          </a>
          <div className="hidden md:flex items-center gap-1">
            <button onClick={() => openModal("platform")} className="px-3 h-8 rounded-lg hover:bg-foreground/[0.05] text-caption text-muted-foreground hover:text-foreground veltra-transition">Platform</button>
            <a href="#living-clinic" className="px-3 h-8 rounded-lg hover:bg-foreground/[0.05] flex items-center text-caption text-muted-foreground hover:text-foreground veltra-transition">Clinic</a>
            <a href="#import" className="px-3 h-8 rounded-lg hover:bg-foreground/[0.05] flex items-center text-caption text-muted-foreground hover:text-foreground veltra-transition">Import</a>
            <a href="#security" className="px-3 h-8 rounded-lg hover:bg-foreground/[0.05] flex items-center text-caption text-muted-foreground hover:text-foreground veltra-transition">Security</a>
            <a href="#pricing" className="px-3 h-8 rounded-lg hover:bg-foreground/[0.05] flex items-center text-caption text-muted-foreground hover:text-foreground veltra-transition">Pricing</a>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="px-3 h-8 rounded-lg hover:bg-foreground/[0.05] flex items-center gap-1 text-caption text-muted-foreground hover:text-foreground veltra-transition">
                  Company <ChevronDown className="h-3 w-3 opacity-50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 veltra-shadow-lg bg-card/95 backdrop-blur-xl border-border/40">
                <DropdownMenuItem onClick={() => openModal("why")} className="text-body cursor-pointer">Why Veltra</DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.location.href = "/security"} className="text-body cursor-pointer">Security</DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.location.href = "/constitution"} className="text-body cursor-pointer">Constitution</DropdownMenuItem>
                <DropdownMenuItem onClick={() => openModal("changelog")} className="text-body cursor-pointer">Changelog</DropdownMenuItem>
                <DropdownMenuItem onClick={() => openModal("status")} className="text-body cursor-pointer">Status</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-2">
            {onPatientPortal && (
              <button
                onClick={onPatientPortal}
                className="hidden sm:flex h-8 px-3 rounded-lg items-center gap-1.5 text-caption text-muted-foreground hover:text-foreground veltra-transition"
              >
                <Heart className="h-3 w-3" />
                Patient portal
              </button>
            )}
            <Button variant="ghost" size="sm" onClick={onSignIn} className="hidden sm:flex h-8 px-3 text-caption text-muted-foreground hover:text-foreground">
              Sign in
            </Button>
            <Button size="sm" onClick={() => onEnter()} className="hidden sm:flex h-8 px-4 bg-veltra-emerald hover:bg-veltra-emerald-dark text-white text-caption font-medium">
              See it live
              <ArrowRight className="ml-1.5 h-3 w-3" />
            </Button>
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="md:hidden h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground veltra-transition"
              aria-label="Menu"
            >
              {mobileNavOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        <AnimatePresence>
          {mobileNavOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: EASE }}
              className="md:hidden overflow-hidden border-t border-border/20 bg-background/95 backdrop-blur-xl"
            >
              <div className="px-6 py-3 space-y-1">
                <button onClick={() => { openModal("platform"); setMobileNavOpen(false); }} className="block w-full text-left py-2 text-caption text-muted-foreground hover:text-foreground">Platform</button>
                <a href="#living-clinic" onClick={() => setMobileNavOpen(false)} className="block py-2 text-caption text-muted-foreground hover:text-foreground">Clinic</a>
                <a href="#import" onClick={() => setMobileNavOpen(false)} className="block py-2 text-caption text-muted-foreground hover:text-foreground">Import</a>
                <a href="#security" onClick={() => setMobileNavOpen(false)} className="block py-2 text-caption text-muted-foreground hover:text-foreground">Security</a>
                <a href="#pricing" onClick={() => setMobileNavOpen(false)} className="block py-2 text-caption text-muted-foreground hover:text-foreground">Pricing</a>
                <hr className="border-border/20 my-2" />
                {onPatientPortal && (
                  <button onClick={() => { onPatientPortal(); setMobileNavOpen(false); }} className="flex items-center gap-1.5 py-2 text-caption text-muted-foreground hover:text-foreground">
                    <Heart className="h-3 w-3" /> Patient portal
                  </button>
                )}
                <button onClick={() => { onSignIn(); setMobileNavOpen(false); }} className="block py-2 text-caption text-muted-foreground hover:text-foreground">Sign in</button>
                <button onClick={() => { onEnter(); setMobileNavOpen(false); }} className="flex items-center gap-1.5 py-2 text-caption text-veltra-emerald font-medium">
                  See it live <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ===== SECTION 1: HERO — The unforgettable opening ===== */}
      <HeroSection onEnter={onEnter} onSignIn={onSignIn} onPatientPortal={onPatientPortal} />

      {/* ===== SECTION 2: WHY VELTRA EXISTS — Chaos → Calm ===== */}
      <WhyVeltraExists />

      {/* ===== SECTION 3: A LIVING CLINIC — 8:00 → 8:30 AM ===== */}
      <LivingClinicSection />

      {/* ===== SECTION 4: IMPORT INTELLIGENCE — Drag, parse, done ===== */}
      <ImportIntelligenceSection />

      {/* ===== SECTION 5: CLINICAL INTELLIGENCE — AI whispers ===== */}
      <ClinicalIntelligenceSection />

      {/* ===== SECTION 6: GLOBAL SEARCH + COMMAND PALETTE ===== */}
      <SearchCommandSection />

      {/* ===== SECTION 7: SECURITY — Calm, no buzzwords ===== */}
      <SecuritySection />

      {/* ===== SECTION 8: ENTERPRISE — Org visualization ===== */}
      <EnterpriseSection />

      {/* ===== SECTION 9: PERFORMANCE — Real ROI metrics ===== */}
      <PerformanceSection />

      {/* ===== SECTION 10: MOBILE — Doctor / Patient / Reception / Admin ===== */}
      <MobileSection />

      {/* ===== SECTION 11: PRICING ===== */}
      <PricingSection onEnter={onEnter} />

      {/* ===== SECTION 12: FINAL STATEMENT ===== */}
      <FinalStatementSection onEnter={onEnter} />

      {/* ===== MODAL ===== */}
      <AnimatePresence>
        {activeModal && (
          <ModalWrapper onClose={closeModal} title={activeModal}>
            <ModalContent type={activeModal} />
          </ModalWrapper>
        )}
      </AnimatePresence>
    </div>
  );
}

/* =========================================================================
   SECTION 1 — HERO
   ========================================================================= */
function HeroSection({ onEnter, onSignIn, onPatientPortal }: { onEnter: (uid?: string) => void; onSignIn: () => void; onPatientPortal?: () => void }) {
  return (
    <section className="relative pt-32 pb-24 sm:pt-40 sm:pb-32 overflow-hidden">
      {/* Ambient gradient — subtle, not noisy */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-veltra-emerald/8 rounded-full blur-3xl" />
        <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-5xl px-6 text-center">
        {/* Eyebrow */}
        <FadeIn>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-foreground/[0.04] border border-border/40 mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-veltra-emerald veltra-live-dot" />
            <span className="text-micro text-muted-foreground normal-case tracking-normal">
              The Clinic Operating System
            </span>
          </div>
        </FadeIn>

        {/* Iconic headline */}
        <FadeIn delay={0.05}>
          <h1 className="text-[3rem] sm:text-[4.5rem] md:text-[5.5rem] leading-[1.0] tracking-[-0.04em] font-semibold text-foreground">
            <span className="text-editorial-italic text-muted-foreground">Technology</span>
            <br />
            disappears.
            <br />
            <span className="text-veltra-emerald">Care</span>{" "}
            <span className="text-editorial-italic">remains.</span>
          </h1>
        </FadeIn>

        <FadeIn delay={0.15}>
          <p className="text-body sm:text-lg text-muted-foreground mt-8 max-w-xl mx-auto leading-relaxed">
            Veltra is the invisible operating system behind modern healthcare.
            The calm layer beneath every appointment, every prescription, every decision.
          </p>
        </FadeIn>

        <FadeIn delay={0.25}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10">
            <Button
              size="lg"
              onClick={() => onEnter()}
              className="h-12 px-6 bg-veltra-emerald hover:bg-veltra-emerald-dark text-white text-body font-medium veltra-shadow-lg"
            >
              See it live
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={onSignIn}
              className="h-12 px-6 border-0 bg-foreground/[0.04] text-foreground text-body font-medium"
            >
              <LogIn className="mr-2 h-4 w-4" />
              I have an account
            </Button>
          </div>
        </FadeIn>

        <FadeIn delay={0.35}>
          <p className="text-micro text-muted-foreground/60 normal-case tracking-normal mt-6">
            No credit card · 90 seconds to first patient · Cancel anytime
          </p>
          {onPatientPortal && (
            <button
              onClick={onPatientPortal}
              className="mt-3 inline-flex items-center gap-1.5 text-caption text-veltra-emerald hover:text-veltra-emerald-dark veltra-transition"
            >
              <Heart className="h-3.5 w-3.5" />
              I'm a patient — open the patient portal
              <ArrowRight className="h-3 w-3" />
            </button>
          )}
        </FadeIn>

        {/* Living dashboard preview — animated, not a screenshot */}
        <FadeIn delay={0.5}>
          <LivingDashboardPreview />
        </FadeIn>
      </div>
    </section>
  );
}

/**
 * Living dashboard preview — not a screenshot, a real animated UI.
 * Cycles through morning brief → patient arrives → AI alert → prescription.
 */
function LivingDashboardPreview() {
  const [activeScene, setActiveScene] = useState(0);
  const scenes = [
    { time: "08:00", title: "Good morning, Dr. Sarah", subtitle: "13 patients today · 2 critical", accent: "text-veltra-emerald" },
    { time: "09:00", title: "Ahmed Hassan arrived", subtitle: "Wait: 4 min · Room 2 ready", accent: "text-violet-400" },
    { time: "09:03", title: "Allergy alert — Sulfa", subtitle: "Prescription blocked · Suggested alt", accent: "text-amber-400" },
    { time: "09:08", title: "Labs ordered", subtitle: "HbA1c + lipid panel · Sent to Lab", accent: "text-cyan-400" },
    { time: "09:25", title: "Visit completed", subtitle: "Prescription sent · $240 invoiced", accent: "text-emerald-400" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveScene((s) => (s + 1) % scenes.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [scenes.length]);

  return (
    <div className="mt-12 mx-auto max-w-4xl">
      <div className="rounded-2xl veltra-glass-strong veltra-shadow-xl border border-border/30 overflow-hidden">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border/30 bg-foreground/[0.02]">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500/30" />
            <div className="h-3 w-3 rounded-full bg-amber-500/30" />
            <div className="h-3 w-3 rounded-full bg-emerald-500/30" />
          </div>
          <div className="flex-1 mx-3 h-6 rounded-md bg-foreground/[0.04] flex items-center px-3">
            <span className="text-micro text-muted-foreground/60 normal-case tracking-normal truncate">
              veltra.health/brief
            </span>
          </div>
          <div className="text-micro text-muted-foreground/40 normal-case tracking-normal hidden sm:block">
            ⌘K
          </div>
        </div>

        {/* Animated content area */}
        <div className="grid grid-cols-12 min-h-[360px]">
          {/* Sidebar */}
          <div className="hidden md:block col-span-2 border-r border-border/30 p-3 space-y-1">
            {["Brief", "Patients", "Schedule", "Messages", "Settings"].map((item, i) => (
              <div
                key={item}
                className={cn(
                  "px-2.5 py-1.5 rounded-md text-micro normal-case tracking-normal",
                  i === 0 ? "bg-veltra-emerald/15 text-veltra-emerald font-medium" : "text-muted-foreground"
                )}
              >
                {item}
              </div>
            ))}
          </div>

          {/* Main */}
          <div className="col-span-12 md:col-span-10 p-6 sm:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeScene}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease: EASE }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-micro text-muted-foreground/60 normal-case tracking-normal tabular">
                    {scenes[activeScene].time}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                  <span className="text-micro text-veltra-emerald normal-case tracking-normal flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-veltra-emerald veltra-live-dot" />
                    Live
                  </span>
                </div>
                <h3 className={cn("text-title sm:text-[1.75rem] font-semibold tracking-tight", scenes[activeScene].accent)}>
                  {scenes[activeScene].title}
                </h3>
                <p className="text-body text-muted-foreground mt-1">
                  {scenes[activeScene].subtitle}
                </p>

                {/* Scene-specific visual */}
                <div className="mt-6 grid grid-cols-3 gap-3">
                  {[
                    { label: "Patients today", value: "13", icon: Users, tint: "text-veltra-emerald" },
                    { label: "Revenue", value: "$3,200", icon: DollarSign, tint: "text-emerald-400" },
                    { label: "AI alerts", value: "2", icon: Sparkles, tint: "text-amber-400" },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-lg bg-foreground/[0.03] p-3 border border-border/20">
                      <stat.icon className={cn("h-3.5 w-3.5 mb-1.5", stat.tint)} />
                      <p className="text-body font-semibold text-foreground tabular">{stat.value}</p>
                      <p className="text-micro text-muted-foreground/70 normal-case tracking-normal mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Progress dots */}
            <div className="flex items-center justify-center gap-1.5 mt-8">
              {scenes.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1 rounded-full veltra-transition",
                    i === activeScene ? "w-6 bg-veltra-emerald" : "w-1 bg-foreground/15"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   SECTION 2 — WHY VELTRA EXISTS
   ========================================================================= */
function WhyVeltraExists() {
  return (
    <section className="py-24 sm:py-32 border-t border-border/20">
      <div className="mx-auto max-w-5xl px-6">
        {/* Section eyebrow */}
        <FadeIn>
          <p className="text-micro text-veltra-emerald font-medium uppercase tracking-wider mb-4 text-center">
            Why Veltra exists
          </p>
        </FadeIn>

        {/* The chaos statement */}
        <FadeIn delay={0.05}>
          <h2 className="text-[2rem] sm:text-[3rem] leading-[1.05] tracking-[-0.035em] text-foreground font-semibold text-center max-w-3xl mx-auto">
            <span className="text-editorial-italic text-muted-foreground">Every morning,</span>{" "}
            doctors inherit the chaos of yesterday's systems.
          </h2>
        </FadeIn>

        {/* Chaos items */}
        <StaggerGroup className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-16">
          {[
            { icon: FileText, label: "Paper", detail: "Charts lost, duplicated, illegible" },
            { icon: Search, label: "Searching", detail: "20 min/day looking for patient history" },
            { icon: AlertTriangle, label: "Errors", detail: "Allergy missed · wrong dose · duplicate Rx" },
            { icon: X, label: "Disconnected", detail: "Labs, pharmacy, billing — 5 different tools" },
          ].map((item) => (
            <StaggerItem key={item.label}>
              <div className="rounded-xl veltra-glass p-5 h-full border border-border/20 hover:border-red-500/30 veltra-transition">
                <item.icon className="h-4 w-4 text-red-400/70 mb-3" />
                <p className="text-body font-medium text-foreground mb-1">{item.label}</p>
                <p className="text-micro text-muted-foreground/70 normal-case tracking-normal leading-relaxed">
                  {item.detail}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>

        {/* The pivot */}
        <FadeIn delay={0.2}>
          <div className="text-center mt-20">
            <p className="text-body sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              <span className="text-editorial-italic">So we built the opposite.</span>
              <br />
              One system. One timeline. One source of truth.
              <br />
              <span className="text-foreground font-medium">Everything the clinic needs. Nothing it doesn't.</span>
            </p>
          </div>
        </FadeIn>

        {/* The 3 promises */}
        <StaggerGroup className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          {[
            { icon: Zap, title: "Speed", desc: "Open a patient in 200ms. Search in 100ms. Every interaction instant." },
            { icon: Brain, title: "Memory", desc: "Veltra remembers what the doctor forgets — every visit, every lab, every pattern." },
            { icon: Shield, title: "Trust", desc: "Encryption at rest. Audit trail. Role permissions. HIPAA, GDPR, PDPL ready." },
          ].map((item) => (
            <StaggerItem key={item.title}>
              <div className="text-center">
                <div className="mx-auto h-12 w-12 rounded-2xl bg-veltra-emerald/10 flex items-center justify-center mb-4">
                  <item.icon className="h-5 w-5 text-veltra-emerald" />
                </div>
                <h3 className="text-body font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-caption text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}

/* =========================================================================
   SECTION 3 — A LIVING CLINIC (8:00 → 8:30 AM patient journey)
   ========================================================================= */
function LivingClinicSection() {
  const [activeStep, setActiveStep] = useState(0);

  const journey = [
    { time: "08:00", icon: Calendar,    title: "Patient arrives",         detail: "Ahmed Hassan checks in via iPad kiosk. Reception notified automatically.", tint: "text-violet-400" },
    { time: "08:02", icon: Users,       title: "Reception confirms",      detail: "Insurance verified · copay $40 collected · room 2 assigned.", tint: "text-emerald-400" },
    { time: "08:05", icon: Stethoscope, title: "Doctor opens chart",      detail: "Veltra loads full timeline in 180ms — last visit, labs, meds, allergies.", tint: "text-veltra-emerald" },
    { time: "08:06", icon: AlertTriangle, title: "Allergy alert",         detail: "Veltra blocks Sulfa-based antibiotic. Suggests Doxycycline with rationale.", tint: "text-amber-400" },
    { time: "08:08", icon: FlaskConical, title: "Labs ordered",           detail: "HbA1c + lipid panel sent to lab. Result expected same day.", tint: "text-cyan-400" },
    { time: "08:20", icon: FlaskConical, title: "Labs return",            detail: "HbA1c 8.4% (high). Veltra flags — recommends insulin review.", tint: "text-rose-400" },
    { time: "08:23", icon: Pill,        title: "Prescription written",    detail: "Metformin 1000mg renewed. Drug interaction check passes. e-Prescription sent.", tint: "text-rose-400" },
    { time: "08:25", icon: DollarSign,  title: "Invoice closed",          detail: "$240 invoiced. Bupa Arabia claim submitted automatically. Patient pays $40.", tint: "text-emerald-400" },
    { time: "08:30", icon: Check,       title: "Patient leaves",          detail: "Follow-up booked in 30 days. WhatsApp reminder scheduled. Care journey continues.", tint: "text-veltra-emerald" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((s) => (s + 1) % journey.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [journey.length]);

  return (
    <section id="living-clinic" className="py-24 sm:py-32 border-t border-border/20 bg-foreground/[0.01] scroll-mt-20">
      <div className="mx-auto max-w-5xl px-6">
        <FadeIn>
          <p className="text-micro text-veltra-emerald font-medium uppercase tracking-wider mb-4 text-center">
            A living clinic
          </p>
          <h2 className="text-[2rem] sm:text-[3rem] leading-[1.05] tracking-[-0.035em] text-foreground font-semibold text-center max-w-3xl mx-auto">
            <span className="text-editorial-italic text-muted-foreground">One patient.</span>{" "}
            One seamless journey.
          </h2>
          <p className="text-body text-muted-foreground mt-6 max-w-xl mx-auto text-center leading-relaxed">
            From check-in to follow-up — 30 minutes, 9 steps, zero friction. This is what a clinic running on Veltra looks like.
          </p>
        </FadeIn>

        {/* The timeline visualization */}
        <FadeIn delay={0.1}>
          <div className="mt-16 relative">
            {/* Vertical line */}
            <div className="absolute left-[19px] sm:left-1/2 top-4 bottom-4 w-px bg-border/60 sm:-translate-x-1/2" />

            <div className="space-y-2">
              {journey.map((step, i) => {
                const isActive = i === activeStep;
                const isPast = i < activeStep;
                return (
                  <motion.div
                    key={i}
                    initial={false}
                    animate={{
                      opacity: isActive ? 1 : isPast ? 0.5 : 0.35,
                      scale: isActive ? 1 : 0.98,
                    }}
                    transition={{ duration: 0.4, ease: EASE }}
                    className={cn(
                      "relative flex items-start gap-4 pl-12 sm:pl-0",
                      i % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"
                    )}
                  >
                    {/* Time + dot */}
                    <div className="absolute left-0 sm:left-1/2 sm:-translate-x-1/2 top-1 flex items-center gap-2">
                      <div className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center border-2 veltra-transition",
                        isActive ? "bg-veltra-emerald border-veltra-emerald veltra-shadow-lg" :
                        isPast ? "bg-foreground/[0.04] border-border/40" : "bg-background border-border/40"
                      )}>
                        <step.icon className={cn("h-4 w-4", isActive ? "text-white" : step.tint)} />
                      </div>
                    </div>

                    {/* Card */}
                    <div className={cn(
                      "flex-1 sm:max-w-[calc(50%-2.5rem)] sm:mt-0 mt-3 rounded-xl p-4 veltra-transition border",
                      isActive ? "veltra-glass-strong veltra-shadow-lg border-veltra-emerald/30" : "bg-foreground/[0.02] border-border/20"
                    )}>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className={cn("text-micro font-semibold tabular", isActive ? "text-veltra-emerald" : "text-muted-foreground/60")}>
                          {step.time}
                        </span>
                        {isActive && (
                          <span className="text-micro text-veltra-emerald normal-case tracking-normal flex items-center gap-1">
                            <span className="veltra-live-dot" /> now
                          </span>
                        )}
                      </div>
                      <h3 className={cn("text-caption font-semibold mb-1", isActive ? "text-foreground" : "text-muted-foreground")}>
                        {step.title}
                      </h3>
                      <p className="text-micro text-muted-foreground/80 normal-case tracking-normal leading-relaxed">
                        {step.detail}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Final line */}
            <FadeIn delay={0.4}>
              <p className="text-center mt-16 text-body text-editorial-italic text-muted-foreground">
                Thousands more to come.
              </p>
            </FadeIn>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* =========================================================================
   SECTION 4 — IMPORT INTELLIGENCE
   ========================================================================= */
function ImportIntelligenceSection() {
  const [stage, setStage] = useState(0);
  const stages = [
    { label: "Upload",        icon: FileUp,        detail: "PDF, image, Word, Excel — any file" },
    { label: "OCR",           icon: Eye,           detail: "Text extracted from scan" },
    { label: "Medical AI",    icon: Brain,         detail: "Entities identified" },
    { label: "Validation",    icon: Check,         detail: "Cross-checked fields" },
    { label: "Timeline",      icon: Activity,      detail: "Patient record built" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStage((s) => (s + 1) % (stages.length + 1));
    }, 2500);
    return () => clearInterval(interval);
  }, [stages.length]);

  return (
    <section id="import" className="py-24 sm:py-32 border-t border-border/20 scroll-mt-20">
      <div className="mx-auto max-w-5xl px-6">
        <FadeIn>
          <p className="text-micro text-veltra-emerald font-medium uppercase tracking-wider mb-4 text-center">
            Import intelligence
          </p>
          <h2 className="text-[2rem] sm:text-[3rem] leading-[1.05] tracking-[-0.035em] text-foreground font-semibold text-center max-w-3xl mx-auto">
            <span className="text-editorial-italic text-muted-foreground">Drop a file.</span>{" "}
            Veltra reads it.
          </h2>
          <p className="text-body text-muted-foreground mt-6 max-w-xl mx-auto text-center leading-relaxed">
            Upload a scanned report, lab result, or referral letter. OCR + Medical AI extracts every field, scores its confidence, and asks you to review before anything is written to the patient record.
          </p>
        </FadeIn>

        {/* The drag-drop + pipeline animation */}
        <FadeIn delay={0.1}>
          <div className="mt-16 grid lg:grid-cols-2 gap-8 items-center">
            {/* Left: drag-drop zone */}
            <div className="rounded-2xl veltra-glass-strong veltra-shadow-xl border-2 border-dashed border-veltra-emerald/40 p-8 text-center bg-veltra-emerald/[0.02]">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2.4, repeat: typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ? 0 : Infinity, ease: "easeInOut" }}
                className="mx-auto h-16 w-16 rounded-2xl bg-veltra-emerald/15 flex items-center justify-center mb-4"
              >
                <FileUp className="h-7 w-7 text-veltra-emerald" />
              </motion.div>
              <p className="text-body font-medium text-foreground mb-1">
                Drop patient file here
              </p>
              <p className="text-caption text-muted-foreground">
                PDF · JPG · PNG · DOCX · XLSX · CSV
              </p>
              <div className="flex flex-wrap gap-1.5 justify-center mt-4">
                {["CBC.pdf", "MRI.jpg", "Referral.docx", "Patients.xlsx"].map((f) => (
                  <span key={f} className="text-micro px-2 py-0.5 rounded-md bg-foreground/[0.04] text-muted-foreground normal-case tracking-normal">
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: animated pipeline */}
            <div className="space-y-2">
              {stages.map((s, i) => {
                const isDone = i < stage;
                const isActive = i === stage;
                return (
                  <motion.div
                    key={s.label}
                    initial={false}
                    animate={{
                      opacity: isDone || isActive ? 1 : 0.4,
                      x: isActive ? 4 : 0,
                    }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className={cn(
                      "flex items-center gap-3 rounded-xl p-3 border veltra-transition",
                      isActive ? "bg-veltra-emerald/[0.04] border-veltra-emerald/30" :
                      isDone ? "bg-emerald-500/[0.02] border-emerald-500/20" :
                      "bg-foreground/[0.02] border-border/20"
                    )}
                  >
                    <div className={cn(
                      "h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0",
                      isDone ? "bg-emerald-500/15" : isActive ? "bg-veltra-emerald/15" : "bg-foreground/[0.04]"
                    )}>
                      {isDone ? (
                        <Check className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <s.icon className={cn("h-4 w-4", isActive ? "text-veltra-emerald" : "text-muted-foreground/60")} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-caption font-medium", isActive || isDone ? "text-foreground" : "text-muted-foreground")}>
                        {s.label}
                      </p>
                      <p className="text-micro text-muted-foreground/70 normal-case tracking-normal">{s.detail}</p>
                    </div>
                    {isActive && (
                      <span className="text-micro text-veltra-emerald normal-case tracking-normal flex items-center gap-1">
                        <span className="veltra-live-dot" /> working
                      </span>
                    )}
                  </motion.div>
                );
              })}

              {/* Extracted fields preview */}
              {stage >= stages.length && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl bg-veltra-emerald/[0.04] border border-veltra-emerald/20 p-4 mt-2"
                >
                  <p className="text-micro text-veltra-emerald font-medium uppercase tracking-wider mb-2">
                    Extracted · 98% avg confidence
                  </p>
                  <div className="space-y-1.5">
                    {[
                      { field: "Patient Name", value: "Ahmed Hassan", conf: 99 },
                      { field: "Diagnosis", value: "Type 2 Diabetes", conf: 97 },
                      { field: "HbA1c", value: "8.2%", conf: 96 },
                      { field: "Medication", value: "Metformin 1000mg", conf: 100 },
                    ].map((row) => (
                      <div key={row.field} className="flex items-center justify-between text-caption">
                        <span className="text-muted-foreground">{row.field}</span>
                        <span className="text-foreground font-medium tabular">{row.value}</span>
                        <span className="text-micro text-emerald-400 font-semibold tabular">{row.conf}%</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* =========================================================================
   SECTION 5 — CLINICAL INTELLIGENCE (AI whispers)
   ========================================================================= */
function ClinicalIntelligenceSection() {
  const alerts = [
    {
      icon: AlertTriangle, tint: "text-amber-400", bg: "bg-amber-500/[0.04]", border: "border-amber-500/20",
      title: "Drug interaction detected",
      evidence: "Metformin × patient's Sulfa allergy (active)",
      confidence: 98,
      action: "Switch to Doxycycline",
    },
    {
      icon: Pill, tint: "text-rose-400", bg: "bg-rose-500/[0.04]", border: "border-rose-500/20",
      title: "Duplicate medication",
      evidence: "Patient already prescribed Metformin 1000mg 2x daily",
      confidence: 100,
      action: "Discontinue previous",
    },
    {
      icon: Calendar, tint: "text-violet-400", bg: "bg-violet-500/[0.04]", border: "border-violet-500/20",
      title: "Missing follow-up",
      evidence: "Ahmed Hassan — last visit 87 days ago · diabetic · overdue",
      confidence: 94,
      action: "Book follow-up",
    },
    {
      icon: TrendingUp, tint: "text-cyan-400", bg: "bg-cyan-500/[0.04]", border: "border-cyan-500/20",
      title: "Abnormal trend",
      evidence: "HbA1c rising: 7.1 → 7.9 → 8.4 over 6 months",
      confidence: 96,
      action: "Review insulin",
    },
  ];

  return (
    <section className="py-24 sm:py-32 border-t border-border/20 bg-foreground/[0.01]">
      <div className="mx-auto max-w-5xl px-6">
        <FadeIn>
          <p className="text-micro text-veltra-emerald font-medium uppercase tracking-wider mb-4 text-center">
            Clinical intelligence
          </p>
          <h2 className="text-[2rem] sm:text-[3rem] leading-[1.05] tracking-[-0.035em] text-foreground font-semibold text-center max-w-3xl mx-auto">
            <span className="text-editorial-italic text-muted-foreground">AI that whispers.</span>{" "}
            Never shouts.
          </h2>
          <p className="text-body text-muted-foreground mt-6 max-w-xl mx-auto text-center leading-relaxed">
            Every AI suggestion ships with evidence and a confidence score. Every suggestion comes with evidence, confidence, and a clear action — never a black box.
          </p>
        </FadeIn>

        <StaggerGroup className="grid sm:grid-cols-2 gap-3 mt-16">
          {alerts.map((alert) => (
            <StaggerItem key={alert.title}>
              <div className={cn("rounded-xl p-5 border veltra-transition hover:scale-[1.01] cursor-default", alert.bg, alert.border)}>
                <div className="flex items-start gap-3 mb-3">
                  <alert.icon className={cn("h-4 w-4 mt-0.5 flex-shrink-0", alert.tint)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-body font-medium text-foreground">{alert.title}</p>
                    <p className="text-caption text-muted-foreground mt-0.5 leading-snug">{alert.evidence}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border/20">
                  <span className="text-micro text-muted-foreground/70 normal-case tracking-normal flex items-center gap-1">
                    <Sparkles className="h-2.5 w-2.5 text-veltra-emerald" />
                    {alert.confidence}% confidence
                  </span>
                  <span className="text-micro text-veltra-emerald/70 normal-case tracking-normal font-medium flex items-center gap-0.5">
                    {alert.action}
                    <ChevronRight className="h-2.5 w-2.5" />
                  </span>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>

        {/* Trust statement */}
        <FadeIn delay={0.3}>
          <p className="text-center mt-12 text-caption text-muted-foreground/70 leading-relaxed max-w-2xl mx-auto">
            <span className="text-editorial-italic">Never ask the doctor to trust AI. Show the evidence.</span>
            <br />
            Every alert explains why, cites the data, scores confidence, and offers a one-click action — or dismiss.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

/* =========================================================================
   SECTION 6 — GLOBAL SEARCH + COMMAND PALETTE
   ========================================================================= */
function SearchCommandSection() {
  const [query, setQuery] = useState("");
  const sampleQueries = ["ahmed", "metformin", "hba1c", "invoice", "bupa"];
  const [queryIdx, setQueryIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setQueryIdx((i) => (i + 1) % sampleQueries.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Clear query immediately when switching to a new sample so the typed text
    // and the results below stay in sync.
    setQuery("");
    let i = 0;
    const target = sampleQueries[queryIdx];
    const typer = setInterval(() => {
      i++;
      setQuery(target.slice(0, i));
      if (i >= target.length) {
        clearInterval(typer);
      }
    }, 90);
    return () => clearInterval(typer);
  }, [queryIdx]);

  const resultsByType: Record<string, { icon: React.ElementType; tint: string; label: string; detail: string }[]> = {
    ahmed: [
      { icon: Users, tint: "text-emerald-400", label: "Ahmed Hassan · 54M · MRN P1", detail: "Patients" },
      { icon: Calendar, tint: "text-violet-400", label: "Ahmed Hassan — Tomorrow 9:00", detail: "Appointments" },
      { icon: MessageCircle, tint: "text-blue-400", label: "Conversation with Ahmed", detail: "Messages" },
      { icon: FlaskConical, tint: "text-cyan-400", label: "Ahmed — HbA1c 8.4%", detail: "Lab Results" },
    ],
    metformin: [
      { icon: Pill, tint: "text-rose-400", label: "Metformin 1000mg · in stock", detail: "Medications" },
      { icon: Pill, tint: "text-rose-400", label: "Metformin Rx — Ahmed Hassan", detail: "Prescriptions" },
    ],
    hba1c: [
      { icon: FlaskConical, tint: "text-cyan-400", label: "HbA1c 8.4% — Ahmed Hassan", detail: "Lab Results" },
      { icon: FlaskConical, tint: "text-cyan-400", label: "HbA1c 6.1% — Fatima Al-Zahra", detail: "Lab Results" },
    ],
    invoice: [
      { icon: DollarSign, tint: "text-amber-400", label: "Invoice #392 — $240", detail: "Billing" },
      { icon: DollarSign, tint: "text-amber-400", label: "Invoice #389 — $180 (overdue)", detail: "Billing" },
    ],
    bupa: [
      { icon: Shield, tint: "text-emerald-400", label: "Bupa Arabia — $240 approved", detail: "Insurance" },
      { icon: Shield, tint: "text-emerald-400", label: "Bupa Arabia — policy POL-2026-1002", detail: "Insurance" },
    ],
  };

  const currentResults = resultsByType[sampleQueries[queryIdx]] || [];

  return (
    <section className="py-24 sm:py-32 border-t border-border/20">
      <div className="mx-auto max-w-5xl px-6">
        <FadeIn>
          <p className="text-micro text-veltra-emerald font-medium uppercase tracking-wider mb-4 text-center">
            Global search · Command center
          </p>
          <h2 className="text-[2rem] sm:text-[3rem] leading-[1.05] tracking-[-0.035em] text-foreground font-semibold text-center max-w-3xl mx-auto">
            <span className="text-editorial-italic text-muted-foreground">Spotlight</span> for your clinic.
          </h2>
          <p className="text-body text-muted-foreground mt-6 max-w-xl mx-auto text-center leading-relaxed">
            One search across patients, labs, prescriptions, files, invoices, messages. One keystroke (⌘K) to execute any action.
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="mt-16 max-w-xl mx-auto">
            <div className="rounded-2xl veltra-glass-strong veltra-shadow-xl border border-border/30 overflow-hidden">
              {/* Command palette header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border/30">
                <Search className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-body text-foreground">
                    {query}
                    <span className="inline-block w-px h-4 bg-veltra-emerald ml-0.5 animate-pulse align-middle" />
                  </p>
                </div>
                <kbd className="text-micro px-1.5 py-0.5 rounded bg-foreground/[0.06] text-muted-foreground normal-case tracking-normal">⌘K</kbd>
              </div>

              {/* Results */}
              <div className="max-h-72 overflow-y-auto veltra-scrollbar">
                {query && currentResults.length > 0 ? (
                  currentResults.map((r, i) => (
                    <motion.div
                      key={`${r.label}-${i}`}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.3, ease: EASE }}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-foreground/[0.03] cursor-pointer veltra-transition border-b border-border/20 last:border-0"
                    >
                      <r.icon className={cn("h-3.5 w-3.5 flex-shrink-0", r.tint)} />
                      <div className="flex-1 min-w-0">
                        <p className="text-caption text-foreground truncate">{r.label}</p>
                      </div>
                      <span className="text-micro text-muted-foreground/60 normal-case tracking-normal">{r.detail}</span>
                    </motion.div>
                  ))
                ) : (
                  <div className="px-4 py-12 text-center">
                    <Command className="h-6 w-6 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-caption text-muted-foreground/60">Type to search across everything…</p>
                  </div>
                )}
              </div>

              {/* Footer actions */}
              <div className="px-4 py-2.5 border-t border-border/30 bg-foreground/[0.02]">
                <p className="text-micro text-muted-foreground/60 normal-case tracking-normal mb-1.5">
                  Actions
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: "New patient", icon: Plus },
                    { label: "Start visit", icon: Stethoscope },
                    { label: "Order lab", icon: FlaskConical },
                    { label: "Print chart", icon: FileText },
                  ].map((a) => (
                    <span key={a.label} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-foreground/[0.04] text-micro text-foreground normal-case tracking-normal">
                      <a.icon className="h-2.5 w-2.5 text-veltra-emerald" />
                      {a.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* =========================================================================
   SECTION 7 — SECURITY (calm, no buzzwords)
   ========================================================================= */
function SecuritySection() {
  const pillars = [
    { icon: Lock,        title: "Encryption",        desc: "AES-256 at rest. TLS 1.3 in transit. Every byte." },
    { icon: Eye,         title: "Audit trail",       desc: "Every action logged. Every view tracked. Every change attributed." },
    { icon: Shield,      title: "Role permissions",  desc: "10 roles. 25+ granular flags. Doctors see patients. IT sees systems. Nobody sees what they shouldn't." },
    { icon: Database,    title: "Cloud backups",     desc: "Daily automated. Tested restores. 30-day point-in-time recovery." },
  ];

  const compliance = ["HIPAA", "GDPR", "PDPL", "SOC 2", "ISO 27001"];

  return (
    <section id="security" className="py-24 sm:py-32 border-t border-border/20 bg-foreground/[0.01] scroll-mt-20">
      <div className="mx-auto max-w-5xl px-6">
        <FadeIn>
          <p className="text-micro text-veltra-emerald font-medium uppercase tracking-wider mb-4 text-center">
            Security
          </p>
          <h2 className="text-[2rem] sm:text-[3rem] leading-[1.05] tracking-[-0.035em] text-foreground font-semibold text-center max-w-3xl mx-auto">
            <span className="text-editorial-italic text-muted-foreground">Calm</span> by design.
          </h2>
          <p className="text-body text-muted-foreground mt-6 max-w-xl mx-auto text-center leading-relaxed">
            Healthcare data deserves more than marketing buzzwords. Veltra is engineered to be the most secure system in your clinic.
          </p>
        </FadeIn>

        <StaggerGroup className="grid sm:grid-cols-2 gap-3 mt-16">
          {pillars.map((p) => (
            <StaggerItem key={p.title}>
              <div className="rounded-xl veltra-glass p-5 border border-border/20 h-full">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-veltra-emerald/10 flex items-center justify-center flex-shrink-0">
                    <p.icon className="h-4 w-4 text-veltra-emerald" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body font-medium text-foreground mb-1">{p.title}</p>
                    <p className="text-caption text-muted-foreground leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>

        {/* Compliance badges */}
        <FadeIn delay={0.3}>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            {compliance.map((c) => (
              <span key={c} className="px-4 py-1.5 rounded-full bg-foreground/[0.04] border border-border/40 text-caption text-muted-foreground font-medium tracking-wider">
                {c}
              </span>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={0.4}>
          <p className="text-center mt-8 text-micro text-muted-foreground/60 normal-case tracking-normal italic">
            Architecture, not policy. Compliance by design — not by checklist.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

/* =========================================================================
   SECTION 8 — ENTERPRISE (org visualization)
   ========================================================================= */
function EnterpriseSection() {
  const layers = [
    { icon: Building2, label: "Platform",      detail: "Veltra itself",          count: "1" },
    { icon: Building2, label: "Organization",  detail: "Hospital network",       count: "1" },
    { icon: Hospital,  label: "Hospital",      detail: "Multi-specialty",        count: "3" },
    { icon: Building2, label: "Branch",        detail: "Locations",              count: "12" },
    { icon: Users,     label: "Department",    detail: "Cardio, Derma, Peds…",   count: "47" },
    { icon: Users,     label: "Users",         detail: "Doctors, nurses, staff", count: "2,400" },
  ];

  return (
    <section className="py-24 sm:py-32 border-t border-border/20">
      <div className="mx-auto max-w-5xl px-6">
        <FadeIn>
          <p className="text-micro text-veltra-emerald font-medium uppercase tracking-wider mb-4 text-center">
            Enterprise
          </p>
          <h2 className="text-[2rem] sm:text-[3rem] leading-[1.05] tracking-[-0.035em] text-foreground font-semibold text-center max-w-3xl mx-auto">
            <span className="text-editorial-italic text-muted-foreground">From one clinic</span>{" "}
            to a thousand.
          </h2>
          <p className="text-body text-muted-foreground mt-6 max-w-xl mx-auto text-center leading-relaxed">
            Built multi-tenant from day one. One doctor sees one clinic. A network owner sees everything. Same codebase, same UX, infinite scale.
          </p>
        </FadeIn>

        {/* Org hierarchy visualization */}
        <FadeIn delay={0.1}>
          <div className="mt-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {layers.map((layer, i) => (
              <motion.div
                key={layer.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: EASE }}
                className="rounded-xl veltra-glass p-4 border border-border/20 text-center"
              >
                <layer.icon className="h-5 w-5 text-veltra-emerald mx-auto mb-2" />
                <p className="text-body font-semibold text-foreground tabular">{layer.count}</p>
                <p className="text-micro font-medium text-foreground mt-0.5 normal-case tracking-normal">{layer.label}</p>
                <p className="text-micro text-muted-foreground/60 normal-case tracking-normal mt-1 leading-tight">{layer.detail}</p>
              </motion.div>
            ))}
          </div>
        </FadeIn>

        {/* Permission matrix preview */}
        <FadeIn delay={0.3}>
          <div className="mt-8 rounded-xl veltra-glass p-5 border border-border/20">
            <p className="text-micro text-veltra-emerald font-medium uppercase tracking-wider mb-3">
              Permission matrix — what each role sees
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-micro">
              {[
                { role: "Doctor",      sees: "Patients · Labs · Rx", color: "text-emerald-400" },
                { role: "Nurse",       sees: "Vitals · Patients", color: "text-violet-400" },
                { role: "Pharmacist",  sees: "Inventory · Rx", color: "text-pink-400" },
                { role: "Lab Tech",    sees: "Lab orders · Results", color: "text-cyan-400" },
                { role: "Finance",     sees: "Billing · Claims · Reports", color: "text-amber-400" },
                { role: "Reception",   sees: "Schedule · Check-in", color: "text-violet-400" },
                { role: "IT Support",  sees: "System · Audit logs", color: "text-blue-400" },
                { role: "Operations",  sees: "Billing · Inventory", color: "text-teal-400" },
                { role: "Radiologist", sees: "Imaging · Reports", color: "text-indigo-400" },
                { role: "Admin",       sees: "Everything", color: "text-rose-400" },
              ].map((r) => (
                <div key={r.role} className="rounded-md bg-foreground/[0.04] p-2">
                  <p className={cn("font-medium normal-case tracking-normal", r.color)}>{r.role}</p>
                  <p className="text-muted-foreground/70 normal-case tracking-normal mt-0.5 leading-tight">{r.sees}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* =========================================================================
   SECTION 9 — PERFORMANCE (real ROI metrics)
   ========================================================================= */
function PerformanceSection() {
  const metrics = [
    { value: 43,  suffix: "%",    label: "Less documentation",     detail: "AI scribe + smart import", color: "text-veltra-emerald" },
    { value: 62,  suffix: "%",    label: "Faster check-in",         detail: "iPad kiosk + auto-verify", color: "text-violet-400" },
    { value: 91,  suffix: "%",    label: "Fewer missed follow-ups", detail: "AI reminders + smart scheduling", color: "text-cyan-400" },
    { value: 318, suffix: " hrs", label: "Saved monthly",           detail: "Per clinic, on average", color: "text-amber-400" },
  ];

  return (
    <section className="py-24 sm:py-32 border-t border-border/20 bg-foreground/[0.01]">
      <div className="mx-auto max-w-5xl px-6">
        <FadeIn>
          <p className="text-micro text-veltra-emerald font-medium uppercase tracking-wider mb-4 text-center">
            Performance
          </p>
          <h2 className="text-[2rem] sm:text-[3rem] leading-[1.05] tracking-[-0.035em] text-foreground font-semibold text-center max-w-3xl mx-auto">
            <span className="text-editorial-italic text-muted-foreground">Hours back.</span>{" "}
            Patients first.
          </h2>
        </FadeIn>

        <StaggerGroup className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-16">
          {metrics.map((m) => (
            <StaggerItem key={m.label}>
              <div className="rounded-xl veltra-glass p-6 border border-border/20 text-center h-full">
                <AnimatedCounter value={m.value} suffix={m.suffix} className={m.color} />
                <p className="text-caption font-medium text-foreground mt-2">{m.label}</p>
                <p className="text-micro text-muted-foreground/70 normal-case tracking-normal mt-1">{m.detail}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>

        <FadeIn delay={0.3}>
          <p className="text-center mt-12 text-micro text-muted-foreground/60 normal-case tracking-normal italic max-w-xl mx-auto">
            Measured across pilot clinics over 90 days. Your results will vary — but the direction is always the same.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

function AnimatedCounter({ value, suffix, className }: { value: number; suffix: string; className?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (!inView) return;
    const duration = 1400;
    const start = Date.now();
    let rafId: number;
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplay(Math.round(value * eased));
      if (progress < 1) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [inView, value]);

  return (
    <p ref={ref} className={cn("text-[2.5rem] sm:text-[3rem] font-bold tabular leading-none", className)}>
      {display.toLocaleString()}{suffix}
    </p>
  );
}

/* =========================================================================
   SECTION 10 — MOBILE
   ========================================================================= */
function MobileSection() {
  const apps = [
    { icon: Stethoscope, title: "Doctor",     desc: "Start visit · prescribe · review labs · AI scribe", tint: "text-veltra-emerald" },
    { icon: Heart,       title: "Patient",    desc: "Book · chat · see labs · pay · health score",        tint: "text-rose-400" },
    { icon: Users,       title: "Reception",  desc: "Check-in · confirm · assign room · collect copay",   tint: "text-violet-400" },
    { icon: Shield,      title: "Admin",      desc: "Revenue · occupancy · staff · inventory · KPIs",     tint: "text-amber-400" },
  ];

  return (
    <section className="py-24 sm:py-32 border-t border-border/20">
      <div className="mx-auto max-w-5xl px-6">
        <FadeIn>
          <p className="text-micro text-veltra-emerald font-medium uppercase tracking-wider mb-4 text-center">
            Mobile
          </p>
          <h2 className="text-[2rem] sm:text-[3rem] leading-[1.05] tracking-[-0.035em] text-foreground font-semibold text-center max-w-3xl mx-auto">
            <span className="text-editorial-italic text-muted-foreground">The clinic</span>{" "}
            in your pocket.
          </h2>
          <p className="text-body text-muted-foreground mt-6 max-w-xl mx-auto text-center leading-relaxed">
            Four purpose-built apps. One operating system. The doctor works from anywhere. The patient never calls reception again.
          </p>
        </FadeIn>

        <StaggerGroup className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-16">
          {apps.map((app) => (
            <StaggerItem key={app.title}>
              {/* Phone mockup */}
              <div className="rounded-[2rem] veltra-glass-strong border border-border/30 p-4 veltra-shadow-lg text-center h-full">
                <div className="mx-auto w-20 h-32 rounded-2xl bg-foreground/[0.06] border border-border/40 mb-4 flex items-center justify-center relative overflow-hidden">
                  <app.icon className={cn("h-7 w-7", app.tint)} />
                  {/* Phone notch */}
                  <div className="absolute top-1.5 left-1/2 -translate-x-1/2 h-1 w-6 rounded-full bg-foreground/40" />
                </div>
                <p className="text-body font-semibold text-foreground">{app.title}</p>
                <p className="text-micro text-muted-foreground/70 normal-case tracking-normal mt-1 leading-relaxed">{app.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>

        <FadeIn delay={0.3}>
          <p className="text-center mt-10 text-micro text-muted-foreground/60 normal-case tracking-normal">
            PWA today · Native iOS &amp; Android in Phase 3
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

/* =========================================================================
   SECTION 11 — PRICING
   ========================================================================= */
function PricingSection({ onEnter }: { onEnter: (uid?: string) => void }) {
  const tiers = TIERS.filter((t) => t.id === "platform" || t.id === "enterprise");
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  return (
    <section id="pricing" className="py-24 sm:py-32 border-t border-border/20 bg-foreground/[0.01] scroll-mt-20">
      <div className="mx-auto max-w-5xl px-6">
        <FadeIn>
          <p className="text-micro text-veltra-emerald font-medium uppercase tracking-wider mb-4 text-center">
            Pricing
          </p>
          <h2 className="text-[2rem] sm:text-[3rem] leading-[1.05] tracking-[-0.035em] text-foreground font-semibold text-center max-w-3xl mx-auto">
            <span className="text-editorial-italic text-muted-foreground">Simple.</span> Honest.
          </h2>
          <p className="text-body text-muted-foreground mt-6 max-w-xl mx-auto text-center leading-relaxed">
            One price per clinic. Unlimited patients, visits, and staff. No per-seat games. No hidden fees.
          </p>
        </FadeIn>

        {/* Billing toggle */}
        <FadeIn delay={0.1}>
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => setBilling("monthly")}
              className={cn("px-3 py-1.5 rounded-md text-caption font-medium veltra-transition", billing === "monthly" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("annual")}
              className={cn("px-3 py-1.5 rounded-md text-caption font-medium veltra-transition", billing === "annual" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}
            >
              Annual
              <span className="ml-1.5 text-micro text-veltra-emerald normal-case tracking-normal">2 months free</span>
            </button>
          </div>
        </FadeIn>

        <StaggerGroup className="grid md:grid-cols-2 gap-4 mt-12 max-w-3xl mx-auto">
          {tiers.map((tier) => (
            <StaggerItem key={tier.id}>
              <PricingCard tier={tier} billing={billing} onEnter={onEnter} />
            </StaggerItem>
          ))}
        </StaggerGroup>

        <FadeIn delay={0.3}>
          <p className="text-center mt-10 text-micro text-muted-foreground/60 normal-case tracking-normal">
            Founding Partner program · first 10 clinics · $699/month locked for 3 years ·{" "}
            <a href="mailto:sales@veltrahealth.co?subject=Founding%20Partner%20Application" className="text-veltra-emerald hover:underline">
              Apply now →
            </a>
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

function PricingCard({ tier, billing, onEnter }: { tier: TierConfig; billing: "monthly" | "annual"; onEnter: (uid?: string) => void }) {
  const isPlatform = tier.id === "platform";
  const price = isPlatform ? (billing === "monthly" ? 999 : 832) : null;
  const features = isPlatform
    ? ["Unlimited patients & visits", "Unlimited staff", "Up to 3 locations", "All clinical modules", "Smart Import + OCR", "Drug interaction engine", "Audit trail", "Email + WhatsApp support"]
    : ["Everything in Platform", "Unlimited locations", "Multi-organization", "SSO + MFA", "Advanced analytics", "Custom integrations", "Dedicated account manager", "99.99% uptime SLA"];

  return (
    <div className={cn(
      "rounded-2xl p-6 border h-full flex flex-col veltra-transition",
      isPlatform ? "veltra-glass-strong veltra-shadow-xl border-veltra-emerald/30" : "veltra-glass border-border/20"
    )}>
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-body font-semibold text-foreground">{tier.name}</span>
        {isPlatform && (
          <span className="text-micro px-1.5 py-0 rounded bg-veltra-emerald/15 text-veltra-emerald normal-case tracking-normal font-medium">
            Most popular
          </span>
        )}
      </div>
      <p className="text-micro text-muted-foreground/70 normal-case tracking-normal mb-5">{tier.tagline}</p>

      <div className="mb-5">
        {price ? (
          <>
            <span className="text-[2.5rem] font-bold text-foreground tabular">${price}</span>
            <span className="text-caption text-muted-foreground">/mo</span>
            {billing === "annual" && (
              <p className="text-micro text-veltra-emerald normal-case tracking-normal mt-1">Billed annually</p>
            )}
          </>
        ) : (
          <>
            <span className="text-[2rem] font-semibold text-foreground">Custom</span>
            <p className="text-micro text-muted-foreground/70 normal-case tracking-normal mt-1">For hospital networks</p>
          </>
        )}
      </div>

      <ul className="space-y-2 mb-6 flex-1">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <Check className="h-3.5 w-3.5 text-veltra-emerald flex-shrink-0 mt-0.5" />
            <span className="text-caption text-foreground leading-snug">{f}</span>
          </li>
        ))}
      </ul>

      {isPlatform ? (
        <Button
          onClick={() => onEnter(tier.demoUserId)}
          className="w-full h-10 text-caption font-medium bg-veltra-emerald hover:bg-veltra-emerald-dark text-white"
        >
          See it live
          <ArrowRight className="ml-1.5 h-3 w-3" />
        </Button>
      ) : (
        <a
          href="mailto:sales@veltrahealth.co?subject=Enterprise%20inquiry"
          className="w-full h-10 inline-flex items-center justify-center rounded-md bg-foreground/[0.06] hover:bg-foreground/[0.1] text-foreground text-caption font-medium veltra-transition"
        >
          Talk to sales
          <ArrowRight className="ml-1.5 h-3 w-3" />
        </a>
      )}
    </div>
  );
}

/* =========================================================================
   SECTION 12 — FINAL STATEMENT
   ========================================================================= */
function FinalStatementSection({ onEnter }: { onEnter: (uid?: string) => void }) {
  return (
    <section className="py-32 sm:py-40 border-t border-border/20 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-veltra-emerald/8 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-3xl px-6 text-center">
        <FadeIn>
          <p className="text-micro text-veltra-emerald font-medium uppercase tracking-wider mb-6">
            The final statement
          </p>
        </FadeIn>

        <FadeIn delay={0.05}>
          <h2 className="text-[2.5rem] sm:text-[4rem] leading-[1.0] tracking-[-0.04em] text-foreground font-semibold">
            <span className="text-editorial-italic text-muted-foreground">This is not</span>
            <br />
            another clinic app.
          </h2>
        </FadeIn>

        <FadeIn delay={0.15}>
          <p className="text-body sm:text-lg text-muted-foreground mt-8 max-w-xl mx-auto leading-relaxed">
            This is the operating system modern healthcare has been missing.
            <br />
            <span className="text-editorial-italic">Technology disappears. Care remains.</span>
          </p>
        </FadeIn>

        <FadeIn delay={0.25}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-12">
            <Button
              size="lg"
              onClick={() => onEnter()}
              className="h-12 px-6 bg-veltra-emerald hover:bg-veltra-emerald-dark text-white text-body font-medium veltra-shadow-lg"
            >
              See it live
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <a
              href="mailto:hello@veltrahealth.co"
              className="h-12 px-6 inline-flex items-center justify-center rounded-md bg-foreground/[0.04] hover:bg-foreground/[0.08] text-body font-medium text-muted-foreground hover:text-foreground veltra-transition"
            >
              hello@veltrahealth.co
            </a>
          </div>
        </FadeIn>

        {/* Trust microcopy */}
        <FadeIn delay={0.35}>
          <p className="text-micro text-muted-foreground/60 normal-case tracking-normal mt-16">
            90 seconds to first patient · No credit card · Cancel anytime · HIPAA · GDPR · PDPL
          </p>
        </FadeIn>
      </div>

      {/* Footer */}
      <FadeIn delay={0.4}>
        <div className="mt-32 pt-8 border-t border-border/20 max-w-5xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <img src="/logo-symbol.png" alt="Veltra" className="object-cover h-6 w-6 rounded-lg" />
              <span className="text-caption font-semibold tracking-tight text-foreground">Veltra</span>
              <span className="text-micro text-muted-foreground/60 normal-case tracking-normal">
                · The Clinic Operating System
              </span>
            </div>
            <div className="flex items-center gap-4 text-micro text-muted-foreground normal-case tracking-normal">
              <a href="/security" className="hover:text-foreground veltra-transition">Security</a>
              <a href="/constitution" className="hover:text-foreground veltra-transition">Constitution</a>
              <a href="mailto:hello@veltrahealth.co" className="hover:text-foreground veltra-transition">Contact</a>
              <span className="text-muted-foreground/40">© {new Date().getFullYear()} Veltra</span>
            </div>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}

/* =========================================================================
   MODAL WRAPPER + CONTENT
   ========================================================================= */
function ModalWrapper({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  // Lock body scroll + Escape to close
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="bg-card/95 backdrop-blur-2xl rounded-2xl veltra-shadow-xl border border-border/40 max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto veltra-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function ModalContent({ type }: { type: ModalType }) {
  const titles: Record<string, string> = {
    platform: "Veltra Platform",
    security: "Security & Compliance",
    privacy: "Privacy Policy",
    terms: "Terms of Service",
    contact: "Contact",
    why: "Why Veltra",
    status: "System Status",
    changelog: "Changelog",
  };

  return (
    <div>
      <h3 className="text-title font-semibold text-foreground mb-1">{type ? (titles[type] || type) : ""}</h3>
      <p className="text-caption text-muted-foreground mb-5">
        {type === "platform" && "Everything you need to run a clinic."}
        {type === "security" && "Engineered for healthcare-grade trust."}
        {type === "why" && "The story behind Veltra."}
        {type === "status" && "All systems operational."}
        {type === "changelog" && "Latest updates."}
      </p>

      {type === "platform" && (
        <div className="space-y-3 text-body text-muted-foreground">
          <p>Veltra includes everything a clinic needs to operate — and nothing it doesn't.</p>
          <div className="grid grid-cols-2 gap-2">
            {["Appointments", "Patient Records", "Billing & Payments", "Lab Results", "Automated Reminders", "Insurance Claims", "Pharmacy Inventory", "Insights & Reports"].map((f) => (
              <div key={f} className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-veltra-emerald flex-shrink-0" />
                <span className="text-caption text-foreground">{f}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {type === "security" && (
        <div className="space-y-3">
          {[
            { icon: Lock, label: "TLS 1.3 in transit", desc: "Every byte encrypted end-to-end" },
            { icon: Shield, label: "AES-256 at rest", desc: "Database + file storage encrypted" },
            { icon: Eye, label: "Role-based access", desc: "10 roles · 25+ permission flags" },
            { icon: Check, label: "Audit trail", desc: "Every action logged, attributed" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3 rounded-xl bg-foreground/[0.04] p-3">
              <div className="h-8 w-8 rounded-lg bg-veltra-emerald/10 flex items-center justify-center flex-shrink-0">
                <s.icon className="h-3.5 w-3.5 text-veltra-emerald" />
              </div>
              <div>
                <p className="text-caption font-medium text-foreground">{s.label}</p>
                <p className="text-micro text-muted-foreground normal-case tracking-normal">{s.desc}</p>
              </div>
            </div>
          ))}
          <p className="text-micro text-muted-foreground/60 normal-case tracking-normal italic mt-2">
            HIPAA · GDPR · PDPL · SOC 2 · ISO 27001 — architecture, not policy.
          </p>
        </div>
      )}

      {type === "why" && (
        <div className="space-y-3 text-body text-muted-foreground">
          <p>Healthcare software today is broken. Doctors spend more time with screens than with patients. Clinics juggle five disconnected tools. Errors slip through. Paper never dies.</p>
          <p>Veltra exists to fix this — not by adding another app, but by replacing the chaos with a single, calm operating system.</p>
          <p className="text-editorial-italic text-foreground">Technology disappears. Care remains.</p>
        </div>
      )}

      {type === "status" && (
        <div className="space-y-2">
          {["API", "Dashboard", "Database", "AI Engine", "Notifications", "Backups"].map((s) => (
            <div key={s} className="flex items-center justify-between text-caption">
              <span className="text-foreground">{s}</span>
              <span className="text-emerald-400 flex items-center gap-1.5 normal-case tracking-normal">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Operational
              </span>
            </div>
          ))}
        </div>
      )}

      {type === "changelog" && (
        <div className="space-y-3 text-caption text-muted-foreground">
          <div>
            <p className="text-foreground font-medium">v0.3.0 — Latest</p>
            <p className="mt-0.5 normal-case tracking-normal">Health Score · Clinic Intelligence · Patient Flags · VELTRA Switch migration</p>
          </div>
          <div>
            <p className="text-foreground font-medium">v0.2.0</p>
            <p className="mt-0.5 normal-case tracking-normal">10 roles · Permission Matrix · Notification Center · Smart Import · Global Search</p>
          </div>
          <div>
            <p className="text-foreground font-medium">v0.1.0</p>
            <p className="mt-0.5 normal-case tracking-normal">Initial launch · 19 screens · 11-language landing page</p>
          </div>
        </div>
      )}

      {(type === "privacy" || type === "terms" || type === "contact") && (
        <p className="text-body text-muted-foreground">
          Full {titles[type]} document available at veltrahealth.co/{type}.
        </p>
      )}
    </div>
  );
}
