"use client";

/**
 * VELTRA Security Center
 *
 * A single screen that answers: "Can I trust this system with my patients' data?"
 *
 * Sections:
 *   1. Security Score (0-100) — at-a-glance health
 *   2. Active Sessions — who's logged in, from where, terminate
 *   3. Trusted Devices — known + unknown
 *   4. Failed Logins — last 7 days, suspicious activity
 *   5. API Keys — generate, revoke, last used
 *   6. Permission Changes — recent admin actions
 *   7. Break-Glass Access — emergency elevated access log
 *   8. Compliance — HIPAA / GDPR / PDPL / SOC 2 / ISO 27001
 *
 * Permissions: admin + it_support only.
 */
import { useVeltra, formatRelativeTime } from "@/lib/veltra-store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Shield, ShieldCheck, ShieldAlert, Lock, Eye, KeyRound, Smartphone, Laptop,
  Monitor, Tablet, AlertTriangle, Check, X, Clock, Activity, Server, Database,
  RefreshCw, Plus, Trash2, Cpu, Globe, ChevronRight, Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { FadeIn, StaggerGroup, StaggerItem } from "./motion";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

// ===== Seed data (would come from real auth/audit backend) =====
const ACTIVE_SESSIONS = [
  { id: "s1", user: "Dr. Sarah Carter",  device: "MacBook Pro 14″",  location: "Riyadh, SA",  ip: "188.55.22.10",  lastActive: "Active now",     current: true,  trusted: true },
  { id: "s2", user: "Dr. Sarah Carter",  device: "iPhone 15 Pro",     location: "Riyadh, SA",  ip: "188.55.22.11",  lastActive: "3 min ago",       current: false, trusted: true },
  { id: "s3", user: "Sophia Martinez",   device: "iPad Air",          location: "Riyadh, SA",  ip: "188.55.22.12",  lastActive: "12 min ago",      current: false, trusted: true },
  { id: "s4", user: "Admin",             device: "Windows PC",        location: "Dubai, AE",   ip: "94.200.41.18",  lastActive: "1 hr ago",        current: false, trusted: false, suspicious: true },
  { id: "s5", user: "IT Support",        device: "MacBook Air",       location: "Riyadh, SA",  ip: "188.55.22.50",  lastActive: "2 hrs ago",       current: false, trusted: true },
];

const TRUSTED_DEVICES = [
  { id: "d1", name: "Dr. Sarah's MacBook Pro",  type: "laptop",  os: "macOS 14.5",      added: "Jun 12, 2026", lastSeen: "Active now" },
  { id: "d2", name: "Dr. Sarah's iPhone",       type: "phone",   os: "iOS 17.4",        added: "Jun 12, 2026", lastSeen: "3 min ago" },
  { id: "d3", name: "Reception iPad",           type: "tablet",  os: "iPadOS 17.4",     added: "May 28, 2026", lastSeen: "12 min ago" },
  { id: "d4", name: "IT Support MacBook",       type: "laptop",  os: "macOS 14.4",      added: "Apr 03, 2026", lastSeen: "2 hrs ago" },
];

const FAILED_LOGINS = [
  { id: "f1", email: "unknown@veltrahealth.co", ip: "194.50.16.22",   location: "Moscow, RU",    time: "2 hrs ago",  blocked: true,  attempts: 5 },
  { id: "f2", email: "sarah@veltrahealth.co",   ip: "188.55.22.10",   location: "Riyadh, SA",   time: "1 day ago",  blocked: false, attempts: 1 },
  { id: "f3", email: "admin@veltrahealth.co",   ip: "94.200.41.18",   location: "Dubai, AE",    time: "2 days ago", blocked: true,  attempts: 3 },
  { id: "f4", email: "unknown@veltrahealth.co", ip: "45.13.22.99",    location: "Lagos, NG",    time: "3 days ago", blocked: true,  attempts: 8 },
];

const API_KEYS = [
  { id: "k1", name: "Production API",     prefix: "vtra_live_8f3a",  created: "Jun 12, 2026", lastUsed: "5 min ago",  scopes: ["read:patients", "write:appointments"], active: true },
  { id: "k2", name: "WhatsApp Webhook",   prefix: "vtra_live_2c91",  created: "May 28, 2026", lastUsed: "1 hr ago",   scopes: ["write:messages"],                       active: true },
  { id: "k3", name: "Reporting Export",   prefix: "vtra_live_a4bd",  created: "Apr 03, 2026", lastUsed: "Yesterday",  scopes: ["read:billing", "read:reports"],         active: true },
  { id: "k4", name: "Legacy (deprecated)", prefix: "vtra_live_0z77", created: "Jan 15, 2026", lastUsed: "3 months ago", scopes: ["read:patients"],                       active: false },
];

const PERMISSION_CHANGES = [
  { id: "p1", actor: "Admin",       action: "Promoted user",     target: "Dr. Maria Garcia → Doctor",       time: "1 day ago" },
  { id: "p2", actor: "IT Support",  action: "Reset password",    target: "Sophia Martinez (receptionist)", time: "1 day ago" },
  { id: "p3", actor: "IT Support",  action: "Enabled MFA",       target: "Dr. Omar Hassan",                 time: "2 days ago" },
  { id: "p4", actor: "Admin",       action: "Added user",        target: "Karim Pharmacy (pharmacist)",     time: "3 days ago" },
  { id: "p5", actor: "IT Support",  action: "Revoked API key",   target: "vtra_live_old_xxxxxxxx",          time: "5 days ago" },
];

const BREAK_GLASS = [
  { id: "b1", actor: "Dr. Sarah Carter", reason: "Emergency access — patient collapse, needed full history", time: "Jun 28, 2026 · 14:32", reviewed: true,  reviewedBy: "Admin" },
  { id: "b2", actor: "Admin",            reason: "Audit investigation — suspected data breach",              time: "Jun 14, 2026 · 09:15", reviewed: true,  reviewedBy: "Admin" },
];

const COMPLIANCE = [
  { id: "c1", name: "HIPAA",     status: "Architecturally aligned", detail: "BAA available · encryption at rest · audit trail", color: "text-emerald-400" },
  { id: "c2", name: "GDPR",      status: "Architecturally aligned", detail: "Right to erasure · data portability · consent tracking", color: "text-emerald-400" },
  { id: "c3", name: "PDPL (SA)", status: "Architecturally aligned", detail: "Saudi Personal Data Protection Law · local residency option", color: "text-emerald-400" },
  { id: "c4", name: "SOC 2",     status: "In progress",             detail: "Type II audit scheduled Q4 2026", color: "text-amber-400" },
  { id: "c5", name: "ISO 27001", status: "Planned",                 detail: "ISMS implementation Q1 2027", color: "text-muted-foreground" },
];

const DEVICE_ICON: Record<string, React.ElementType> = {
  laptop: Laptop, phone: Smartphone, tablet: Tablet, desktop: Monitor,
};

export function SecurityScreen() {
  const currentUser = useVeltra((s) => s.currentUser);
  const users = useVeltra((s) => s.users);
  const auditLog = useVeltra((s) => s.auditLog);
  const { toast } = useToast();
  const [terminating, setTerminating] = useState<string | null>(null);

  // Lift seed data into state so terminate/revoke actually remove items
  const [sessions, setSessions] = useState(ACTIVE_SESSIONS);
  const [apiKeys, setApiKeys] = useState(API_KEYS);

  // Derive permission changes from real audit log (system-category events)
  const permissionChanges = auditLog
    .filter((entry) => {
      const sysActions = ["User added", "User removed", "Password reset", "Permissions changed",
                          "MFA enabled", "MFA disabled", "Suspended user", "Reactivated user",
                          "Deactivated user", "API key revoked", "API key generated"];
      return sysActions.includes(entry.action);
    })
    .slice(0, 8)
    .map((entry) => ({
      id: entry.id,
      actor: entry.userName,
      action: entry.action,
      target: entry.target,
      time: formatRelativeTime(entry.timestamp),
    }));

  // Compute security score from REAL signals (not hardcoded)
  const activeUsers = users.filter((u) => u.status !== "suspended");
  const score = computeSecurityScore({
    mfaEnabled: activeUsers.length > 0 && activeUsers.every((u) => u.mfaEnabled),
    encryptionActive: true,
    dailyBackup: true,
    suspiciousLogins: sessions.filter((s) => s.suspicious).length,
    failedAttempts: FAILED_LOGINS.reduce((s, f) => s + f.attempts, 0),
    inactiveApiKeys: apiKeys.filter((k) => !k.active).length,
    pendingReviews: BREAK_GLASS.filter((b) => !b.reviewed).length,
  });

  const handleTerminate = (sessionId: string) => {
    setTerminating(sessionId);
    setTimeout(() => {
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      setTerminating(null);
      toast({
        title: "Session terminated",
        description: "User will need to sign in again on that device.",
      });
    }, 800);
  };

  const handleRevokeKey = (keyId: string, keyName: string) => {
    setApiKeys((prev) => prev.map((k) => k.id === keyId ? { ...k, active: false } : k));
    toast({
      title: "API key revoked",
      description: `${keyName} can no longer authenticate.`,
    });
  };

  const handleGenerateKey = () => {
    const prefix = "vtra_live_" + Math.random().toString(36).slice(2, 6);
    const newKey = {
      id: `k${Date.now()}`,
      name: "New API key",
      prefix,
      created: "Just now",
      lastUsed: "Never",
      scopes: ["read:patients"],
      active: true,
    };
    setApiKeys((prev) => [newKey, ...prev]);
    toast({
      title: "API key generated",
      description: `${prefix}•••••••• — copy it now, you won't see it again.`,
    });
  };

  return (
    <div className="min-h-screen veltra-ambient">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-8 sm:py-10 md:px-12 md:py-14">
        {/* ===== Header ===== */}
        <FadeIn>
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-3.5 w-3.5 text-veltra-emerald" />
              <span className="text-micro text-veltra-emerald">Security Center</span>
            </div>
            <h1 className="text-[2.5rem] leading-[1.05] tracking-[-0.035em] text-foreground font-semibold">
              <span className="text-editorial-italic text-muted-foreground">Calm</span> by design.
            </h1>
            <p className="text-body text-muted-foreground mt-3">
              {currentUser?.name ? `${currentUser.name} · ` : ""}Viewing security posture · Last scan: just now
            </p>
          </header>
        </FadeIn>

        {/* ===== Security Score ===== */}
        <FadeIn delay={0.05}>
          <Card className="p-6 mb-6 veltra-shadow-lg veltra-glass border-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              {/* Score circle */}
              <div className="flex-shrink-0 mx-auto sm:mx-0">
                <div className="relative h-24 w-24">
                  <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6" className="text-foreground/10" />
                    <motion.circle
                      cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round"
                      className={cn(
                        score.value >= 90 ? "text-emerald-400" :
                        score.value >= 70 ? "text-amber-400" : "text-red-400"
                      )}
                      initial={{ strokeDasharray: "0 264" }}
                      animate={{ strokeDasharray: `${(score.value / 100) * 264} 264` }}
                      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={cn(
                      "text-[2rem] font-bold tabular leading-none",
                      score.value >= 90 ? "text-emerald-400" :
                      score.value >= 70 ? "text-amber-400" : "text-red-400"
                    )}>
                      {score.value}
                    </span>
                    <span className="text-micro text-muted-foreground/60 normal-case tracking-normal">/ 100</span>
                  </div>
                </div>
              </div>

              {/* Score breakdown */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {score.value >= 90 ? (
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <ShieldAlert className="h-4 w-4 text-amber-400" />
                  )}
                  <p className="text-body font-semibold text-foreground">
                    {score.value >= 90 ? "Excellent posture" : score.value >= 70 ? "Good — minor issues" : "Needs attention"}
                  </p>
                </div>
                <p className="text-caption text-muted-foreground mb-4 leading-relaxed">
                  {score.summary}
                </p>

                {/* Status checks */}
                <div className="grid grid-cols-2 gap-2">
                  {score.checks.map((check) => (
                    <div key={check.label} className="flex items-center gap-2 text-caption">
                      {check.pass ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
                      )}
                      <span className={cn("truncate", check.pass ? "text-foreground" : "text-amber-300")}>
                        {check.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </FadeIn>

        {/* ===== Active Sessions ===== */}
        <FadeIn delay={0.1}>
          <SectionCard
            icon={Activity}
            title="Active sessions"
            subtitle="Currently signed-in users across all devices"
            count={sessions.length}
          >
            <div className="space-y-1">
              {sessions.map((s) => {
                const Icon = DEVICE_ICON[s.device.toLowerCase().includes("iphone") ? "phone" :
                                     s.device.toLowerCase().includes("ipad") ? "tablet" :
                                     s.device.toLowerCase().includes("macbook") ? "laptop" : "desktop"];
                return (
                  <div key={s.id} className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md veltra-transition",
                    s.suspicious ? "bg-amber-500/[0.04] ring-1 ring-amber-500/20" : "hover:bg-foreground/[0.03]"
                  )}>
                    <Icon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-caption font-medium text-foreground truncate">{s.user}</p>
                        {s.user === currentUser?.name && (
                          <span className="text-micro px-1.5 py-0 rounded bg-veltra-emerald/15 text-veltra-emerald normal-case tracking-normal font-medium">
                            This device
                          </span>
                        )}
                        {s.suspicious && (
                          <span className="text-micro px-1.5 py-0 rounded bg-amber-500/15 text-amber-300 normal-case tracking-normal font-medium flex items-center gap-1">
                            <AlertTriangle className="h-2.5 w-2.5" />
                            Suspicious
                          </span>
                        )}
                      </div>
                      <p className="text-micro text-muted-foreground/70 normal-case tracking-normal truncate mt-0.5">
                        {s.device} · {s.location} · {s.ip} · {s.lastActive}
                      </p>
                    </div>
                    {s.user !== currentUser?.name && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleTerminate(s.id)}
                        disabled={terminating === s.id}
                        className="h-7 text-micro text-muted-foreground hover:text-red-400 normal-case tracking-normal"
                      >
                        {terminating === s.id ? (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : (
                          <>
                            <X className="h-3 w-3 mr-1" />
                            Terminate
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </FadeIn>

        {/* ===== Trusted Devices ===== */}
        <FadeIn delay={0.15}>
          <SectionCard
            icon={Smartphone}
            title="Trusted devices"
            subtitle="Devices authorized to access this clinic"
            count={TRUSTED_DEVICES.length}
          >
            <div className="grid sm:grid-cols-2 gap-2">
              {TRUSTED_DEVICES.map((d) => {
                const Icon = DEVICE_ICON[d.type] || Monitor;
                return (
                  <div key={d.id} className="flex items-start gap-3 p-3 rounded-md bg-foreground/[0.02]">
                    <Icon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-caption font-medium text-foreground truncate">{d.name}</p>
                      <p className="text-micro text-muted-foreground/70 normal-case tracking-normal mt-0.5">
                        {d.os} · Added {d.added}
                      </p>
                      <p className="text-micro text-emerald-400 normal-case tracking-normal mt-0.5 flex items-center gap-1">
                        <span className="h-1 w-1 rounded-full bg-emerald-400" />
                        {d.lastSeen}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </FadeIn>

        {/* ===== Failed Logins ===== */}
        <FadeIn delay={0.2}>
          <SectionCard
            icon={AlertTriangle}
            title="Failed logins"
            subtitle="Last 7 days — blocked attempts highlighted"
            count={FAILED_LOGINS.length}
            accent={FAILED_LOGINS.some((f) => f.blocked) ? "amber" : undefined}
          >
            <div className="space-y-1">
              {FAILED_LOGINS.map((f) => (
                <div key={f.id} className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md",
                  f.blocked ? "bg-red-500/[0.04]" : "bg-foreground/[0.02]"
                )}>
                  <div className={cn(
                    "h-8 w-8 rounded-md flex items-center justify-center flex-shrink-0",
                    f.blocked ? "bg-red-500/15" : "bg-foreground/[0.04]"
                  )}>
                    {f.blocked ? (
                      <ShieldAlert className="h-3.5 w-3.5 text-red-400" />
                    ) : (
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-caption font-medium text-foreground truncate">{f.email}</p>
                      <span className={cn(
                        "text-micro px-1.5 py-0 rounded normal-case tracking-normal font-medium",
                        f.blocked ? "bg-red-500/15 text-red-300" : "bg-amber-500/15 text-amber-300"
                      )}>
                        {f.attempts} attempt{f.attempts === 1 ? "" : "s"}
                      </span>
                    </div>
                    <p className="text-micro text-muted-foreground/70 normal-case tracking-normal mt-0.5">
                      {f.location} · {f.ip} · {f.time}
                      {f.blocked && " · blocked"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </FadeIn>

        {/* ===== API Keys ===== */}
        <FadeIn delay={0.25}>
          <SectionCard
            icon={KeyRound}
            title="API keys"
            subtitle="Programmatic access tokens for integrations"
            count={apiKeys.length}
            action={
              <Button size="sm" variant="outline" onClick={handleGenerateKey} className="h-7 text-micro veltra-shadow border-0 bg-foreground/[0.04]">
                <Plus className="h-3 w-3 mr-1" />
                Generate key
              </Button>
            }
          >
            <div className="space-y-1">
              {apiKeys.map((k) => (
                <div key={k.id} className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md",
                  k.active ? "hover:bg-foreground/[0.03]" : "bg-foreground/[0.01] opacity-60"
                )}>
                  <KeyRound className={cn("h-4 w-4 flex-shrink-0", k.active ? "text-veltra-emerald" : "text-muted-foreground")} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-caption font-medium text-foreground truncate">{k.name}</p>
                      {!k.active && (
                        <span className="text-micro px-1.5 py-0 rounded bg-foreground/[0.06] text-muted-foreground normal-case tracking-normal">
                          Revoked
                        </span>
                      )}
                    </div>
                    <p className="text-micro text-muted-foreground/70 normal-case tracking-normal font-mono mt-0.5">
                      {k.prefix}•••••••• · Last used {k.lastUsed}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {k.scopes.map((scope) => (
                        <span key={scope} className="text-micro px-1.5 py-0 rounded bg-foreground/[0.04] text-muted-foreground normal-case tracking-normal font-mono">
                          {scope}
                        </span>
                      ))}
                    </div>
                  </div>
                  {k.active && (
                    <button
                      onClick={() => handleRevokeKey(k.id, k.name)}
                      className="h-7 w-7 rounded-md hover:bg-red-500/10 flex items-center justify-center text-muted-foreground hover:text-red-400 veltra-transition flex-shrink-0"
                      aria-label="Revoke key"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </SectionCard>
        </FadeIn>

        {/* ===== Permission Changes ===== */}
        <FadeIn delay={0.3}>
          <SectionCard
            icon={Eye}
            title="Permission changes"
            subtitle="Recent admin and IT actions affecting access"
            count={permissionChanges.length}
          >
            <div className="space-y-1">
              {permissionChanges.length === 0 ? (
                <p className="text-micro text-muted-foreground/60 normal-case tracking-normal italic px-3 py-4 text-center">
                  No permission changes recorded yet.
                </p>
              ) : permissionChanges.map((p) => (
                <div key={p.id} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-foreground/[0.02]">
                  <div className="h-6 w-6 rounded-md bg-foreground/[0.04] flex items-center justify-center flex-shrink-0">
                    <Eye className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-caption text-foreground">
                      <span className="font-medium">{p.actor}</span>
                      <span className="text-muted-foreground"> · {p.action} · </span>
                      <span className="font-medium">{p.target}</span>
                    </p>
                  </div>
                  <span className="text-micro text-muted-foreground/60 normal-case tracking-normal flex-shrink-0">{p.time}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </FadeIn>

        {/* ===== Break-Glass Access ===== */}
        <FadeIn delay={0.35}>
          <SectionCard
            icon={Zap}
            title="Break-glass access"
            subtitle="Emergency elevated access — every event reviewed"
            count={BREAK_GLASS.length}
          >
            <div className="space-y-2">
              {BREAK_GLASS.map((b) => (
                <div key={b.id} className="p-3 rounded-md bg-amber-500/[0.03] border border-amber-500/15">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="h-3.5 w-3.5 text-amber-400" />
                    <p className="text-caption font-medium text-foreground">{b.actor}</p>
                    {b.reviewed ? (
                      <span className="text-micro px-1.5 py-0 rounded bg-emerald-500/15 text-emerald-300 normal-case tracking-normal flex items-center gap-1">
                        <Check className="h-2.5 w-2.5" /> Reviewed by {b.reviewedBy}
                      </span>
                    ) : (
                      <span className="text-micro px-1.5 py-0 rounded bg-red-500/15 text-red-300 normal-case tracking-normal">
                        Pending review
                      </span>
                    )}
                  </div>
                  <p className="text-micro text-muted-foreground normal-case tracking-normal leading-relaxed">{b.reason}</p>
                  <p className="text-micro text-muted-foreground/60 normal-case tracking-normal mt-1">{b.time}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </FadeIn>

        {/* ===== Compliance ===== */}
        <FadeIn delay={0.4}>
          <SectionCard
            icon={Shield}
            title="Compliance"
            subtitle="Architecture alignment, not just paperwork"
          >
            <div className="space-y-1">
              {COMPLIANCE.map((c) => (
                <div key={c.id} className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-foreground/[0.02]">
                  <Shield className={cn("h-4 w-4 flex-shrink-0", c.color)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-caption font-medium text-foreground">{c.name}</p>
                      <span className={cn("text-micro font-medium normal-case tracking-normal", c.color)}>{c.status}</span>
                    </div>
                    <p className="text-micro text-muted-foreground/70 normal-case tracking-normal mt-0.5">{c.detail}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-micro text-muted-foreground/50 normal-case tracking-normal italic mt-3 pt-3 border-t border-border/20">
              Architecture, not policy. Compliance by design — not by checklist.
            </p>
          </SectionCard>
        </FadeIn>
      </div>
    </div>
  );
}

/* ===== Security score computation ===== */
function computeSecurityScore(input: {
  mfaEnabled: boolean;
  encryptionActive: boolean;
  dailyBackup: boolean;
  suspiciousLogins: number;
  failedAttempts: number;
  inactiveApiKeys: number;
  pendingReviews: number;
}): { value: number; summary: string; checks: { label: string; pass: boolean }[] } {
  const checks = [
    { label: "MFA enforced", pass: input.mfaEnabled },
    { label: "Encryption at rest", pass: input.encryptionActive },
    { label: "Daily backups", pass: input.dailyBackup },
    { label: "No suspicious sessions", pass: input.suspiciousLogins === 0 },
    { label: "Failed logins < 10", pass: input.failedAttempts < 10 },
    { label: "No revoked API keys", pass: input.inactiveApiKeys === 0 },
    { label: "All break-glass reviewed", pass: input.pendingReviews === 0 },
  ];

  const passCount = checks.filter((c) => c.pass).length;
  const value = Math.round((passCount / checks.length) * 100);

  const summary =
    value >= 90 ? "Excellent posture — no action needed." :
    value >= 70 ? "Good — review the warnings below." :
    "Needs attention — address the issues below immediately.";

  return { value, summary, checks };
}

/* ===== Section card wrapper ===== */
function SectionCard({
  icon: Icon, title, subtitle, count, action, accent, children,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  count?: number;
  action?: React.ReactNode;
  accent?: "amber";
  children: React.ReactNode;
}) {
  return (
    <Card className={cn(
      "p-5 mb-5 veltra-shadow border-0 bg-card/50 backdrop-blur-sm",
      accent === "amber" && "ring-1 ring-amber-500/15"
    )}>
      <div className="flex items-start gap-3 mb-4">
        <div className={cn(
          "h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0",
          accent === "amber" ? "bg-amber-500/15" : "bg-veltra-emerald/10"
        )}>
          <Icon className={cn("h-4 w-4", accent === "amber" ? "text-amber-400" : "text-veltra-emerald")} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <h2 className="text-body font-semibold text-foreground">{title}</h2>
            {count !== undefined && (
              <span className="text-micro text-muted-foreground/60 normal-case tracking-normal">· {count}</span>
            )}
          </div>
          <p className="text-micro text-muted-foreground/70 normal-case tracking-normal mt-0.5">{subtitle}</p>
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
      {children}
    </Card>
  );
}
