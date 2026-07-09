"use client";

/**
 * VELTRA — EHR Components
 *
 * Full Electronic Health Record UI:
 *   1. SoapNotesSection — view + expand SOAP notes
 *   2. MedicalHistoryTabs — 8 tabs (conditions, surgeries, family, meds, allergies, vaccines, chronic, social)
 *   3. LabTrendsChart — sparkline-style trend visualization
 *   4. ClinicalSuggestionsStrip — proactive AI suggestions
 *
 * Used in: Patient Timeline screen (below timeline events)
 */

import { useVeltra } from "@/lib/veltra-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  FileText, Activity, Heart, Shield, Pill, Syringe, Stethoscope,
  TrendingUp, TrendingDown, Minus, ChevronRight, Sparkles, AlertTriangle,
  Check, Clock, Calendar, User, Users, FlaskConical, Brain, Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import { FadeIn, StaggerGroup, StaggerItem } from "./motion";
import {
  getSoapNotes, getMedicalHistory, computeLabTrends, generateClinicalSuggestions,
} from "@/lib/ehr-service";
import type { SoapNote, ClinicalSuggestion, LabTrend } from "@/lib/ehr-types";

const EASE = [0.16, 1, 0.3, 1] as const;

/* ===== Skeleton loaders ===== */
function SkeletonCard() {
  return (
    <Card className="p-4 veltra-shadow border-0 bg-card/30 backdrop-blur-sm animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-foreground/10" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 w-2/3 rounded bg-foreground/10" />
          <div className="h-2 w-1/2 rounded bg-foreground/5" />
        </div>
      </div>
    </Card>
  );
}

function SkeletonList({ count = 3 }: { count?: number }) {
  return <div className="space-y-2">{Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}</div>;
}

/** Hook: simulates async loading for EHR data (gives skeleton time to show) */
function useDelayedReady(delay = 400): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return ready;
}

/* =========================================================================
   1. SOAP NOTES SECTION
   ========================================================================= */
export function SoapNotesSection({ patientId }: { patientId: string }) {
  const ready = useDelayedReady(300);
  const soapNotes = useMemo(() => getSoapNotes(patientId), [patientId]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!ready) return <SkeletonList count={2} />;

  if (soapNotes.length === 0) {
    return (
      <Card className="p-6 text-center veltra-shadow border-0 bg-card/30 backdrop-blur-sm">
        <FileText className="h-6 w-6 text-muted-foreground/30 mx-auto mb-2" />
        <p className="text-caption text-muted-foreground">No SOAP notes yet. Start a visit to create one.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {soapNotes.map((note) => (
        <SoapNoteCard
          key={note.id}
          note={note}
          expanded={expandedId === note.id}
          onToggle={() => setExpandedId(expandedId === note.id ? null : note.id)}
        />
      ))}
    </div>
  );
}

function SoapNoteCard({ note, expanded, onToggle }: { note: SoapNote; expanded: boolean; onToggle: () => void }) {
  return (
    <Card className="veltra-shadow border-0 bg-card/50 backdrop-blur-sm overflow-hidden">
      {/* Header — always visible */}
      <button onClick={onToggle} aria-expanded={expanded} className="w-full text-left p-4 hover:bg-foreground/[0.02] veltra-transition">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-veltra-emerald/10 flex items-center justify-center flex-shrink-0">
            <FileText className="h-4 w-4 text-veltra-emerald" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-caption font-medium text-foreground truncate">{note.chiefComplaint}</p>
              <span className={cn(
                "text-micro px-1.5 py-0 rounded normal-case tracking-normal font-medium",
                note.status === "signed" ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"
              )}>
                {note.status}
              </span>
            </div>
            <p className="text-micro text-muted-foreground/70 normal-case tracking-normal mt-0.5">
              {new Date(note.visitDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} · {note.doctorName}
            </p>
          </div>
          <ChevronRight className={cn("h-4 w-4 text-muted-foreground veltra-transition", expanded && "rotate-90")} />
        </div>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="overflow-hidden border-t border-border/30"
          >
            <div className="p-4 space-y-4">
              {/* S — Subjective */}
              <SoapSection label="S" title="Subjective" tint="text-blue-400">
                <p className="text-caption text-foreground leading-relaxed">
                  <strong className="text-muted-foreground">Chief complaint: </strong>
                  {note.chiefComplaint}
                </p>
                <p className="text-caption text-foreground leading-relaxed mt-1.5">
                  <strong className="text-muted-foreground">HPI: </strong>
                  {note.historyOfPresentIllness}
                </p>
                {note.reviewOfSystems && (
                  <p className="text-caption text-muted-foreground leading-relaxed mt-1.5">
                    <strong>ROS: </strong>{note.reviewOfSystems}
                  </p>
                )}
                {note.vitalSigns && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {note.vitalSigns.bp && <VitalChip label="BP" value={note.vitalSigns.bp} />}
                    {note.vitalSigns.hr && <VitalChip label="HR" value={`${note.vitalSigns.hr} bpm`} />}
                    {note.vitalSigns.temp && <VitalChip label="Temp" value={`${note.vitalSigns.temp}°C`} />}
                    {note.vitalSigns.weight && <VitalChip label="Wt" value={`${note.vitalSigns.weight} kg`} />}
                  </div>
                )}
              </SoapSection>

              {/* O — Objective */}
              {note.physicalExam && (
                <SoapSection label="O" title="Objective" tint="text-violet-400">
                  <p className="text-caption text-foreground leading-relaxed">{note.physicalExam}</p>
                </SoapSection>
              )}

              {/* A — Assessment */}
              <SoapSection label="A" title="Assessment" tint="text-emerald-400">
                <div className="space-y-1">
                  {note.diagnoses.map((dx) => (
                    <div key={dx.id} className="flex items-center gap-2 text-caption">
                      <span className="text-foreground font-medium">{dx.diagnosis}</span>
                      {dx.icd10Code && (
                        <span className="text-micro px-1.5 py-0 rounded bg-foreground/[0.04] text-muted-foreground font-mono normal-case tracking-normal">
                          {dx.icd10Code}
                        </span>
                      )}
                      <span className={cn(
                        "text-micro normal-case tracking-normal",
                        dx.status === "chronic" ? "text-amber-400" : dx.status === "active" ? "text-blue-400" : "text-emerald-400"
                      )}>
                        {dx.status}
                      </span>
                    </div>
                  ))}
                </div>
                {note.differentialDiagnoses && note.differentialDiagnoses.length > 0 && (
                  <p className="text-micro text-muted-foreground/70 normal-case tracking-normal mt-1.5">
                    <strong>Differentials: </strong>{note.differentialDiagnoses.join(" · ")}
                  </p>
                )}
              </SoapSection>

              {/* P — Plan */}
              <SoapSection label="P" title="Plan" tint="text-rose-400">
                <p className="text-caption text-foreground leading-relaxed whitespace-pre-line">{note.plan}</p>
                {note.followUp && (
                  <div className="flex items-center gap-1.5 mt-2 text-micro text-veltra-emerald normal-case tracking-normal">
                    <Calendar className="h-3 w-3" />
                    Follow-up in {note.followUp.timeframe} — {note.followUp.reason}
                  </div>
                )}
              </SoapSection>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

function SoapSection({ label, title, tint, children }: { label: string; title: string; tint: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <span className={cn("h-5 w-5 rounded flex items-center justify-center text-micro font-bold", `${tint} bg-foreground/[0.04]`)}>
          {label}
        </span>
        <span className={cn("text-micro font-medium uppercase tracking-wider", tint)}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function VitalChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="text-micro px-2 py-0.5 rounded-md bg-foreground/[0.04] text-foreground normal-case tracking-normal">
      <strong className="text-muted-foreground">{label}: </strong>{value}
    </span>
  );
}

/* =========================================================================
   2. MEDICAL HISTORY TABS
   ========================================================================= */
type HistoryTab = "conditions" | "surgeries" | "family" | "medications" | "allergies" | "vaccinations" | "chronic" | "social";

const HISTORY_TABS: { id: HistoryTab; label: string; icon: React.ElementType }[] = [
  { id: "conditions",    label: "Conditions",    icon: Activity },
  { id: "chronic",       label: "Chronic",       icon: Heart },
  { id: "surgeries",     label: "Surgeries",     icon: Stethoscope },
  { id: "family",        label: "Family",        icon: Users },
  { id: "medications",   label: "Medications",   icon: Pill },
  { id: "allergies",     label: "Allergies",     icon: AlertTriangle },
  { id: "vaccinations",  label: "Vaccines",      icon: Syringe },
  { id: "social",        label: "Social",        icon: User },
];

export function MedicalHistorySection({ patientId }: { patientId: string }) {
  const ready = useDelayedReady(400);
  const history = useMemo(() => getMedicalHistory(patientId), [patientId]);
  const [activeTab, setActiveTab] = useState<HistoryTab>("conditions");

  if (!ready) return <SkeletonList count={4} />;

  return (
    <div>
      {/* Tab navigation */}
      <div className="flex gap-1 mb-4 overflow-x-auto veltra-scrollbar pb-1">
        {HISTORY_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-micro font-medium veltra-transition flex-shrink-0",
              activeTab === tab.id
                ? "bg-veltra-emerald/15 text-veltra-emerald"
                : "text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground"
            )}
          >
            <tab.icon className="h-3 w-3" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25, ease: EASE }}
        >
          {activeTab === "conditions" && <ConditionsTab history={history} />}
          {activeTab === "chronic" && <ChronicTab history={history} />}
          {activeTab === "surgeries" && <SurgeriesTab history={history} />}
          {activeTab === "family" && <FamilyTab history={history} />}
          {activeTab === "medications" && <MedHistoryTab history={history} />}
          {activeTab === "allergies" && <AllergiesTab history={history} />}
          {activeTab === "vaccinations" && <VaccinationsTab history={history} />}
          {activeTab === "social" && <SocialTab history={history} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function HistoryRow({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="flex items-baseline gap-2 py-1">
      <span className="text-micro text-muted-foreground/60 normal-case tracking-normal uppercase tracking-wider w-24 flex-shrink-0">{label}</span>
      <span className={cn("text-caption", warn ? "text-amber-300" : "text-foreground")}>{value}</span>
    </div>
  );
}

function ConditionsTab({ history }: { history: ReturnType<typeof getMedicalHistory> }) {
  return (
    <div className="space-y-2">
      {history.conditions.map((c) => (
        <Card key={c.id} className="p-3 veltra-shadow border-0 bg-card/40 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-caption font-medium text-foreground">{c.condition}</p>
              {c.icd10Code && <span className="text-micro text-muted-foreground/60 font-mono normal-case tracking-normal">{c.icd10Code}</span>}
            </div>
            <span className={cn(
              "text-micro px-1.5 py-0 rounded normal-case tracking-normal font-medium",
              c.status === "chronic" ? "bg-amber-500/15 text-amber-300" :
              c.status === "active" ? "bg-blue-500/15 text-blue-300" :
              "bg-emerald-500/15 text-emerald-300"
            )}>{c.status}</span>
          </div>
          <p className="text-micro text-muted-foreground/60 normal-case tracking-normal mt-1">Onset: {new Date(c.onsetDate).toLocaleDateString()}</p>
          {c.notes && <p className="text-micro text-amber-300/80 normal-case tracking-normal mt-0.5 italic">{c.notes}</p>}
        </Card>
      ))}
    </div>
  );
}

function ChronicTab({ history }: { history: ReturnType<typeof getMedicalHistory> }) {
  return (
    <div className="space-y-3">
      {history.chronicDiseases.map((cd) => (
        <Card key={cd.id} className="p-4 veltra-shadow border-0 bg-card/40 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-caption font-medium text-foreground">{cd.disease}</p>
              {cd.icd10Code && <span className="text-micro text-muted-foreground/60 font-mono normal-case tracking-normal">{cd.icd10Code}</span>}
            </div>
            <span className={cn(
              "text-micro px-1.5 py-0 rounded normal-case tracking-normal font-medium",
              cd.currentStatus === "uncontrolled" ? "bg-red-500/15 text-red-300" :
              cd.currentStatus === "controlled" ? "bg-emerald-500/15 text-emerald-300" :
              "bg-amber-500/15 text-amber-300"
            )}>{cd.currentStatus}</span>
          </div>

          {/* Metrics */}
          {cd.metrics && cd.metrics.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-2">
              {cd.metrics.map((m) => (
                <div key={m.label} className="rounded-md bg-foreground/[0.03] p-2">
                  <p className="text-micro text-muted-foreground/60 normal-case tracking-normal">{m.label}</p>
                  <p className={cn(
                    "text-caption font-semibold tabular",
                    m.trend === "up" && m.label.includes("HbA1c") ? "text-red-400" :
                    m.trend === "up" && (m.label.includes("BP") || m.label.includes("Systolic") || m.label.includes("Diastolic")) ? "text-red-400" :
                    m.trend === "down" ? "text-emerald-400" :
                    "text-foreground"
                  )}>
                    {m.value}
                    {m.trend === "up" && <TrendingUp className="inline ml-1 h-2.5 w-2.5" />}
                    {m.trend === "down" && <TrendingDown className="inline ml-1 h-2.5 w-2.5" />}
                    {m.trend === "stable" && <Minus className="inline ml-1 h-2.5 w-2.5" />}
                  </p>
                  <p className="text-micro text-muted-foreground/50 normal-case tracking-normal">Target: {m.target}</p>
                </div>
              ))}
            </div>
          )}

          {cd.treatmentGoals && <p className="text-micro text-muted-foreground/70 normal-case tracking-normal mt-2"><strong>Goals:</strong> {cd.treatmentGoals}</p>}
          {cd.notes && <p className="text-micro text-amber-300/80 normal-case tracking-normal mt-1 italic">{cd.notes}</p>}
          <p className="text-micro text-muted-foreground/50 normal-case tracking-normal mt-1">Next assessment: {new Date(cd.nextAssessmentDue).toLocaleDateString()}</p>
        </Card>
      ))}
    </div>
  );
}

function SurgeriesTab({ history }: { history: ReturnType<typeof getMedicalHistory> }) {
  return (
    <div className="space-y-2">
      {history.surgeries.length === 0 ? (
        <p className="text-micro text-muted-foreground/60 normal-case tracking-normal italic py-4 text-center">No surgical history.</p>
      ) : history.surgeries.map((s) => (
        <Card key={s.id} className="p-3 veltra-shadow border-0 bg-card/40 backdrop-blur-sm">
          <p className="text-caption font-medium text-foreground">{s.procedure}</p>
          <p className="text-micro text-muted-foreground/70 normal-case tracking-normal mt-0.5">
            {new Date(s.date).toLocaleDateString()} · {s.surgeon} · {s.hospital}
          </p>
          {s.complications && <p className="text-micro text-amber-300/80 normal-case tracking-normal mt-0.5 italic">{s.complications}</p>}
        </Card>
      ))}
    </div>
  );
}

function FamilyTab({ history }: { history: ReturnType<typeof getMedicalHistory> }) {
  return (
    <div className="space-y-2">
      {history.familyHistory.map((f) => (
        <Card key={f.id} className="p-3 veltra-shadow border-0 bg-card/40 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="text-micro px-1.5 py-0 rounded bg-foreground/[0.04] text-muted-foreground capitalize normal-case tracking-normal">{f.relation}</span>
            <p className="text-caption font-medium text-foreground">{f.condition}</p>
          </div>
          <p className="text-micro text-muted-foreground/70 normal-case tracking-normal mt-0.5">
            Onset: {f.ageOfOnset || "?"}y · {f.status === "deceased" ? `Deceased at ${f.ageOfDeath || "?"}` : "Alive"}
          </p>
          {f.notes && <p className="text-micro text-muted-foreground/60 normal-case tracking-normal mt-0.5 italic">{f.notes}</p>}
        </Card>
      ))}
    </div>
  );
}

function MedHistoryTab({ history }: { history: ReturnType<typeof getMedicalHistory> }) {
  return (
    <div className="space-y-2">
      {history.medicationHistory.map((m) => (
        <Card key={m.id} className="p-3 veltra-shadow border-0 bg-card/40 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-caption font-medium text-foreground">{m.medication} {m.dosage}</p>
              <p className="text-micro text-muted-foreground/70 normal-case tracking-normal mt-0.5">
                {new Date(m.startDate).toLocaleDateString()} — {m.endDate ? new Date(m.endDate).toLocaleDateString() : "ongoing"} · {m.prescriber}
              </p>
            </div>
            <span className={cn(
              "text-micro px-1.5 py-0 rounded normal-case tracking-normal font-medium",
              m.outcome === "ongoing" ? "bg-emerald-500/15 text-emerald-300" :
              m.outcome === "effective" ? "bg-blue-500/15 text-blue-300" :
              m.outcome === "discontinued" ? "bg-amber-500/15 text-amber-300" :
              m.outcome === "adverse_reaction" ? "bg-red-500/15 text-red-300" :
              "bg-foreground/[0.04] text-muted-foreground"
            )}>{m.outcome || "unknown"}</span>
          </div>
          {m.notes && <p className="text-micro text-muted-foreground/60 normal-case tracking-normal mt-0.5 italic">{m.notes}</p>}
        </Card>
      ))}
    </div>
  );
}

function AllergiesTab({ history }: { history: ReturnType<typeof getMedicalHistory> }) {
  return (
    <div className="space-y-2">
      {history.allergies.map((a) => (
        <Card key={a.id} className={cn(
          "p-3 veltra-shadow border-0 backdrop-blur-sm",
          a.severity === "severe" || a.severity === "anaphylaxis" ? "bg-red-500/[0.04] ring-1 ring-red-500/20" : "bg-amber-500/[0.04] ring-1 ring-amber-500/20"
        )}>
          <div className="flex items-center gap-2">
            <AlertTriangle className={cn("h-4 w-4", a.severity === "severe" || a.severity === "anaphylaxis" ? "text-red-400" : "text-amber-400")} />
            <p className="text-caption font-medium text-foreground">{a.allergen}</p>
            <span className={cn(
              "text-micro px-1.5 py-0 rounded normal-case tracking-normal font-medium",
              a.severity === "severe" || a.severity === "anaphylaxis" ? "bg-red-500/15 text-red-300" : "bg-amber-500/15 text-amber-300"
            )}>{a.severity}</span>
          </div>
          <p className="text-micro text-muted-foreground/70 normal-case tracking-normal mt-1">
            Reaction: {a.reaction} · Type: {a.type} · Since: {new Date(a.firstObserved).toLocaleDateString()}
          </p>
          {a.notes && <p className="text-micro text-amber-300/80 normal-case tracking-normal mt-0.5 italic">{a.notes}</p>}
        </Card>
      ))}
    </div>
  );
}

function VaccinationsTab({ history }: { history: ReturnType<typeof getMedicalHistory> }) {
  return (
    <div className="space-y-2">
      {history.vaccinations.map((v) => (
        <Card key={v.id} className="p-3 veltra-shadow border-0 bg-card/40 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-caption font-medium text-foreground">{v.vaccine}</p>
              <p className="text-micro text-muted-foreground/70 normal-case tracking-normal mt-0.5">
                {new Date(v.date).toLocaleDateString()} · {v.administeredBy}
                {v.doseNumber && ` · Dose ${v.doseNumber}`}
                {v.route && ` · ${v.route}`}
              </p>
            </div>
            {v.nextDue && (
              new Date(v.nextDue) < new Date()
                ? <span className="text-micro px-1.5 py-0 rounded bg-amber-500/15 text-amber-300 normal-case tracking-normal font-medium">Due</span>
                : <span className="text-micro text-muted-foreground/60 normal-case tracking-normal">Next: {new Date(v.nextDue).toLocaleDateString()}</span>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

function SocialTab({ history }: { history: ReturnType<typeof getMedicalHistory> }) {
  const sh = history.socialHistory;
  if (!sh) return <p className="text-micro text-muted-foreground/60 italic py-4 text-center">No social history recorded.</p>;

  return (
    <Card className="p-4 veltra-shadow border-0 bg-card/40 backdrop-blur-sm space-y-1">
      <HistoryRow label="Smoking" value={sh.smokingStatus === "former" ? `Former smoker (${sh.yearsSmoked}y, quit ${new Date(sh.quitDate || "").toLocaleDateString()})` : sh.smokingStatus === "current" ? "Current smoker" : sh.smokingStatus === "never" ? "Never smoked" : "N/A"} warn={sh.smokingStatus === "current"} />
      <HistoryRow label="Alcohol" value={sh.alcoholUse === "never" ? "Never" : sh.alcoholUse === "occasional" ? "Occasional" : sh.alcoholUse === "moderate" ? "Moderate" : sh.alcoholUse === "heavy" ? "Heavy" : sh.alcoholUse === "former" ? "Former drinker" : "N/A"} warn={sh.alcoholUse === "heavy"} />
      <HistoryRow label="Drugs" value={sh.drugUse === "never" ? "Never" : sh.drugUse === "former" ? "Former" : sh.drugUse === "current" ? "Current" : "N/A"} warn={sh.drugUse === "current"} />
      <HistoryRow label="Occupation" value={sh.occupation || "N/A"} />
      <HistoryRow label="Exercise" value={`${sh.exerciseFrequency || "N/A"}${sh.exerciseType ? ` — ${sh.exerciseType}` : ""}`} />
      <HistoryRow label="Diet" value={sh.diet || "N/A"} />
      <HistoryRow label="Caffeine" value={sh.caffeineIntake || "N/A"} />
      <HistoryRow label="Sleep" value={sh.sleepHours ? `${sh.sleepHours} hrs` : "N/A"} />
      <HistoryRow label="Education" value={sh.educationLevel || "N/A"} />
      <HistoryRow label="Living" value={sh.livingSituation || "N/A"} />
    </Card>
  );
}

/* =========================================================================
   3. LAB TRENDS CHART
   ========================================================================= */
export function LabTrendsSection({ patientId }: { patientId: string }) {
  const ready = useDelayedReady(350);
  const labResults = useVeltra((s) => s.labResults);
  const trends = useMemo(() => computeLabTrends(labResults, patientId), [labResults, patientId]);

  if (!ready) return <SkeletonList count={3} />;

  if (trends.length === 0) {
    return (
      <Card className="p-6 text-center veltra-shadow border-0 bg-card/30 backdrop-blur-sm">
        <FlaskConical className="h-6 w-6 text-muted-foreground/30 mx-auto mb-2" />
        <p className="text-caption text-muted-foreground">No lab trends available.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {trends.map((trend) => (
        <LabTrendCard key={trend.testType} trend={trend} />
      ))}
    </div>
  );
}

function LabTrendCard({ trend }: { trend: LabTrend }) {
  const isAbnormal = trend.lastStatus !== "normal";
  const isCritical = trend.lastStatus === "critical";

  // Build simple sparkline from values
  const values = trend.values.map((v) => parseFloat(v.value)).filter((v) => !isNaN(v));
  const max = Math.max(...values, 0);
  const min = Math.min(...values, 0);
  const range = max - min || 1;

  return (
    <Card className={cn(
      "p-4 veltra-shadow border-0 bg-card/40 backdrop-blur-sm",
      isCritical && "ring-1 ring-red-500/20",
      isAbnormal && !isCritical && "ring-1 ring-amber-500/20"
    )}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-caption font-medium text-foreground">{trend.testType}</p>
          <p className="text-micro text-muted-foreground/60 normal-case tracking-normal">Normal: {trend.normalRange}</p>
        </div>
        <div className="text-right">
          <p className={cn(
            "text-body font-bold tabular",
            isCritical ? "text-red-400" : isAbnormal ? "text-amber-400" : "text-emerald-400"
          )}>
            {trend.lastValue} <span className="text-micro font-normal">{trend.unit}</span>
          </p>
          <div className="flex items-center gap-1 justify-end mt-0.5">
            {trend.trend === "improving" && <TrendingDown className="h-3 w-3 text-emerald-400" />}
            {trend.trend === "worsening" && <TrendingUp className="h-3 w-3 text-red-400" />}
            {trend.trend === "stable" && <Minus className="h-3 w-3 text-muted-foreground" />}
            <span className={cn(
              "text-micro normal-case tracking-normal",
              trend.trend === "improving" ? "text-emerald-400" :
              trend.trend === "worsening" ? "text-red-400" : "text-muted-foreground"
            )}>
              {trend.deltaFromLast !== undefined ? `${trend.deltaFromLast > 0 ? "+" : ""}${trend.deltaFromLast}%` : "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* Sparkline */}
      {values.length > 1 && (
        <div className="flex items-end gap-1 h-8 mt-2" role="img" aria-label={`${trend.testType} trend: ${trend.lastValue} ${trend.unit}, ${trend.trend}`}>
          {values.map((val, i) => {
            const heightPct = ((val - min) / range) * 100;
            const isLast = i === values.length - 1;
            const status = trend.values[i]?.status;
            return (
              <div
                key={i}
                className={cn(
                  "flex-1 rounded-sm veltra-transition",
                  isLast && status === "critical" ? "bg-red-400" :
                  isLast && status !== "normal" ? "bg-amber-400" :
                  isLast ? "bg-veltra-emerald" :
                  status === "critical" ? "bg-red-400/40" :
                  status !== "normal" ? "bg-amber-400/40" :
                  "bg-foreground/15"
                )}
                style={{ height: `${Math.max(10, heightPct)}%` }}
                title={`${trend.values[i].value} ${trend.unit} — ${new Date(trend.values[i].date).toLocaleDateString()}`}
              />
            );
          })}
        </div>
      )}

      <p className="text-micro text-muted-foreground/50 normal-case tracking-normal mt-1.5">
        Last: {new Date(trend.lastDate).toLocaleDateString()} · {trend.values.length} test{trend.values.length === 1 ? "" : "s"}
      </p>
    </Card>
  );
}

/* =========================================================================
   4. CLINICAL SUGGESTIONS STRIP
   ========================================================================= */
export function ClinicalSuggestionsSection({ patientId }: { patientId: string }) {
  const ready = useDelayedReady(250);
  const patient = useVeltra((s) => s.patients.find((p) => p.id === patientId));
  const prescriptions = useVeltra((s) => s.prescriptions);
  const labResults = useVeltra((s) => s.labResults);
  const setView = useVeltra((s) => s.setView);
  const { toast } = useUseToast();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  if (!ready) return <SkeletonList count={3} />;

  const suggestions = useMemo(() => {
    if (!patient) return [];
    const history = getMedicalHistory(patientId);
    const trends = computeLabTrends(labResults, patientId);
    const activeRx = prescriptions.filter((rx) => rx.patientId === patientId && rx.status === "active");
    return generateClinicalSuggestions(patient, history, trends, activeRx);
  }, [patient, patientId, labResults, prescriptions]);

  const visible = suggestions.filter((s) => !dismissed.has(s.id));

  if (visible.length === 0) {
    return (
      <Card className="p-4 veltra-shadow border-0 bg-emerald-500/[0.04] ring-1 ring-emerald-500/15">
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4 text-emerald-400" />
          <p className="text-caption text-emerald-300">All clinical suggestions addressed. Patient is up to date.</p>
        </div>
      </Card>
    );
  }

  const handleAction = (suggestion: ClinicalSuggestion) => {
    if (suggestion.actionTarget) {
      setView(suggestion.actionTarget as any);
    }
    toast({ title: suggestion.actionLabel, description: suggestion.title });
    setDismissed((prev) => new Set(prev).add(suggestion.id));
  };

  const handleDismiss = (id: string) => {
    setDismissed((prev) => new Set(prev).add(id));
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-3.5 w-3.5 text-veltra-emerald" />
        <p className="text-micro text-veltra-emerald font-medium uppercase tracking-wider">
          Clinical Decision Support — {visible.length} suggestion{visible.length === 1 ? "" : "s"}
        </p>
      </div>
      <StaggerGroup className="space-y-2">
        {visible.map((s) => (
          <StaggerItem key={s.id}>
            <Card className={cn(
              "p-4 veltra-shadow border-0 bg-card/40 backdrop-blur-sm",
              s.priority === "urgent" && "ring-1 ring-red-500/20",
              s.priority === "important" && "ring-1 ring-amber-500/15"
            )}>
              <div className="flex items-start gap-3">
                <div className={cn(
                  "h-7 w-7 rounded-md flex items-center justify-center flex-shrink-0",
                  s.priority === "urgent" ? "bg-red-500/15" :
                  s.priority === "important" ? "bg-amber-500/15" :
                  "bg-veltra-emerald/10"
                )}>
                  {s.type === "lab_order" ? <FlaskConical className={cn("h-3.5 w-3.5", s.priority === "urgent" ? "text-red-400" : s.priority === "important" ? "text-amber-400" : "text-veltra-emerald")} /> :
                   s.type === "medication_review" ? <Pill className={cn("h-3.5 w-3.5", s.priority === "urgent" ? "text-red-400" : s.priority === "important" ? "text-amber-400" : "text-veltra-emerald")} /> :
                   s.type === "referral" ? <Users className={cn("h-3.5 w-3.5", s.priority === "urgent" ? "text-red-400" : s.priority === "important" ? "text-amber-400" : "text-veltra-emerald")} /> :
                   s.type === "vaccination" ? <Syringe className={cn("h-3.5 w-3.5", s.priority === "urgent" ? "text-red-400" : s.priority === "important" ? "text-amber-400" : "text-veltra-emerald")} /> :
                   <Brain className={cn("h-3.5 w-3.5", s.priority === "urgent" ? "text-red-400" : s.priority === "important" ? "text-amber-400" : "text-veltra-emerald")} />
                   }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <p className="text-caption font-medium text-foreground">{s.title}</p>
                    <span className={cn(
                      "text-micro normal-case tracking-normal font-medium",
                      s.priority === "urgent" ? "text-red-400" :
                      s.priority === "important" ? "text-amber-400" : "text-veltra-emerald"
                    )}>{s.priority}</span>
                    <span className="text-micro text-muted-foreground/50 normal-case tracking-normal">{Math.round(s.confidence * 100)}%</span>
                  </div>
                  <p className="text-micro text-muted-foreground/80 normal-case tracking-normal mt-0.5 leading-relaxed">{s.description}</p>
                  <p className="text-micro text-muted-foreground/60 normal-case tracking-normal mt-1 italic">
                    <strong>Evidence:</strong> {s.evidence}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      onClick={() => handleAction(s)}
                      className="text-micro text-veltra-emerald hover:text-veltra-emerald-dark normal-case tracking-normal font-medium flex items-center gap-0.5"
                    >
                      {s.actionLabel}
                      <ChevronRight className="h-2.5 w-2.5" />
                    </button>
                    <button
                      onClick={() => handleDismiss(s.id)}
                      className="text-micro text-muted-foreground/50 hover:text-muted-foreground normal-case tracking-normal"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </div>
  );
}

// Small helper to avoid circular imports
import { useToast as useUseToast } from "@/hooks/use-toast";
