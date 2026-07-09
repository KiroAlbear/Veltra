"use client";

import { useVeltra } from "@/lib/veltra-store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Shield,
  History,
  LogIn,
  LogOut,
  RotateCcw,
  Calendar,
  Check,
  UserCheck,
  X,
  Stethoscope,
  DollarSign,
  Server,
  Database,
  UserPlus,
  KeyRound,
  AlertTriangle,
  Plug,
} from "lucide-react";
import { formatRelativeTime, formatDate } from "@/lib/veltra-store";
import { FadeIn, StaggerGroup, StaggerItem } from "./motion";

const ACTION_ICONS: Record<string, { icon: React.ElementType; tint: string }> = {
  // Auth
  "Logged in": { icon: LogIn, tint: "text-emerald-400 bg-emerald-500/10" },
  "Logged out": { icon: LogOut, tint: "text-slate-400 bg-slate-500/10" },
  "Logged in (demo)": { icon: LogIn, tint: "text-emerald-400 bg-emerald-500/10" },
  "Failed login": { icon: AlertTriangle, tint: "text-red-400 bg-red-500/10" },
  // Appointments
  "Booked appointment": { icon: Calendar, tint: "text-violet-400 bg-violet-500/10" },
  "Confirmed appointment": { icon: Check, tint: "text-emerald-400 bg-emerald-500/10" },
  "Checked in patient": { icon: UserCheck, tint: "text-purple-400 bg-purple-500/10" },
  "Completed appointment": { icon: Stethoscope, tint: "text-emerald-400 bg-emerald-500/10" },
  "Cancelled appointment": { icon: X, tint: "text-red-400 bg-red-500/10" },
  "Rescheduled appointment": { icon: Calendar, tint: "text-violet-400 bg-violet-500/10" },
  // Clinical
  "Prescribed medication": { icon: Stethoscope, tint: "text-rose-400 bg-rose-500/10" },
  "Added patient note": { icon: Stethoscope, tint: "text-emerald-400 bg-emerald-500/10" },
  "Recorded vitals": { icon: Stethoscope, tint: "text-violet-400 bg-violet-500/10" },
  "Ordered lab": { icon: Stethoscope, tint: "text-cyan-400 bg-cyan-500/10" },
  // Billing
  "Payment collected": { icon: DollarSign, tint: "text-emerald-400 bg-emerald-500/10" },
  // Inventory
  "Adjusted stock": { icon: RotateCcw, tint: "text-amber-400 bg-amber-500/10" },
  "Dispensed medication": { icon: RotateCcw, tint: "text-rose-400 bg-rose-500/10" },
  // Demo
  "Reset demo data": { icon: RotateCcw, tint: "text-amber-400 bg-amber-500/10" },
  // IT / System (only visible to it_support + admin)
  "Service restarted": { icon: Server, tint: "text-blue-400 bg-blue-500/10" },
  "Database backup": { icon: Database, tint: "text-cyan-400 bg-cyan-500/10" },
  "API timeout": { icon: AlertTriangle, tint: "text-amber-400 bg-amber-500/10" },
  "User added": { icon: UserPlus, tint: "text-blue-400 bg-blue-500/10" },
  "User removed": { icon: UserPlus, tint: "text-red-400 bg-red-500/10" },
  "Password reset": { icon: KeyRound, tint: "text-amber-400 bg-amber-500/10" },
  "Permissions changed": { icon: Shield, tint: "text-rose-400 bg-rose-500/10" },
  "MFA enabled": { icon: Shield, tint: "text-emerald-400 bg-emerald-500/10" },
  "Webhook failed": { icon: Plug, tint: "text-red-400 bg-red-500/10" },
  "Integration error": { icon: Plug, tint: "text-amber-400 bg-amber-500/10" },
  "License expired": { icon: AlertTriangle, tint: "text-red-400 bg-red-500/10" },
  "Device synced": { icon: Server, tint: "text-emerald-400 bg-emerald-500/10" },
};

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-rose-500/10 text-rose-300 border-rose-500/20",
  doctor: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  receptionist: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  nurse: "bg-violet-500/10 text-violet-300 border-violet-500/20",
  pharmacist: "bg-pink-500/10 text-pink-300 border-pink-500/20",
  lab_tech: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
  radiologist: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
  finance: "bg-orange-500/10 text-orange-300 border-orange-500/20",
  it_support: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  operations: "bg-teal-500/10 text-teal-300 border-teal-500/20",
};

/**
 * Audit log category per action. Each role sees only their own category + shared auth events.
 *
 * Categories:
 *   - auth        — everyone (login/logout/failed login)
 *   - clinical    — doctor + nurse (prescribe, vitals, labs, visits)
 *   - scheduling  — doctor + receptionist + nurse (bookings, check-in)
 *   - billing     — admin + operations + finance (payments)
 *   - inventory   — admin + operations + pharmacist (stock, dispense)
 *   - system      — admin + it_support only (service restart, backups, users, webhooks)
 *   - demo        — admin only (reset)
 */
const ACTION_CATEGORY: Record<string, "auth" | "clinical" | "scheduling" | "billing" | "inventory" | "system" | "demo"> = {
  "Logged in": "auth",
  "Logged out": "auth",
  "Logged in (demo)": "auth",
  "Failed login": "auth",
  "Booked appointment": "scheduling",
  "Confirmed appointment": "scheduling",
  "Checked in patient": "scheduling",
  "Completed appointment": "clinical",
  "Cancelled appointment": "scheduling",
  "Rescheduled appointment": "scheduling",
  "Prescribed medication": "clinical",
  "Added patient note": "clinical",
  "Recorded vitals": "clinical",
  "Ordered lab": "clinical",
  "Payment collected": "billing",
  "Adjusted stock": "inventory",
  "Dispensed medication": "inventory",
  "Reset demo data": "demo",
  // System
  "Service restarted": "system",
  "Database backup": "system",
  "API timeout": "system",
  "User added": "system",
  "User removed": "system",
  "Password reset": "system",
  "Permissions changed": "system",
  "MFA enabled": "system",
  "Webhook failed": "system",
  "Integration error": "system",
  "License expired": "system",
  "Device synced": "system",
};

/** What categories each role can see in the audit log. */
const ROLE_AUDIT_VISIBILITY: Record<string, Array<"auth" | "clinical" | "scheduling" | "billing" | "inventory" | "system" | "demo">> = {
  admin:        ["auth", "clinical", "scheduling", "billing", "inventory", "system", "demo"],
  it_support:   ["auth", "system"],                       // IT sees only system + auth events
  operations:   ["auth", "billing", "inventory"],         // Operations sees only operational events
  doctor:       ["auth", "clinical", "scheduling"],       // Doctor sees only their clinical actions
  nurse:        ["auth", "clinical", "scheduling"],       // Nurse sees only clinical actions
  receptionist: ["auth", "scheduling"],                   // Receptionist sees only scheduling
  pharmacist:   ["auth", "inventory"],                    // Pharmacist sees only inventory + auth
  lab_tech:     ["auth", "clinical"],                     // Lab tech sees only lab-related clinical events
  radiologist:  ["auth", "clinical"],                     // Radiologist sees only imaging-related clinical events
  finance:      ["auth", "billing"],                      // Finance sees only billing + auth
};

export function AuditScreen() {
  const auditLog = useVeltra((s) => s.auditLog);
  const currentUser = useVeltra((s) => s.currentUser);
  const role = currentUser?.role || "doctor";

  // Filter audit log entries by what this role is allowed to see
  const visibleCategories = ROLE_AUDIT_VISIBILITY[role] || ["auth"];
  const filteredLog = auditLog.filter((entry) => {
    const category = ACTION_CATEGORY[entry.action] || "auth";
    return visibleCategories.includes(category);
  });

  // Build category label for the header subtitle
  const categoryLabel = role === "admin"
    ? "Full visibility (all categories)"
    : role === "it_support"
    ? "System events + auth only"
    : role === "operations"
    ? "Operational events (billing + inventory) only"
    : role === "receptionist"
    ? "Scheduling events only"
    : "Clinical + scheduling events only";

  return (
    <div className="min-h-screen veltra-ambient">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-8 sm:py-10 md:px-12 md:py-14">
        <FadeIn>
          <header className="mb-10">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-3.5 w-3.5 text-veltra-emerald" />
              <span className="text-micro text-veltra-emerald">Audit Log</span>
            </div>
            <h1 className="text-[2.5rem] leading-[1.05] tracking-[-0.035em] text-foreground font-semibold">
              <span className="text-editorial-italic text-muted-foreground">Every action,</span>{" "}
              remembered.
            </h1>
            <p className="text-body text-muted-foreground mt-3">
              {filteredLog.length} events visible to <span className="text-foreground font-medium">{currentUser?.name}</span>
              <span className="text-micro text-muted-foreground/70 normal-case tracking-normal block mt-1">
                {categoryLabel}
              </span>
            </p>
          </header>
        </FadeIn>

        <FadeIn delay={0.1}>
          <Card className="veltra-shadow border-0 bg-card/50 backdrop-blur-sm overflow-hidden">
            <StaggerGroup>
              {filteredLog.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <div className="mx-auto h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                    <History className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-editorial-italic text-body text-muted-foreground">
                    Nothing in your scope yet. Events appear here as they happen.
                  </p>
                </div>
              ) : (
                filteredLog.map((entry, idx) => {
                  const cfg = ACTION_ICONS[entry.action] || { icon: History, tint: "text-slate-400 bg-slate-500/10" };
                  const Icon = cfg.icon;
                  return (
                    <StaggerItem key={entry.id}>
                      <div
                        className={cn(
                          "flex items-center gap-4 px-6 py-4 veltra-transition hover:bg-foreground/[0.03]",
                          idx !== filteredLog.length - 1 && "border-b border-border/40"
                        )}
                      >
                        <div className={cn("flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center", cfg.tint)}>
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-body font-medium text-foreground">
                            {entry.action}
                          </p>
                          <p className="text-caption text-muted-foreground truncate mt-0.5">
                            {entry.target}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <Badge variant="outline" className={cn("text-micro font-medium border normal-case tracking-normal", ROLE_COLORS[entry.userRole])}>
                            {entry.userRole}
                          </Badge>
                          <div className="text-right">
                            <p className="text-caption font-medium text-foreground">{entry.userName}</p>
                            <p className="text-micro text-muted-foreground/70 normal-case tracking-normal mt-0.5">
                              {formatRelativeTime(entry.timestamp)} · {formatDate(entry.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </StaggerItem>
                  );
                })
              )}
            </StaggerGroup>
          </Card>
        </FadeIn>

        <FadeIn delay={0.2}>
          <p className="text-center mt-8 text-editorial-italic text-muted-foreground/50 text-sm">
            Accountability is not a feature. It is what separates a Chief of Staff from a tool.
          </p>
        </FadeIn>
      </div>
    </div>
  );
}
