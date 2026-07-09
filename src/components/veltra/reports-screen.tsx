"use client";

import { useVeltra } from "@/lib/veltra-store";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Activity, DollarSign, Users, CalendarClock, AlertTriangle } from "lucide-react";
import { FadeIn } from "./motion";
import { Sparkline, TrendBadge } from "./sparkline";

const REVENUE_TREND = [3200, 3800, 4100, 3600, 4400, 4800, 5200, 5420];
const NOSHOW_TREND = [4, 3, 5, 3, 2, 3, 2, 2];
const PATIENT_TREND = [4, 5, 5, 6, 6, 6, 6, 6];
const COMPLETION_TREND = [88, 92, 85, 94, 96, 93, 95, 96];

export function ReportsScreen() {
  const patients = useVeltra((s) => s.patients);
  const appointments = useVeltra((s) => s.appointments);
  const prescriptions = useVeltra((s) => s.prescriptions);
  const labResults = useVeltra((s) => s.labResults);
  const vitals = useVeltra((s) => s.vitals);
  const activities = useVeltra((s) => s.activities);

  const todays = appointments.filter((a) => a.status !== "cancelled");
  const completed = todays.filter((a) => a.status === "completed").length;
  const noShows = appointments.filter((a) => a.status === "no-show").length;
  const confirmed = todays.filter((a) => a.status === "confirmed").length;
  const completionRate = todays.length > 0 ? Math.round((completed / todays.length) * 100) : 0;

  const atRisk = patients.filter((p) => p.riskScore >= 50).length;
  const overdue = patients.filter((p) => p.balance === "overdue").length;
  const criticalLabs = labResults.filter((l) => l.status === "critical").length;

  // Activity by type
  const activityByType: Record<string, number> = {};
  activities.forEach((a) => {
    activityByType[a.type] = (activityByType[a.type] || 0) + 1;
  });

  return (
    <div className="min-h-screen veltra-ambient">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-8 sm:py-10 md:px-12 md:py-14">
        <FadeIn>
          <header className="mb-10">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="h-3.5 w-3.5 text-veltra-emerald" />
              <span className="text-micro text-veltra-emerald">Reports & Analytics</span>
            </div>
            <h1 className="text-[2.5rem] leading-[1.05] tracking-[-0.035em] text-foreground font-semibold">
              <span className="text-editorial-italic text-muted-foreground">The clinic,</span>{" "}
              in numbers.
            </h1>
            <p className="text-body text-muted-foreground mt-3">
              Real-time patterns across {patients.length} patients, {appointments.length} appointments, {prescriptions.length} prescriptions.
            </p>
          </header>
        </FadeIn>

        {/* Top metrics */}
        <FadeIn delay={0.1}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <MetricCard label="Revenue Today" value="$5,420" trend="+8%" direction="up" icon={DollarSign} spark={REVENUE_TREND} />
            <MetricCard label="No-show Risk" value={`${atRisk} patients`} trend="-22%" direction="down" icon={AlertTriangle} spark={NOSHOW_TREND} stroke="#f87171" />
            <MetricCard label="Total Patients" value={String(patients.length)} trend="+2" direction="up" icon={Users} spark={PATIENT_TREND} />
            <MetricCard label="Completion" value={`${completionRate}%`} trend="+4%" direction="up" icon={CalendarClock} spark={COMPLETION_TREND} />
          </div>
        </FadeIn>

        {/* Two column: Status breakdown + Activity by type */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Appointment status */}
          <FadeIn delay={0.15}>
            <div>
              <h2 className="text-title text-foreground mb-4">Appointment Status</h2>
              <Card className="p-6 veltra-shadow border-0 bg-card/50 backdrop-blur-sm">
                <div className="space-y-3">
                  <StatusBar label="Completed" value={completed} total={todays.length} color="bg-emerald-500" />
                  <StatusBar label="Confirmed" value={confirmed} total={todays.length} color="bg-blue-500" />
                  <StatusBar label="Pending" value={todays.filter((a) => a.status === "scheduled").length} total={todays.length} color="bg-amber-500" />
                  <StatusBar label="Waiting" value={todays.filter((a) => a.status === "checked-in").length} total={todays.length} color="bg-violet-500" />
                  {noShows > 0 && <StatusBar label="No-show" value={noShows} total={todays.length} color="bg-red-500" />}
                </div>
              </Card>
            </div>
          </FadeIn>

          {/* Activity breakdown */}
          <FadeIn delay={0.2}>
            <div>
              <h2 className="text-title text-foreground mb-4">Activity by Type</h2>
              <Card className="p-6 veltra-shadow border-0 bg-card/50 backdrop-blur-sm">
                {Object.keys(activityByType).length === 0 ? (
                  <p className="text-editorial-italic text-caption text-muted-foreground text-center py-4">No activity yet.</p>
                ) : (
                  <div className="space-y-2.5">
                    {Object.entries(activityByType)
                      .sort((a, b) => b[1] - a[1])
                      .map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between">
                          <span className="text-caption text-foreground capitalize">{type.replace("-", " ")}</span>
                          <span className="text-body font-semibold tabular text-foreground">{count}</span>
                        </div>
                      ))}
                  </div>
                )}
              </Card>
            </div>
          </FadeIn>
        </div>

        {/* Alerts */}
        <FadeIn delay={0.25}>
          <div className="mt-8">
            <h2 className="text-title text-foreground mb-4">Needs Attention</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <AlertCard label="Critical labs" value={criticalLabs} tone="danger" />
              <AlertCard label="Overdue payments" value={overdue} tone="warning" />
              <AlertCard label="High no-show risk" value={atRisk} tone="warning" />
            </div>
          </div>
        </FadeIn>

        {/* Footer */}
        <FadeIn delay={0.3}>
          <p className="text-center mt-12 text-editorial-italic text-muted-foreground/50 text-sm">
            Patterns, not guesses. Memory, not analytics.
          </p>
        </FadeIn>
      </div>
    </div>
  );
}

function MetricCard({ label, value, trend, direction, icon: Icon, spark, stroke }: {
  label: string; value: string; trend: string; direction: "up" | "down"; icon: React.ElementType; spark: number[]; stroke?: string;
}) {
  return (
    <Card className="p-5 veltra-shadow border-0 bg-card/50 backdrop-blur-sm">
      <div className="flex items-start justify-between mb-2">
        <p className="text-micro text-muted-foreground">{label}</p>
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <p className="text-2xl font-semibold tabular text-foreground tracking-[-0.02em]">{value}</p>
      <div className="flex items-center justify-between mt-2">
        <TrendBadge value={trend} direction={direction} />
        <Sparkline data={spark} width={60} height={20} stroke={stroke || "var(--veltra-emerald)"} />
      </div>
    </Card>
  );
}

function StatusBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-caption text-foreground">{label}</span>
        <span className="text-caption tabular text-muted-foreground">{value} ({pct}%)</span>
      </div>
      <div className="h-1.5 rounded-full bg-foreground/5 overflow-hidden">
        <div className={cn("h-full rounded-full veltra-transition", color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function AlertCard({ label, value, tone }: { label: string; value: number; tone: "danger" | "warning" }) {
  return (
    <Card className={cn("p-5 veltra-shadow border-0", tone === "danger" ? "bg-red-500/5" : "bg-amber-500/5")}>
      <p className="text-micro text-muted-foreground">{label}</p>
      <p className={cn("text-3xl font-semibold tabular mt-2", tone === "danger" ? "text-red-400" : "text-amber-400")}>{value}</p>
    </Card>
  );
}
