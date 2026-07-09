"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  ArrowRight, ArrowLeft, Check, Lock, CreditCard, Building2, User,
  Mail, Shield, Sparkles, Loader2,
} from "lucide-react";
import { TIERS, type TierId } from "@/lib/subscription-tiers";
import { useVeltra } from "@/lib/veltra-store";
import { OnboardingWizard } from "@/components/veltra/onboarding-wizard";

const EASE = [0.16, 1, 0.3, 1] as const;

type Step = "clinic" | "account" | "payment" | "done";

const STEPS: { id: Step; label: string }[] = [
  { id: "clinic", label: "Clinic" },
  { id: "account", label: "Account" },
  { id: "payment", label: "Payment" },
  { id: "done", label: "Done" },
];

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><div className="h-8 w-8 rounded-lg bg-veltra-emerald animate-pulse" /></div>}>
      <SignupContent />
    </Suspense>
  );
}

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTier = (searchParams.get("plan") as TierId) || "platform";

  const [step, setStep] = useState<Step>("clinic");
  const [tier, setTier] = useState<TierId>(initialTier);
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [submitting, setSubmitting] = useState(false);

  const [clinic, setClinic] = useState({ name: "", specialty: "general", city: "" });
  const [account, setAccount] = useState({ name: "", email: "", password: "" });
  const [payment, setPayment] = useState({ cardName: "", cardNumber: "", expiry: "", cvc: "" });
  const [showOnboarding, setShowOnboarding] = useState(false);

  const activeTier = TIERS.find((t) => t.id === tier) || TIERS[0];
  const stepIndex = STEPS.findIndex((s) => s.id === step);

  // Validate URL plan param
  useEffect(() => {
    if (!["platform", "enterprise"].includes(initialTier)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTier("platform");
    }
  }, [initialTier]);

  const handleNext = () => {
    const idx = STEPS.findIndex((s) => s.id === step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1].id);
  };

  const handlePrev = () => {
    const idx = STEPS.findIndex((s) => s.id === step);
    if (idx > 0) setStep(STEPS[idx - 1].id);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    // Simulate API call (in production: POST /api/auth/signup + /api/billing/checkout)
    await new Promise((r) => setTimeout(r, 2000));
    setSubmitting(false);
    setStep("done");
  };

  const canProceed = () => {
    if (step === "clinic") return clinic.name.length >= 2;
    if (step === "account") return account.name.length >= 2 && account.email.includes("@") && account.password.length >= 8;
    if (step === "payment") {
      if (tier === "enterprise") return true; // Enterprise — no payment, contact sales
      return payment.cardName.length >= 2 && payment.cardNumber.replace(/\s/g, "").length >= 15 && payment.expiry.length >= 4 && payment.cvc.length >= 3;
    }
    return false;
  };

  if (step === "done") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background veltra-ambient">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 12 }}
            className="mx-auto h-16 w-16 rounded-full bg-veltra-emerald/10 flex items-center justify-center mb-6"
          >
            <Check className="h-8 w-8 text-veltra-emerald" />
          </motion.div>
          <h1 className="text-[2rem] font-semibold tracking-tight text-foreground mb-2">
            <span className="text-editorial-italic text-muted-foreground">Welcome</span> to Veltra.
          </h1>
          <p className="text-body text-muted-foreground mb-1">
            {clinic.name} is now set up on the {activeTier.name} plan.
          </p>
          <p className="text-caption text-muted-foreground/70 mb-8">
            A welcome email is on its way to {account.email}.
          </p>
          <Button
            onClick={() => {
              // After signup, go through onboarding wizard, then log in
              setShowOnboarding(true);
            }}
            className="h-10 px-7 bg-veltra-emerald hover:bg-veltra-emerald-dark text-white font-medium"
          >
            Set up your clinic
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
          <p className="text-micro text-muted-foreground/50 normal-case tracking-normal mt-8">
            Technology disappears. Care remains.
          </p>
        </motion.div>
      </div>
    );
  }

  // Show onboarding wizard after signup completion
  if (showOnboarding) {
    return <OnboardingWizard onComplete={() => router.push("/")} />;
  }

  return (
    <div className="min-h-screen bg-background veltra-ambient">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border/20">
        <div className="mx-auto max-w-3xl px-6 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <img src="/logo-symbol.png" alt="Veltra" className="object-cover h-7 w-7 rounded-lg veltra-shadow" />
            <span className="text-body font-semibold tracking-tight text-foreground">Veltra</span>
          </a>
          <a href="/">
            <Button size="sm" variant="ghost" className="h-8 text-caption text-muted-foreground hover:text-foreground">
              Back to home
            </Button>
          </a>
        </div>
      </nav>

      <div className="mx-auto max-w-2xl px-6 py-10 sm:py-16">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-3.5 w-3.5 text-veltra-emerald" />
            <span className="text-micro text-veltra-emerald">Start with Veltra</span>
          </div>
          <h1 className="text-[2.5rem] leading-[1.05] tracking-[-0.035em] font-semibold text-foreground">
            <span className="text-editorial-italic text-muted-foreground">Set up</span> your clinic.
          </h1>
          <p className="text-body text-muted-foreground mt-3">
            3 steps. Takes 2 minutes. Cancel anytime.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center flex-1">
                <div className={cn(
                  "h-7 w-7 rounded-full flex items-center justify-center text-micro font-semibold veltra-transition flex-shrink-0",
                  i < stepIndex ? "bg-veltra-emerald text-white" :
                  i === stepIndex ? "bg-veltra-emerald/15 text-veltra-emerald ring-2 ring-veltra-emerald/30" :
                  "bg-foreground/[0.05] text-muted-foreground/50"
                )}>
                  {i < stepIndex ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={cn("flex-1 h-px mx-2 veltra-transition", i < stepIndex ? "bg-veltra-emerald" : "bg-border/40")} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between">
            {STEPS.map((s, i) => (
              <span key={s.id} className={cn(
                "text-micro normal-case tracking-normal flex-1 text-center",
                i === stepIndex ? "text-veltra-emerald font-medium" : "text-muted-foreground/50"
              )}>
                {s.label}
              </span>
            ))}
          </div>
        </div>

        {/* Plan summary — always visible */}
        <div className="mb-8 p-4 rounded-xl veltra-glass veltra-shadow flex items-center gap-4">
          <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0", activeTier.accentColor)}>
            {activeTier.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-caption font-semibold text-foreground">{activeTier.name} Plan</p>
            <p className="text-micro text-muted-foreground normal-case tracking-normal">{activeTier.tagline}</p>
          </div>
          <div className="text-right flex-shrink-0">
            {activeTier.priceMonthly ? (
              <>
                <p className="text-body font-semibold tabular text-foreground">
                  ${billing === "annual" ? Math.round(activeTier.priceAnnual! / 12) : activeTier.priceMonthly}
                  <span className="text-micro text-muted-foreground normal-case tracking-normal">/mo</span>
                </p>
                <p className="text-micro text-muted-foreground/70 normal-case tracking-normal">
                  {billing === "annual" ? "$9,990 billed annually" : "billed monthly"}
                </p>
              </>
            ) : (
              <p className="text-body font-semibold text-foreground">Custom</p>
            )}
          </div>
        </div>

        {/* Billing toggle — Monthly + Annual only (hidden for enterprise) */}
        {activeTier.priceMonthly && (
          <div className="mb-6 flex justify-center">
            <div className="flex gap-1 p-1 bg-foreground/[0.04] rounded-lg border border-border/30">
              {(["monthly", "annual"] as const).map((b) => {
                const label = b === "monthly" ? "Monthly" : "Annual";
                const badge = b === "annual" ? "−17%" : null;
                return (
                  <button
                    key={b}
                    onClick={() => setBilling(b)}
                    aria-pressed={billing === b}
                    className={cn(
                      "px-4 h-8 rounded-md text-caption font-medium veltra-transition",
                      billing === b ? "bg-veltra-emerald text-white" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {label}
                    {badge && (
                      <span className={cn(
                        "ml-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-md normal-case tracking-normal",
                        billing === b ? "bg-white/20 text-white" : "bg-veltra-emerald/15 text-veltra-emerald"
                      )}>
                        {badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tailored implementation note */}
        <div className="mb-6 p-3 rounded-lg bg-foreground/[0.02] border border-border/30">
          <p className="text-micro text-muted-foreground/70 normal-case tracking-normal text-center">
            Every implementation is tailored to your clinic's workflow and operational needs.
          </p>
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            {/* Step 1: Clinic */}
            {step === "clinic" && (
              <div className="space-y-5">
                <div>
                  <Label className="text-micro text-muted-foreground flex items-center gap-1.5">
                    <Building2 className="h-3 w-3" /> Clinic name *
                  </Label>
                  <Input
                    value={clinic.name}
                    onChange={(e) => setClinic({ ...clinic, name: e.target.value })}
                    placeholder="Al Noor Polyclinic"
                    className="h-10 mt-1.5"
                    autoFocus
                  />
                </div>
                <div>
                  <Label className="text-micro text-muted-foreground">Specialty</Label>
                  <select
                    value={clinic.specialty}
                    onChange={(e) => setClinic({ ...clinic, specialty: e.target.value })}
                    className="w-full h-10 mt-1.5 px-3 rounded-lg bg-background/50 border border-border/40 text-body text-foreground"
                  >
                    <option value="general">General Practice</option>
                    <option value="dental">Dental</option>
                    <option value="cardiology">Cardiology</option>
                    <option value="dermatology">Dermatology</option>
                    <option value="pediatrics">Pediatrics</option>
                    <option value="neurology">Neurology / Psychiatry</option>
                    <option value="orthopedics">Orthopedics</option>
                    <option value="ophthalmology">Ophthalmology</option>
                    <option value="obgyn">OBGYN</option>
                    <option value="cosmetic">Cosmetic Clinic</option>
                    <option value="multi">Multi-Specialty</option>
                  </select>
                </div>
                <div>
                  <Label className="text-micro text-muted-foreground">City</Label>
                  <Input
                    value={clinic.city}
                    onChange={(e) => setClinic({ ...clinic, city: e.target.value })}
                    placeholder="Riyadh, Dubai, London..."
                    className="h-10 mt-1.5"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Account */}
            {step === "account" && (
              <div className="space-y-5">
                <div>
                  <Label className="text-micro text-muted-foreground flex items-center gap-1.5">
                    <User className="h-3 w-3" /> Your name *
                  </Label>
                  <Input
                    value={account.name}
                    onChange={(e) => setAccount({ ...account, name: e.target.value })}
                    placeholder="Dr. Ahmed Hassan"
                    className="h-10 mt-1.5"
                    autoFocus
                  />
                </div>
                <div>
                  <Label className="text-micro text-muted-foreground flex items-center gap-1.5">
                    <Mail className="h-3 w-3" /> Work email *
                  </Label>
                  <Input
                    type="email"
                    value={account.email}
                    onChange={(e) => setAccount({ ...account, email: e.target.value })}
                    placeholder="you@clinic.com"
                    className="h-10 mt-1.5"
                  />
                </div>
                <div>
                  <Label className="text-micro text-muted-foreground flex items-center gap-1.5">
                    <Lock className="h-3 w-3" /> Password *
                  </Label>
                  <Input
                    type="password"
                    value={account.password}
                    onChange={(e) => setAccount({ ...account, password: e.target.value })}
                    placeholder="Minimum 8 characters"
                    className="h-10 mt-1.5"
                  />
                  <p className="text-micro text-muted-foreground/60 normal-case tracking-normal mt-1.5">
                    {account.password.length > 0 && account.password.length < 8
                      ? `${8 - account.password.length} more characters needed`
                      : "Use a strong password — you can enable 2FA later"}
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {step === "payment" && (
              <div className="space-y-5">
                {tier === "enterprise" ? (
                  <div className="text-center py-8">
                    <div className="mx-auto h-12 w-12 rounded-full bg-veltra-emerald/10 flex items-center justify-center mb-4">
                      <Shield className="h-5 w-5 text-veltra-emerald" />
                    </div>
                    <p className="text-body text-foreground font-medium mb-2">Enterprise — Let's talk.</p>
                    <p className="text-caption text-muted-foreground mb-6 max-w-sm mx-auto">
                      Enterprise includes unlimited locations, Network Memory (collective intelligence), custom integrations, and a dedicated account manager. Our team will reach out within 24 hours.
                    </p>
                    <a
                      href={`mailto:hello@veltrahealth.co?subject=${encodeURIComponent("Enterprise inquiry")}&body=${encodeURIComponent(`Clinic: ${clinic.name}\r\nContact: ${account.name}\r\nEmail: ${account.email}`)}`}
                    >
                      <Button className="h-10 px-7 bg-veltra-emerald hover:bg-veltra-emerald-dark text-white font-medium">
                        Contact sales
                        <ArrowRight className="ml-1.5 h-4 w-4" />
                      </Button>
                    </a>
                  </div>
                ) : (
                  <>
                    <div>
                      <Label className="text-micro text-muted-foreground flex items-center gap-1.5">
                        <User className="h-3 w-3" /> Name on card *
                      </Label>
                      <Input
                        value={payment.cardName}
                        onChange={(e) => setPayment({ ...payment, cardName: e.target.value })}
                        placeholder="Ahmed Hassan"
                        className="h-10 mt-1.5"
                        autoFocus
                      />
                    </div>
                    <div>
                      <Label className="text-micro text-muted-foreground flex items-center gap-1.5">
                        <CreditCard className="h-3 w-3" /> Card number *
                      </Label>
                      <Input
                        value={payment.cardNumber}
                        onChange={(e) => {
                          const cleaned = e.target.value.replace(/\D/g, "").slice(0, 16);
                          const formatted = cleaned.replace(/(.{4})/g, "$1 ").trim();
                          setPayment({ ...payment, cardNumber: formatted });
                        }}
                        placeholder="4242 4242 4242 4242"
                        className="h-10 mt-1.5 tabular"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-micro text-muted-foreground">Expiry *</Label>
                        <Input
                          value={payment.expiry}
                          onChange={(e) => {
                            const cleaned = e.target.value.replace(/\D/g, "").slice(0, 4);
                            const formatted = cleaned.length >= 3 ? `${cleaned.slice(0, 2)}/${cleaned.slice(2)}` : cleaned;
                            setPayment({ ...payment, expiry: formatted });
                          }}
                          placeholder="MM/YY"
                          className="h-10 mt-1.5 tabular"
                        />
                      </div>
                      <div>
                        <Label className="text-micro text-muted-foreground">CVC *</Label>
                        <Input
                          value={payment.cvc}
                          onChange={(e) => setPayment({ ...payment, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                          placeholder="123"
                          className="h-10 mt-1.5 tabular"
                        />
                      </div>
                    </div>
                    {/* Security badges */}
                    <div className="flex items-center justify-center gap-4 pt-4 pb-2">
                      <span className="flex items-center gap-1.5 text-micro text-muted-foreground/70 normal-case tracking-normal">
                        <Lock className="h-3 w-3" /> Encrypted
                      </span>
                      <span className="flex items-center gap-1.5 text-micro text-muted-foreground/70 normal-case tracking-normal">
                        <Shield className="h-3 w-3" /> PCI compliant
                      </span>
                      <span className="flex items-center gap-1.5 text-micro text-muted-foreground/70 normal-case tracking-normal">
                        <Check className="h-3 w-3" /> 14-day trial
                      </span>
                    </div>
                    <p className="text-micro text-muted-foreground/60 normal-case tracking-normal text-center leading-relaxed">
                      Your card won't be charged for 14 days. Launch Program billed separately after trial. Cancel anytime — no questions asked.
                    </p>
                  </>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-10">
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={stepIndex === 0}
            className="h-10 text-caption text-muted-foreground hover:text-foreground disabled:opacity-30"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back
          </Button>

          {step === "payment" ? (
            tier === "enterprise" ? (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed() || submitting}
                className="h-10 px-7 bg-veltra-emerald hover:bg-veltra-emerald-dark text-white font-medium"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Submit inquiry
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed() || submitting}
                className="h-10 px-7 bg-veltra-emerald hover:bg-veltra-emerald-dark text-white font-medium"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    Start 14-day trial
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </>
                )}
              </Button>
            )
          ) : (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="h-10 px-7 bg-veltra-emerald hover:bg-veltra-emerald-dark text-white font-medium"
            >
              Continue
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Trust footer */}
        <div className="mt-12 pt-8 border-t border-border/20 text-center">
          <p className="text-micro text-muted-foreground/50 normal-case tracking-normal">
            By signing up, you agree to our Terms and Privacy Policy.
            <br />
            HIPAA · GDPR · NPHIES compliant · Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
}
