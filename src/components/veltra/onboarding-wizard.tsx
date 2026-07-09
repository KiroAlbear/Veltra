"use client";

/**
 * VELTRA Onboarding Wizard
 *
 * Gets a new clinic from signup to first patient in 15 minutes.
 *
 * 5 steps:
 *   1. Clinic info — name, type, specialty
 *   2. Admin account — your name, email, password
 *   3. Locations — add first branch
 *   4. Staff — invite doctors + receptionists
 *   5. Import — migrate data (optional, can skip)
 *
 * After completion: clinic is live, admin can log in, staff invited.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVeltra } from "@/lib/veltra-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  ArrowRight, ArrowLeft, Check, Building2, Users, MapPin, FileUp,
  Sparkles, Stethoscope, Heart, Pill, Brain, Eye, Baby, Bone,
  UserPlus, Mail, Lock, Phone, Globe, SkipForward,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const EASE = [0.16, 1, 0.3, 1] as const;

const SPECIALTIES = [
  { id: "general",       icon: Stethoscope, label: "General Practice",  color: "text-emerald-400" },
  { id: "cardiology",    icon: Heart,       label: "Cardiology",         color: "text-rose-400" },
  { id: "dermatology",   icon: Sparkles,    label: "Dermatology",        color: "text-violet-400" },
  { id: "pediatrics",    icon: Baby,        label: "Pediatrics",         color: "text-amber-400" },
  { id: "orthopedics",   icon: Bone,        label: "Orthopedics",        color: "text-blue-400" },
  { id: "ophthalmology", icon: Eye,         label: "Ophthalmology",      color: "text-cyan-400" },
  { id: "psychiatry",    icon: Brain,       label: "Psychiatry",         color: "text-indigo-400" },
  { id: "pharmacy",      icon: Pill,        label: "Pharmacy",           color: "text-pink-400" },
];

const STEPS = [
  { id: 1, label: "Clinic",     icon: Building2, desc: "Tell us about your clinic" },
  { id: 2, label: "Admin",      icon: Users,     desc: "Create your admin account" },
  { id: 3, label: "Location",   icon: MapPin,    desc: "Add your first branch" },
  { id: 4, label: "Staff",      icon: UserPlus,  desc: "Invite your team" },
  { id: 5, label: "Import",     icon: FileUp,    desc: "Migrate existing data" },
];

export function OnboardingWizard({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [clinic, setClinic] = useState({
    name: "", type: "general", specialty: "general",
    website: "", phone: "",
  });
  const [admin, setAdmin] = useState({
    name: "", email: "", password: "", confirmPassword: "",
  });
  const [location, setLocation] = useState({
    name: "", address: "", phone: "",
  });
  const [staff, setStaff] = useState([
    { name: "", email: "", role: "doctor" },
  ]);
  const { toast } = useToast();
  const loginAs = useVeltra((s) => s.loginAs);

  const next = () => {
    // Validate current step
    if (step === 1 && !clinic.name) {
      toast({ title: "Clinic name required", variant: "destructive" });
      return;
    }
    if (step === 2) {
      if (!admin.name || !admin.email || !admin.password) {
        toast({ title: "All admin fields required", variant: "destructive" });
        return;
      }
      if (admin.password !== admin.confirmPassword) {
        toast({ title: "Passwords don't match", variant: "destructive" });
        return;
      }
    }
    if (step === 3 && !location.name) {
      toast({ title: "Location name required", variant: "destructive" });
      return;
    }
    if (step < 5) setStep(step + 1);
    else {
      // Complete
      toast({
        title: "Clinic setup complete! 🎉",
        description: `${clinic.name} is now live on Veltra.`,
      });
      // Login as admin (demo: login as u5)
      loginAs("u5");
      onComplete();
    }
  };

  const back = () => {
    if (step > 1) setStep(step - 1);
  };

  const addStaff = () => {
    setStaff([...staff, { name: "", email: "", role: "doctor" }]);
  };

  const updateStaff = (idx: number, field: string, value: string) => {
    setStaff(staff.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  return (
    <div className="min-h-screen bg-background veltra-ambient flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/logo-symbol.png" alt="Veltra" className="object-cover h-12 w-12 rounded-xl veltra-shadow mx-auto mb-3" />
          <h1 className="text-title font-semibold text-foreground">Welcome to Veltra</h1>
          <p className="text-caption text-muted-foreground mt-1">Your clinic will be live in 15 minutes.</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between mb-8 px-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={cn(
                  "h-9 w-9 rounded-full flex items-center justify-center veltra-transition border-2",
                  step > s.id ? "bg-veltra-emerald border-veltra-emerald text-white" :
                  step === s.id ? "bg-veltra-emerald/15 border-veltra-emerald text-veltra-emerald" :
                  "bg-foreground/[0.02] border-border/40 text-muted-foreground/50"
                )}>
                  {step > s.id ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <s.icon className="h-4 w-4" />
                  )}
                </div>
                <span className={cn(
                  "text-micro mt-1.5 normal-case tracking-normal hidden sm:block",
                  step >= s.id ? "text-foreground font-medium" : "text-muted-foreground/50"
                )}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn(
                  "flex-1 h-px mx-2 mb-5 veltra-transition",
                  step > s.id ? "bg-veltra-emerald" : "bg-border/40"
                )} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="rounded-2xl veltra-glass-strong veltra-shadow-xl border border-border/30 p-6 sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              {/* Step 1: Clinic Info */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-body font-semibold text-foreground">Tell us about your clinic</h2>
                    <p className="text-caption text-muted-foreground mt-0.5">This information appears on patient documents and invoices.</p>
                  </div>

                  <div>
                    <Label className="text-micro text-muted-foreground">Clinic name</Label>
                    <Input
                      value={clinic.name}
                      onChange={(e) => setClinic({ ...clinic, name: e.target.value })}
                      placeholder="Riyadh Medical Center"
                      className="h-10 mt-1 text-body bg-foreground/[0.02] border-border/30"
                      autoFocus
                    />
                  </div>

                  <div>
                    <Label className="text-micro text-muted-foreground">Specialty</Label>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {SPECIALTIES.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setClinic({ ...clinic, specialty: s.id })}
                          className={cn(
                            "flex flex-col items-center gap-1.5 p-3 rounded-lg border veltra-transition",
                            clinic.specialty === s.id
                              ? "bg-veltra-emerald/[0.04] border-veltra-emerald/30"
                              : "bg-foreground/[0.02] border-border/20 hover:bg-foreground/[0.04]"
                          )}
                        >
                          <s.icon className={cn("h-4 w-4", s.color)} />
                          <span className="text-micro text-foreground normal-case tracking-normal text-center">{s.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-micro text-muted-foreground">Phone</Label>
                      <Input
                        value={clinic.phone}
                        onChange={(e) => setClinic({ ...clinic, phone: e.target.value })}
                        placeholder="+966 11 200 3000"
                        className="h-10 mt-1 text-body bg-foreground/[0.02] border-border/30"
                      />
                    </div>
                    <div>
                      <Label className="text-micro text-muted-foreground">Website (optional)</Label>
                      <Input
                        value={clinic.website}
                        onChange={(e) => setClinic({ ...clinic, website: e.target.value })}
                        placeholder="clinic.com"
                        className="h-10 mt-1 text-body bg-foreground/[0.02] border-border/30"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Admin Account */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-body font-semibold text-foreground">Create your admin account</h2>
                    <p className="text-caption text-muted-foreground mt-0.5">You'll use this to manage your clinic on Veltra.</p>
                  </div>

                  <div>
                    <Label className="text-micro text-muted-foreground">Full name</Label>
                    <Input
                      value={admin.name}
                      onChange={(e) => setAdmin({ ...admin, name: e.target.value })}
                      placeholder="Dr. Ahmed Hassan"
                      className="h-10 mt-1 text-body bg-foreground/[0.02] border-border/30"
                      autoFocus
                    />
                  </div>

                  <div>
                    <Label className="text-micro text-muted-foreground">Email</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        type="email"
                        value={admin.email}
                        onChange={(e) => setAdmin({ ...admin, email: e.target.value })}
                        placeholder="ahmed@clinic.com"
                        className="h-10 pl-9 text-body bg-foreground/[0.02] border-border/30"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-micro text-muted-foreground">Password</Label>
                      <div className="relative mt-1">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                          type="password"
                          value={admin.password}
                          onChange={(e) => setAdmin({ ...admin, password: e.target.value })}
                          placeholder="••••••••"
                          className="h-10 pl-9 text-body bg-foreground/[0.02] border-border/30"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-micro text-muted-foreground">Confirm</Label>
                      <Input
                        type="password"
                        value={admin.confirmPassword}
                        onChange={(e) => setAdmin({ ...admin, confirmPassword: e.target.value })}
                        placeholder="••••••••"
                        className="h-10 mt-1 text-body bg-foreground/[0.02] border-border/30"
                      />
                    </div>
                  </div>

                  <div className="rounded-lg bg-veltra-emerald/[0.04] border border-veltra-emerald/20 p-3 flex items-start gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-veltra-emerald mt-0.5 flex-shrink-0" />
                    <p className="text-micro text-muted-foreground normal-case tracking-normal leading-relaxed">
                      We'll enable <strong className="text-veltra-emerald">MFA</strong> for your admin account. You can add staff accounts in the next step.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 3: Location */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-body font-semibold text-foreground">Add your first location</h2>
                    <p className="text-caption text-muted-foreground mt-0.5">You can add more branches later from Settings.</p>
                  </div>

                  <div>
                    <Label className="text-micro text-muted-foreground">Location name</Label>
                    <Input
                      value={location.name}
                      onChange={(e) => setLocation({ ...location, name: e.target.value })}
                      placeholder="Riyadh — Olaya Branch"
                      className="h-10 mt-1 text-body bg-foreground/[0.02] border-border/30"
                      autoFocus
                    />
                  </div>

                  <div>
                    <Label className="text-micro text-muted-foreground">Address</Label>
                    <Input
                      value={location.address}
                      onChange={(e) => setLocation({ ...location, address: e.target.value })}
                      placeholder="Olaya St, Riyadh, Saudi Arabia"
                      className="h-10 mt-1 text-body bg-foreground/[0.02] border-border/30"
                    />
                  </div>

                  <div>
                    <Label className="text-micro text-muted-foreground">Phone</Label>
                    <Input
                      value={location.phone}
                      onChange={(e) => setLocation({ ...location, phone: e.target.value })}
                      placeholder="+966 11 200 3000"
                      className="h-10 mt-1 text-body bg-foreground/[0.02] border-border/30"
                    />
                  </div>

                  <div className="rounded-lg bg-foreground/[0.02] border border-border/20 p-3 flex items-start gap-2">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <p className="text-micro text-muted-foreground normal-case tracking-normal leading-relaxed">
                      This location will be your primary branch. You can add more from Settings → Locations.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 4: Staff */}
              {step === 4 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-body font-semibold text-foreground">Invite your team</h2>
                    <p className="text-caption text-muted-foreground mt-0.5">They'll receive an email with setup instructions.</p>
                  </div>

                  {staff.map((member, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-4">
                        <Label className="text-micro text-muted-foreground">Name</Label>
                        <Input
                          value={member.name}
                          onChange={(e) => updateStaff(idx, "name", e.target.value)}
                          placeholder="Dr. Sarah"
                          className="h-10 mt-1 text-caption bg-foreground/[0.02] border-border/30"
                        />
                      </div>
                      <div className="col-span-5">
                        <Label className="text-micro text-muted-foreground">Email</Label>
                        <Input
                          value={member.email}
                          onChange={(e) => updateStaff(idx, "email", e.target.value)}
                          placeholder="sarah@clinic.com"
                          className="h-10 mt-1 text-caption bg-foreground/[0.02] border-border/30"
                        />
                      </div>
                      <div className="col-span-3">
                        <Label className="text-micro text-muted-foreground">Role</Label>
                        <select
                          value={member.role}
                          onChange={(e) => updateStaff(idx, "role", e.target.value)}
                          className="h-10 mt-1 w-full px-3 rounded-md bg-foreground/[0.02] border border-border/30 text-caption text-foreground"
                        >
                          <option value="doctor">Doctor</option>
                          <option value="nurse">Nurse</option>
                          <option value="receptionist">Receptionist</option>
                          <option value="pharmacist">Pharmacist</option>
                          <option value="finance">Finance</option>
                        </select>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={addStaff}
                    className="w-full h-9 rounded-lg border border-dashed border-border/40 text-caption text-muted-foreground hover:text-veltra-emerald hover:border-veltra-emerald/40 veltra-transition flex items-center justify-center gap-1.5"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    Add another team member
                  </button>

                  <div className="rounded-lg bg-foreground/[0.02] border border-border/20 p-3">
                    <p className="text-micro text-muted-foreground normal-case tracking-normal leading-relaxed">
                      You can skip this step and add staff later from Settings → Users.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 5: Import */}
              {step === 5 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-body font-semibold text-foreground">Migrate your existing data</h2>
                    <p className="text-caption text-muted-foreground mt-0.5">Optional — you can do this later from VELTRA Switch.</p>
                  </div>

                  <div className="rounded-xl border-2 border-dashed border-border/40 p-8 text-center bg-foreground/[0.02]">
                    <FileUp className="h-8 w-8 text-muted-foreground/50 mx-auto mb-3" />
                    <p className="text-caption font-medium text-foreground">Drop your Excel or CSV file here</p>
                    <p className="text-micro text-muted-foreground mt-1 normal-case tracking-normal">
                      We'll extract patients, visits, and prescriptions automatically
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-caption text-muted-foreground">
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      Supports Excel, CSV, PDF, images
                    </div>
                    <div className="flex items-center gap-2 text-caption text-muted-foreground">
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      AI extracts with 98.7% accuracy
                    </div>
                    <div className="flex items-center gap-2 text-caption text-muted-foreground">
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      Review before commit — zero data loss
                    </div>
                  </div>

                  <div className="rounded-lg bg-veltra-emerald/[0.04] border border-veltra-emerald/20 p-3 flex items-start gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-veltra-emerald mt-0.5 flex-shrink-0" />
                    <p className="text-micro text-muted-foreground normal-case tracking-normal leading-relaxed">
                      <strong className="text-veltra-emerald">Pro tip:</strong> If you're migrating from another system, our VELTRA Switch feature can import everything in under an hour.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-border/20">
            <button
              onClick={back}
              disabled={step === 1}
              className="flex items-center gap-1.5 text-caption text-muted-foreground hover:text-foreground veltra-transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </button>

            <div className="flex items-center gap-2">
              {step === 5 && (
                <button
                  onClick={() => {
                    toast({ title: "Skipped import", description: "You can migrate later from VELTRA Switch" });
                    loginAs("u5");
                    onComplete();
                  }}
                  className="flex items-center gap-1.5 text-caption text-muted-foreground hover:text-foreground veltra-transition"
                >
                  <SkipForward className="h-3.5 w-3.5" />
                  Skip for now
                </button>
              )}
              <Button
                onClick={next}
                className="h-10 px-5 bg-veltra-emerald hover:bg-veltra-emerald-dark text-white text-caption font-medium"
              >
                {step === 5 ? "Launch my clinic" : "Continue"}
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Trust indicators */}
        <p className="text-center text-micro text-muted-foreground/50 normal-case tracking-normal mt-6">
          🔒 HIPAA · GDPR · PDPL compliant · 90-day money-back guarantee
        </p>
      </div>
    </div>
  );
}
