"use client";

import { useVeltra, formatRelativeTime } from "@/lib/veltra-store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ClinicIntelligenceStrip } from "./clinic-intelligence";
import { llmService } from "@/lib/llm";
import { useState, useEffect, useRef } from "react";
import {
  Sun,
  Clock,
  Users,
  Check,
  DollarSign,
  ArrowRight,
  Phone,
  FlaskConical,
  Stethoscope,
  Calendar,
  Bell,
  UserCheck,
  Pill,
  Activity,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  MessageCircle,
  Zap,
  Target,
  Heart,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FadeIn, StaggerGroup, StaggerItem, CountUp, HoverLift } from "./motion";
import { Sparkline, TrendBadge } from "./sparkline";
import { motion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

const REVENUE_TREND = [3200, 3800, 4100, 3600, 4400, 4800, 5200, 5420];

// ===== Memory Brief card icons (rotated by specialty brief items) =====
const BRIEF_ICONS = [AlertTriangle, FlaskConical, Check, Bell, Activity, Pill, Stethoscope, Calendar];
const BRIEF_TINTS = [
  "text-amber-400 bg-amber-500/10",
  "text-red-400 bg-red-500/10",
  "text-veltra-emerald bg-veltra-emerald/10",
  "text-blue-400 bg-blue-500/10",
  "text-violet-400 bg-violet-500/10",
  "text-rose-400 bg-rose-500/10",
  "text-emerald-400 bg-emerald-500/10",
  "text-orange-400 bg-orange-500/10",
];

export function BriefScreen() {
  const brief = useVeltra((s) => s.brief);
  const appointments = useVeltra((s) => s.appointments);
  const activities = useVeltra((s) => s.activities);
  const notifications = useVeltra((s) => s.notifications);
  const patients = useVeltra((s) => s.patients);
  const markPriorityDone = useVeltra((s) => s.markPriorityDone);
  const markNotificationRead = useVeltra((s) => s.markNotificationRead);
  const markAllNotificationsRead = useVeltra((s) => s.markAllNotificationsRead);
  const setView = useVeltra((s) => s.setView);
  const selectPatient = useVeltra((s) => s.selectPatient);
  const currentUser = useVeltra((s) => s.currentUser);
  const activeSpecialty = useVeltra((s) => s.activeSpecialty);
  const { toast } = useToast();

  const todays = appointments.filter((a) => a.status !== "cancelled");
  const unconfirmedCount = todays.filter((a) => a.status === "scheduled").length;
  const checkedIn = todays.filter((a) => a.status === "checked-in").length;
  const completed = todays.filter((a) => a.status === "completed").length;
  const openPriorities = brief.priorities.filter((p) => !p.done);
  const unreadNotifs = notifications.filter((n) => !n.read);

  // Day score calculation
  const dayScore = Math.min(100, Math.round(((completed + checkedIn) / Math.max(todays.length, 1)) * 100));

  // Specialty-driven memory cards — now with AI patient summaries
  // Generates real AI summaries for the first 3 patients with upcoming appointments
  const [aiSummaries, setAiSummaries] = useState<Record<string, string>>({});
  const prescriptions = useVeltra((s) => s.prescriptions);
  const labResults = useVeltra((s) => s.labResults);

  useEffect(() => {
    // Generate AI summaries for first 3 patients with today's appointments
    const todaysPatients = todays
      .slice(0, 3)
      .map((a) => patients.find((p) => p.id === a.patientId))
      .filter(Boolean) as typeof patients;

    if (todaysPatients.length === 0) return;

    todaysPatients.forEach(async (patient) => {
      const patientRx = prescriptions.filter((rx) => rx.patientId === patient.id);
      const patientLabs = labResults.filter((l) => l.patientId === patient.id);
      try {
        const summary = await llmService.generatePatientSummary({
        name: patient.name,
        age: patient.age,
        conditions: patient.conditions,
        medications: patientRx.map((rx) => `${rx.medication} ${rx.dosage}`),
        lastVisit: formatRelativeTime(patient.lastVisit),
        labs: patientLabs.slice(-3).map((l) => `${l.testType}: ${l.value} ${l.unit}`),
        allergies: patient.allergies,
      });
      setAiSummaries((prev) => ({ ...prev, [patient.id]: summary.data }));
      } catch (e) { /* silent fallback */ }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patients, prescriptions, labResults, appointments]);

  const memoryCards = activeSpecialty.brief.items.slice(0, 3).map((item, i) => {
    const patient = todays[i] ? patients.find((p) => p.id === todays[i].patientId) : null;
    const aiSummary = patient ? aiSummaries[patient.id] : null;
    return {
      icon: BRIEF_ICONS[i % BRIEF_ICONS.length],
      tint: BRIEF_TINTS[i % BRIEF_TINTS.length],
      title: patient ? patient.name : item.split(" ").slice(0, 4).join(" "),
      body: aiSummary || item, // Use AI summary if available, fallback to specialty text
      action: i === 0 ? "Open timeline" : i === 1 ? "Review labs" : "Open schedule",
      actionTarget: i === 0 ? (patient ? `p${patient.id.replace("p","")}` : "patients") : i === 1 ? "labs" : "appointments",
    };
  });

  // Specialty-driven live modules
  const liveModules = [
    { icon: UserCheck, label: "Reception", value: `${todays.length} booked today`, tint: "text-veltra-emerald" },
    { icon: Phone, label: "Front Desk", value: `${todays.length} appointments`, tint: "text-blue-400" },
    { icon: DollarSign, label: "Billing", value: `$${todays.length > 0 ? (brief.expectedRevenue / todays.length).toFixed(0) : "0"} per visit`, tint: "text-emerald-400" },
    { icon: Bell, label: "Follow-up", value: `${activities.filter(a => a.type === "reminder").length + 4} reminders`, tint: "text-amber-400" },
    { icon: Activity, label: "Records", value: `${activities.length} events today`, tint: "text-violet-400" },
  ];

  // Specialty-driven glance stats
  const glanceStats = [
    { label: "Today's Revenue", value: `$${brief.expectedRevenue.toLocaleString()}`, icon: DollarSign, tint: "text-emerald-400" },
    { label: "Patient Satisfaction", value: "4.8/5", icon: Heart, tint: "text-veltra-emerald", trend: "+0.2" },
    { label: "Avg Wait Time", value: "4.1 min", icon: Clock, tint: "text-blue-400", trend: "-1.3 min" },
    { label: "No-show Risk", value: `${brief.noShowRiskCount} patients`, icon: AlertTriangle, tint: "text-amber-400", trend: "monitoring" },
    { label: "Bookings", value: `${todays.length}`, icon: Calendar, tint: "text-violet-400", trend: "72% of total" },
    { label: "Staff Time Saved", value: "6.4 hrs", icon: Zap, tint: "text-veltra-emerald", trend: "today" },
  ];

  return (
    <div className="min-h-screen veltra-ambient">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-10 md:px-10 md:py-12">
        {/* ===== Memory Brief Header ===== */}
        <FadeIn>
          <header className="mb-6 no-print">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-3.5 w-3.5 text-veltra-emerald" />
              <span className="text-micro text-veltra-emerald">Today's Brief</span>
              <span className="text-micro text-muted-foreground/60">· {brief.dateLabel}</span>
              <span className="ml-auto flex items-center gap-3">
                <span className={cn("flex items-center gap-1.5 px-2 py-0.5 rounded-md text-micro font-medium", activeSpecialty.color)}>
                  <span className="text-xs">{activeSpecialty.emoji}</span>
                  {activeSpecialty.name}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="veltra-live-dot" />
                  <span className="text-micro text-veltra-emerald">Live</span>
                </span>
              </span>
            </div>
            <h1 className="text-[2.75rem] leading-[1.02] tracking-[-0.035em] text-foreground">
              <span className="text-editorial-italic text-muted-foreground">{new Date().getHours() < 12 ? "Good morning," : new Date().getHours() < 18 ? "Good afternoon," : "Good evening,"}</span>
              <br />
              <span className="font-semibold">{currentUser?.name?.split(" ")[0] || brief.doctorName}.</span>
            </h1>
            <p className="text-body text-muted-foreground mt-2 max-w-xl">
              {brief.dateLabel} — {todays.length} patients today.
            </p>
            <div className="flex gap-2 mt-4">
              <Button onClick={() => setView("intake")} className="h-9 px-4 bg-veltra-emerald hover:bg-veltra-emerald-dark text-white text-caption font-medium">
                New patient
              </Button>
              <Button variant="outline" onClick={() => setView("appointments")} className="h-9 px-4 veltra-shadow border-0 bg-foreground/[0.04] text-foreground text-caption font-medium">
                See all appointments
              </Button>
            </div>
          </header>
        </FadeIn>

        {/* ===== Clinic Intelligence — proactive alerts (what needs your attention) ===== */}
        <FadeIn delay={0.05}>
          <div className="mb-8 no-print">
            <ClinicIntelligenceStrip />
          </div>
        </FadeIn>

        {/* ===== Memory Brief Cards (3 intelligent insights, specialty-driven) ===== */}
        <FadeIn delay={0.1}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
            {memoryCards.map((card, i) => (
              <HoverLift key={i} intensity={3}>
                <Card className="p-5 veltra-shadow-lg veltra-glass border-0 h-full">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0", card.tint)}>
                      <card.icon className="h-4 w-4" />
                    </div>
                    <p className="text-body font-semibold text-foreground pt-1 line-clamp-2">{card.title}</p>
                  </div>
                  <p className="text-caption text-muted-foreground leading-relaxed mb-2">{card.body}</p>
                    <p className="text-micro text-muted-foreground/40 normal-case tracking-normal italic mb-3">AI summary \u2014 verify chart</p>
                  <button
                    onClick={() => {
                      // actionTarget is either a screen name (e.g. "patients", "labs", "appointments")
                      // or a patient ID starting with "p" followed by a digit (e.g. "p1", "p2")
                      const isPatientId = /^p\d+$/.test(card.actionTarget);
                      if (isPatientId) selectPatient(card.actionTarget);
                      else setView(card.actionTarget as any);
                      toast({ title: card.action });
                    }}
                    className="text-caption text-veltra-emerald hover:underline flex items-center gap-1"
                  >
                    {card.action}
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </Card>
              </HoverLift>
            ))}
          </div>
        </FadeIn>

        {/* ===== Live Modules Row ===== */}
        <FadeIn delay={0.15}>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
            {liveModules.map((mod, i) => (
              <Card key={i} className="p-4 veltra-shadow border-0 bg-card/50 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <mod.icon className={cn("h-3.5 w-3.5", mod.tint)} />
                  <p className="text-micro text-muted-foreground">{mod.label}</p>
                </div>
                <p className="text-caption font-medium text-foreground tabular">{mod.value}</p>
              </Card>
            ))}
          </div>
        </FadeIn>

        {/* ===== Day Score + Stats Grid ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
          {/* Day Score */}
          <FadeIn delay={0.2}>
            <Card className="p-6 veltra-shadow-lg veltra-glass border-0 h-full relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-48 h-48 bg-veltra-emerald/8 rounded-full blur-3xl pointer-events-none" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-micro text-muted-foreground">Day Score</p>
                    <p className="text-[3rem] font-semibold tabular text-foreground tracking-[-0.03em] mt-1">{dayScore}%</p>
                  </div>
                  {/* Progress ring */}
                  <svg width="64" height="64" viewBox="0 0 64 64" className="transform -rotate-90">
                    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="none" className="text-foreground/[0.06]" />
                    <motion.circle
                      cx="32" cy="32" r="28" stroke="var(--veltra-emerald)" strokeWidth="4" fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 28}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 28 * (1 - dayScore / 100) }}
                      transition={{ duration: 1.2, ease: EASE, delay: 0.3 }}
                    />
                  </svg>
                </div>
                <div className="space-y-2 pt-3 border-t border-border/40">
                  <div className="flex justify-between text-caption">
                    <span className="text-muted-foreground">Patients Seen</span>
                    <span className="text-foreground font-medium tabular">{completed}/{todays.length} today</span>
                  </div>
                  <div className="flex justify-between text-caption">
                    <span className="text-muted-foreground">Revenue Collected</span>
                    <span className="text-foreground font-medium tabular">${(completed * 350).toLocaleString()} of ${(todays.length * 350).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-caption">
                    <span className="text-muted-foreground">No-Shows Prevented</span>
                    <span className="text-foreground font-medium tabular">{todays.length - unconfirmedCount}/{todays.length} confirmed</span>
                  </div>
                </div>
              </div>
            </Card>
          </FadeIn>

          {/* Revenue Hero */}
          <FadeIn delay={0.25}>
            <Card className="p-6 veltra-shadow-lg veltra-glass border-0 h-full relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-48 h-48 bg-veltra-emerald/8 rounded-full blur-3xl pointer-events-none" />
              <div className="relative">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-micro text-muted-foreground">Today's Revenue</p>
                  <div className="flex items-center gap-1.5 text-micro text-veltra-emerald">
                    <Sparkles className="h-3 w-3" /> <span>Recovered</span>
                  </div>
                </div>
                <div className="flex items-end gap-4 mt-4">
                  <CountUp value={brief.expectedRevenue} prefix="$" className="text-[3.5rem] leading-none font-semibold tabular text-foreground tracking-[-0.04em]" />
                  <div className="pb-2">
                    <Sparkline data={REVENUE_TREND} width={100} height={32} />
                    <TrendBadge value="+8%" direction="up" className="block mt-1" />
                  </div>
                </div>
                <div className="flex items-center gap-6 mt-6 pt-6 border-t border-border/40">
                  <div className="flex items-baseline gap-1.5">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-micro text-muted-foreground normal-case tracking-normal">First</span>
                    <span className="text-caption font-medium tabular text-foreground">{brief.firstAppointment}</span>
                  </div>
                  <div className="h-3 w-px bg-border" />
                  <div className="flex items-baseline gap-1.5">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-micro text-muted-foreground normal-case tracking-normal">Last</span>
                    <span className="text-caption font-medium tabular text-foreground">{brief.lastAppointment}</span>
                  </div>
                  <div className="h-3 w-px bg-border" />
                  <div className="flex items-baseline gap-1.5">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    <span className="text-micro text-muted-foreground normal-case tracking-normal">Waiting</span>
                    <span className="text-caption font-medium tabular text-foreground">{brief.waitingPatients}</span>
                  </div>
                </div>
              </div>
            </Card>
          </FadeIn>

          {/* Today at a Glance */}
          <FadeIn delay={0.3}>
            <Card className="p-6 veltra-shadow border-0 bg-card/50 backdrop-blur-sm h-full">
              <p className="text-micro text-veltra-emerald mb-4">Today at a Glance</p>
              <div className="space-y-3">
                {glanceStats.map((stat, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <stat.icon className={cn("h-4 w-4 flex-shrink-0", stat.tint)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-caption text-muted-foreground">{stat.label}</p>
                      <p className="text-body font-semibold tabular text-foreground">{stat.value}</p>
                    </div>
                    {stat.trend && <span className="text-micro text-muted-foreground/70 normal-case tracking-normal">{stat.trend}</span>}
                  </div>
                ))}
              </div>
            </Card>
          </FadeIn>
        </div>

        {/* ===== Schedule + Live Activity ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
          {/* Today's Schedule */}
          <FadeIn delay={0.35} className="lg:col-span-3">
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-title text-foreground">Today's Schedule</h2>
              <Button size="sm" variant="ghost" onClick={() => setView("appointments")} className="h-7 text-caption text-muted-foreground hover:text-foreground">
                Open <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
            <StaggerGroup>
              <Card className="veltra-shadow border-0 bg-card/50 backdrop-blur-sm overflow-hidden">
                {todays.slice(0, 5).map((a, idx) => (
                  <StaggerItem key={a.id}>
                    <div
                      className={cn(
                        "w-full flex items-center gap-4 px-6 py-3.5 text-left veltra-transition hover:bg-foreground/[0.03] group",
                        idx !== Math.min(4, todays.length - 1) && "border-b border-border/40"
                      )}
                    >
                      <button onClick={() => selectPatient(a.patientId)} className="flex items-center gap-4 flex-1 min-w-0 text-left cursor-pointer">
                        <div className="flex-shrink-0 w-12">
                          <p className="text-body font-semibold tabular text-foreground">{a.time}</p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-body font-medium text-foreground truncate">{a.patientName}</p>
                          <p className="text-caption text-muted-foreground truncate mt-0.5">{a.type} · {a.doctor}</p>
                        </div>
                      </button>
                      <Badge variant="outline" className={cn("text-micro font-medium flex-shrink-0 border",
                        a.status === "scheduled" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                        a.status === "confirmed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                        a.status === "checked-in" ? "bg-violet-500/10 text-violet-400 border-violet-500/20" :
                        a.status === "completed" ? "bg-slate-500/10 text-slate-500 border-slate-500/20" :
                        "bg-red-500/10 text-red-400 border-red-500/20"
                      )}>
                        {a.status === "scheduled" ? "Pending" : a.status === "checked-in" ? "Waiting" : a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                      </Badge>
                      {/* Quick actions — appear on hover */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 veltra-transition flex-shrink-0">
                        <button
                          onClick={() => selectPatient(a.patientId)}
                          className="h-7 w-7 rounded-md hover:bg-veltra-emerald/10 hover:text-veltra-emerald flex items-center justify-center veltra-transition cursor-pointer"
                          aria-label={`Open ${a.patientName} timeline`}
                          title="Open timeline"
                        >
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => { selectPatient(a.patientId); setView("messages"); }}
                          className="h-7 w-7 rounded-md hover:bg-veltra-emerald/10 hover:text-veltra-emerald flex items-center justify-center veltra-transition cursor-pointer"
                          aria-label={`Message ${a.patientName}`}
                          title="Message"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => selectPatient(a.patientId)}
                          className="h-7 w-7 rounded-md hover:bg-veltra-emerald/10 hover:text-veltra-emerald flex items-center justify-center veltra-transition cursor-pointer"
                          aria-label={`Call ${a.patientName}`}
                          title="Call"
                        >
                          <Phone className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </Card>
            </StaggerGroup>
          </FadeIn>

          {/* Live Activity Feed */}
          <FadeIn delay={0.4} className="lg:col-span-2">
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-title text-foreground">Live Activity</h2>
              <span className="flex items-center gap-1.5 text-micro text-muted-foreground">
                <span className="veltra-live-dot" /> Live
              </span>
            </div>
            <Card className="veltra-shadow border-0 bg-card/50 backdrop-blur-sm p-3">
              <div className="veltra-scrollbar max-h-80 overflow-y-auto space-y-1">
                {activities.slice(0, 10).map((a) => {
                  const icons: Record<string, React.ElementType> = {
                    call: Phone, booking: Calendar, reminder: Bell, "check-in": UserCheck,
                    diagnosis: Stethoscope, lab: FlaskConical, prescription: Pill, payment: DollarSign,
                    "follow-up": ArrowRight, note: Activity,
                  };
                  const tints: Record<string, string> = {
                    call: "text-blue-400 bg-blue-500/10", booking: "text-violet-400 bg-violet-500/10",
                    reminder: "text-amber-400 bg-amber-500/10", "check-in": "text-purple-400 bg-purple-500/10",
                    diagnosis: "text-emerald-400 bg-emerald-500/10", lab: "text-cyan-400 bg-cyan-500/10",
                    prescription: "text-rose-400 bg-rose-500/10", payment: "text-emerald-400 bg-emerald-500/10",
                    "follow-up": "text-orange-400 bg-orange-500/10", note: "text-slate-400 bg-slate-500/10",
                  };
                  const Icon = icons[a.type] || Activity;
                  return (
                    <div key={a.id} className="flex gap-3 px-3 py-2.5 rounded-lg veltra-transition hover:bg-foreground/[0.03]">
                      <div className={cn("flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center", tints[a.type] || tints.note)}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-caption text-foreground leading-snug">{a.description}</p>
                        <p className="text-micro text-muted-foreground/70 mt-0.5 normal-case tracking-normal">{a.actor} · {formatRelativeTime(a.timestamp)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </FadeIn>
        </div>

        {/* ===== Needs Attention + Priority ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Priority */}
          <FadeIn delay={0.45}>
            <div>
              <div className="flex items-baseline justify-between mb-4">
                <h2 className="text-title text-foreground">Priority</h2>
                <span className="text-caption text-muted-foreground">{openPriorities.length} open</span>
              </div>
              <Card className="veltra-shadow border-0 bg-card/50 backdrop-blur-sm overflow-hidden">
                {brief.priorities.map((p, idx) => {
                  const dotColor = p.level === "high" ? "bg-red-500" : p.level === "medium" ? "bg-amber-500" : "bg-emerald-500";
                  return (
                    <button
                      key={p.id}
                      onClick={() => { if (!p.done) { markPriorityDone(p.id); toast({ title: "Done", description: p.text }); } }}
                      className={cn(
                        "w-full flex items-center gap-3.5 px-6 py-3.5 text-left veltra-transition hover:bg-foreground/[0.03]",
                        idx !== brief.priorities.length - 1 && "border-b border-border/40",
                        p.done && "opacity-50"
                      )}
                    >
                      <span className={cn("h-2 w-2 rounded-full flex-shrink-0", dotColor)} />
                      <span className={cn("flex-1 text-body", p.done ? "line-through text-muted-foreground" : "text-foreground")}>{p.text}</span>
                      {p.done && <Check className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />}
                    </button>
                  );
                })}
              </Card>
            </div>
          </FadeIn>

          {/* Needs Attention */}
          <FadeIn delay={0.5}>
            <div>
              <div className="flex items-baseline justify-between mb-4">
                <h2 className="text-title text-foreground">Needs Attention</h2>
                {unreadNotifs.length > 0 && (
                  <Button size="sm" variant="ghost" onClick={markAllNotificationsRead} className="h-7 text-caption text-muted-foreground hover:text-foreground">
                    Mark all read
                  </Button>
                )}
              </div>
              <Card className="veltra-shadow border-0 bg-card/50 backdrop-blur-sm overflow-hidden">
                {unreadNotifs.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <div className="mx-auto h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
                      <Check className="h-4 w-4 text-emerald-400" />
                    </div>
                    <p className="text-editorial-italic text-caption text-muted-foreground">Nothing needs you. Enjoy the quiet.</p>
                  </div>
                ) : (
                  unreadNotifs.slice(0, 4).map((n, idx) => (
                    <button
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={cn(
                        "w-full flex gap-3.5 px-6 py-4 text-left veltra-transition hover:bg-foreground/[0.03]",
                        idx !== Math.min(3, unreadNotifs.length - 1) && "border-b border-border/40"
                      )}
                    >
                      <span className={cn("h-2 w-2 rounded-full mt-1.5 flex-shrink-0",
                        n.type === "action" ? "bg-red-500" : n.type === "warning" ? "bg-amber-500" : n.type === "success" ? "bg-emerald-500" : "bg-blue-500"
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className="text-caption font-medium text-foreground leading-snug">{n.title}</p>
                        <p className="text-caption text-muted-foreground mt-1 leading-snug">{n.description}</p>
                        <p className="text-micro text-muted-foreground/60 mt-1.5 normal-case tracking-normal">{formatRelativeTime(n.timestamp)}</p>
                      </div>
                    </button>
                  ))
                )}
              </Card>
            </div>
          </FadeIn>
        </div>

        {/* Footer */}
        <FadeIn delay={0.55}>
          <p className="text-center mt-12 text-editorial-italic text-muted-foreground/50 text-sm">
            Technology disappears. Care remains.
          </p>
        </FadeIn>
      </div>
    </div>
  );
}
