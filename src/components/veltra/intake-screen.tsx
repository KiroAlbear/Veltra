"use client";

import { useVeltra } from "@/lib/veltra-store";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  ArrowRight, ArrowLeft, Check, Mic, MicOff, User, Heart, Brain,
  Moon, Utensils, Activity, Shield, FileText, Sparkles, Send, X,
  AlertTriangle, Clock, Play,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

type Step = "demographics" | "symptoms" | "history" | "lifestyle" | "voice" | "consent" | "summary";

const STEPS: { id: Step; label: string; icon: React.ElementType }[] = [
  { id: "demographics", label: "About You", icon: User },
  { id: "symptoms", label: "Symptoms", icon: AlertTriangle },
  { id: "history", label: "History", icon: FileText },
  { id: "lifestyle", label: "Lifestyle", icon: Activity },
  { id: "voice", label: "Voice Note", icon: Mic },
  { id: "consent", label: "Consent", icon: Shield },
  { id: "summary", label: "Summary", icon: Sparkles },
];

interface IntakeData {
  name: string; age: string; gender: string; phone: string; email: string;
  chiefComplaint: string; duration: string; severity: number; previousTreatment: string;
  conditions: string[]; medications: string[]; allergies: string[]; familyHistory: string;
  sleepHours: string; exerciseFreq: string; diet: string; smoking: string; alcohol: string;
  stressLevel: number;
  voiceTranscript: string; voiceDuration: number;
  consent: boolean;
}

const INITIAL_DATA: IntakeData = {
  name: "", age: "", gender: "", phone: "", email: "",
  chiefComplaint: "", duration: "", severity: 5, previousTreatment: "",
  conditions: [], medications: [], allergies: [], familyHistory: "",
  sleepHours: "7", exerciseFreq: "rarely", diet: "balanced", smoking: "no", alcohol: "no",
  stressLevel: 5,
  voiceTranscript: "", voiceDuration: 0,
  consent: false,
};

export function IntakeScreen() {
  const addPatient = useVeltra((s) => s.addPatient);
  const addPatientNote = useVeltra((s) => s.addPatientNote);
  const setView = useVeltra((s) => s.setView);
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("demographics");
  const [data, setData] = useState<IntakeData>(INITIAL_DATA);
  const [recording, setRecording] = useState(false);
  const [recordSecs, setRecordSecs] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stepIndex = STEPS.findIndex((s) => s.id === step);
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  const next = () => {
    const idx = STEPS.findIndex((s) => s.id === step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1].id);
  };
  const prev = () => {
    const idx = STEPS.findIndex((s) => s.id === step);
    if (idx > 0) setStep(STEPS[idx - 1].id);
  };

  const handleSubmit = () => {
    // Generate intake summary
    const summary = generateIntakeSummary(data);

    // Create patient from intake
    addPatient({
      name: data.name || "New Patient",
      age: Number(data.age) || 0,
      gender: (data.gender as "M" | "F") || "M",
      phone: data.phone || "",
      conditions: data.conditions,
      doctor: "Dr. Sarah",
      preferredChannel: "whatsapp",
    });

    // Add intake summary as patient note (flows to timeline)
    // The patient was just created, find it by name
    setTimeout(() => {
      const state = useVeltra.getState();
      const patient = state.patients.find((p) => p.name === (data.name || "New Patient"));
      if (patient) {
        const summaryText = `Intake completed. Chief concern: ${data.chiefComplaint || "N/A"}. Severity: ${data.severity}/10. Priority: ${summary.priority}. ${summary.flags.length > 0 ? `Flags: ${summary.flags.join(", ")}.` : ""} ${data.voiceTranscript ? `Voice note: "${data.voiceTranscript}"` : ""}`;
        state.addPatientNote(patient.id, summaryText);
      }
    }, 200);

    setSubmitted(true);
    toast({ title: "Intake complete ✓", description: `${data.name} added to clinic. Pre-visit brief ready.` });

    setTimeout(() => {
      setView("patients");
    }, 3000);
  };

  // Intake summary generation
  const intakeSummary = generateIntakeSummary(data);

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background veltra-ambient p-6">
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: EASE }} className="text-center max-w-md">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 12 }}
            className="mx-auto h-16 w-16 rounded-full bg-veltra-emerald/10 flex items-center justify-center mb-6">
            <Check className="h-8 w-8 text-veltra-emerald" />
          </motion.div>
          <h2 className="text-[2rem] font-semibold tracking-tight text-foreground mb-2">
            <span className="text-editorial-italic text-muted-foreground">Intake</span> complete.
          </h2>
          <p className="text-body text-muted-foreground mb-4">
            {data.name} has been added to the clinic.
          </p>
          <p className="text-caption text-veltra-emerald">
            Intake summary is ready for the doctor. Redirecting...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen veltra-ambient">
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-10 md:py-14">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-3.5 w-3.5 text-veltra-emerald" />
            <span className="text-micro text-veltra-emerald">Patient Intake</span>
          </div>
          <h1 className="text-[2rem] tracking-[-0.03em] font-semibold text-foreground">
            <span className="text-editorial-italic text-muted-foreground">Let's get</span> to know you.
          </h1>
          <p className="text-body text-muted-foreground mt-2">
            This takes about 5 minutes. Your doctor will review everything before your visit.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-micro text-muted-foreground">{STEPS[stepIndex].label}</span>
            <span className="text-micro text-muted-foreground tabular">{stepIndex + 1} / {STEPS.length}</span>
          </div>
          <Progress value={progress} className="h-1.5 [&>div]:bg-veltra-emerald" />
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
            {step === "demographics" && (
              <div className="space-y-4">
                <Card className="p-6 veltra-shadow border-0 bg-card/50 backdrop-blur-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label className="text-micro text-muted-foreground">Full name *</Label>
                      <Input value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} placeholder="Ahmed Hassan" className="h-10 mt-1.5" />
                    </div>
                    <div>
                      <Label className="text-micro text-muted-foreground">Age *</Label>
                      <Input type="number" value={data.age} onChange={(e) => setData({ ...data, age: e.target.value })} placeholder="54" className="h-10 mt-1.5" />
                    </div>
                    <div>
                      <Label className="text-micro text-muted-foreground">Gender</Label>
                      <select value={data.gender} onChange={(e) => setData({ ...data, gender: e.target.value })}
                        className="w-full h-10 mt-1.5 px-3 rounded-lg bg-background/50 border border-border/40 text-body text-foreground">
                        <option value="">Select...</option>
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-micro text-muted-foreground">Phone *</Label>
                      <Input value={data.phone} onChange={(e) => setData({ ...data, phone: e.target.value })} placeholder="+1 555 000 0000" className="h-10 mt-1.5" />
                    </div>
                    <div>
                      <Label className="text-micro text-muted-foreground">Email</Label>
                      <Input type="email" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} placeholder="you@email.com" className="h-10 mt-1.5" />
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {step === "symptoms" && (
              <div className="space-y-4">
                <Card className="p-6 veltra-shadow border-0 bg-card/50 backdrop-blur-sm">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-micro text-muted-foreground">What brings you in today? *</Label>
                      <textarea value={data.chiefComplaint} onChange={(e) => setData({ ...data, chiefComplaint: e.target.value })}
                        placeholder="Describe your main concern..." rows={3}
                        className="w-full mt-1.5 px-3 py-2.5 rounded-lg bg-background/50 border border-border/40 text-body text-foreground resize-none" />
                    </div>
                    <div>
                      <Label className="text-micro text-muted-foreground">How long has this been going on?</Label>
                      <Input value={data.duration} onChange={(e) => setData({ ...data, duration: e.target.value })} placeholder="e.g., 2 weeks, 3 months" className="h-10 mt-1.5" />
                    </div>
                    <div>
                      <Label className="text-micro text-muted-foreground">Severity: {data.severity}/10</Label>
                      <input type="range" min={1} max={10} value={data.severity} onChange={(e) => setData({ ...data, severity: Number(e.target.value) })}
                        className="w-full mt-2 accent-veltra-emerald" />
                      <div className="flex justify-between text-micro text-muted-foreground/50 mt-1">
                        <span>Mild</span><span>Moderate</span><span>Severe</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-micro text-muted-foreground">Have you tried any treatment?</Label>
                      <Input value={data.previousTreatment} onChange={(e) => setData({ ...data, previousTreatment: e.target.value })} placeholder="e.g., Painkillers, physiotherapy" className="h-10 mt-1.5" />
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {step === "history" && (
              <div className="space-y-4">
                <Card className="p-6 veltra-shadow border-0 bg-card/50 backdrop-blur-sm">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-micro text-muted-foreground mb-2 block">Existing conditions</Label>
                      <div className="flex flex-wrap gap-2">
                        {["Diabetes", "Hypertension", "Heart Disease", "Thyroid", "Asthma", "Anxiety", "Depression", "None"].map((c) => (
                          <button key={c} onClick={() => {
                            const conds = data.conditions.includes(c) ? data.conditions.filter((x) => x !== c) : [...data.conditions, c];
                            setData({ ...data, conditions: conds });
                          }}
                          className={cn("px-3 py-1.5 rounded-lg text-caption font-medium veltra-transition",
                            data.conditions.includes(c) ? "bg-veltra-emerald/15 text-veltra-emerald" : "bg-foreground/[0.04] text-muted-foreground")}>
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-micro text-muted-foreground">Current medications</Label>
                      <Input value={data.medications.join(", ")} onChange={(e) => setData({ ...data, medications: e.target.value.split(",").map((m) => m.trim()).filter(Boolean) })}
                        placeholder="e.g., Metformin, Lisinopril" className="h-10 mt-1.5" />
                    </div>
                    <div>
                      <Label className="text-micro text-muted-foreground">Allergies</Label>
                      <Input value={data.allergies.join(", ")} onChange={(e) => setData({ ...data, allergies: e.target.value.split(",").map((m) => m.trim()).filter(Boolean) })}
                        placeholder="e.g., Penicillin, Peanuts" className="h-10 mt-1.5" />
                    </div>
                    <div>
                      <Label className="text-micro text-muted-foreground">Family history</Label>
                      <Input value={data.familyHistory} onChange={(e) => setData({ ...data, familyHistory: e.target.value })}
                        placeholder="e.g., Father: diabetes, Mother: hypertension" className="h-10 mt-1.5" />
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {step === "lifestyle" && (
              <div className="space-y-4">
                <Card className="p-6 veltra-shadow border-0 bg-card/50 backdrop-blur-sm">
                  <div className="space-y-5">
                    <div className="flex items-center gap-3">
                      <Moon className="h-5 w-5 text-veltra-emerald flex-shrink-0" />
                      <div className="flex-1">
                        <Label className="text-micro text-muted-foreground">Average sleep (hours/night)</Label>
                        <div className="flex items-center gap-3 mt-1.5">
                          <input type="range" min={3} max={12} value={Number(data.sleepHours)} onChange={(e) => setData({ ...data, sleepHours: e.target.value })} className="flex-1 accent-veltra-emerald" />
                          <span className="text-body font-semibold tabular text-foreground min-w-[30px]">{data.sleepHours}h</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Activity className="h-5 w-5 text-veltra-emerald flex-shrink-0" />
                      <div className="flex-1">
                        <Label className="text-micro text-muted-foreground">Exercise frequency</Label>
                        <select value={data.exerciseFreq} onChange={(e) => setData({ ...data, exerciseFreq: e.target.value })}
                          className="w-full h-10 mt-1.5 px-3 rounded-lg bg-background/50 border border-border/40 text-body text-foreground">
                          <option value="daily">Daily</option>
                          <option value="3-4x">3-4 times/week</option>
                          <option value="1-2x">1-2 times/week</option>
                          <option value="rarely">Rarely</option>
                          <option value="never">Never</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Utensils className="h-5 w-5 text-veltra-emerald flex-shrink-0" />
                      <div className="flex-1">
                        <Label className="text-micro text-muted-foreground">Diet</Label>
                        <select value={data.diet} onChange={(e) => setData({ ...data, diet: e.target.value })}
                          className="w-full h-10 mt-1.5 px-3 rounded-lg bg-background/50 border border-border/40 text-body text-foreground">
                          <option value="balanced">Balanced</option>
                          <option value="vegetarian">Vegetarian</option>
                          <option value="vegan">Vegan</option>
                          <option value="keto">Keto</option>
                          <option value="halal">Halal</option>
                          <option value="unrestricted">Unrestricted</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-micro text-muted-foreground">Smoking</Label>
                        <select value={data.smoking} onChange={(e) => setData({ ...data, smoking: e.target.value })}
                          className="w-full h-10 mt-1.5 px-3 rounded-lg bg-background/50 border border-border/40 text-body text-foreground">
                          <option value="no">No</option>
                          <option value="occasional">Occasional</option>
                          <option value="daily">Daily</option>
                          <option value="former">Former smoker</option>
                        </select>
                      </div>
                      <div>
                        <Label className="text-micro text-muted-foreground">Alcohol</Label>
                        <select value={data.alcohol} onChange={(e) => setData({ ...data, alcohol: e.target.value })}
                          className="w-full h-10 mt-1.5 px-3 rounded-lg bg-background/50 border border-border/40 text-body text-foreground">
                          <option value="no">No</option>
                          <option value="occasional">Occasional</option>
                          <option value="regular">Regular</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <Label className="text-micro text-muted-foreground">Stress level: {data.stressLevel}/10</Label>
                      <input type="range" min={1} max={10} value={data.stressLevel} onChange={(e) => setData({ ...data, stressLevel: Number(e.target.value) })}
                        className="w-full mt-2 accent-veltra-emerald" />
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {step === "voice" && (
              <div className="space-y-4">
                <Card className="p-8 veltra-shadow border-0 bg-card/50 backdrop-blur-sm text-center">
                  <div className="flex items-center gap-2 justify-center mb-6">
                    <Mic className="h-4 w-4 text-veltra-emerald" />
                    <p className="text-micro text-veltra-emerald">Voice Note (Optional)</p>
                  </div>
                  <p className="text-body text-muted-foreground mb-6 max-w-sm mx-auto">
                    Tell us anything else the doctor should know. Speak freely — in any language.
                  </p>

                  {/* Recording button */}
                  <button
                    onClick={() => {
                      if (recording) {
                        setRecording(false);
                        if (timerRef.current) clearInterval(timerRef.current);
                        // Generate mock transcript
                        if (!data.voiceTranscript) {
                          setData({
                            ...data,
                            voiceTranscript: "Patient reports difficulty sleeping and increased anxiety over the past month. Work has been stressful. No major changes in diet. Would like to discuss medication options.",
                            voiceDuration: recordSecs || 30,
                          });
                        }
                      } else {
                        setRecording(true);
                        setRecordSecs(0);
                        timerRef.current = setInterval(() => {
                          setRecordSecs((s) => {
                            if (s >= 120) {
                              setRecording(false);
                              if (timerRef.current) clearInterval(timerRef.current);
                              return s;
                            }
                            return s + 1;
                          });
                        }, 1000);
                      }
                    }}
                    className={cn(
                      "mx-auto h-20 w-20 rounded-full flex items-center justify-center veltra-transition",
                      recording ? "bg-red-500/15" : "bg-veltra-emerald/15 hover:bg-veltra-emerald/25"
                    )}
                  >
                    <motion.div animate={recording ? { scale: [1, 1.15, 1] } : {}} transition={{ duration: 1, repeat: Infinity }}>
                      {recording ? <MicOff className="h-8 w-8 text-red-400" /> : <Mic className="h-8 w-8 text-veltra-emerald" />}
                    </motion.div>
                  </button>

                  <p className="text-caption text-muted-foreground mt-4">
                    {recording ? `Recording... ${recordSecs}s (tap to stop)` : data.voiceTranscript ? `Recorded: ${data.voiceDuration}s` : "Tap to record (max 2 min)"}
                  </p>

                  {/* Waveform mock */}
                  {recording && (
                    <div className="flex items-center justify-center gap-1 mt-6 h-12">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{ height: [4, Math.random() * 40 + 8, 4] }}
                          transition={{ duration: 0.4 + Math.random() * 0.3, repeat: Infinity, delay: i * 0.03 }}
                          className="w-1 rounded-full bg-veltra-emerald/40"
                        />
                      ))}
                    </div>
                  )}

                  {/* Transcript */}
                  {data.voiceTranscript && !recording && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6 text-left">
                      <div className="rounded-xl bg-foreground/[0.04] p-4">
                        <p className="text-micro text-veltra-emerald mb-2 flex items-center gap-1.5">
                          <Sparkles className="h-3 w-3" /> Auto-transcribed
                        </p>
                        <p className="text-caption text-foreground italic leading-relaxed">"{data.voiceTranscript}"</p>
                      </div>
                    </motion.div>
                  )}
                </Card>
                <p className="text-center text-micro text-muted-foreground/60 normal-case tracking-normal">
                  You can skip this step — it's optional
                </p>
              </div>
            )}

            {step === "consent" && (
              <div className="space-y-4">
                <Card className="p-6 veltra-shadow border-0 bg-card/50 backdrop-blur-sm">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-veltra-emerald flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-body font-medium text-foreground">Data Privacy</p>
                        <p className="text-caption text-muted-foreground mt-1">Your data belongs to your clinic. Veltra never sells patient data. Every access is logged.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-veltra-emerald flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-body font-medium text-foreground">Medical Records</p>
                        <p className="text-caption text-muted-foreground mt-1">Your information will be shared with your treating doctor only. You can request deletion at any time.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Brain className="h-5 w-5 text-veltra-emerald flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-body font-medium text-foreground">Veltra Assistance</p>
                        <p className="text-caption text-muted-foreground mt-1">Veltra may summarize your intake for the doctor. The doctor makes all clinical decisions.</p>
                      </div>
                    </div>

                    <label className="flex items-center gap-3 pt-4 border-t border-border/40 cursor-pointer">
                      <input type="checkbox" checked={data.consent} onChange={(e) => setData({ ...data, consent: e.target.checked })}
                        className="h-5 w-5 rounded accent-veltra-emerald" />
                      <span className="text-body text-foreground">I consent to share this information with my doctor.</span>
                    </label>
                  </div>
                </Card>
              </div>
            )}

            {step === "summary" && (
              <div className="space-y-4">
                {/* Intake Summary */}
                <Card className="p-6 veltra-shadow-lg veltra-glass border-0 relative overflow-hidden">
                  <div className="absolute -top-20 -right-20 w-48 h-48 bg-veltra-emerald/8 rounded-full blur-3xl pointer-events-none" />
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="h-4 w-4 text-veltra-emerald" />
                      <p className="text-micro text-veltra-emerald">Pre-Visit Brief</p>
                      <span className="ml-auto flex items-center gap-1 text-micro text-muted-foreground/60 normal-case tracking-normal">
                        <Clock className="h-3 w-3" /> 15s read
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-micro text-muted-foreground mb-1">Patient</p>
                        <p className="text-body font-medium text-foreground">{data.name || "New Patient"}, {data.age || "?"}, {data.gender || "—"}</p>
                      </div>

                      <div className="pt-3 border-t border-border/40">
                        <p className="text-micro text-muted-foreground mb-1">Chief Concern</p>
                        <p className="text-caption text-foreground">{intakeSummary.chiefConcern}</p>
                      </div>

                      <div className="pt-3 border-t border-border/40">
                        <p className="text-micro text-muted-foreground mb-1">Key Findings</p>
                        <ul className="space-y-1">
                          {intakeSummary.findings.map((f, i) => (
                            <li key={i} className="text-caption text-foreground flex items-start gap-2">
                              <Check className="h-3 w-3 text-veltra-emerald flex-shrink-0 mt-1" />
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-3 border-t border-border/40">
                        <p className="text-micro text-muted-foreground mb-1">Risk Flags</p>
                        <div className="flex flex-wrap gap-1.5">
                          {intakeSummary.flags.length > 0 ? intakeSummary.flags.map((f, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-md text-micro bg-amber-500/10 text-amber-300 border border-amber-500/20 normal-case tracking-normal">
                              ⚠ {f}
                            </span>
                          )) : <span className="text-caption text-muted-foreground">None detected</span>}
                        </div>
                      </div>

                      {data.voiceTranscript && (
                        <div className="pt-3 border-t border-border/40">
                          <p className="text-micro text-muted-foreground mb-1 flex items-center gap-1.5">
                            <Mic className="h-3 w-3" /> Voice Note Summary
                          </p>
                          <p className="text-caption text-foreground italic">"{data.voiceTranscript}"</p>
                        </div>
                      )}

                      <div className="pt-3 border-t border-border/40 flex items-center justify-between">
                        <div>
                          <p className="text-micro text-muted-foreground">Estimated Visit Duration</p>
                          <p className="text-body font-semibold text-foreground">{intakeSummary.estimatedDuration} minutes</p>
                        </div>
                        <div className="text-right">
                          <p className="text-micro text-muted-foreground">Priority</p>
                          <p className={cn("text-body font-semibold", intakeSummary.priority === "High" ? "text-red-400" : intakeSummary.priority === "Medium" ? "text-amber-400" : "text-emerald-400")}>{intakeSummary.priority}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                <p className="text-center text-micro text-muted-foreground/60 normal-case tracking-normal">
                  The doctor will review this summary before your visit.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <Button variant="ghost" onClick={prev} disabled={stepIndex === 0} className="h-10 px-4 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
          </Button>

          {step === "summary" ? (
            <Button onClick={handleSubmit} disabled={!data.consent} className="h-10 px-6 bg-veltra-emerald hover:bg-veltra-emerald-dark text-white font-medium">
              Submit Intake <Send className="ml-1.5 h-4 w-4" />
            </Button>
          ) : step === "voice" ? (
            <Button onClick={next} className="h-10 px-6 bg-veltra-emerald hover:bg-veltra-emerald-dark text-white font-medium">
              Skip / Continue <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={next} className="h-10 px-6 bg-veltra-emerald hover:bg-veltra-emerald-dark text-white font-medium">
              Continue <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ===== Intake Summary Generator =====
function generateIntakeSummary(data: IntakeData): {
  chiefConcern: string;
  findings: string[];
  flags: string[];
  estimatedDuration: string;
  priority: string;
} {
  const findings: string[] = [];
  const flags: string[] = [];

  // Chief concern
  const chiefConcern = data.chiefComplaint
    ? `${data.chiefComplaint} (${data.duration || "duration unspecified"}, severity ${data.severity}/10)`
    : "No chief complaint recorded.";

  // Conditions
  if (data.conditions.length > 0 && !data.conditions.includes("None")) {
    findings.push(`Existing conditions: ${data.conditions.join(", ")}`);
  }

  // Medications
  if (data.medications.length > 0) {
    findings.push(`Current medications: ${data.medications.join(", ")}`);
  }

  // Allergies
  if (data.allergies.length > 0) {
    flags.push(`Allergies: ${data.allergies.join(", ")}`);
  }

  // Lifestyle
  findings.push(`Sleep: ${data.sleepHours}h/night`);
  findings.push(`Exercise: ${data.exerciseFreq}`);
  findings.push(`Stress: ${data.stressLevel}/10`);

  // Risk flags
  if (Number(data.sleepHours) < 6) flags.push("Sleep deprivation");
  if (data.stressLevel >= 8) flags.push("High stress");
  if (data.smoking === "daily") flags.push("Daily smoker");
  if (data.severity >= 8) flags.push("High severity");
  if (data.familyHistory) flags.push(`Family history: ${data.familyHistory}`);

  // Priority
  let priority = "Low";
  if (data.severity >= 7 || flags.length >= 3) priority = "High";
  else if (data.severity >= 4 || flags.length >= 1) priority = "Medium";

  // Duration estimate
  const estimatedDuration = priority === "High" ? "30-45" : priority === "Medium" ? "20-30" : "15-20";

  return { chiefConcern, findings, flags, estimatedDuration, priority };
}

// Need useToast import
import { useToast } from "@/hooks/use-toast";
