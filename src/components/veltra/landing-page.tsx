"use client";

import { useVeltra } from "@/lib/veltra-store";
import { translate, type Language } from "@/lib/i18n";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, Phone, Calendar, DollarSign, Bell, Sparkles, Shield, Check,
  Mail, Clock, Lock, Eye, AlertTriangle, Activity, Sun,
  Linkedin, Twitter, Instagram, X, Globe, Zap, Heart, Brain,
} from "lucide-react";
import { useState, useRef } from "react";
import { SubscriptionPreview } from "./subscription-preview";
import { TIERS, type TierConfig, type TierId } from "@/lib/subscription-tiers";
import { ThemeToggle } from "./theme-toggle";
import { SPECIALTIES } from "@/lib/specialties";
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

type ModalType = "platform" | "memory" | "security" | "privacy" | "terms" | "contact" | "why" | "status" | "changelog" | null;

function getModalContent(t: any): Record<string, { title: string; subtitle?: string; body: React.ReactNode; cta?: string }> {
  return {
  platform: {
    title: t("modal.platform.title"),
    subtitle: t("modal.platform.subtitle"),
    body: (
      <div className="space-y-4 text-body text-muted-foreground">
        <p>{t("modal.platform.desc")}</p>
        <div className="grid grid-cols-2 gap-3">
          {["Appointments", "Patient Records", "Billing & Payments", "Lab Results", "Automated Reminders", "Insurance Claims", "Pharmacy Inventory", "Insights & Reports"].map((f) => (
            <div key={f} className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5 text-veltra-emerald flex-shrink-0" />
              <span className="text-caption text-foreground">{f}</span>
            </div>
          ))}
        </div>
        {/* Integrations */}
        <div className="pt-4 border-t border-border/40">
          <p className="text-micro text-muted-foreground mb-3">{t("modal.platform.integrations")}</p>
          <div className="space-y-2">
            {[
              { name: "Gmail", status: "Live", color: "text-emerald-400" },
              { name: "Outlook", status: "Live", color: "text-emerald-400" },
              { name: "Google Calendar", status: "Live", color: "text-emerald-400" },
              { name: "Stripe", status: "Live", color: "text-emerald-400" },
              { name: "Twilio (SMS)", status: "Live", color: "text-emerald-400" },
              { name: "WhatsApp Business", status: "Available", color: "text-emerald-400" },
              { name: "NPHIES", status: "Rolling Out Soon", color: "text-blue-400" },
              { name: "Developer API", status: "Early Access", color: "text-amber-400" },
            ].map((int) => (
              <div key={int.name} className="flex items-center justify-between text-caption">
                <span className="text-foreground">{int.name}</span>
                <span className={int.color}>{int.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  memory: {
    title: t("modal.memory.title"),
    subtitle: t("modal.memory.subtitle"),
    body: (
      <div className="space-y-4 text-body text-muted-foreground">
        <p>{t("modal.memory.p1")}</p>
        <p>{t("modal.memory.p2")}</p>
        <div className="space-y-3 mt-4">
          <div className="rounded-xl bg-foreground/[0.04] p-4">
            <p className="text-micro text-muted-foreground mb-1">{t("modal.memory.card1_period")}</p>
            <p className="text-body text-foreground">{t("modal.memory.card1_insight")}</p>
          </div>
          <div className="rounded-xl bg-foreground/[0.04] p-4">
            <p className="text-micro text-muted-foreground mb-1">{t("modal.memory.card2_period")}</p>
            <p className="text-body text-foreground">{t("modal.memory.card2_insight")}</p>
          </div>
        </div>
      </div>
    ),
  },
  security: {
    title: t("modal.security.title"),
    subtitle: t("modal.security.subtitle"),
    body: (
      <div className="space-y-3">
        {[
          { icon: Lock, label: t("modal.security.tls"), desc: t("modal.security.tls_desc") },
          { icon: Shield, label: t("modal.security.aes"), desc: t("modal.security.aes_desc") },
          { icon: Eye, label: t("modal.security.rbac"), desc: t("modal.security.rbac_desc") },
          { icon: Check, label: t("modal.security.audit"), desc: t("modal.security.audit_desc") },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-3 rounded-xl bg-foreground/[0.04] p-4">
            <div className="h-9 w-9 rounded-lg bg-veltra-emerald/10 flex items-center justify-center">
              <s.icon className="h-4 w-4 text-veltra-emerald" />
            </div>
            <div>
              <p className="text-body font-medium text-foreground">{s.label}</p>
              <p className="text-caption text-muted-foreground">{s.desc}</p>
            </div>
          </div>
        ))}
        <p className="text-caption text-muted-foreground/60 italic mt-2">{t("modal.security.hosted")}</p>
      </div>
    ),
  },
  privacy: {
    title: t("modal.privacy.title"),
    subtitle: t("modal.privacy.subtitle"),
    body: (
      <div className="space-y-3 text-body text-muted-foreground">
        <p>{t("modal.privacy.p1")}</p>
        <p>{t("modal.privacy.p2")}</p>
        <p>{t("modal.privacy.p3")}</p>
        <p className="text-caption text-muted-foreground/60 italic mt-4">{t("modal.privacy.note")}</p>
      </div>
    ),
  },
  terms: {
    title: t("modal.terms.title"),
    subtitle: t("modal.terms.subtitle"),
    body: (
      <div className="space-y-3 text-body text-muted-foreground">
        <p>{t("modal.terms.p1")}</p>
        <p>{t("modal.terms.p2")}</p>
        <p>{t("modal.terms.p3")}</p>
      </div>
    ),
  },
  contact: {
    title: t("modal.contact.title"),
    subtitle: t("modal.contact.subtitle"),
    body: (
      <div className="space-y-3">
        {[
          { icon: Mail, label: t("modal.contact.email_label"), value: t("modal.contact.email_value") },
          { icon: Calendar, label: t("modal.contact.demo_label"), value: t("modal.contact.demo_value") },
        ].map((c) => (
          <div key={c.label} className="flex items-center gap-3 rounded-xl bg-foreground/[0.04] p-4">
            <div className="h-9 w-9 rounded-lg bg-veltra-emerald/10 flex items-center justify-center">
              <c.icon className="h-4 w-4 text-veltra-emerald" />
            </div>
            <div>
              <p className="text-body font-medium text-foreground">{c.label}</p>
              <p className="text-caption text-muted-foreground">{c.value}</p>
            </div>
          </div>
        ))}
      </div>
    ),
  },

  why: {
    title: t("modal.why.title"),
    subtitle: t("modal.why.subtitle"),
    body: (
      <div className="space-y-4 text-body text-muted-foreground leading-relaxed">
        <p>{t("modal.why.p1")}</p>
        <p>{t("modal.why.p2")}</p>
        <p className="text-foreground font-medium">{t("modal.why.p3")}</p>
        <p>{t("modal.why.p4")}</p>
        <p className="text-editorial-italic text-foreground pt-4 border-t border-border/40">
          {t("tagline")}
        </p>
      </div>
    ),
  },

  status: {
    title: t("modal.status.title"),
    subtitle: t("modal.status.subtitle"),
    body: (
      <div className="space-y-3">
        {[
          { service: t("modal.status.api"), status: t("modal.status.operational"), uptime: "99.98%" },
          { service: t("modal.status.dashboard"), status: t("modal.status.operational"), uptime: "99.99%" },
          { service: t("modal.status.email_gw"), status: t("modal.status.operational"), uptime: "99.95%" },
          { service: t("modal.status.payments"), status: t("modal.status.operational"), uptime: "100%" },
          { service: t("modal.status.notifications"), status: t("modal.status.operational"), uptime: "99.97%" },
        ].map((s) => (
          <div key={s.service} className="flex items-center justify-between rounded-xl bg-foreground/[0.04] p-4">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-body text-foreground">{s.service}</span>
            </div>
            <div className="text-right">
              <p className="text-caption text-emerald-400">{s.status}</p>
              <p className="text-micro text-muted-foreground tabular">{s.uptime} {t("modal.status.uptime")}</p>
            </div>
          </div>
        ))}
        <p className="text-micro text-muted-foreground/60 italic mt-3">{t("modal.status.updated")}</p>
      </div>
    ),
  },

  changelog: {
    title: t("modal.changelog.title"),
    subtitle: t("modal.changelog.subtitle"),
    body: (
      <div className="space-y-5">
        {[
          { version: "v1.0.1", date: "July 6, 2026", items: ["Clinical Memory section on landing", "Veltra Network with live activity feed", "Apple-style modal system", "Smart sticky navigation", "Loading screen with brand voice", "Dynamic browser tab titles"] },
          { version: "v1.0.0", date: "July 5, 2026", items: ["Initial release", "Operating System, Chief of Staff, Clinical Memory", "4 roles with permission matrix", "17 screens: Brief, Patients, Appointments, Calendar, Timeline, Labs, Billing, Reports, Insurance, Inventory, Messages, Documents, Availability, Recurring, Audit, Settings", "Dark/Light mode + Arabic RTL", "Command Palette, Undo, Context Menus, Tooltips", "Automated reminders, Insurance claims, Pharmacy inventory"] },
        ].map((release) => (
          <div key={release.version}>
            <div className="flex items-baseline justify-between mb-2">
              <p className="text-body font-semibold text-foreground">{release.version}</p>
              <p className="text-micro text-muted-foreground/60 normal-case tracking-normal">{release.date}</p>
            </div>
            <ul className="space-y-1.5">
              {release.items.map((item) => (
                <li key={item} className="flex items-start gap-2 text-caption text-muted-foreground">
                  <Check className="h-3 w-3 text-veltra-emerald flex-shrink-0 mt-1" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    ),
  },
};
}

export function LandingPage({ onEnter, onSignIn, onSpecialtySelect }: { onEnter: (userId?: string) => void; onSignIn: () => void; onSpecialtySelect?: () => void }) {
  const language = useVeltra((s) => s.language) as Language;
  const t = (key: any) => translate(key, language);
  const MODAL_CONTENT = getModalContent(t);
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [navVisible, setNavVisible] = useState(true);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [tierPreviewOpen, setTierPreviewOpen] = useState(false);
  const [tierPreviewInitial, setTierPreviewInitial] = useState<TierId>("platform");
  const { scrollY } = useScroll();
  const lastScroll = useRef(0);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = lastScroll.current;
    if (latest > previous && latest > 100) setNavVisible(false);
    else setNavVisible(true);
    lastScroll.current = latest;
  });

  // ALL entry points go through the password gate via onEnter.
  // The gate (in page.tsx) handles access verification BEFORE any login happens.
  // userId is passed to onEnter so the gate knows which tier to set after granting access.
  const handleEnter = (userId?: string) => {
    onEnter(userId);
  };

  const handleTryTier = (tier: TierConfig) => {
    setTierPreviewOpen(false);
    // Set the tier immediately (updates locations, but no login yet)
    useVeltra.getState().setActiveTier(tier.id);
    // Gate: require password before actual login
    onEnter(tier.demoUserId);
  };

  const openTierPreview = (tierId: TierId = "platform") => {
    setTierPreviewInitial(tierId);
    setTierPreviewOpen(true);
  };

  const openModal = (type: ModalType) => setActiveModal(type);
  const closeModal = () => setActiveModal(null);

  return (
    <div className="min-h-screen bg-background veltra-ambient">
      {/* ===== SMART STICKY NAV — Apple/Stripe/Linear grade ===== */}
      <motion.nav
        animate={{ y: navVisible ? 0 : -100 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="fixed top-0 inset-x-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border/20"
      >
        <div className="mx-auto max-w-5xl px-6 h-14 flex items-center justify-between">
          <a href="/" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="flex items-center gap-2.5 veltra-transition hover:opacity-80" aria-label="Veltra home">
            <img src="/logo-symbol.png" alt="Veltra" className="object-cover h-7 w-7 rounded-lg veltra-shadow" />
            <span className="text-body font-semibold tracking-tight text-foreground">Veltra</span>
          </a>
          {/* Desktop nav — 4 items only */}
          <div className="hidden md:flex items-center gap-1">
            <NavButton label={t("nav.platform")} onClick={() => openModal("platform")} />

            {/* Solutions dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="px-3 h-8 rounded-lg hover:bg-foreground/[0.05] flex items-center gap-1 text-caption text-muted-foreground hover:text-foreground veltra-transition">
                  {t("nav.solutions")} <ChevronDown className="h-3 w-3 opacity-50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 veltra-shadow-lg bg-card/95 backdrop-blur-xl border-border/40">
                <DropdownMenuLabel className="text-micro text-muted-foreground">By Specialty</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {SPECIALTIES.slice(0, 5).map((s) => (
                  <DropdownMenuItem key={s.id} onClick={() => { useVeltra.getState().setSpecialty(s.id); onEnter(); }} className="text-body cursor-pointer gap-2.5">
                    <span className="text-sm">{s.emoji}</span>
                    <span className="flex-1">{s.name}</span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { document.getElementById("solutions")?.scrollIntoView({ behavior: "smooth" }); }} className="text-body cursor-pointer text-veltra-emerald">
                  {t("solutions.view_all")} →
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <a href="#pricing" className="px-3 h-8 rounded-lg hover:bg-foreground/[0.05] flex items-center text-caption text-muted-foreground hover:text-foreground veltra-transition">{t("nav.pricing")}</a>

            {/* Company dropdown — replaces Resources */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="px-3 h-8 rounded-lg hover:bg-foreground/[0.05] flex items-center gap-1 text-caption text-muted-foreground hover:text-foreground veltra-transition">
                  {t("nav.company")} <ChevronDown className="h-3 w-3 opacity-50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 veltra-shadow-lg bg-card/95 backdrop-blur-xl border-border/40">
                <DropdownMenuItem onClick={() => openModal("why")} className="text-body cursor-pointer">{t("nav.about")}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.location.href = "/security"} className="text-body cursor-pointer">{t("nav.security")}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.location.href = "/constitution"} className="text-body cursor-pointer">{t("nav.constitution")}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => openModal("changelog")} className="text-body cursor-pointer">{t("nav.changelog")}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => openModal("status")} className="text-body cursor-pointer">{t("nav.status")}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {/* Mobile: simplified nav */}
          <div className="flex md:hidden items-center gap-1">
            <a href="#pricing" className="px-2 h-8 rounded-lg hover:bg-foreground/[0.05] flex items-center text-caption text-muted-foreground hover:text-foreground veltra-transition">{t("nav.pricing")}</a>
            <a href="#solutions" className="px-2 h-8 rounded-lg hover:bg-foreground/[0.05] flex items-center text-caption text-muted-foreground hover:text-foreground veltra-transition">{t("nav.solutions")}</a>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button size="sm" variant="ghost" onClick={() => onSignIn()} className="h-8 text-caption text-muted-foreground hover:text-foreground">{t("nav.sign_in")}</Button>
            <Button size="sm" onClick={() => handleEnter("u1")} className="h-8 px-4 bg-veltra-emerald hover:bg-veltra-emerald-dark text-white text-caption font-medium">{t("nav.book_demo")}</Button>
          </div>
        </div>
      </motion.nav>

      {/* ===== 1. HERO — Apple-grade staggered reveal ===== */}
      <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
        {/* Ambient emerald glow — slow breathing animation */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.05, 0.10, 0.05] }}
            transition={{ duration: 8, repeat: Infinity, ease: EASE }}
            className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-veltra-emerald rounded-full blur-[140px]"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.03, 0.06, 0.03] }}
            transition={{ duration: 10, repeat: Infinity, ease: EASE, delay: 2 }}
            className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-veltra-emerald rounded-full blur-[100px]"
          />
        </div>

        {/* Staggered content: Logo → Headline → Tagline → CTAs */}
        <div className="relative text-center max-w-2xl">
          {/* Logo — appears first (0.0s) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="mx-auto mb-8"
          >
            <div className="relative inline-flex h-12 w-12 rounded-xl veltra-shadow-emerald">
              <motion.div
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: EASE }}
                className="absolute inset-0 rounded-xl bg-veltra-emerald blur-xl"
              />
              <img src="/logo-symbol.png" alt="Veltra" className="object-cover relative h-12 w-12 rounded-xl" />
            </div>
          </motion.div>

          {/* Headline — appears second (0.3s) */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: EASE }}
            className="text-[3rem] sm:text-[4.5rem] leading-[1.02] tracking-[-0.04em] font-semibold text-foreground"
          >
            {t("hero.title1")}
            <br />
            <span className="text-editorial-italic text-muted-foreground">{t("hero.title2")}</span>
          </motion.h1>

          {/* Tagline — appears third (0.7s) */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.7, ease: EASE }}
            className="text-body text-muted-foreground mt-8 max-w-md mx-auto"
          >
            {t("hero.tagline")}
          </motion.p>

          {/* CTAs — appear fourth (1.0s) */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 1.0, ease: EASE }}
            className="flex items-center justify-center gap-3 mt-12"
          >
            <Button onClick={() => handleEnter("u1")} className="h-11 px-7 bg-veltra-emerald hover:bg-veltra-emerald-dark text-white font-medium">
              {t("hero.cta_demo")} <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              onClick={() => document.getElementById("video")?.scrollIntoView({ behavior: "smooth" })}
              className="h-11 px-6 text-foreground font-medium hover:bg-foreground/[0.05] flex items-center gap-2"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              {t("hero.cta_video")}
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ===== 2. TODAY'S BRIEF — The Hero Feature (animated, live) ===== */}
      <section className="py-32 px-6">
        <div className="mx-auto max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: EASE }} className="text-center mb-12">
            <p className="text-micro text-veltra-emerald mb-4">{t("brief.eyebrow")}</p>
            <h2 className="text-[2.5rem] leading-[1.1] tracking-[-0.03em] font-semibold text-foreground">
              {t("brief.title1")} <span className="text-editorial-italic text-muted-foreground">{t("brief.title2")}</span>
            </h2>
          </motion.div>

          {/* Large Today's Brief mockup — with live motion */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2, ease: EASE }} className="relative">
            <div className="absolute -inset-4 bg-veltra-emerald/5 rounded-3xl blur-2xl pointer-events-none" />
            <div className="relative veltra-glass rounded-2xl veltra-shadow-lg overflow-hidden">
              {/* Browser bar */}
              <div className="flex items-center gap-2 px-5 py-3 border-b border-border/30 bg-foreground/[0.02]">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-400/60" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/60" />
                </div>
                <div className="ml-3 px-3 py-0.5 rounded-md bg-foreground/[0.04] text-micro text-muted-foreground normal-case tracking-normal flex items-center gap-1.5">
                  <Lock className="h-2.5 w-2.5" /> app.veltrahealth.co/brief
                </div>
                <span className="ml-auto flex items-center gap-1.5 text-micro text-veltra-emerald">
                  <span className="veltra-live-dot" /> Live
                </span>
              </div>

              {/* Brief content — full mockup with staggered reveals */}
              <div className="p-6 sm:p-8">
                {/* Greeting */}
                <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3, ease: EASE }} className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-3.5 w-3.5 text-veltra-emerald" />
                    <span className="text-micro text-veltra-emerald">Memory Brief</span>
                    <span className="text-micro text-muted-foreground/60">· Monday, July 7</span>
                  </div>
                  <h3 className="text-[1.75rem] leading-[1.02] tracking-[-0.03em] text-foreground">
                    <span className="text-editorial-italic text-muted-foreground">Good morning,</span>
                    <br />
                    <span className="font-semibold">Dr. Sarah.</span>
                  </h3>
                </motion.div>

                {/* Memory cards — staggered */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                  {[
                    { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/5 border-amber-500/10", title: "No-show pattern", desc: "Ahmed Khalil missed 2 Tuesday appointments after night shifts. HbA1c trending up." },
                    { icon: Activity, color: "text-red-400", bg: "bg-red-500/5 border-red-500/10", title: "Lab flagged", desc: "Sarah Chen's WBC at 12.5. Last 2 visits normal. New medication started 6 weeks ago." },
                    { icon: Check, color: "text-veltra-emerald", bg: "bg-veltra-emerald/5 border-veltra-emerald/10", title: "Open capacity", desc: "Tuesday has 2 open slots. 2 patients on waitlist 5+ days. Fill both in one tap." },
                  ].map((card, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.5 + i * 0.12, ease: EASE }}
                      className={`rounded-xl p-4 border ${card.bg}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <card.icon className={`h-3.5 w-3.5 ${card.color}`} />
                        <p className="text-caption font-medium text-foreground">{card.title}</p>
                      </div>
                      <p className="text-micro text-muted-foreground normal-case tracking-normal leading-relaxed">{card.desc}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Stats grid — animated count-up */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  {[
                    { label: "Revenue Today", value: "$4,850", trend: "+12%", trendColor: "text-emerald-400" },
                    { label: "Patients", value: "24", trend: "+3", trendColor: "text-emerald-400" },
                    { label: "Avg Wait", value: "4.1 min", trend: "-1.3 min", trendColor: "text-emerald-400" },
                    { label: "No-show Risk", value: "2", trend: "monitoring", trendColor: "text-amber-400" },
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.8 + i * 0.08, ease: EASE }}
                      className="rounded-xl p-4 bg-foreground/[0.02]"
                    >
                      <p className="text-micro text-muted-foreground normal-case tracking-normal">{stat.label}</p>
                      <motion.p
                        className="text-[1.5rem] font-semibold tabular text-foreground tracking-[-0.02em] mt-1"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 1.0 + i * 0.08 }}
                      >
                        {stat.value}
                      </motion.p>
                      <p className={`text-micro ${stat.trendColor} normal-case tracking-normal`}>{stat.trend}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Today's schedule — staggered */}
                <div className="rounded-xl bg-foreground/[0.02] overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-border/20">
                    <p className="text-micro text-muted-foreground normal-case tracking-normal">Today's Schedule</p>
                  </div>
                  {[
                    { time: "09:00", name: "Ahmed Hassan", type: "Diabetic Follow-up", status: "Completed", color: "bg-slate-500/10 text-slate-300" },
                    { time: "09:30", name: "Fatima Al-Zahra", type: "Thyroid Review", status: "Waiting", color: "bg-violet-500/10 text-violet-300" },
                    { time: "10:15", name: "Khalid Al-Otaibi", type: "Cardiac Review", status: "Confirmed", color: "bg-emerald-500/10 text-emerald-300" },
                    { time: "11:00", name: "Noura Al-Saud", type: "Consultation", status: "Pending", color: "bg-amber-500/10 text-amber-300" },
                  ].map((apt, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: 1.2 + i * 0.08, ease: EASE }}
                      className={cn("flex items-center gap-4 px-4 py-2.5", i < 3 && "border-b border-border/20")}
                    >
                      <p className="text-caption font-semibold tabular text-foreground w-12">{apt.time}</p>
                      <div className="flex-1 min-w-0">
                        <p className="text-caption font-medium text-foreground truncate">{apt.name}</p>
                        <p className="text-micro text-muted-foreground normal-case tracking-normal truncate">{apt.type}</p>
                      </div>
                      <span className={cn("text-micro font-medium px-2 py-0.5 rounded-md normal-case tracking-normal", apt.color)}>{apt.status}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* CTA under screenshot */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.5, ease: EASE }} className="text-center mt-10">
            <Button onClick={() => handleEnter("u1")} variant="outline" className="h-11 px-7 veltra-shadow border-0 bg-foreground/[0.04] text-foreground font-medium">
              See it live <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ===== 3. VIDEO — Watch the Vision ===== */}
      <section id="video" className="py-20 px-6 scroll-mt-20">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: EASE }} className="mb-10">
            <h2 className="text-[2rem] leading-[1.1] tracking-[-0.03em] font-semibold text-foreground mb-3">
              {t("video.title1")} <span className="text-editorial-italic text-muted-foreground">{t("video.title2")}</span>
            </h2>
            <p className="text-body text-muted-foreground">{t("video.subtitle")}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2, ease: EASE }}>
            <div className="relative veltra-glass rounded-2xl veltra-shadow-lg overflow-hidden aspect-video max-w-3xl mx-auto group cursor-pointer" onClick={() => handleEnter("u1")}>
              {/* Video placeholder — replace with actual video when ready */}
              <div className="absolute inset-0 bg-gradient-to-br from-veltra-emerald/5 via-transparent to-veltra-emerald/3" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="mx-auto h-16 w-16 rounded-full bg-veltra-emerald flex items-center justify-center mb-4 veltra-shadow-lg">
                    <svg className="h-6 w-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  </motion.div>
                  <p className="text-body font-medium text-foreground">{t("video.cta")}</p>
                </div>
              </div>
              {/* Duration badge */}
              <span className="absolute bottom-4 right-4 px-2 py-0.5 rounded-md bg-black/60 text-white text-micro normal-case tracking-normal">{t("video.duration")}</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== 4. CLINICAL MEMORY — Never forget another patient ===== */}
      <section id="memory" className="py-40 px-6 relative overflow-hidden" style={{ background: "linear-gradient(180deg, transparent 0%, rgba(57,207,162,0.02) 30%, rgba(57,207,162,0.03) 70%, transparent 100%)" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-veltra-emerald/4 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-veltra-emerald/3 rounded-full blur-[120px]" />
        </div>
        <div className="relative mx-auto max-w-3xl text-center">
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: EASE }}>
            <p className="text-micro text-veltra-emerald mb-6">{t("memory.eyebrow")}</p>
            <h2 className="text-[3rem] sm:text-[3.5rem] leading-[1.08] tracking-[-0.035em] font-semibold text-foreground mb-8">
              {t("memory.title1")} <span className="text-editorial-italic text-muted-foreground">{t("memory.title2")}</span>
            </h2>
            <p className="text-body text-muted-foreground max-w-lg mx-auto mb-12">
              {t("memory.subtitle")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16">
              <MemoryCard period={t("memory.card1_period")} insight={t("memory.card1_insight")} />
              <MemoryCard period={t("memory.card2_period")} insight={t("memory.card2_insight")} />
              <MemoryCard period={t("memory.card3_period")} insight={t("memory.card3_insight")} />
            </div>
          </motion.div>
          {/* MASSIVE signature text */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.4, ease: EASE }} className="mt-20">
            <p className="text-[2.5rem] sm:text-[4rem] leading-[1.05] tracking-[-0.04em] font-semibold text-foreground">
              {t("memory.sig1")}
            </p>
            <p className="text-[3rem] sm:text-[5rem] leading-[1.0] tracking-[-0.04em] font-semibold text-editorial-italic text-veltra-emerald mt-2">
              {t("memory.sig2")}
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.8, ease: EASE }} className="mt-12">
            <Button onClick={() => handleEnter("u1")} variant="outline" className="h-11 px-7 veltra-shadow border-0 bg-foreground/[0.04] text-foreground font-medium">
              {t("memory.cta")} <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ===== 5. WHY CLINICS CHOOSE VELTRA — Show, don't tell ===== */}
      <section className="py-32 px-6">
        <div className="mx-auto max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: EASE }} className="text-center mb-16">
            <p className="text-micro text-veltra-emerald mb-4">{t("why.eyebrow")}</p>
            <h2 className="text-[2.5rem] leading-[1.1] tracking-[-0.03em] font-semibold text-foreground">
              {t("why.title1")} <span className="text-editorial-italic text-muted-foreground">{t("why.title2")}</span>
            </h2>
            <p className="text-body text-muted-foreground mt-4 max-w-lg mx-auto">
              {t("why.subtitle")}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                icon: DollarSign,
                stat: t("why.b1_stat"),
                title: t("why.b1_title"),
                desc: t("why.b1_desc"),
                tone: "emerald" as const,
              },
              {
                icon: Clock,
                stat: t("why.b2_stat"),
                title: t("why.b2_title"),
                desc: t("why.b2_desc"),
                tone: "emerald" as const,
              },
              {
                icon: Calendar,
                stat: t("why.b3_stat"),
                title: t("why.b3_title"),
                desc: t("why.b3_desc"),
                tone: "emerald" as const,
              },
              {
                icon: Brain,
                stat: t("why.b4_stat"),
                title: t("why.b4_title"),
                desc: t("why.b4_desc"),
                tone: "emerald" as const,
              },
            ].map((block, i) => (
              <motion.div
                key={block.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: EASE }}
                className="veltra-glass rounded-2xl p-6 veltra-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-veltra-emerald/10 flex items-center justify-center flex-shrink-0">
                    <block.icon className="h-5 w-5 text-veltra-emerald" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <p className="text-[1.5rem] font-semibold tabular text-foreground tracking-[-0.02em]">{block.stat}</p>
                      <p className="text-body font-medium text-foreground">{block.title}</p>
                    </div>
                    <p className="text-caption text-muted-foreground leading-relaxed">{block.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 6. GLOBAL VISION — No country, no borders ===== */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-veltra-emerald/3 rounded-full blur-[120px]" />
        </div>
        <div className="relative mx-auto max-w-3xl text-center">
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: EASE }}>
            <p className="text-micro text-veltra-emerald mb-4">{t("global.eyebrow")}</p>
            <h2 className="text-[2.5rem] leading-[1.1] tracking-[-0.03em] font-semibold text-foreground mb-4">
              {t("global.title1")} <span className="text-editorial-italic text-muted-foreground">{t("global.title2")}</span>
            </h2>
            <p className="text-body text-muted-foreground max-w-md mx-auto mb-12">
              {t("global.subtitle")}
            </p>
            {/* Compliance badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
              {[
                { name: "HIPAA", region: t("global.ready") },
                { name: "GDPR", region: t("global.ready") },
                { name: "NPHIES", region: t("global.ready") },
                { name: "PDPL", region: t("global.ready") },
                { name: "DHA", region: t("global.ready") },
                { name: "DOH", region: t("global.ready") },
              ].map((cert, i) => (
                <motion.div key={cert.name} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.05, ease: EASE }}
                  className="veltra-glass rounded-xl p-4 veltra-shadow text-center">
                  <Shield className="h-4 w-4 text-veltra-emerald mx-auto mb-2" />
                  <p className="text-caption font-semibold text-foreground">{cert.name}</p>
                  <p className="text-micro text-muted-foreground/70 normal-case tracking-normal mt-0.5">{cert.region}</p>
                </motion.div>
              ))}
            </div>
            <p className="text-micro text-muted-foreground/60 normal-case tracking-normal mt-6">
              {t("global.note")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== 7. RECOVERED REVENUE — directly above Pricing ===== */}
      <section className="py-32 px-6">
        <div className="mx-auto max-w-2xl">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: EASE }} className="text-center mb-12">
            <h2 className="text-[2.5rem] leading-[1.1] tracking-[-0.03em] font-semibold text-foreground">
              {t("roi.title1")} <span className="text-editorial-italic text-muted-foreground">{t("roi.title2")}</span>
            </h2>
          </motion.div>
          <RecoveryCalculator t={t} language={language} />
        </div>
      </section>

      {/* ===== 8. PRICING ===== */}
      <section id="pricing" className="py-24 px-6">
        <div className="mx-auto max-w-3xl">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: EASE }} className="text-center mb-6">
            <h2 className="text-[1.75rem] leading-[1.1] tracking-[-0.03em] font-semibold text-foreground">
              {t("pricing.title1")} <span className="text-editorial-italic text-muted-foreground">{t("pricing.title2")}</span>
            </h2>
            <p className="text-caption text-muted-foreground mt-3">{t("pricing.subtitle")}</p>
          </motion.div>

          {/* Billing toggle — Monthly + Annual only (3-Year introduced later) */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-foreground/[0.04] border border-border/30">
              <BillingPill label={t("pricing.monthly")} active={billing === "monthly"} onClick={() => setBilling("monthly")} />
              <BillingPill label={t("pricing.annual")} badge="−17%" active={billing === "annual"} onClick={() => setBilling("annual")} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {/* Veltra Platform */}
            <PricingCard
              name={t("pricing.platform_name")}
              desc={t("pricing.platform_desc")}
              price={billing === "monthly" ? "$999" : "$833"}
              period="/month"
              billingNote={
                billing === "monthly" ? t("pricing.platform_note_monthly")
                : t("pricing.platform_note_annual")
              }
              features={[
                t("pricing.feature.locations"),
                t("pricing.feature.team"),
                t("pricing.feature.memory"),
                t("pricing.feature.brief"),
                t("pricing.feature.billing"),
                t("pricing.feature.revenue"),
                t("pricing.feature.support"),
              ]}
              featured
              cta={t("pricing.cta")}
              onStart={() => window.location.href = "/signup?plan=platform"}
              onPreview={() => openTierPreview("platform")}
              launchPrice={`${t("pricing.launch_price")} · ${t("pricing.launch_title")}`}
            />
            {/* Enterprise */}
            <PricingCard
              name={t("pricing.enterprise_name")}
              desc={t("pricing.enterprise_desc")}
              price="Custom"
              period=""
              features={[
                t("pricing.feature.unlimited"),
                t("pricing.feature.network"),
                t("pricing.feature.api"),
                t("pricing.feature.sso"),
                t("pricing.feature.manager"),
                t("pricing.feature.uptime"),
                t("pricing.feature.sla"),
              ]}
              cta={t("pricing.cta")}
              onStart={() => window.location.href = "/signup?plan=enterprise"}
              onPreview={() => openTierPreview("enterprise")}
              launchPrice={`Custom · ${t("pricing.launch_title")}`}
            />
          </div>

          {/* Tailored implementation note */}
          <p className="text-center text-micro text-muted-foreground/70 normal-case tracking-normal mt-8 max-w-md mx-auto leading-relaxed">
            {t("pricing.tailored")}
          </p>

          {/* Launch Program details */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2, ease: EASE }} className="max-w-2xl mx-auto mt-8">
            <div className="rounded-2xl p-6 bg-foreground/[0.02] border border-border/20">
              <div className="flex items-baseline justify-between mb-3">
                <p className="text-micro text-veltra-emerald">{t("pricing.launch_title")}</p>
                <p className="text-micro text-muted-foreground/70 normal-case tracking-normal">{t("pricing.launch_price")}</p>
              </div>
              <p className="text-caption text-muted-foreground leading-relaxed mb-4">
                {t("pricing.launch_desc")}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[t("pricing.launch.item1"), t("pricing.launch.item2"), t("pricing.launch.item3"), t("pricing.launch.item4"), t("pricing.launch.item5"), t("pricing.launch.item6"), t("pricing.launch.item7"), t("pricing.launch.item8")].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-caption text-muted-foreground">
                    <Check className="h-3 w-3 text-veltra-emerald flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
              <p className="text-micro text-muted-foreground/60 normal-case tracking-normal mt-4">
                {t("pricing.launch_note")}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== 9. INTEGRATIONS — Built to connect ===== */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: EASE }}>
            <p className="text-micro text-veltra-emerald mb-4">{t("integrations.eyebrow")}</p>
            <h2 className="text-[2rem] leading-[1.1] tracking-[-0.03em] font-semibold text-foreground mb-4">
              {t("integrations.title1")} <span className="text-editorial-italic text-muted-foreground">{t("integrations.title2")}</span>
            </h2>
            <p className="text-body text-muted-foreground max-w-md mx-auto mb-10">
              {t("integrations.subtitle")}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                "Stripe", "Google Calendar", "Outlook", "Microsoft 365",
                "Twilio SMS", "WhatsApp Business", "NPHIES", "HL7 / FHIR",
                "Lab Systems", "Radiology", "Slack", "Zapier", "Apple Health", "Google Fit",
              ].map((int, i) => (
                <motion.span
                  key={int}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.04, ease: EASE }}
                  className="px-4 py-2 rounded-xl veltra-glass text-caption font-medium text-muted-foreground/60 hover:text-foreground veltra-shadow veltra-transition"
                >
                  {int}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== 10. SOLUTIONS — 5 specialties + View All ===== */}
      <section id="solutions" className="py-32 px-6">
        <div className="mx-auto max-w-4xl">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: EASE }} className="text-center mb-12">
            <h2 className="text-[2.5rem] leading-[1.1] tracking-[-0.03em] font-semibold text-foreground">
              {t("solutions.title1")} <span className="text-editorial-italic text-muted-foreground">{t("solutions.title2")}</span>
            </h2>
            <p className="text-body text-muted-foreground mt-3">{t("solutions.subtitle")}</p>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 max-w-3xl mx-auto">
            {[
              { name: t("solutions.gp"), emoji: "🏥", specialty: "general" },
              { name: t("solutions.dental"), emoji: "🦷", specialty: "dental" },
              { name: t("solutions.derm"), emoji: "🩹", specialty: "dermatology" },
              { name: t("solutions.cardio"), emoji: "❤️", specialty: "cardiology" },
              { name: t("solutions.multi"), emoji: "🏥", specialty: "multi" },
            ].map((s, i) => (
              <motion.button
                key={s.name}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05, ease: EASE }}
                whileHover={{ y: -3 }}
                onClick={() => { useVeltra.getState().setSpecialty(s.specialty as any); onEnter(); }}
                className="veltra-glass rounded-2xl p-5 veltra-shadow text-center group cursor-pointer"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 veltra-transition">{s.emoji}</div>
                <p className="text-caption font-medium text-foreground">{s.name}</p>
                <p className="text-micro text-veltra-emerald mt-1 normal-case tracking-normal opacity-0 group-hover:opacity-100 veltra-transition">{t("solutions.view_demo")}</p>
              </motion.button>
            ))}
          </div>
          <div className="text-center mt-8">
            <button
              onClick={() => onSpecialtySelect?.()}
              className="inline-flex items-center gap-1.5 text-caption text-veltra-emerald hover:underline veltra-transition"
            >
              {t("solutions.view_all")} <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ===== 11. TRUSTED BY ===== */}
      <section className="py-24 px-6 border-t border-border/10">
        <div className="mx-auto max-w-2xl text-center">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: EASE }}>
            <p className="text-micro text-muted-foreground/50 normal-case tracking-normal mb-6">{t("trusted.label")}</p>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
              {[t("trusted.clinics"), t("trusted.centers"), t("trusted.groups")].map((label, i) => (
                <motion.span key={label} initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1, ease: EASE }}
                  className="text-body font-medium text-muted-foreground/50 tracking-tight">
                  {label}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== 12. FINAL CTA ===== */}
      <section className="py-32 px-6">
        <div className="mx-auto max-w-xl text-center">
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: EASE }}>
            <h2 className="text-[3rem] leading-[1.05] tracking-[-0.035em] font-semibold text-foreground">
              <span className="text-editorial-italic text-muted-foreground">{t("final.title1")}</span> disappears.
              <br />
              <span className="text-editorial-italic text-muted-foreground">{t("final.title2")}</span> remains.
            </h2>
            <div className="flex items-center justify-center gap-3 mt-10">
              <Button onClick={() => handleEnter("u1")} className="h-12 px-8 bg-veltra-emerald hover:bg-veltra-emerald-dark text-white font-medium text-body">
                {t("final.cta_demo")} <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
              <Button variant="ghost" onClick={() => window.location.href = "/signup"} className="h-12 px-6 text-foreground font-medium hover:bg-foreground/[0.05]">{t("final.cta_signup")}</Button>
            </div>
            <p className="text-micro text-muted-foreground/60 mt-5 normal-case tracking-normal">{t("final.note")}</p>
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-border/20 py-12 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-8 mb-8">
            <div>
              <a href="/" className="flex items-center gap-2.5 mb-4 veltra-transition hover:opacity-80" aria-label="Veltra home">
                <img src="/logo-symbol.png" alt="Veltra" className="object-cover h-7 w-7 rounded-lg veltra-shadow" />
                <span className="text-body font-semibold text-foreground">Veltra</span>
              </a>
              <p className="text-caption text-muted-foreground/70">{t("footer.tagline")}</p>
            </div>
            <div>
              <p className="text-micro text-muted-foreground mb-3">{t("footer.platform")}</p>
              <div className="space-y-2">
                <button onClick={() => openModal("platform")} className="block text-caption text-muted-foreground hover:text-foreground veltra-transition cursor-pointer">{t("footer.brief")}</button>
                <a href="#memory" className="block text-caption text-muted-foreground hover:text-foreground veltra-transition cursor-pointer">{t("footer.memory")}</a>
                <a href="#pricing" className="block text-caption text-muted-foreground hover:text-foreground veltra-transition cursor-pointer">{t("footer.pricing")}</a>
                <a href="/security" className="block text-caption text-muted-foreground hover:text-foreground veltra-transition cursor-pointer">{t("footer.security")}</a>
              </div>
            </div>
            <div>
              <p className="text-micro text-muted-foreground mb-3">{t("footer.resources")}</p>
              <div className="space-y-2">
                <a href="/constitution" className="block text-caption text-muted-foreground hover:text-foreground veltra-transition cursor-pointer">{t("footer.constitution")}</a>
                <button onClick={() => openModal("changelog")} className="block text-caption text-muted-foreground hover:text-foreground veltra-transition cursor-pointer">{t("footer.changelog")}</button>
                <button onClick={() => openModal("status")} className="block text-caption text-muted-foreground hover:text-foreground veltra-transition cursor-pointer">{t("footer.status")}</button>
                <span className="block text-caption text-muted-foreground/50">{t("footer.help")}</span>
                <span className="block text-caption text-muted-foreground/50">{t("footer.api")}</span>
              </div>
            </div>
            <div>
              <p className="text-micro text-muted-foreground mb-3">{t("footer.company")}</p>
              <div className="space-y-2">
                <button onClick={() => openModal("why")} className="block text-caption text-muted-foreground hover:text-foreground veltra-transition cursor-pointer">{t("footer.about")}</button>
                <a href="mailto:hello@veltrahealth.co" className="block text-caption text-muted-foreground hover:text-foreground veltra-transition cursor-pointer">{t("footer.contact")}</a>
                <a href="mailto:hello@veltrahealth.co?subject=Careers" className="block text-caption text-muted-foreground hover:text-foreground veltra-transition cursor-pointer">{t("footer.careers")}</a>
              </div>
            </div>
            <div>
              <p className="text-micro text-muted-foreground mb-3">{t("footer.legal")}</p>
              <div className="space-y-2">
                <button onClick={() => openModal("privacy")} className="block text-caption text-muted-foreground hover:text-foreground veltra-transition cursor-pointer">{t("footer.privacy")}</button>
                <button onClick={() => openModal("terms")} className="block text-caption text-muted-foreground hover:text-foreground veltra-transition cursor-pointer">{t("footer.terms")}</button>
                <span className="block text-caption text-muted-foreground/50">{t("footer.compliance")}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between pt-8 border-t border-border/20">
            <div className="flex items-center gap-4">
              <span className="text-micro text-muted-foreground/60 normal-case tracking-normal">{t("footer.rights")}</span>
              <span className="text-micro text-muted-foreground/40 normal-case tracking-normal">v1.0</span>
              <span className="flex items-center gap-1.5 text-micro text-emerald-400 normal-case tracking-normal">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> {t("global.operational")}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <a href="https://linkedin.com/company/veltrahealth" target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-lg bg-foreground/[0.04] hover:bg-veltra-emerald/10 flex items-center justify-center text-muted-foreground hover:text-veltra-emerald veltra-transition" aria-label="LinkedIn"><Linkedin className="h-4 w-4" /></a>
              <a href="https://x.com/veltrahealth" target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-lg bg-foreground/[0.04] hover:bg-veltra-emerald/10 flex items-center justify-center text-muted-foreground hover:text-veltra-emerald veltra-transition" aria-label="X"><Twitter className="h-4 w-4" /></a>
              <a href="https://instagram.com/veltrahealth" target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-lg bg-foreground/[0.04] hover:bg-veltra-emerald/10 flex items-center justify-center text-muted-foreground hover:text-veltra-emerald veltra-transition" aria-label="Instagram"><Instagram className="h-4 w-4" /></a>
              <a href="mailto:hello@veltrahealth.co" className="h-9 w-9 rounded-lg bg-foreground/[0.04] hover:bg-veltra-emerald/10 flex items-center justify-center text-muted-foreground hover:text-veltra-emerald veltra-transition" aria-label="Email"><Mail className="h-4 w-4" /></a>
            </div>
          </div>
        </div>
      </footer>

      {/* ===== MODAL SYSTEM (Apple-style) ===== */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6"
            style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(24px)" }}
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.25, ease: EASE }}
              className="veltra-glass rounded-3xl p-8 max-w-lg w-full veltra-shadow-lg relative max-h-[80vh] overflow-y-auto veltra-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={closeModal} className="absolute top-5 right-5 h-8 w-8 rounded-lg hover:bg-foreground/[0.05] flex items-center justify-center text-muted-foreground hover:text-foreground veltra-transition" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
              {activeModal && MODAL_CONTENT[activeModal] && (
                <>
                  <h2 className="text-[1.75rem] tracking-[-0.02em] font-semibold text-foreground mb-1">{MODAL_CONTENT[activeModal].title}</h2>
                  {MODAL_CONTENT[activeModal].subtitle && <p className="text-editorial-italic text-body text-muted-foreground mb-6">{MODAL_CONTENT[activeModal].subtitle}</p>}
                  <div>{MODAL_CONTENT[activeModal].body}</div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== SUBSCRIPTION TIER PREVIEW MODAL ===== */}
      <SubscriptionPreview
        open={tierPreviewOpen}
        onClose={() => setTierPreviewOpen(false)}
        initialTier={tierPreviewInitial}
        onTryTier={handleTryTier}
      />
    </div>
  );
}

// ===== Sub-components =====
function NavButton({ label, onClick }: { label: string; onClick: () => void }) {
  return <button onClick={onClick} className="px-3 h-8 rounded-lg hover:bg-foreground/[0.05] flex items-center text-caption text-muted-foreground hover:text-foreground veltra-transition">{label}</button>;
}
function PreviewStat({ label, value, trend }: { label: string; value: string; trend?: string }) {
  return (<div className="rounded-lg bg-foreground/[0.03] p-3"><p className="text-micro text-muted-foreground">{label}</p><p className="text-body font-semibold tabular text-foreground mt-1">{value}</p>{trend && <p className="text-micro text-veltra-emerald normal-case tracking-normal mt-0.5">{trend}</p>}</div>);
}
function BriefLine({ icon: Icon, color, text }: { icon: React.ElementType; color: string; text: string }) {
  return (<div className="flex items-center gap-3"><Icon className={cn("h-4 w-4 flex-shrink-0", color)} /><p className="text-body text-foreground">{text}</p></div>);
}
function MemoryCard({ period, insight }: { period: string; insight: string }) {
  return (<div className="veltra-glass rounded-2xl p-5 veltra-shadow"><p className="text-micro text-muted-foreground mb-1">{period}</p><p className="text-body font-medium text-foreground">{insight}</p></div>);
}
function BillingPill({ label, badge, active, onClick }: { label: string; badge?: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative px-4 h-8 rounded-lg text-caption font-medium veltra-transition",
        active ? "bg-veltra-emerald text-white" : "text-muted-foreground hover:text-foreground"
      )}
      aria-pressed={active}
    >
      {label}
      {badge && (
        <span className={cn(
          "ml-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-md normal-case tracking-normal",
          active ? "bg-white/20 text-white" : "bg-veltra-emerald/15 text-veltra-emerald"
        )}>
          {badge}
        </span>
      )}
    </button>
  );
}
function PricingCard({ name, desc, price, period, billingNote, features, featured, cta, onStart, onPreview, launchPrice }: { name: string; desc: string; price: string; period: string; billingNote?: string; features: string[]; featured?: boolean; cta: string; onStart: () => void; onPreview: () => void; launchPrice?: string }) {
  return (<div className={cn("veltra-glass rounded-2xl p-6 veltra-shadow relative flex flex-col h-full", featured && "ring-1 ring-veltra-emerald/30")}>
    {featured && <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-veltra-emerald text-white text-micro normal-case tracking-normal font-medium whitespace-nowrap">Most Popular</span>}
    <div className="mb-4">
      <p className="text-body font-semibold text-foreground">{name}</p>
      <p className="text-caption text-muted-foreground mt-1">{desc}</p>
      <div className="mt-3"><span className="text-[2rem] font-semibold tabular text-foreground tracking-[-0.02em]">{price}</span>{period && <span className="text-caption text-muted-foreground ml-1">{period}</span>}</div>
      {billingNote && <p className="text-micro text-muted-foreground/70 normal-case tracking-normal mt-1">{billingNote}</p>}
      {launchPrice && (
        <p className="text-micro text-muted-foreground/60 normal-case tracking-normal mt-2">+ {launchPrice}</p>
      )}
    </div>
    <ul className="space-y-2 mb-6 flex-1">{features.map((f) => (<li key={f} className="flex items-start gap-2"><Check className="h-3.5 w-3.5 text-veltra-emerald flex-shrink-0 mt-0.5" /><span className="text-caption text-foreground">{f}</span></li>))}</ul>
    <div className="space-y-2">
      <Button onClick={onStart} className={cn("w-full h-10 font-medium", featured ? "bg-veltra-emerald hover:bg-veltra-emerald-dark text-white" : "veltra-shadow border-0 bg-foreground/[0.04] text-foreground")}>{cta}</Button>
    </div>
  </div>);
}
function RecoveryCalculator({ t, language }: { t: (key: any) => string; language: Language }) {
  const [doctors, setDoctors] = useState(3); const [apptValue, setApptValue] = useState(350);
  const [noShowRate, setNoShowRate] = useState(12); const [missedCalls, setMissedCalls] = useState(40);
  const noShowRecovery = doctors * 20 * (noShowRate / 100) * apptValue;
  const missedCallRecovery = missedCalls * apptValue * 0.4; const total = noShowRecovery + missedCallRecovery;
  const fmt = (n: number) => n.toLocaleString();
  return (<div className="veltra-glass rounded-2xl p-8 veltra-shadow-lg">
    <div className="grid grid-cols-2 gap-8 mb-8">
      <CalcInput label={t("roi.label_doctors")} value={doctors} onChange={setDoctors} min={1} max={20} />
      <CalcInput label={t("roi.label_value")} value={apptValue} onChange={setApptValue} min={50} max={2000} step={10} prefix="$" />
      <CalcInput label={t("roi.label_noshow")} value={noShowRate} onChange={setNoShowRate} min={0} max={40} suffix="%" />
      <CalcInput label={t("roi.label_missed")} value={missedCalls} onChange={setMissedCalls} min={0} max={200} step={5} />
    </div>
    <div className="space-y-2 mb-6">
      <div className="flex justify-between text-caption"><span className="text-muted-foreground">{t("roi.from_noshow")}</span><span className="text-foreground font-medium tabular">${fmt(noShowRecovery)}</span></div>
      <div className="flex justify-between text-caption"><span className="text-muted-foreground">{t("roi.from_missed")}</span><span className="text-foreground font-medium tabular">${fmt(missedCallRecovery)}</span></div>
    </div>
    <div className="pt-6 border-t border-border/40"><p className="text-micro text-muted-foreground">{t("roi.recovered")}</p><p className="text-[3rem] font-semibold tabular text-foreground tracking-[-0.03em] mt-2">${fmt(total)}</p></div>
    <p className="text-caption text-muted-foreground/70 mt-4 italic">{t("roi.note")}</p>
  </div>);
}

function CalcInput({ label, value, onChange, min, max, step = 1, prefix, suffix }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number; step?: number; prefix?: string; suffix?: string }) {
  return (<div><p className="text-micro text-muted-foreground mb-2">{label}</p><div className="flex items-center gap-3"><input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="flex-1 accent-veltra-emerald" /><span className="text-body font-semibold tabular text-foreground min-w-[60px] text-right">{prefix}{value}{suffix}</span></div></div>);
}
