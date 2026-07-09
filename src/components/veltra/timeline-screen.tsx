"use client";

import { useVeltra, canDo, type TimelineEvent, type Patient } from "@/lib/veltra-store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Phone,
  Calendar,
  Bell,
  UserCheck,
  Stethoscope,
  FlaskConical,
  FileText,
  Pill,
  Shield,
  DollarSign,
  ArrowRight,
  StickyNote,
  MessageCircle,
  AlertTriangle,
  Sparkles,
  Mic,
  Activity,
  Download,
  X,
  Plus,
  Printer,
} from "lucide-react";
import { formatDate, formatRelativeTime } from "@/lib/veltra-store";
import { FadeIn, StaggerGroup } from "./motion";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { VeltraPrintLayout } from "./print-layout";
import { HealthScoreCard } from "./health-score-card";
import { computeHealthScore } from "@/lib/health-score";
import { FLAG_CATEGORY_META, FLAG_SEVERITY_META } from "@/lib/health-score";
import { drugSafetyService, type SafetyAlert } from "@/lib/drug-safety";
import { Flag, Loader2 } from "lucide-react";
import {
  SoapNotesSection, MedicalHistorySection, LabTrendsSection, ClinicalSuggestionsSection,
} from "./ehr-components";
import { Component, type ReactNode } from "react";

/** Error boundary that catches errors from EHR components without breaking the whole timeline */
class ErrorBoundaryFallback extends Component<{ label: string; children: ReactNode }, { hasError: boolean; error?: string }> {
  constructor(props: { label: string; children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }
  render() {
    if (this.state.hasError) {
      return (
        <Card className="p-6 text-center veltra-shadow border-0 bg-card/30 backdrop-blur-sm">
          <AlertTriangle className="h-5 w-5 text-amber-400/50 mx-auto mb-2" />
          <p className="text-caption text-muted-foreground">
            {this.props.label} temporarily unavailable.
          </p>
          <p className="text-micro text-muted-foreground/50 normal-case tracking-normal mt-1">
            {this.state.error || "Unknown error"}
          </p>
        </Card>
      );
    }
    return this.props.children;
  }
}

const EVENT_CONFIG: Record<
  TimelineEvent["type"],
  { icon: React.ElementType; tint: string; label: string }
> = {
  call: { icon: Phone, label: "Call", tint: "text-blue-400 bg-blue-500/10" },
  booking: { icon: Calendar, label: "Booking", tint: "text-violet-400 bg-violet-500/10" },
  reminder: { icon: Bell, label: "Reminder", tint: "text-amber-400 bg-amber-500/10" },
  "check-in": { icon: UserCheck, label: "Check-in", tint: "text-purple-400 bg-purple-500/10" },
  diagnosis: { icon: Stethoscope, label: "Diagnosis", tint: "text-emerald-400 bg-emerald-500/10" },
  lab: { icon: FlaskConical, label: "Lab", tint: "text-cyan-400 bg-cyan-500/10" },
  prescription: { icon: Pill, label: "Prescription", tint: "text-rose-400 bg-rose-500/10" },
  payment: { icon: DollarSign, label: "Payment", tint: "text-emerald-400 bg-emerald-500/10" },
  "follow-up": { icon: ArrowRight, label: "Follow-up", tint: "text-orange-400 bg-orange-500/10" },
  note: { icon: StickyNote, label: "Note", tint: "text-slate-400 bg-slate-500/10" },
};

export function TimelineScreen() {
  const patients = useVeltra((s) => s.patients);
  const selectedId = useVeltra((s) => s.selectedPatientId);
  const selectPatient = useVeltra((s) => s.selectPatient);
  const setView = useVeltra((s) => s.setView);
  const appointments = useVeltra((s) => s.appointments);
  const prescriptions = useVeltra((s) => s.prescriptions);
  const labResults = useVeltra((s) => s.labResults);
  const vitals = useVeltra((s) => s.vitals);
  const voiceNotes = useVeltra((s) => s.voiceNotes);
  const role = useVeltra((s) => s.currentUser?.role);
  const currentUser = useVeltra((s) => s.currentUser);
  const canPrescribe = canDo(role, "canPrescribe");
  const canRecordVitals = canDo(role, "canRecordVitals");
  const canVoiceNote = canDo(role, "canVoiceNote");
  const canExport = canDo(role, "canExport");
  const addPrescription = useVeltra((s) => s.addPrescription);
  const addVital = useVeltra((s) => s.addVital);
  const addVoiceNote = useVeltra((s) => s.addVoiceNote);
  const addPatientNote = useVeltra((s) => s.addPatientNote);
  const { toast } = useToast();
  const [rxOpen, setRxOpen] = useState(false);
  const [vitalsOpen, setVitalsOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [rxForm, setRxForm] = useState({ medication: "", dosage: "", frequency: "", duration: "", notes: "" });
  const [rxAlerts, setRxAlerts] = useState<SafetyAlert[]>([]);
  const [rxChecking, setRxChecking] = useState(false);

  /** Close prescription dialog — clears all state to prevent stale alerts/form */
  const closeRxDialog = () => {
    setRxOpen(false);
    setRxForm({ medication: "", dosage: "", frequency: "", duration: "", notes: "" });
    setRxAlerts([]);
    setRxChecking(false);
  };
  const [vitalsForm, setVitalsForm] = useState({ bp_systolic: "", bp_diastolic: "", heartRate: "", temperature: "", bloodSugar: "", oxygenLevel: "", weight: "", notes: "" });
  const [recording, setRecording] = useState(false);
  const [recordSecs, setRecordSecs] = useState(0);

  const patient = patients.find((p) => p.id === selectedId);

  if (!patient) {
    return (
      <div className="min-h-screen veltra-ambient flex items-center justify-center p-6">
        <Card className="p-16 text-center max-w-md veltra-shadow border-0 bg-card/50 backdrop-blur-sm">
          <div className="mx-auto h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-editorial-italic text-body text-muted-foreground">
            Pick a patient to see their story.
          </p>
          <Button size="sm" variant="outline" onClick={() => setView("patients")} className="mt-5 h-9">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            All patients
          </Button>
        </Card>
      </div>
    );
  }

  const initials = patient.name.trim().split(/\s+/).map((n) => n[0] || "").filter(Boolean).slice(0, 2).join("");
  const timeline = [...patient.timeline].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  const nextAppt = appointments.find(
    (a) => a.patientId === patient.id && a.status !== "cancelled" && a.status !== "completed"
  );

  const patientPrescriptions = prescriptions.filter((rx) => rx.patientId === patient.id);
  const patientVitals = vitals.filter((v) => v.patientId === patient.id);
  const patientLabs = labResults.filter((lr) => lr.patientId === patient.id);
  const patientVoiceNotes = voiceNotes.filter((vn) => vn.patientId === patient.id);

  // Compute Health Score — pure function, real data
  const healthScore = computeHealthScore(patient, patientLabs, patientVitals, appointments);

  const handleAddNote = () => {
    const note = noteText.trim();
    if (!note) {
      toast({ title: "Note is empty", description: "Write a note before adding it to the timeline.", variant: "destructive" });
      return;
    }

    addPatientNote(patient.id, note);
    setNoteText("");
    setNoteOpen(false);
    toast({ title: "Note added", description: "Clinical note saved to timeline" });
  };

  return (
    <div className="min-h-screen veltra-ambient">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-8 sm:py-10 md:px-12 md:py-14">
        <FadeIn>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => { selectPatient(null); setView("patients"); }}
            className="mb-6 h-8 text-caption text-muted-foreground hover:text-foreground -ml-2"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            All patients
          </Button>
        </FadeIn>

        {/* ===== Patient header — restructured per enterprise spec ============ */}
        <FadeIn delay={0.05}>
          <Card className="p-6 sm:p-8 mb-8 veltra-shadow-lg veltra-glass border-0 relative overflow-hidden">
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-500/8 rounded-full blur-3xl pointer-events-none" />

            {/* Top row: Avatar + identity + risk/allergy badges */}
            <div className="relative flex flex-col sm:flex-row sm:items-start gap-4 mb-5">
              <div className={cn("h-14 w-14 rounded-full flex items-center justify-center text-base font-semibold flex-shrink-0", patient.avatarColor)}>
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-[2rem] sm:text-[2.25rem] leading-[1.05] tracking-[-0.035em] text-foreground font-semibold">
                  {patient.name}
                </h1>
                <p className="text-caption text-muted-foreground mt-1">
                  {patient.age}{patient.gender} · MRN {patient.id.toUpperCase()} · {patient.phone}
                </p>

                {/* Critical badges — risk, allergies, insurance */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {patient.riskScore >= 70 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-micro bg-red-500/10 text-red-300 border border-red-500/20 normal-case tracking-normal font-medium">
                      <AlertTriangle className="h-2.5 w-2.5" />
                      High risk
                    </span>
                  )}
                  {Array.isArray(patient.allergies) && patient.allergies.length > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-micro bg-amber-500/10 text-amber-300 border border-amber-500/20 normal-case tracking-normal font-medium">
                      <AlertTriangle className="h-2.5 w-2.5" />
                      Allergy: {patient.allergies.join(", ")}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-micro bg-foreground/[0.04] text-muted-foreground border border-border/40 normal-case tracking-normal">
                    <Shield className="h-2.5 w-2.5" />
                    {patient.balance === "paid" ? "Insurance: settled" : patient.balance === "overdue" ? "Balance overdue" : "Insurance: pending"}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-micro bg-foreground/[0.04] text-muted-foreground border border-border/40 normal-case tracking-normal">
                    Prefers {channelLabel(patient.preferredChannel)}
                  </span>
                </div>
              </div>
            </div>

            {/* Primary action — Start Visit (largest button, top of header) */}
            {/* <div className="relative mb-5"> */}
              {/* <Button
                onClick={() => {
                  addPatientNote(patient.id, `New visit started — ${new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`);
                  setRxOpen(true);
                  toast({ title: "Visit started", description: "Prescription pad ready" });
                }}
                className="w-full sm:w-auto h-11 px-6 text-body font-medium veltra-shadow bg-veltra-emerald hover:bg-veltra-emerald-dark text-white border-0 cursor-pointer"
              >
                <Stethoscope className="mr-2 h-4 w-4" />
                Start Visit
              </Button> */}
            {/* </div> */}

            {/* Action bar — 3 groups separated by Dividers */}
            <div className="relative pt-4 border-t border-border/40">
              <div className="flex flex-wrap items-center gap-2">

                {/* Group 1 — Communication */}
                <Button
                  size="sm"
                  variant="outline"
                  asChild
                  className="h-9 px-3 text-caption veltra-shadow border-0 bg-foreground/[0.04] hover:bg-blue-500/10 hover:text-blue-400"
                >
                  <a href={`tel:${patient.phone.replace(/\s+/g, "")}`} aria-label={`Call ${patient.name}`}>
                    <Phone className="mr-1.5 h-3.5 w-3.5" />
                    Call
                  </a>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { selectPatient(patient.id); setView("messages"); toast({ title: `Opened chat with ${patient.name.split(" ")[0]}` }); }}
                  className="h-9 px-3 text-caption veltra-shadow border-0 bg-foreground/[0.04] hover:bg-emerald-500/10 hover:text-veltra-emerald cursor-pointer"
                >
                  <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
                  Message
                </Button>

                <Divider />

                {/* Group 2 — Care (clinical actions) */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { selectPatient(patient.id); setView("labs"); toast({ title: "Lab ordering", description: `Ordering labs for ${patient.name.split(" ")[0]}` }); }}
                  className="h-9 px-3 text-caption veltra-shadow border-0 bg-foreground/[0.04] hover:bg-cyan-500/10 hover:text-cyan-400 cursor-pointer"
                >
                  <FlaskConical className="mr-1.5 h-3.5 w-3.5" />
                  Order Labs
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { setRxOpen(true); toast({ title: "Prescription pad", description: `Writing Rx for ${patient.name.split(" ")[0]}` }); }}
                  className="h-9 px-3 text-caption veltra-shadow border-0 bg-foreground/[0.04] hover:bg-rose-500/10 hover:text-rose-400 cursor-pointer"
                >
                  <Pill className="mr-1.5 h-3.5 w-3.5" />
                  Prescription
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    selectPatient(patient.id);
                    setView("appointments");
                    toast({
                      title: nextAppt ? `Next visit: ${nextAppt.time} today` : "No upcoming visit",
                      description: nextAppt ? nextAppt.type : "Book a follow-up from here",
                    });
                  }}
                  className="h-9 px-3 text-caption veltra-shadow border-0 bg-foreground/[0.04] hover:bg-violet-500/10 hover:text-violet-400 cursor-pointer"
                >
                  <Calendar className="mr-1.5 h-3.5 w-3.5" />
                  Follow-up
                </Button>

                <Divider />

                {/* Group 3 — More (export, secondary) */}
                <div className="ml-auto flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.print()}
                    className="h-9 px-3 text-caption veltra-shadow border-0 bg-foreground/[0.04] hover:bg-foreground/[0.08] cursor-pointer"
                  >
                    <Printer className="mr-1.5 h-3.5 w-3.5" />
                    Print
                  </Button>
                </div>
              </div>

              
            </div>

            {/* ===== CONTEXT — glass with emerald glow ============ */}
            <div className="mt-6 rounded-xl veltra-glass p-5 relative">
              <div className="flex items-center gap-1.5 mb-3">
                <Sparkles className="h-3 w-3 text-veltra-emerald" />
                <span className="text-micro text-veltra-emerald">Context</span>
                <span className="text-micro text-muted-foreground/60 font-normal normal-case tracking-normal">
                  — what Veltra remembers
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
                <ContextRow label="Conditions" value={patient.conditions.length ? patient.conditions.join(", ") : "None on file"} />
                <ContextRow label="Allergies" value={Array.isArray(patient.allergies) && patient.allergies.length ? patient.allergies.join(", ") : "None"} warn={Array.isArray(patient.allergies) && patient.allergies.length > 0} />
                <ContextRow label="Visit pattern" value={patient.visitPattern} />
                <ContextRow label="Last visit" value={formatRelativeTime(patient.lastVisit)} />
                <ContextRow
                  label="Balance"
                  value={
                    patient.balance === "paid"
                      ? "Paid in full"
                      : `${patient.balance === "overdue" ? "Overdue" : "Due"} ${patient.balanceAmount ? `$${patient.balanceAmount}` : ""}`
                  }
                  warn={patient.balance !== "paid"}
                />
                <ContextRow label="Doctor" value={patient.doctor} />
              </div>
            </div>

            {/* ===== HEALTH SCORE — computed from vitals + labs + conditions + adherence ===== */}
            {healthScore && (
              <div className="mt-6">
                <HealthScoreCard score={healthScore} />
              </div>
            )}

            {/* ===== PATIENT FLAGS — operational tags (NOT personal ratings) ===== */}
            {patient.flags && patient.flags.length > 0 && (
              <div className="mt-6 rounded-xl veltra-glass p-5 relative">
                <div className="flex items-center gap-1.5 mb-3">
                  <Flag className="h-3 w-3 text-veltra-emerald" />
                  <span className="text-micro text-veltra-emerald">Care Signals</span>
                  <span className="text-micro text-muted-foreground/60 font-normal normal-case tracking-normal">
                    — operational flags for care coordination
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {patient.flags.map((flag) => {
                    const sev = FLAG_SEVERITY_META[flag.severity];
                    const cat = FLAG_CATEGORY_META[flag.category];
                    return (
                      <span
                        key={flag.id}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-micro font-medium border normal-case tracking-normal",
                          sev.bg, sev.text, sev.border
                        )}
                        title={`Set by ${flag.setBy} · ${formatRelativeTime(flag.setAt)}`}
                      >
                        <span>{cat.icon}</span>
                        {flag.label}
                      </span>
                    );
                  })}
                </div>
                <p className="text-micro text-muted-foreground/50 normal-case tracking-normal mt-3 italic">
                  These are operational signals for care coordination — not personal ratings. Used to improve care quality, not to judge patients.
                </p>
              </div>
            )}
          </Card>
        </FadeIn>

        {/* ===== Timeline ============ */}
        <FadeIn delay={0.1}>
          <div className="mb-5 flex items-baseline justify-between">
            <h2 className="text-title text-foreground">Timeline</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setNoteOpen(true)}
                className="text-micro text-muted-foreground hover:text-foreground veltra-transition flex items-center gap-1"
              >
                <StickyNote className="h-3 w-3" />
                Add note
              </button>
              <span className="text-caption text-muted-foreground">{timeline.length} events</span>
            </div>
          </div>
        </FadeIn>

        <Card className="p-8 sm:p-10 veltra-shadow border-0 bg-card/50 backdrop-blur-sm">
          <StaggerGroup stagger={0.08}>
            <div className="relative">
              <div className="absolute left-[19px] top-3 bottom-3 w-px bg-border/60" />
              <ol className="space-y-6">
                {timeline.map((event) => {
                  const cfg = EVENT_CONFIG[event.type];
                  const Icon = cfg.icon;
                  return (
                    <li key={event.id} className="relative flex gap-4">
                        <div className={cn("relative z-10 h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-background", cfg.tint)}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0 pt-1.5">
                          <div className="flex items-baseline justify-between gap-3 flex-wrap">
                            <p className="text-body font-medium text-foreground">{event.title}</p>
                            <span className="text-micro text-muted-foreground/70 tabular normal-case tracking-normal">
                              {formatDate(event.timestamp)}
                            </span>
                          </div>
                          {event.description && (
                            <p className="text-caption text-muted-foreground mt-1 leading-relaxed">{event.description}</p>
                          )}
                          <p className="text-micro text-muted-foreground/60 mt-1.5 normal-case tracking-normal">
                            {event.actor} · {formatRelativeTime(event.timestamp)}
                          </p>
                        </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </StaggerGroup>
        </Card>

        {/* ===== Clinical Decision Support — AI suggestions ===== */}
        <FadeIn delay={0.12}>
          <div className="mt-8">
            <ErrorBoundaryFallback label="Clinical Suggestions">
              <ClinicalSuggestionsSection patientId={patient.id} />
            </ErrorBoundaryFallback>
          </div>
        </FadeIn>

        {/* ===== SOAP Notes ===== */}
        <FadeIn delay={0.15}>
          <div className="mt-8">
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-title text-foreground flex items-center gap-2">
                <FileText className="h-4 w-4 text-veltra-emerald" />
                SOAP Notes
              </h2>
            </div>
            <ErrorBoundaryFallback label="SOAP Notes">
              <SoapNotesSection patientId={patient.id} />
            </ErrorBoundaryFallback>
          </div>
        </FadeIn>

        {/* ===== Medical History ===== */}
        <FadeIn delay={0.18}>
          <div className="mt-8">
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-title text-foreground flex items-center gap-2">
                <Activity className="h-4 w-4 text-violet-400" />
                Medical History
              </h2>
            </div>
            <ErrorBoundaryFallback label="Medical History">
              <MedicalHistorySection patientId={patient.id} />
            </ErrorBoundaryFallback>
          </div>
        </FadeIn>

        {/* ===== Lab Trends ===== */}
        <FadeIn delay={0.2}>
          <div className="mt-8">
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-title text-foreground flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-cyan-400" />
                Lab Trends
              </h2>
            </div>
            <ErrorBoundaryFallback label="Lab Trends">
              <LabTrendsSection patientId={patient.id} />
            </ErrorBoundaryFallback>
          </div>
        </FadeIn>

        {/* ===== Prescriptions ===== */}
        <FadeIn delay={0.25}>
          <div className="mt-8">
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-title text-foreground flex items-center gap-2">
                <Pill className="h-4 w-4 text-rose-400" />
                Prescriptions
              </h2>
              {canPrescribe && (
                <Button size="sm" variant="outline" onClick={() => setRxOpen(true)} className="h-7 text-caption veltra-shadow border-0 bg-foreground/[0.04]">
                  <Plus className="mr-1 h-3 w-3" />
                  New
                </Button>
              )}
            </div>
            <Card className="veltra-shadow border-0 bg-card/50 backdrop-blur-sm overflow-hidden">
              {patientPrescriptions.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <p className="text-editorial-italic text-caption text-muted-foreground">No prescriptions on file.</p>
                </div>
              ) : (
                patientPrescriptions.map((rx, idx) => (
                  <div key={rx.id} className={cn("flex items-center gap-4 px-6 py-4", idx !== patientPrescriptions.length - 1 && "border-b border-border/40")}>
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-rose-500/10 flex items-center justify-center">
                      <Pill className="h-3.5 w-3.5 text-rose-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-body font-medium text-foreground">{rx.medication} <span className="text-muted-foreground">{rx.dosage}</span></p>
                      <p className="text-caption text-muted-foreground">{rx.frequency} · {rx.duration} · {rx.doctorName}</p>
                      {rx.notes && <p className="text-caption text-muted-foreground/70 italic mt-0.5">{rx.notes}</p>}
                    </div>
                    <Badge variant="outline" className={cn("text-micro font-medium border",
                      rx.status === "active" ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" :
                      rx.status === "cancelled" ? "bg-slate-500/10 text-slate-400 border-slate-500/20" :
                      "bg-slate-500/10 text-slate-300 border-slate-500/20"
                    )}>
                      {rx.status}
                    </Badge>
                  </div>
                ))
              )}
            </Card>
          </div>
        </FadeIn>

        {/* ===== Vitals ===== */}
        <FadeIn delay={0.3}>
          <div className="mt-8">
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-title text-foreground flex items-center gap-2">
                <Activity className="h-4 w-4 text-violet-400" />
                Vitals
              </h2>
              {canRecordVitals && (
                <Button size="sm" variant="outline" onClick={() => setVitalsOpen(true)} className="h-7 text-caption veltra-shadow border-0 bg-foreground/[0.04]">
                  <Plus className="mr-1 h-3 w-3" />
                  Record
                </Button>
              )}
            </div>
            <Card className="veltra-shadow border-0 bg-card/50 backdrop-blur-sm overflow-hidden">
              {patientVitals.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <p className="text-editorial-italic text-caption text-muted-foreground">No vitals recorded yet.</p>
                </div>
              ) : (
                patientVitals.map((v, idx) => (
                  <div key={v.id} className={cn("px-6 py-4", idx !== patientVitals.length - 1 && "border-b border-border/40")}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-caption font-medium text-foreground">{v.recordedBy} ({v.recordedByRole})</p>
                      <span className="text-micro text-muted-foreground/70 normal-case tracking-normal">{formatDate(v.timestamp)}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {v.bp_systolic && <VitalCell label="BP" value={`${v.bp_systolic}/${v.bp_diastolic}`} unit="mmHg" />}
                      {v.heartRate && <VitalCell label="HR" value={String(v.heartRate)} unit="bpm" />}
                      {v.temperature && <VitalCell label="Temp" value={String(v.temperature)} unit="°C" />}
                      {v.bloodSugar && <VitalCell label="Glucose" value={String(v.bloodSugar)} unit="mmol/L" />}
                      {v.oxygenLevel && <VitalCell label="SpO₂" value={String(v.oxygenLevel)} unit="%" />}
                      {v.weight && <VitalCell label="Weight" value={String(v.weight)} unit="kg" />}
                    </div>
                    {v.notes && <p className="text-caption text-muted-foreground/70 italic mt-2">{v.notes}</p>}
                  </div>
                ))
              )}
            </Card>
          </div>
        </FadeIn>

        {/* ===== Lab Results ===== */}
        <FadeIn delay={0.35}>
          <div className="mt-8">
            <h2 className="text-title text-foreground mb-4 flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-cyan-400" />
              Lab Results
            </h2>
            <Card className="veltra-shadow border-0 bg-card/50 backdrop-blur-sm overflow-hidden">
              {patientLabs.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <p className="text-editorial-italic text-caption text-muted-foreground">No lab results yet.</p>
                </div>
              ) : (
                patientLabs.map((lr, idx) => (
                  <div key={lr.id} className={cn("flex items-center gap-4 px-6 py-4", idx !== patientLabs.length - 1 && "border-b border-border/40")}>
                    <div className="flex-1 min-w-0">
                      <p className="text-body font-medium text-foreground">{lr.testType}</p>
                      <p className="text-caption text-muted-foreground">Normal: {lr.normalRange} · {lr.orderedBy}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-body font-semibold tabular text-foreground">{lr.value} <span className="text-muted-foreground font-normal">{lr.unit}</span></p>
                      <Badge variant="outline" className={cn("text-micro font-medium border mt-1",
                        lr.status === "normal" ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" :
                        lr.status === "critical" ? "bg-red-500/10 text-red-300 border-red-500/20" :
                        "bg-amber-500/10 text-amber-300 border-amber-500/20"
                      )}>
                        {lr.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </Card>
          </div>
        </FadeIn>

        {/* ===== Voice Notes ===== */}
        {(canVoiceNote || patientVoiceNotes.length > 0) && (
          <FadeIn delay={0.4}>
            <div className="mt-8">
              <div className="flex items-baseline justify-between mb-4">
                <h2 className="text-title text-foreground flex items-center gap-2">
                  <Mic className="h-4 w-4 text-amber-400" />
                  Voice Notes
                </h2>
                {canVoiceNote && (
                  <Button size="sm" variant="outline" onClick={() => setVoiceOpen(true)} className="h-7 text-caption veltra-shadow border-0 bg-foreground/[0.04]">
                    <Mic className="mr-1 h-3 w-3" />
                    Record
                  </Button>
                )}
              </div>
              <Card className="veltra-shadow border-0 bg-card/50 backdrop-blur-sm overflow-hidden">
                {patientVoiceNotes.length === 0 ? (
                  <div className="px-6 py-8 text-center">
                    <p className="text-editorial-italic text-caption text-muted-foreground">No voice notes yet.</p>
                  </div>
                ) : (
                  patientVoiceNotes.map((vn, idx) => (
                    <div key={vn.id} className={cn("px-6 py-4", idx !== patientVoiceNotes.length - 1 && "border-b border-border/40")}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                          <Mic className="h-3.5 w-3.5 text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-caption font-medium text-foreground">{vn.recordedBy}</p>
                          <p className="text-micro text-muted-foreground/70 normal-case tracking-normal">{formatRelativeTime(vn.timestamp)} · {vn.durationSec}s</p>
                        </div>
                      </div>
                      <p className="text-caption text-muted-foreground italic pl-11">"{vn.transcript}"</p>
                    </div>
                  ))
                )}
              </Card>
            </div>
          </FadeIn>
        )}

        {/* ===== Export ===== */}
        {canExport && (
          <FadeIn delay={0.45}>
            <div className="mt-8">
              <Button
                variant="outline"
                onClick={() => exportPatientData(patient, patientPrescriptions, patientVitals, patientLabs, patientVoiceNotes)}
                className="h-10 px-5 veltra-shadow border-0 bg-foreground/[0.04] text-foreground"
              >
                <Download className="mr-1.5 h-4 w-4" />
                Export patient data (CSV)
              </Button>
            </div>
          </FadeIn>
        )}

        <FadeIn delay={0.5}>
          <p className="text-center mt-8 text-editorial-italic text-muted-foreground/50 text-sm">
            Every interaction becomes a memory.
          </p>
        </FadeIn>

        {/* ===== Prescription Dialog ===== */}
        {rxOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6" onClick={closeRxDialog}>
            <div className="bg-card/95 backdrop-blur-2xl rounded-2xl veltra-shadow-lg max-w-md w-full p-6 border border-border/40" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-title text-foreground flex items-center gap-2">
                  <Pill className="h-4 w-4 text-rose-400" /> New Prescription
                </h3>
                <button onClick={closeRxDialog} className="text-muted-foreground hover:text-foreground" aria-label="Close dialog"><X className="h-4 w-4" /></button>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-micro text-muted-foreground">Medication</Label><Input value={rxForm.medication} onChange={(e) => setRxForm({ ...rxForm, medication: e.target.value })} placeholder="Metformin" className="h-10 mt-1" /></div>
                  <div><Label className="text-micro text-muted-foreground">Dosage</Label><Input value={rxForm.dosage} onChange={(e) => setRxForm({ ...rxForm, dosage: e.target.value })} placeholder="1000mg" className="h-10 mt-1" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-micro text-muted-foreground">Frequency</Label><Input value={rxForm.frequency} onChange={(e) => setRxForm({ ...rxForm, frequency: e.target.value })} placeholder="Twice daily" className="h-10 mt-1" /></div>
                  <div><Label className="text-micro text-muted-foreground">Duration</Label><Input value={rxForm.duration} onChange={(e) => setRxForm({ ...rxForm, duration: e.target.value })} placeholder="90 days" className="h-10 mt-1" /></div>
                </div>
                <div><Label className="text-micro text-muted-foreground">Notes</Label><Input value={rxForm.notes} onChange={(e) => setRxForm({ ...rxForm, notes: e.target.value })} placeholder="Take with meals" className="h-10 mt-1" /></div>
              </div>
              {/* Drug Safety Alerts */}
              {rxAlerts.length > 0 && (
                <div className="space-y-1.5 mt-3">
                  {rxAlerts.map((alert, i) => (
                    <div key={i} className={cn(
                      "rounded-lg p-3 border text-caption",
                      alert.severity === "critical" ? "bg-red-500/[0.04] border-red-500/20 text-red-300" :
                      alert.severity === "warning" ? "bg-amber-500/[0.04] border-amber-500/20 text-amber-300" :
                      "bg-blue-500/[0.04] border-blue-500/20 text-blue-300"
                    )}>
                      <p className="font-medium">{alert.title}</p>
                      <p className="text-micro text-muted-foreground/80 normal-case tracking-normal mt-0.5">{alert.description}</p>
                      <p className="text-micro text-muted-foreground/60 normal-case tracking-normal mt-0.5 italic">→ {alert.suggestion}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2 mt-5">
                <Button variant="ghost" onClick={closeRxDialog} className="flex-1 h-10">Cancel</Button>
                <Button
                  onClick={async () => {
                    if (!rxForm.medication || !rxForm.dosage) { toast({ title: "Missing fields", variant: "destructive" }); return; }

                    // Run real drug safety check before prescribing
                    setRxChecking(true);
                    try {
                    const safetyResult = await drugSafetyService.check({
                      medication: rxForm.medication,
                      dosage: rxForm.dosage,
                      patientAllergies: patient.allergies || [],
                      currentMedications: patientPrescriptions
                        .filter((rx) => rx.status === "active")
                        .map((rx) => rx.medication),
                      patientAge: patient.age,
                      patientGender: patient.gender,
                    });

                    if (safetyResult.recommendation === "do_not_prescribe") {
                      setRxAlerts(safetyResult.alerts);
                      toast({
                        title: "⚠ Prescription blocked",
                        description: `${safetyResult.alerts.filter(a => a.severity === "critical").length} critical safety alert(s) — review before prescribing`,
                        variant: "destructive",
                      });
                      return;
                    }

                    if (safetyResult.alerts.length > 0) {
                      setRxAlerts(safetyResult.alerts);
                    }

                    addPrescription({ patientId: patient.id, patientName: patient.name, doctorId: currentUser?.id || "", doctorName: currentUser?.name || "", medication: rxForm.medication, dosage: rxForm.dosage, frequency: rxForm.frequency, duration: rxForm.duration, notes: rxForm.notes });
                    closeRxDialog();
                    toast({
                      title: "Prescription added ✓",
                      description: safetyResult.alerts.length > 0
                        ? `${rxForm.medication} ${rxForm.dosage} · ${safetyResult.alerts.length} safety note(s)`
                        : `${rxForm.medication} ${rxForm.dosage} · no safety concerns`,
                    });
                    } catch (error) {
                      console.error("[Prescription] Safety check error:", error);
                      toast({ title: "Safety check failed", description: "Could not verify drug safety. Please try again.", variant: "destructive" });
                    } finally {
                      setRxChecking(false);
                    }
                  }}
                  disabled={rxChecking}
                  className="flex-1 h-10 bg-veltra-emerald hover:bg-veltra-emerald-dark text-white"
                >
                  {rxChecking ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      Checking safety...
                    </>
                  ) : (
                    "Prescribe"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ===== Vitals Dialog ===== */}
        {vitalsOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setVitalsOpen(false)}>
            <div className="bg-card/95 backdrop-blur-2xl rounded-2xl veltra-shadow-lg max-w-md w-full p-6 border border-border/40" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-title text-foreground flex items-center gap-2">
                  <Activity className="h-4 w-4 text-violet-400" /> Record Vitals
                </h3>
                <button onClick={() => setVitalsOpen(false)} className="text-muted-foreground hover:text-foreground" aria-label="Close dialog"><X className="h-4 w-4" /></button>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-micro text-muted-foreground">BP Systolic</Label><Input type="number" value={vitalsForm.bp_systolic} onChange={(e) => setVitalsForm({ ...vitalsForm, bp_systolic: e.target.value })} placeholder="120" className="h-10 mt-1" /></div>
                  <div><Label className="text-micro text-muted-foreground">BP Diastolic</Label><Input type="number" value={vitalsForm.bp_diastolic} onChange={(e) => setVitalsForm({ ...vitalsForm, bp_diastolic: e.target.value })} placeholder="80" className="h-10 mt-1" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-micro text-muted-foreground">Heart Rate</Label><Input type="number" value={vitalsForm.heartRate} onChange={(e) => setVitalsForm({ ...vitalsForm, heartRate: e.target.value })} placeholder="72" className="h-10 mt-1" /></div>
                  <div><Label className="text-micro text-muted-foreground">Temperature °C</Label><Input type="number" step="0.1" value={vitalsForm.temperature} onChange={(e) => setVitalsForm({ ...vitalsForm, temperature: e.target.value })} placeholder="36.8" className="h-10 mt-1" /></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div><Label className="text-micro text-muted-foreground">Glucose</Label><Input type="number" step="0.1" value={vitalsForm.bloodSugar} onChange={(e) => setVitalsForm({ ...vitalsForm, bloodSugar: e.target.value })} placeholder="5.5" className="h-10 mt-1" /></div>
                  <div><Label className="text-micro text-muted-foreground">SpO₂ %</Label><Input type="number" value={vitalsForm.oxygenLevel} onChange={(e) => setVitalsForm({ ...vitalsForm, oxygenLevel: e.target.value })} placeholder="98" className="h-10 mt-1" /></div>
                  <div><Label className="text-micro text-muted-foreground">Weight kg</Label><Input type="number" value={vitalsForm.weight} onChange={(e) => setVitalsForm({ ...vitalsForm, weight: e.target.value })} placeholder="70" className="h-10 mt-1" /></div>
                </div>
                <div><Label className="text-micro text-muted-foreground">Notes</Label><Input value={vitalsForm.notes} onChange={(e) => setVitalsForm({ ...vitalsForm, notes: e.target.value })} placeholder="Optional notes" className="h-10 mt-1" /></div>
              </div>
              <div className="flex gap-2 mt-5">
                <Button variant="ghost" onClick={() => setVitalsOpen(false)} className="flex-1 h-10">Cancel</Button>
                <Button onClick={() => {
                  addVital({
                    patientId: patient.id, patientName: patient.name,
                    recordedBy: currentUser?.name || "Unknown", recordedByRole: currentUser?.role || "nurse",
                    bp_systolic: vitalsForm.bp_systolic ? Number(vitalsForm.bp_systolic) : undefined,
                    bp_diastolic: vitalsForm.bp_diastolic ? Number(vitalsForm.bp_diastolic) : undefined,
                    heartRate: vitalsForm.heartRate ? Number(vitalsForm.heartRate) : undefined,
                    temperature: vitalsForm.temperature ? Number(vitalsForm.temperature) : undefined,
                    bloodSugar: vitalsForm.bloodSugar ? Number(vitalsForm.bloodSugar) : undefined,
                    oxygenLevel: vitalsForm.oxygenLevel ? Number(vitalsForm.oxygenLevel) : undefined,
                    weight: vitalsForm.weight ? Number(vitalsForm.weight) : undefined,
                    notes: vitalsForm.notes,
                  });
                  setVitalsOpen(false); setVitalsForm({ bp_systolic: "", bp_diastolic: "", heartRate: "", temperature: "", bloodSugar: "", oxygenLevel: "", weight: "", notes: "" });
                  toast({ title: "Vitals recorded ✓" });
                }} className="flex-1 h-10 bg-veltra-emerald hover:bg-veltra-emerald-dark text-white" disabled={!vitalsForm.bp_systolic && !vitalsForm.heartRate && !vitalsForm.temperature && !vitalsForm.bloodSugar && !vitalsForm.oxygenLevel && !vitalsForm.weight && !vitalsForm.notes}>Record</Button>
              </div>
            </div>
          </div>
        )}

        {/* ===== Voice Note Dialog (mock) ===== */}
        {voiceOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setVoiceOpen(false)}>
            <div className="bg-card/95 backdrop-blur-2xl rounded-2xl veltra-shadow-lg max-w-md w-full p-6 border border-border/40" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-title text-foreground flex items-center gap-2">
                  <Mic className="h-4 w-4 text-amber-400" /> Voice Note
                </h3>
                <button onClick={() => setVoiceOpen(false)} className="text-muted-foreground hover:text-foreground" aria-label="Close dialog"><X className="h-4 w-4" /></button>
              </div>
              <div className="text-center py-6">
                <button
                  onClick={() => {
                    if (recording) {
                      const duration = recordSecs || 30;
                      addVoiceNote({
                        patientId: patient.id, patientName: patient.name,
                        recordedBy: currentUser?.name || "Unknown",
                        durationSec: duration,
                        transcript: "[Demo — ASR not connected]",
                      });
                      setVoiceOpen(false); setRecording(false); setRecordSecs(0);
                      toast({ title: "Voice note saved ✓", description: `${duration}s recording` });
                    } else {
                      setRecording(true); setRecordSecs(0);
                      const interval = setInterval(() => {
                        setRecordSecs((s) => { if (s >= 60) { clearInterval(interval); return s; } return s + 1; });
                      }, 1000);
                      setTimeout(() => clearInterval(interval), 60000);
                    }
                  }}
                  className="mx-auto h-20 w-20 rounded-full bg-veltra-emerald/15 flex items-center justify-center hover:bg-veltra-emerald/25 veltra-transition"
                >
                  <Mic className={cn("h-8 w-8 text-veltra-emerald", recording && "animate-pulse")} />
                </button>
                <p className="text-caption text-muted-foreground mt-4">
                  {recording ? `Recording... ${recordSecs}s (tap to stop)` : "Tap to record (mock)"}
                </p>
                {recording && (
                  <p className="text-micro text-muted-foreground/60 mt-2 normal-case tracking-normal">
                    Transcript will be auto-generated on save
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===== Add Note Dialog ===== */}
        {noteOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setNoteOpen(false)}>
            <div className="bg-card/95 backdrop-blur-2xl rounded-2xl veltra-shadow-lg max-w-md w-full p-6 border border-border/40" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-title text-foreground flex items-center gap-2">
                  <StickyNote className="h-4 w-4 text-slate-400" /> Add Note
                </h3>
                <button onClick={() => setNoteOpen(false)} className="text-muted-foreground hover:text-foreground" aria-label="Close dialog"><X className="h-4 w-4" /></button>
              </div>
              <div>
                <Label htmlFor="timeline-note" className="text-micro text-muted-foreground">Clinical note</Label>
                <Textarea
                  id="timeline-note"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Write the note to add to this patient's timeline..."
                  className="mt-1 min-h-32 resize-none"
                  autoFocus
                />
              </div>
              <div className="flex gap-2 mt-5">
                <Button variant="ghost" onClick={() => setNoteOpen(false)} className="flex-1 h-10">Cancel</Button>
                <Button onClick={handleAddNote} className="flex-1 h-10 bg-veltra-emerald hover:bg-veltra-emerald-dark text-white" disabled={!noteText.trim()}>
                  Add note
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ===== Print-only document wrapper =====
            Renders branded header, doctor strip, note space, signature row,
            and footer when window.print() fires. Hidden on screen. */}
        <VeltraPrintLayout
          title="Patient Chart Summary"
          patient={patient}
          withNoteSpace={true}
          withSignature={true}
        >
          {/* <h2>Patient</h2>
          <table>
            <tbody>
              <tr><th style={{ width: "30%" }}>Name</th><td>{patient.name}</td></tr>
              <tr><th>Age / Gender</th><td>{patient.age} / {patient.gender}</td></tr>
              <tr><th>Phone</th><td>{patient.phone}</td></tr>
              <tr><th>Doctor</th><td>{patient.doctor}</td></tr>
              <tr><th>Conditions</th><td>{patient.conditions.length ? patient.conditions.join(", ") : "None on file"}</td></tr>
              <tr><th>Allergies</th><td>{Array.isArray(patient.allergies) && patient.allergies.length ? patient.allergies.join(", ") : "None"}</td></tr>
              <tr><th>Last visit</th><td>{formatRelativeTime(patient.lastVisit)}</td></tr>
              <tr><th>Visit pattern</th><td>{patient.visitPattern}</td></tr>
            </tbody>
          </table> */}

          {/* <h2>Timeline ({timeline.length} events)</h2>
          <table>
            <thead>
              <tr><th style={{ width: "20%" }}>Date</th><th style={{ width: "20%" }}>Type</th><th>Details</th></tr>
            </thead>
            <tbody>
              {timeline.slice(-12).map((ev) => (
                <tr key={ev.id}>
                  <td>{formatDate(ev.timestamp)}</td>
                  <td>{EVENT_CONFIG[ev.type]?.label || ev.type}</td>
                  <td>{ev.description}{ev.actor ? ` — ${ev.actor}` : ""}</td>
                </tr>
              ))}
            </tbody>
          </table> */}

          {patientPrescriptions.length > 0 && (
            <>
              {/* <h2>Active Prescriptions ({patientPrescriptions.length})</h2>
              <table>
                <thead>
                  <tr><th>Medication</th><th>Dosage</th><th>Frequency</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {patientPrescriptions.filter((rx) => rx.status === "active").map((rx) => (
                    <tr key={rx.id}>
                      <td>{rx.medication}</td>
                      <td>{rx.dosage}</td>
                      <td>{rx.frequency}</td>
                      <td>{rx.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table> */}
            </>
          )}

          {patientLabs.length > 0 && (
            <>
              {/* <h2>Recent Lab Results ({patientLabs.length})</h2>
              <table>
                <thead>
                  <tr><th>Test</th><th>Result</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {patientLabs.slice(-5).map((lr) => (
                    <tr key={lr.id}>
                      <td>{lr.testType}</td>
                      <td>{lr.value} {lr.unit} {lr.status !== "normal" && `(${lr.status})`}</td>
                      <td>{formatDate(lr.timestamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table> */}
            </>
          )}
        </VeltraPrintLayout>
      </div>
    </div>
  );
}

/** Vertical divider used to visually separate action-button groups in the patient action bar. */
function Divider() {
  return <span className="hidden sm:block h-6 w-px bg-border/40" aria-hidden />;
}

function ContextRow({
  label,
  value,
  warn = false,
}: {
  label: string;
  value: string;
  warn?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-micro text-muted-foreground normal-case tracking-normal flex-shrink-0">{label}</span>
      <span className={cn(
        "text-caption font-medium",
        warn ? "text-red-400" : "text-foreground"
      )}>
        {value}
      </span>
    </div>
  );
}

function channelLabel(c: Patient["preferredChannel"]): string {
  return { whatsapp: "Messaging", call: "Phone call", sms: "SMS", "in-person": "In-person" }[c];
}

function VitalCell({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="rounded-lg bg-foreground/[0.03] px-3 py-2">
      <p className="text-micro text-muted-foreground normal-case tracking-normal">{label}</p>
      <p className="text-body font-semibold tabular text-foreground mt-0.5">{value} <span className="text-caption font-normal text-muted-foreground">{unit}</span></p>
    </div>
  );
}

function exportPatientData(patient: Patient, rx: any[], v: any[], lr: any[], vn: any[]) {
  const rows = [
    ["VELTRA — Patient Export"],
    ["Patient", patient.name],
    ["Age/Gender", `${patient.age}${patient.gender}`],
    ["Phone", patient.phone],
    ["Conditions", patient.conditions.join(", ")],
    ["Allergies", Array.isArray(patient.allergies) && patient.allergies.length ? patient.allergies.join(", ") : "None"],
    ["Visit pattern", patient.visitPattern],
    ["Doctor", patient.doctor],
    ["Insurance", patient.insurance],
    ["Balance", patient.balance],
    [],
    ["PRESCRIPTIONS"],
    ["Medication", "Dosage", "Frequency", "Duration", "Doctor", "Status", "Date"],
    ...rx.map((r) => [r.medication, r.dosage, r.frequency, r.duration, r.doctorName, r.status, formatDate(r.timestamp)]),
    [],
    ["LAB RESULTS"],
    ["Test", "Value", "Unit", "Normal", "Status", "Ordered by", "Date"],
    ...lr.map((l) => [l.testType, l.value, l.unit, l.normalRange, l.status, l.orderedBy, formatDate(l.timestamp)]),
    [],
    ["VITALS"],
    ["BP", "HR", "Temp", "Glucose", "SpO2", "Weight", "Recorded by", "Date"],
    ...v.map((x) => [`${x.bp_systolic||"-"}/${x.bp_diastolic||"-"}`, x.heartRate||"-", x.temperature||"-", x.bloodSugar||"-", x.oxygenLevel||"-", x.weight||"-", x.recordedBy, formatDate(x.timestamp)]),
    [],
    ["VOICE NOTES"],
    ["Duration", "Transcript", "Recorded by", "Date"],
    ...vn.map((n) => [`${n.durationSec}s`, n.transcript, n.recordedBy, formatDate(n.timestamp)]),
  ];
  // Sanitize each cell — prevent CSV formula injection by prefixing cells
  // starting with =, +, -, or @ with a single quote (Excel/Sheets ignore it on import).
  const sanitizeCell = (c: unknown): string => {
    let s = String(c ?? "");
    // Escape embedded quotes
    s = s.replace(/"/g, '""');
    // Formula injection guard
    if (/^[=+\-@]/.test(s)) {
      s = "'" + s;
    }
    return `"${s}"`;
  };
  const csv = rows.map((r) => r.map(sanitizeCell).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `veltra-${patient.name.replace(/\s/g, "-").toLowerCase()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
