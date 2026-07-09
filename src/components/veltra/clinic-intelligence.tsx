"use client";

/**
 * ClinicIntelligenceStrip — proactive alerts for Today's Brief.
 *
 * VELTRA doesn't wait for the doctor to find problems. It surfaces them.
 * This strip shows 1-6 computed alerts (no-show risk, inventory, claims,
 * critical labs, revenue trend, overdue follow-ups).
 *
 * Each alert:
 *   - severity color (critical = red, warning = amber, info = neutral)
 *   - title + detail
 *   - metric badge (e.g. "+18%", "3 critical")
 *   - action button → navigates to relevant screen
 */
import { useVeltra } from "@/lib/veltra-store";
import { computeClinicIntelligence, type IntelligenceAlert } from "@/lib/health-score";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Package,
  DollarSign,
  Activity,
  Calendar,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Sparkles,
} from "lucide-react";

const CATEGORY_ICON: Record<IntelligenceAlert["category"], React.ElementType> = {
  scheduling: Calendar,
  inventory: Package,
  financial: DollarSign,
  clinical: Activity,
  operational: AlertTriangle,
};

const SEVERITY_STYLE: Record<IntelligenceAlert["severity"], { bg: string; border: string; text: string; icon: string }> = {
  critical: { bg: "bg-red-500/8",       border: "border-red-500/30",       text: "text-red-400",       icon: "text-red-400" },
  warning:  { bg: "bg-amber-500/8",     border: "border-amber-500/30",     text: "text-amber-400",     icon: "text-amber-400" },
  info:     { bg: "bg-blue-500/8", border: "border-blue-500/30", text: "text-blue-400", icon: "text-blue-400" },
};

export function ClinicIntelligenceStrip() {
  const patients = useVeltra((s) => s.patients);
  const appointments = useVeltra((s) => s.appointments);
  const medications = useVeltra((s) => s.medications);
  const claims = useVeltra((s) => s.insuranceClaims);
  const labResults = useVeltra((s) => s.labResults);
  const setView = useVeltra((s) => s.setView);

  const alerts = computeClinicIntelligence(patients, appointments, medications, claims, labResults);

  if (alerts.length === 0) {
    return (
      <div className="rounded-xl veltra-glass p-4 flex items-center gap-3 bg-emerald-500/5 border border-emerald-500/20">
        <Sparkles className="h-4 w-4 text-emerald-400 flex-shrink-0" />
        <p className="text-caption text-foreground">
          All clear — no urgent issues detected. Your clinic is running smoothly.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-3.5 w-3.5 text-veltra-emerald" />
        <p className="text-micro text-veltra-emerald font-medium uppercase tracking-wider">
          Clinic Intelligence
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {alerts.slice(0, 6).map((alert, idx) => {
          const Icon = CATEGORY_ICON[alert.category];
          const style = SEVERITY_STYLE[alert.severity];
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * idx, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "rounded-xl p-4 border veltra-transition hover:-translate-y-0.5 focus-within:ring-2 focus-within:ring-veltra-emerald focus-within:outline-none",
                style.bg, style.border
              )}
              onClick={() => alert.actionTarget && setView(alert.actionTarget as any)}
            >
              <div className="flex items-start gap-3">
                <Icon className={cn("h-4 w-4 flex-shrink-0 mt-0.5", style.icon)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className={cn("text-caption font-medium leading-snug", style.text)}>
                      {alert.title}
                    </p>
                    {alert.metric && (
                      <span className={cn("text-micro font-semibold tabular flex items-center gap-0.5 flex-shrink-0", style.text)}>
                        {alert.trend === "up" && <TrendingUp className="h-2.5 w-2.5" />}
                        {alert.trend === "down" && <TrendingDown className="h-2.5 w-2.5" />}
                        {alert.metric}
                      </span>
                    )}
                  </div>
                  <p className="text-micro text-muted-foreground/80 normal-case tracking-normal leading-relaxed mb-2">
                    {alert.detail}
                  </p>
                  {alert.actionLabel && (
                    <p className="text-micro text-veltra-emerald hover:text-veltra-emerald-dark normal-case tracking-normal flex items-center gap-0.5">
                      {alert.actionLabel}
                      <ChevronRight className="h-2.5 w-2.5" />
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
