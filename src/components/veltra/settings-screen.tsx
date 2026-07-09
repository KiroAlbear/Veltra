"use client";

import { useVeltra, PERMISSIONS } from "@/lib/veltra-store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Settings as SettingsIcon, Shield, User, LogOut, Check, X, RotateCcw } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { FadeIn } from "./motion";
import { useToast } from "@/hooks/use-toast";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrator",
  doctor: "Doctor",
  receptionist: "Receptionist",
  nurse: "Nurse",
};

export function SettingsScreen() {
  const currentUser = useVeltra((s) => s.currentUser);
  const logout = useVeltra((s) => s.logout);
  const resetDemo = useVeltra((s) => s.resetDemo);
  const { toast } = useToast();

  if (!currentUser) return null;

  const perms = PERMISSIONS[currentUser.role];

  const permItems: { key: keyof typeof perms; label: string }[] = [
    { key: "canBook", label: "Book appointments" },
    { key: "canConfirm", label: "Confirm appointments" },
    { key: "canCheckIn", label: "Check in patients" },
    { key: "canComplete", label: "Complete visits" },
    { key: "canCancel", label: "Cancel appointments" },
    { key: "canEditPatient", label: "Edit patient records" },
    { key: "canPrescribe", label: "Prescribe medication" },
    { key: "canViewAudit", label: "View audit log" },
    { key: "canResetDemo", label: "Reset demo data" },
    { key: "canManageUsers", label: "Manage users" },
  ];

  return (
    <div className="min-h-screen veltra-ambient">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-8 sm:py-10 md:px-12 md:py-14">
        <FadeIn>
          <header className="mb-10">
            <div className="flex items-center gap-2 mb-3">
              <SettingsIcon className="h-3.5 w-3.5 text-veltra-emerald" />
              <span className="text-micro text-veltra-emerald">Settings</span>
            </div>
            <h1 className="text-[2.5rem] leading-[1.05] tracking-[-0.035em] text-foreground font-semibold">
              <span className="text-editorial-italic text-muted-foreground">Your</span>{" "}
              account.
            </h1>
          </header>
        </FadeIn>

        {/* Profile card */}
        <FadeIn delay={0.1}>
          <Card className="p-8 veltra-shadow-lg veltra-glass border-0 mb-6 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-veltra-emerald/8 rounded-full blur-3xl pointer-events-none" />
            <div className="relative flex items-start gap-5">
              <div className={cn("h-16 w-16 rounded-full flex items-center justify-center text-lg font-semibold flex-shrink-0", currentUser.avatarColor)}>
                {currentUser.initials}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-title text-foreground font-semibold">{currentUser.name}</h2>
                <p className="text-caption text-muted-foreground mt-1">{currentUser.title}</p>
                <p className="text-caption text-muted-foreground/70 mt-0.5">{currentUser.email}</p>
                <div className="flex items-center gap-2 mt-3">
                  <Badge variant="outline" className="text-micro font-medium border-veltra-emerald/30 bg-veltra-emerald/10 text-veltra-emerald uppercase tracking-wider">
                    <Shield className="mr-1 h-2.5 w-2.5" />
                    {ROLE_LABELS[currentUser.role]}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        </FadeIn>

        {/* Permissions */}
        <FadeIn delay={0.15}>
          <Card className="p-6 veltra-shadow border-0 bg-card/50 backdrop-blur-sm mb-6">
            <div className="flex items-baseline justify-between mb-5">
              <h3 className="text-title text-foreground">Permissions</h3>
              <span className="text-caption text-muted-foreground">Role: {ROLE_LABELS[currentUser.role]}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {permItems.map((item) => {
                const allowed = perms[item.key] as boolean;
                return (
                  <div
                    key={item.key}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg",
                      allowed ? "bg-emerald-500/5" : "bg-muted/30"
                    )}
                  >
                    {allowed ? (
                      <Check className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <X className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
                    )}
                    <span className={cn(
                      "text-caption flex-1",
                      allowed ? "text-foreground" : "text-muted-foreground line-through"
                    )}>
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </FadeIn>

        {/* Preferences */}
        <FadeIn delay={0.2}>
          <Card className="p-6 veltra-shadow border-0 bg-card/50 backdrop-blur-sm mb-6">
            <h3 className="text-title text-foreground mb-5">Preferences</h3>
            <div className="flex items-center justify-between py-3 border-b border-border/40 last:border-0">
              <div>
                <p className="text-body font-medium text-foreground">Theme</p>
                <p className="text-caption text-muted-foreground mt-0.5">Switch between dark and light mode</p>
              </div>
              <ThemeToggle />
            </div>
          </Card>
        </FadeIn>

        {/* Danger zone */}
        <FadeIn delay={0.25}>
          <Card className="p-6 veltra-shadow border-0 bg-card/50 backdrop-blur-sm">
            <h3 className="text-title text-foreground mb-5">Session</h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => {
                  if (confirm("Reset all demo data? This cannot be undone.")) {
                    resetDemo();
                    toast({ title: "Demo reset", description: "All data restored to original." });
                  }
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 text-amber-300 text-caption font-medium hover:bg-amber-500/10 veltra-transition"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset demo data
              </button>
              <button
                onClick={() => {
                  logout();
                  toast({ title: "Signed out", description: "See you tomorrow, doctor." });
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-red-500/20 bg-red-500/5 text-red-300 text-caption font-medium hover:bg-red-500/10 veltra-transition"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            </div>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}
