"use client";

/**
 * VELTRA Patient Portal
 *
 * The patient's view of their clinic. Separate from the doctor/staff app.
 *
 * Features:
 *   1. Health Score — patient sees their own score + trend
 *   2. Appointments — book, view upcoming, view history
 *   3. Messages — chat with doctor (WhatsApp-style)
 *   4. Lab Results — view results with normal ranges + trends
 *   5. Prescriptions — active medications, refills, instructions
 *   6. Bills — outstanding balance, pay online, history
 *   7. Documents — letters, referrals, reports (download)
 *   8. Profile — demographics, allergies, conditions, insurance
 *
 * Entry: from landing page "Patient portal" link, or /portal route.
 * Auth: patient logs in with phone number + OTP (simulated for demo).
 */
import { useVeltra, type Patient, type LabResult, type Prescription, type Appointment } from "@/lib/veltra-store";
import { computeHealthScore } from "@/lib/health-score";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  ArrowRight, ArrowLeft, Calendar, MessageCircle, FlaskConical, Pill, DollarSign,
  FileText, Heart, Activity, TrendingUp, TrendingDown, Check, Clock, AlertTriangle,
  Shield, Phone, Mail, Download, ChevronRight, Plus, Sparkles, Stethoscope, X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { HealthScoreCard } from "./health-score-card";

type Tab = "home" | "appointments" | "messages" | "labs" | "prescriptions" | "bills" | "documents" | "profile";

const EASE = [0.16, 1, 0.3, 1] as const;

export function PatientPortal({ onClose }: { onClose: () => void }) {
  const patients = useVeltra((s) => s.patients);
  const appointments = useVeltra((s) => s.appointments);
  const labResults = useVeltra((s) => s.labResults);
  const prescriptions = useVeltra((s) => s.prescriptions);
  const vitals = useVeltra((s) => s.vitals);
  const documents = useVeltra((s) => s.documents);
  const insuranceClaims = useVeltra((s) => s.insuranceClaims);

  // For demo: patient is Ahmed Hassan (p1)
  const patient = patients.find((p) => p.id === "p1") || patients[0];
  const [activeTab, setActiveTab] = useState<Tab>("home");

  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background veltra-ambient">
        <p className="text-body text-muted-foreground">No patient data available.</p>
      </div>
    );
  }

  const patientAppts = appointments.filter((a) => a.patientId === patient.id);
  const patientLabs = labResults.filter((l) => l.patientId === patient.id);
  const patientRx = prescriptions.filter((rx) => rx.patientId === patient.id);
  const patientDocs = documents.filter((d) => d.patientId === patient.id);
  const patientClaims = insuranceClaims.filter((c) => c.patientId === patient.id);

  // Compute health score
  const healthScore = computeHealthScore(patient, patientLabs, vitals, appointments);

  return (
    <div className="min-h-screen bg-background veltra-ambient">
      {/* ===== Top bar ===== */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button onClick={onClose} className="flex items-center gap-1.5 text-caption text-muted-foreground hover:text-foreground veltra-transition" aria-label="Back to home">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <div className="h-4 w-px bg-border/40" />
            <img src="/logo-symbol.png" alt="Veltra" className="object-cover h-6 w-6 rounded-lg" />
            <span className="text-caption font-semibold text-foreground">Veltra</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="text-micro text-muted-foreground hover:text-foreground veltra-transition" aria-label="Sign out">Sign out</button>
            <div className={cn("h-7 w-7 rounded-full flex items-center justify-center text-micro font-semibold", patient.avatarColor)}>
              {patient.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </div>
            <span className="text-caption text-muted-foreground hidden sm:block">{patient.name}</span>
          </div>
        </div>
      </header>

      {/* ===== Body ===== */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-10">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mb-8"
        >
          <p className="text-micro text-veltra-emerald normal-case tracking-normal mb-1">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <h1 className="text-[2rem] sm:text-[2.5rem] leading-[1.05] tracking-[-0.035em] text-foreground font-semibold">
            <span className="text-editorial-italic text-muted-foreground">Hello,</span>{" "}
            {patient.name.split(" ")[0]}.
          </h1>
          <p className="text-body text-muted-foreground mt-2">
            Here's your health at a glance.
          </p>
        </motion.div>

        {/* Tab navigation — horizontal scroll on mobile */}
        <div className="flex gap-1 mb-6 overflow-x-auto veltra-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          {[
            { id: "home" as Tab,          label: "Home",          icon: Heart },
            { id: "appointments" as Tab,  label: "Appointments",  icon: Calendar },
            { id: "messages" as Tab,      label: "Messages",      icon: MessageCircle },
            { id: "labs" as Tab,          label: "Lab Results",   icon: FlaskConical },
            { id: "prescriptions" as Tab, label: "Prescriptions", icon: Pill },
            { id: "bills" as Tab,         label: "Bills",         icon: DollarSign },
            { id: "documents" as Tab,     label: "Documents",     icon: FileText },
            { id: "profile" as Tab,       label: "Profile",       icon: Shield },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-lg text-caption font-medium veltra-transition flex-shrink-0",
                activeTab === tab.id
                  ? "bg-veltra-emerald/15 text-veltra-emerald"
                  : "text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground"
              )}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            {activeTab === "home" && <HomeTab patient={patient} healthScore={healthScore} patientAppts={patientAppts} patientLabs={patientLabs} patientRx={patientRx} setTab={setActiveTab} />}
            {activeTab === "appointments" && <AppointmentsTab patient={patient} patientAppts={patientAppts} />}
            {activeTab === "messages" && <MessagesTab patient={patient} />}
            {activeTab === "labs" && (patientLabs.some(l => l.status === "critical") ? (
          <div className="rounded-lg p-3 bg-red-500/[0.06] border border-red-500/20 mb-3"><p className="text-caption text-red-400 font-medium">Some results are critical. Your doctor will contact you within 24 hours. If you feel unwell, seek immediate medical attention.</p></div>
        ) : null)}
        {activeTab === "labs" && <LabsTab patientLabs={patientLabs} />}
            {activeTab === "prescriptions" && <PrescriptionsTab patientRx={patientRx} />}
            {activeTab === "bills" && <BillsTab patient={patient} patientClaims={patientClaims} />}
            {activeTab === "documents" && <DocumentsTab patientDocs={patientDocs} />}
            {activeTab === "profile" && <ProfileTab patient={patient} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ===== HOME TAB ===== */
function HomeTab({
  patient, healthScore, patientAppts, patientLabs, patientRx, setTab,
}: {
  patient: Patient;
  healthScore: ReturnType<typeof computeHealthScore>;
  patientAppts: Appointment[];
  patientLabs: LabResult[];
  patientRx: Prescription[];
  setTab: (t: Tab) => void;
}) {
  const { toast } = useToast();
  const upcomingAppt = patientAppts.find((a) => a.status === "scheduled" || a.status === "confirmed");
  const activeRx = patientRx.filter((rx) => rx.status === "active");
  const criticalLabs = patientLabs.filter((l) => l.status === "critical");

  return (
    <div className="space-y-4">
      {/* Health Score */}
      <HealthScoreCard score={healthScore} />

      {/* Next appointment */}
      {upcomingAppt && (
        <Card className="p-5 veltra-shadow border-0 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-4 w-4 text-veltra-emerald" />
            <p className="text-micro text-veltra-emerald font-medium uppercase tracking-wider">Next appointment</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body font-semibold text-foreground">{upcomingAppt.type}</p>
              <p className="text-caption text-muted-foreground mt-0.5">
                Today at {upcomingAppt.time} · {upcomingAppt.doctor}
              </p>
            </div>
            <Button size="sm" onClick={() => setTab("appointments")} className="h-8 px-3 bg-veltra-emerald hover:bg-veltra-emerald-dark text-white text-caption">
              Details
              <ChevronRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </Card>
      )}

      {/* Quick stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Active prescriptions */}
        <button onClick={() => setTab("prescriptions")} className="text-left">
          <Card className="p-4 veltra-shadow border-0 bg-card/50 backdrop-blur-sm hover:scale-[1.02] veltra-transition h-full">
            <Pill className="h-4 w-4 text-rose-400 mb-2" />
            <p className="text-title font-bold text-foreground tabular">{activeRx.length}</p>
            <p className="text-micro text-muted-foreground/70 normal-case tracking-normal mt-0.5">Active medications</p>
          </Card>
        </button>

        {/* Lab results */}
        <button onClick={() => setTab("labs")} className="text-left">
          <Card className={cn(
            "p-4 veltra-shadow border-0 bg-card/50 backdrop-blur-sm hover:scale-[1.02] veltra-transition h-full",
            criticalLabs.length > 0 && "ring-1 ring-amber-500/20"
          )}>
            <FlaskConical className={cn("h-4 w-4 mb-2", criticalLabs.length > 0 ? "text-amber-400" : "text-cyan-400")} />
            <p className="text-title font-bold text-foreground tabular">{patientLabs.length}</p>
            <p className="text-micro text-muted-foreground/70 normal-case tracking-normal mt-0.5">
              {criticalLabs.length > 0 ? `${criticalLabs.length} need review` : "Lab results"}
            </p>
          </Card>
        </button>

        {/* Messages */}
        <button onClick={() => setTab("messages")} className="text-left">
          <Card className="p-4 veltra-shadow border-0 bg-card/50 backdrop-blur-sm hover:scale-[1.02] veltra-transition h-full">
            <MessageCircle className="h-4 w-4 text-blue-400 mb-2" />
            <p className="text-title font-bold text-foreground tabular">{patientLabs.length > 0 ? "2" : "0"}</p>
            <p className="text-micro text-muted-foreground/70 normal-case tracking-normal mt-0.5">Unread messages</p>
          </Card>
        </button>

        {/* Bills */}
        <button onClick={() => setTab("bills")} className="text-left">
          <Card className={cn(
            "p-4 veltra-shadow border-0 bg-card/50 backdrop-blur-sm hover:scale-[1.02] veltra-transition h-full",
            patient.balance !== "paid" && "ring-1 ring-amber-500/20"
          )}>
            <DollarSign className={cn("h-4 w-4 mb-2", patient.balance !== "paid" ? "text-amber-400" : "text-emerald-400")} />
            <p className="text-title font-bold text-foreground tabular">
              {patient.balance === "paid" ? "$0" : `$${patient.balanceAmount || 0}`}
            </p>
            <p className="text-micro text-muted-foreground/70 normal-case tracking-normal mt-0.5">
              {patient.balance === "paid" ? "Paid in full" : patient.balance === "overdue" ? "Overdue" : "Due"}
            </p>
          </Card>
        </button>
      </div>

      {/* Allergies warning */}
      {patient.allergies && patient.allergies.length > 0 && (
        <Card className="p-4 veltra-shadow border-0 bg-amber-500/[0.04] ring-1 ring-amber-500/20">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <p className="text-micro text-amber-300 font-medium uppercase tracking-wider">Your allergies</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {patient.allergies.map((a) => (
              <span key={a} className="text-caption px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/20 normal-case tracking-normal font-medium">
                {a}
              </span>
            ))}
          </div>
          <p className="text-micro text-muted-foreground/60 normal-case tracking-normal mt-2 italic">
            Make sure to tell any new doctor about these.
          </p>
        </Card>
      )}

      {/* Book appointment CTA */}
      <Button
        onClick={() => { setTab("appointments"); toast({ title: "Book an appointment", description: "Choose a time that works for you" }); }}
        className="w-full h-11 bg-veltra-emerald hover:bg-veltra-emerald-dark text-white text-body font-medium veltra-shadow"
      >
        <Plus className="mr-1.5 h-4 w-4" />
        Book an appointment
      </Button>
    </div>
  );
}

/* ===== APPOINTMENTS TAB ===== */
function AppointmentsTab({ patient, patientAppts }: { patient: Patient; patientAppts: Appointment[] }) {
  const { toast } = useToast();
  const upcoming = patientAppts.filter((a) => a.status === "scheduled" || a.status === "confirmed");
  const past = patientAppts.filter((a) => a.status === "completed" || a.status === "cancelled");

  return (
    <div className="space-y-4">
      <SectionHeader title="Appointments" subtitle={`${upcoming.length} upcoming · ${past.length} past`} />

      <Button
        onClick={() => toast({ title: "Booking opened", description: "Pick a date and time" })}
        className="w-full h-11 bg-veltra-emerald hover:bg-veltra-emerald-dark text-white text-body font-medium veltra-shadow"
      >
        <Plus className="mr-1.5 h-4 w-4" />
        Book new appointment
      </Button>

      {upcoming.length > 0 && (
        <div>
          <p className="text-micro text-muted-foreground/60 normal-case tracking-normal uppercase tracking-wider mb-2">Upcoming</p>
          <div className="space-y-2">
            {upcoming.map((a) => (
              <Card key={a.id} className="p-4 veltra-shadow border-0 bg-card/50 backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-veltra-emerald/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-4 w-4 text-veltra-emerald" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body font-medium text-foreground">{a.type}</p>
                    <p className="text-caption text-muted-foreground mt-0.5">
                      Today · {a.time} · {a.doctor}
                    </p>
                    <span className={cn(
                      "inline-flex items-center mt-2 text-micro px-1.5 py-0 rounded normal-case tracking-normal font-medium",
                      a.status === "confirmed" ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"
                    )}>
                      {a.status}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <p className="text-micro text-muted-foreground/60 normal-case tracking-normal uppercase tracking-wider mb-2 mt-4">Past</p>
          <div className="space-y-2">
            {past.slice(0, 5).map((a) => (
              <Card key={a.id} className="p-4 veltra-shadow border-0 bg-card/50 backdrop-blur-sm opacity-70">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-foreground/[0.04] flex items-center justify-center flex-shrink-0">
                    {a.status === "completed" ? <Check className="h-4 w-4 text-emerald-400" /> : <X className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body font-medium text-foreground">{a.type}</p>
                    <p className="text-caption text-muted-foreground mt-0.5">
                      {a.time} · {a.doctor}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ===== MESSAGES TAB ===== */
function MessagesTab({ patient }: { patient: Patient }) {
  const { toast } = useToast();
  const [messages, setMessages] = useState([
    { id: "m1", from: "doctor", text: "Hi Ahmed, your HbA1c result came back at 8.4%. Let's discuss at your next visit.", time: "Yesterday · 4:32 PM" },
    { id: "m2", from: "patient", text: "Thank you doctor. Should I continue the Metformin?", time: "Yesterday · 5:01 PM" },
    { id: "m3", from: "doctor", text: "Yes, continue 1000mg twice daily with meals. We'll review in 2 weeks.", time: "Yesterday · 5:15 PM" },
  ]);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    setMessages([...messages, { id: `m${Date.now()}`, from: "patient", text: input, time: "Now" }]);
    setInput("");
    toast({ title: "Message sent", description: "Dr. Sarah will reply soon" });
  };

  return (
    <div className="space-y-4">
      <SectionHeader title="Messages" subtitle="Chat with your doctor" />

      <Card className="veltra-shadow border-0 bg-card/50 backdrop-blur-sm overflow-hidden">
        {/* Doctor header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/30 bg-foreground/[0.02]">
          <div className="h-9 w-9 rounded-full bg-veltra-emerald/15 flex items-center justify-center text-caption font-semibold text-veltra-emerald">
            SC
          </div>
          <div className="flex-1">
            <p className="text-caption font-medium text-foreground">Dr. Sarah Carter</p>
            <p className="text-micro text-emerald-400 normal-case tracking-normal flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Online
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="p-4 space-y-3 max-h-96 overflow-y-auto veltra-scrollbar">
          {messages.map((m) => (
            <div key={m.id} className={cn("flex", m.from === "patient" ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[75%] rounded-2xl px-3.5 py-2.5",
                m.from === "patient"
                  ? "bg-veltra-emerald text-white rounded-br-md"
                  : "bg-foreground/[0.04] text-foreground rounded-bl-md"
              )}>
                <p className="text-caption leading-relaxed">{m.text}</p>
                <p className={cn("text-micro mt-1 normal-case tracking-normal", m.from === "patient" ? "text-white/60" : "text-muted-foreground/60")}>
                  {m.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 p-3 border-t border-border/30">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Type a message…"
            className="flex-1 h-10 text-caption bg-foreground/[0.02] border-border/30"
          />
          <Button onClick={send} size="sm" disabled={!input.trim()} className="h-10 px-4 bg-veltra-emerald hover:bg-veltra-emerald-dark text-white">
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}

/* ===== LABS TAB ===== */
function LabsTab({ patientLabs }: { patientLabs: LabResult[] }) {
  return (
    <div className="space-y-4">
      <SectionHeader title="Lab Results" subtitle={`${patientLabs.length} results on file`} />

      {patientLabs.length === 0 ? (
        <EmptyState icon={FlaskConical} message="No lab results yet" />
      ) : (
        <div className="space-y-2">
          {patientLabs.map((lab) => (
            <Card key={lab.id} className={cn(
              "p-4 veltra-shadow border-0 bg-card/50 backdrop-blur-sm",
              lab.status === "critical" && "ring-1 ring-red-500/20"
            )}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-body font-medium text-foreground">{lab.testType}</p>
                  <p className="text-caption text-muted-foreground mt-0.5">
                    Ordered by {lab.orderedBy} · {new Date(lab.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                  {lab.notes && <p className="text-micro text-muted-foreground/70 normal-case tracking-normal mt-1 italic">{lab.notes}</p>}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={cn(
                    "text-body font-bold tabular",
                    lab.status === "critical" ? "text-red-400" :
                    lab.status === "high" ? "text-amber-400" :
                    lab.status === "low" ? "text-amber-400" : "text-emerald-400"
                  )}>
                    {lab.value} <span className="text-micro font-normal">{lab.unit}</span>
                  </p>
                  <p className="text-micro text-muted-foreground/60 normal-case tracking-normal mt-0.5">
                    Normal: {lab.normalRange}
                  </p>
                  <span className={cn(
                    "inline-block mt-1 text-micro px-1.5 py-0 rounded normal-case tracking-normal font-medium",
                    lab.status === "critical" ? "bg-red-500/15 text-red-300" :
                    lab.status === "high" || lab.status === "low" ? "bg-amber-500/15 text-amber-300" :
                    "bg-emerald-500/15 text-emerald-300"
                  )}>
                    {lab.status}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ===== PRESCRIPTIONS TAB ===== */
function PrescriptionsTab({ patientRx }: { patientRx: Prescription[] }) {
  const active = patientRx.filter((rx) => rx.status === "active");
  const inactive = patientRx.filter((rx) => rx.status !== "active");

  return (
    <div className="space-y-4">
      <SectionHeader title="Prescriptions" subtitle={`${active.length} active · ${inactive.length} past`} />

      {active.length > 0 && (
        <div>
          <p className="text-micro text-muted-foreground/60 normal-case tracking-normal uppercase tracking-wider mb-2">Active medications</p>
          <div className="space-y-2">
            {active.map((rx) => (
              <Card key={rx.id} className="p-4 veltra-shadow border-0 bg-card/50 backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-rose-500/10 flex items-center justify-center flex-shrink-0">
                    <Pill className="h-4 w-4 text-rose-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body font-medium text-foreground">{rx.medication} {rx.dosage}</p>
                    <p className="text-caption text-muted-foreground mt-0.5">
                      {rx.frequency} · {rx.duration}
                    </p>
                    {rx.notes && <p className="text-micro text-muted-foreground/70 normal-case tracking-normal mt-1 italic">{rx.notes}</p>}
                    <p className="text-micro text-muted-foreground/50 normal-case tracking-normal mt-1">
                      Prescribed by {rx.doctorName}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {inactive.length > 0 && (
        <div>
          <p className="text-micro text-muted-foreground/60 normal-case tracking-normal uppercase tracking-wider mb-2 mt-4">Past medications</p>
          <div className="space-y-2">
            {inactive.slice(0, 5).map((rx) => (
              <Card key={rx.id} className="p-4 veltra-shadow border-0 bg-card/50 backdrop-blur-sm opacity-60">
                <div className="flex items-center gap-3">
                  <Pill className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-caption font-medium text-foreground">{rx.medication} {rx.dosage}</p>
                    <p className="text-micro text-muted-foreground/70 normal-case tracking-normal">{rx.frequency}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ===== BILLS TAB ===== */
function BillsTab({ patient, patientClaims }: { patient: Patient; patientClaims: any[] }) {
  const { toast } = useToast();
  const balance = patient.balanceAmount || 0;
  const isPaid = patient.balance === "paid";

  return (
    <div className="space-y-4">
      <SectionHeader title="Bills & Payments" subtitle="Your balance and payment history" />

      {/* Outstanding balance */}
      <Card className={cn(
        "p-6 veltra-shadow border-0 bg-card/50 backdrop-blur-sm text-center",
        !isPaid && balance > 0 && "ring-1 ring-amber-500/20"
      )}>
        <p className="text-micro text-muted-foreground/60 normal-case tracking-normal uppercase tracking-wider mb-2">
          {isPaid ? "Balance" : "Outstanding balance"}
        </p>
        <p className={cn(
          "text-[2.5rem] font-bold tabular",
          isPaid ? "text-emerald-400" : "text-amber-400"
        )}>
          ${balance}
        </p>
        {!isPaid && (
          <>
            <p className="text-caption text-muted-foreground mt-1">
              {patient.balance === "overdue" ? "Overdue — please pay to avoid service interruption" : "Due now"}
            </p>
            <Button
              onClick={() => toast({ title: "Payment link sent", description: `Check your email for a $${balance} payment link` })}
              className="mt-4 h-10 px-6 bg-veltra-emerald hover:bg-veltra-emerald-dark text-white text-body font-medium"
            >
              <DollarSign className="mr-1.5 h-4 w-4" />
              Pay ${balance} now
            </Button>
          </>
        )}
        {isPaid && (
          <p className="text-caption text-emerald-400 mt-2 flex items-center justify-center gap-1">
            <Check className="h-3.5 w-3.5" />
            Paid in full
          </p>
        )}
      </Card>

      {/* Insurance claims */}
      {patientClaims.length > 0 && (
        <div>
          <p className="text-micro text-muted-foreground/60 normal-case tracking-normal uppercase tracking-wider mb-2">Insurance claims</p>
          <div className="space-y-2">
            {patientClaims.map((c) => (
              <Card key={c.id} className="p-4 veltra-shadow border-0 bg-card/50 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-caption font-medium text-foreground">{c.provider}</p>
                    <p className="text-micro text-muted-foreground/70 normal-case tracking-normal mt-0.5">
                      {c.serviceType} · {c.policyNumber}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-caption font-bold text-foreground tabular">${c.amount}</p>
                    <span className={cn(
                      "inline-block text-micro px-1.5 py-0 rounded normal-case tracking-normal font-medium mt-0.5",
                      c.status === "paid" || c.status === "approved" ? "bg-emerald-500/15 text-emerald-300" :
                      c.status === "pending" || c.status === "submitted" ? "bg-amber-500/15 text-amber-300" :
                      "bg-red-500/15 text-red-300"
                    )}>
                      {c.status}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ===== DOCUMENTS TAB ===== */
function DocumentsTab({ patientDocs }: { patientDocs: any[] }) {
  const { toast } = useToast();

  return (
    <div className="space-y-4">
      <SectionHeader title="Documents" subtitle="Letters, referrals, reports" />

      {patientDocs.length === 0 ? (
        <EmptyState icon={FileText} message="No documents yet" />
      ) : (
        <div className="space-y-2">
          {patientDocs.map((doc) => (
            <Card key={doc.id} className="p-4 veltra-shadow border-0 bg-card/50 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-foreground/[0.04] flex items-center justify-center flex-shrink-0">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-caption font-medium text-foreground truncate">{doc.name || doc.title}</p>
                  <p className="text-micro text-muted-foreground/70 normal-case tracking-normal mt-0.5">
                    {doc.type} · {doc.size} · {new Date(doc.uploadedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>
                <button
                  onClick={() => toast({ title: "Download started", description: doc.name || doc.title })}
                  className="h-8 w-8 rounded-md hover:bg-foreground/[0.06] flex items-center justify-center text-muted-foreground hover:text-veltra-emerald veltra-transition flex-shrink-0"
                  aria-label="Download"
                >
                  <Download className="h-3.5 w-3.5" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ===== PROFILE TAB ===== */
function ProfileTab({ patient }: { patient: Patient }) {
  return (
    <div className="space-y-4">
      <SectionHeader title="Profile" subtitle="Your medical information" />

      {/* Demographics */}
      <Card className="p-5 veltra-shadow border-0 bg-card/50 backdrop-blur-sm">
        <p className="text-micro text-veltra-emerald font-medium uppercase tracking-wider mb-3">Demographics</p>
        <div className="grid grid-cols-2 gap-3">
          <InfoRow label="Name" value={patient.name} />
          <InfoRow label="Age / Gender" value={`${patient.age} / ${patient.gender}`} />
          <InfoRow label="Phone" value={patient.phone} />
          <InfoRow label="MRN" value={patient.id.toUpperCase()} />
          <InfoRow label="Doctor" value={patient.doctor} />
          <InfoRow label="Preferred contact" value={patient.preferredChannel} />
        </div>
      </Card>

      {/* Conditions */}
      <Card className="p-5 veltra-shadow border-0 bg-card/50 backdrop-blur-sm">
        <p className="text-micro text-veltra-emerald font-medium uppercase tracking-wider mb-3">Conditions</p>
        {patient.conditions.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {patient.conditions.map((c) => (
              <span key={c} className="text-caption px-2 py-0.5 rounded-md bg-foreground/[0.04] text-foreground normal-case tracking-normal">
                {c}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-caption text-muted-foreground/70">None on file</p>
        )}
      </Card>

      {/* Allergies */}
      <Card className={cn(
        "p-5 veltra-shadow border-0 bg-card/50 backdrop-blur-sm",
        patient.allergies && patient.allergies.length > 0 && "ring-1 ring-amber-500/20"
      )}>
        <p className="text-micro text-amber-300 font-medium uppercase tracking-wider mb-3">Allergies</p>
        {patient.allergies && patient.allergies.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {patient.allergies.map((a) => (
              <span key={a} className="text-caption px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/20 normal-case tracking-normal font-medium">
                {a}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-caption text-muted-foreground/70">None on file</p>
        )}
      </Card>

      {/* Insurance */}
      <Card className="p-5 veltra-shadow border-0 bg-card/50 backdrop-blur-sm">
        <p className="text-micro text-veltra-emerald font-medium uppercase tracking-wider mb-3">Insurance</p>
        <div className="grid grid-cols-2 gap-3">
          <InfoRow label="Status" value={patient.insurance} />
          <InfoRow label="Balance" value={patient.balance === "paid" ? "Paid in full" : `$${patient.balanceAmount || 0} ${patient.balance}`} />
        </div>
      </Card>

      {/* Patient flags (operational) */}
      {patient.flags && patient.flags.length > 0 && (
        <Card className="p-5 veltra-shadow border-0 bg-card/50 backdrop-blur-sm">
          <p className="text-micro text-veltra-emerald font-medium uppercase tracking-wider mb-3">Care notes</p>
          <div className="flex flex-wrap gap-1.5">
            {patient.flags.map((flag) => (
              <span key={flag.id} className="text-micro px-2 py-0.5 rounded-md bg-foreground/[0.04] text-muted-foreground border border-border/20 normal-case tracking-normal">
                {flag.label}
              </span>
            ))}
          </div>
          <p className="text-micro text-muted-foreground/50 normal-case tracking-normal mt-2 italic">
            Operational notes from your care team — for your awareness only.
          </p>
        </Card>
      )}
    </div>
  );
}

/* ===== Helpers ===== */
function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h2 className="text-title font-semibold text-foreground">{title}</h2>
      <p className="text-caption text-muted-foreground mt-0.5">{subtitle}</p>
    </div>
  );
}

function EmptyState({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
  return (
    <Card className="p-12 text-center veltra-shadow border-0 bg-card/30 backdrop-blur-sm">
      <Icon className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
      <p className="text-caption text-muted-foreground">{message}</p>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-micro text-muted-foreground/60 normal-case tracking-normal uppercase tracking-wider">{label}</p>
      <p className="text-caption text-foreground mt-0.5 capitalize">{value}</p>
    </div>
  );
}
