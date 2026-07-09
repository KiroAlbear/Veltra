"use client";

/**
 * VELTRA User Management
 *
 * A single screen that answers: "Who has access to my clinic, and what can they do?"
 *
 * Sections:
 *   1. Stats overview — total users, active, suspended, MFA %
 *   2. User list — searchable, filterable by role
 *   3. Per-user actions: View profile · Suspend · Deactivate · Reset password · Transfer
 *   4. Invite new user — modal with role + branch assignment
 *
 * Permissions: admin only.
 */
import { useVeltra, PERMISSIONS, type User, type Role } from "@/lib/veltra-store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Users, UserPlus, Search, MoreVertical, Shield, Mail, Clock, Activity,
  Check, X, KeyRound, Ban, UserX, UserCheck, AlertTriangle, ChevronDown,
} from "lucide-react";
import { FadeIn, StaggerGroup, StaggerItem } from "./motion";
import { useToast } from "@/hooks/use-toast";
import { useState, useMemo, useEffect } from "react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

const ROLE_LABELS: Record<Role, { label: string; color: string }> = {
  admin:        { label: "Admin",         color: "bg-rose-500/10 text-rose-300 border-rose-500/20" },
  doctor:       { label: "Doctor",        color: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" },
  receptionist: { label: "Receptionist",  color: "bg-amber-500/10 text-amber-300 border-amber-500/20" },
  nurse:        { label: "Nurse",         color: "bg-violet-500/10 text-violet-300 border-violet-500/20" },
  pharmacist:   { label: "Pharmacist",    color: "bg-pink-500/10 text-pink-300 border-pink-500/20" },
  lab_tech:     { label: "Lab Tech",      color: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20" },
  radiologist:  { label: "Radiologist",   color: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20" },
  finance:      { label: "Finance",       color: "bg-orange-500/10 text-orange-300 border-orange-500/20" },
  it_support:   { label: "IT Support",    color: "bg-blue-500/10 text-blue-300 border-blue-500/20" },
  operations:   { label: "Operations",    color: "bg-teal-500/10 text-teal-300 border-teal-500/20" },
};

const ALL_ROLES: Role[] = ["admin", "doctor", "receptionist", "nurse", "pharmacist", "lab_tech", "radiologist", "finance", "it_support", "operations"];

export function UserManagementScreen() {
  const users = useVeltra((s) => s.users);
  const currentUser = useVeltra((s) => s.currentUser);
  const logAction = useVeltra((s) => s.logAction);
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [localUsers, setLocalUsers] = useState(users);

  // Defense-in-depth: only admin should see this screen.
  // The sidebar already gates this, but this prevents direct route access.
  if (currentUser?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center veltra-ambient">
        <Card className="p-12 text-center max-w-md veltra-shadow border-0 bg-card/50 backdrop-blur-sm">
          <Shield className="h-8 w-8 text-amber-400 mx-auto mb-3" />
          <p className="text-body font-medium text-foreground">Access denied</p>
          <p className="text-caption text-muted-foreground mt-1">Only administrators can manage users.</p>
        </Card>
      </div>
    );
  }

  const filtered = useMemo(() => {
    return localUsers.filter((u) => {
      const matchesSearch = !search ||
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.title.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [localUsers, search, roleFilter]);

  // Stats — use localUsers so suspend/deactivate updates the counts live
  const totalUsers = localUsers.length;
  const activeUsers = localUsers.filter((u) => u.status === "active").length;
  const suspendedUsers = localUsers.filter((u) => u.status === "suspended").length;
  const mfaEnabled = totalUsers > 0 ? Math.round((localUsers.filter((u) => u.mfaEnabled).length / totalUsers) * 100) : 0;

  const handleAction = (action: string, user: User) => {
    // Actually mutate user status in local state + log to audit trail
    if (action === "Suspend") {
      setLocalUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, status: "suspended" } : u));
      logAction?.("Suspended user", `${user.name} (${user.role})`);
      toast({ title: `Suspended · ${user.name}`, description: "User signed out. Access revoked." });
    } else if (action === "Reactivate") {
      setLocalUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, status: "active" } : u));
      logAction?.("Reactivated user", `${user.name} (${user.role})`);
      toast({ title: `Reactivated · ${user.name}`, description: "User can sign in again." });
    } else if (action === "Deactivate") {
      setLocalUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, status: "inactive" } : u));
      logAction?.("Deactivated user", `${user.name} (${user.role})`);
      toast({ title: `Deactivated · ${user.name}`, description: "User archived. Can be reactivated." });
    } else if (action === "Reset password") {
      logAction?.("Password reset", `${user.email}`);
      toast({ title: `Reset link sent · ${user.name}`, description: `Reset link sent to ${user.email}` });
    } else if (action === "Transfer") {
      toast({ title: `Transfer workflow · ${user.name}`, description: "Transfer dialog opened" });
    } else {
      toast({ title: `${action} · ${user.name}`, description: "Profile opened" });
    }
  };

  return (
    <div className="min-h-screen veltra-ambient">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-8 sm:py-10 md:px-12 md:py-14">
        {/* ===== Header ===== */}
        <FadeIn>
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-3.5 w-3.5 text-veltra-emerald" />
              <span className="text-micro text-veltra-emerald">User Management</span>
            </div>
            <h1 className="text-[2.5rem] leading-[1.05] tracking-[-0.035em] text-foreground font-semibold">
              <span className="text-editorial-italic text-muted-foreground">Who</span> has access.
            </h1>
            <p className="text-body text-muted-foreground mt-3">
              {totalUsers} users · {activeUsers} active · {suspendedUsers} suspended · {mfaEnabled}% MFA
            </p>
          </header>
        </FadeIn>

        {/* ===== Stats ===== */}
        <FadeIn delay={0.05}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <StatCard icon={Users}      label="Total"     value={String(totalUsers)}     tint="text-foreground" />
            <StatCard icon={UserCheck}  label="Active"    value={String(activeUsers)}    tint="text-emerald-400" />
            <StatCard icon={UserX}      label="Suspended" value={String(suspendedUsers)} tint="text-amber-400" />
            <StatCard icon={Shield}     label="MFA"       value={`${mfaEnabled}%`}        tint="text-violet-400" />
          </div>
        </FadeIn>

        {/* ===== Toolbar ===== */}
        <FadeIn delay={0.1}>
          <Card className="p-3 mb-4 veltra-shadow border-0 bg-card/50 backdrop-blur-sm flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, or title…"
                className="h-9 pl-9 text-caption bg-foreground/[0.02] border-border/30"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 px-3 veltra-shadow border-0 bg-foreground/[0.04] text-caption">
                  {roleFilter === "all" ? "All roles" : ROLE_LABELS[roleFilter].label}
                  <ChevronDown className="ml-1.5 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 veltra-shadow-lg bg-card/95 backdrop-blur-xl border-border/40">
                <DropdownMenuLabel className="text-micro text-muted-foreground">Filter by role</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setRoleFilter("all")} className="text-body cursor-pointer">
                  All roles
                  {roleFilter === "all" && <Check className="ml-auto h-3 w-3 text-veltra-emerald" />}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {ALL_ROLES.map((r) => (
                  <DropdownMenuItem key={r} onClick={() => setRoleFilter(r)} className="text-body cursor-pointer">
                    <span className={cn("inline-block h-2 w-2 rounded-full mr-2",
                      r === "admin" ? "bg-rose-400" :
                      r === "doctor" ? "bg-emerald-400" :
                      r === "receptionist" ? "bg-amber-400" :
                      r === "nurse" ? "bg-violet-400" :
                      r === "pharmacist" ? "bg-pink-400" :
                      r === "lab_tech" ? "bg-cyan-400" :
                      r === "radiologist" ? "bg-indigo-400" :
                      r === "finance" ? "bg-orange-400" :
                      r === "it_support" ? "bg-blue-400" : "bg-teal-400"
                    )} />
                    {ROLE_LABELS[r].label}
                    {roleFilter === r && <Check className="ml-auto h-3 w-3 text-veltra-emerald" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              size="sm"
              onClick={() => setInviteOpen(true)}
              className="h-9 px-4 bg-veltra-emerald hover:bg-veltra-emerald-dark text-white text-caption font-medium"
            >
              <UserPlus className="mr-1.5 h-3.5 w-3.5" />
              Invite user
            </Button>
          </Card>
        </FadeIn>

        {/* ===== User list ===== */}
        <FadeIn delay={0.15}>
          <Card className="veltra-shadow border-0 bg-card/50 backdrop-blur-sm overflow-hidden">
            <div className="px-4 py-2.5 border-b border-border/30 flex items-center gap-3 text-micro text-muted-foreground uppercase tracking-wider">
              <span className="flex-1">User</span>
              <span className="hidden sm:block w-32">Role</span>
              <span className="hidden md:block w-24">MFA</span>
              <span className="hidden md:block w-32">Last login</span>
              <span className="w-8" />
            </div>

            <div>
              {filtered.length === 0 ? (
                <div className="px-4 py-12 text-center">
                  <Users className="h-6 w-6 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-caption text-muted-foreground/60">No users match your filters.</p>
                </div>
              ) : (
                filtered.map((user) => (
                  <UserRow key={user.id} user={user} isCurrentUser={user.id === currentUser?.id} onAction={handleAction} />
                ))
              )}
            </div>

            <div className="px-4 py-2 border-t border-border/30 text-micro text-muted-foreground/60 normal-case tracking-normal">
              Showing {filtered.length} of {totalUsers} users
            </div>
          </Card>
        </FadeIn>

        {/* ===== Invite modal ===== */}
        {inviteOpen && (
          <InviteModal onClose={() => setInviteOpen(false)} onInvite={(email, role, name) => {
            toast({
              title: "Invitation sent",
              description: `${name} (${email}) invited as ${ROLE_LABELS[role as Role].label}`,
            });
            setInviteOpen(false);
          }} />
        )}
      </div>
    </div>
  );
}

function UserRow({ user, isCurrentUser, onAction }: { user: User; isCurrentUser: boolean; onAction: (a: string, u: User) => void }) {
  const roleMeta = ROLE_LABELS[user.role] || ROLE_LABELS.doctor;
  const isSuspended = user.status === "suspended";

  return (
    <div className={cn(
      "flex items-center gap-3 px-4 py-2.5 border-b border-border/20 last:border-0 veltra-transition",
      isSuspended ? "opacity-50" : "hover:bg-foreground/[0.02]"
    )}>
      {/* Avatar + name */}
      <div className="flex-1 min-w-0 flex items-center gap-2.5">
        <div className={cn("h-8 w-8 rounded-full flex items-center justify-center text-micro font-semibold flex-shrink-0", user.avatarColor)}>
          {user.initials}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-caption font-medium text-foreground truncate">{user.name}</p>
            {isCurrentUser && (
              <span className="text-micro px-1.5 py-0 rounded bg-veltra-emerald/15 text-veltra-emerald normal-case tracking-normal">You</span>
            )}
            {isSuspended && (
              <span className="text-micro px-1.5 py-0 rounded bg-amber-500/15 text-amber-300 normal-case tracking-normal">Suspended</span>
            )}
          </div>
          <p className="text-micro text-muted-foreground/70 normal-case tracking-normal truncate">{user.title}</p>
        </div>
      </div>

      {/* Role */}
      <div className="hidden sm:block w-32">
        <span className={cn("inline-flex items-center text-micro font-medium px-2 py-0.5 rounded border normal-case tracking-normal", roleMeta.color)}>
          {roleMeta.label}
        </span>
      </div>

      {/* MFA */}
      <div className="hidden md:flex items-center w-24">
        {user.mfaEnabled ? (
          <span className="text-micro text-emerald-400 normal-case tracking-normal flex items-center gap-1">
            <Shield className="h-3 w-3" /> Enabled
          </span>
        ) : (
          <span className="text-micro text-amber-400 normal-case tracking-normal flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> Off
          </span>
        )}
      </div>

      {/* Last login */}
      <div className="hidden md:block w-32">
        <p className="text-micro text-muted-foreground/70 normal-case tracking-normal">{user.lastLogin || "Never"}</p>
      </div>

      {/* Actions menu */}
      <div className="w-8 flex-shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="h-7 w-7 rounded-md hover:bg-foreground/[0.06] flex items-center justify-center text-muted-foreground hover:text-foreground veltra-transition"
              aria-label="User actions"
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 veltra-shadow-lg bg-card/95 backdrop-blur-xl border-border/40">
            <DropdownMenuLabel className="text-micro text-muted-foreground">{user.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onAction("View profile", user)} className="text-body cursor-pointer">
              <Users className="mr-2 h-3.5 w-3.5" /> View profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction("Reset password", user)} className="text-body cursor-pointer">
              <KeyRound className="mr-2 h-3.5 w-3.5" /> Reset password
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction("Transfer", user)} className="text-body cursor-pointer">
              <Mail className="mr-2 h-3.5 w-3.5" /> Transfer
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {!isSuspended ? (
              <DropdownMenuItem
                onClick={() => onAction("Suspend", user)}
                disabled={isCurrentUser}
                className="text-body cursor-pointer text-amber-400 focus:text-amber-400 focus:bg-amber-500/10 data-[disabled]:opacity-40 data-[disabled]:cursor-not-allowed"
              >
                <Ban className="mr-2 h-3.5 w-3.5" /> Suspend
                {isCurrentUser && <span className="ml-auto text-micro text-muted-foreground/50 normal-case tracking-normal">You</span>}
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={() => onAction("Reactivate", user)}
                className="text-body cursor-pointer text-emerald-400 focus:text-emerald-400 focus:bg-emerald-500/10"
              >
                <UserCheck className="mr-2 h-3.5 w-3.5" /> Reactivate
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => onAction("Deactivate", user)}
              disabled={isCurrentUser}
              className="text-body cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-500/10 data-[disabled]:opacity-40 data-[disabled]:cursor-not-allowed"
            >
              <UserX className="mr-2 h-3.5 w-3.5" /> Deactivate
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function InviteModal({ onClose, onInvite }: { onClose: () => void; onInvite: (email: string, role: Role, name: string) => void }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("doctor");

  // Escape to close + lock body scroll
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Invite new user"
      className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
      onClick={onClose}
    >
      <div
        className="bg-card/95 backdrop-blur-2xl rounded-2xl veltra-shadow-xl border border-border/40 max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 mb-1">
          <UserPlus className="h-4 w-4 text-veltra-emerald" />
          <h3 className="text-body font-semibold text-foreground">Invite new user</h3>
        </div>
        <p className="text-caption text-muted-foreground mb-5">They'll receive an email with setup instructions.</p>

        <div className="space-y-3">
          <div>
            <Label className="text-micro text-muted-foreground">Full name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dr. Maria Garcia"
              className="h-10 mt-1 text-body bg-foreground/[0.02] border-border/30"
            />
          </div>
          <div>
            <Label className="text-micro text-muted-foreground">Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="maria@veltrahealth.co"
              className="h-10 mt-1 text-body bg-foreground/[0.02] border-border/30"
            />
          </div>
          <div>
            <Label className="text-micro text-muted-foreground">Role</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full h-10 mt-1 px-3 rounded-md bg-foreground/[0.02] border border-border/30 text-body text-foreground flex items-center justify-between veltra-transition hover:bg-foreground/[0.04]">
                  <span>{ROLE_LABELS[role].label}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-full veltra-shadow-lg bg-card/95 backdrop-blur-xl border-border/40">
                {ALL_ROLES.map((r) => (
                  <DropdownMenuItem key={r} onClick={() => setRole(r)} className="text-body cursor-pointer">
                    {ROLE_LABELS[r].label}
                    {role === r && <Check className="ml-auto h-3 w-3 text-veltra-emerald" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <Button variant="ghost" onClick={onClose} className="flex-1 h-10 text-body">Cancel</Button>
          <Button
            onClick={() => email && name && onInvite(email, role, name)}
            disabled={!email || !name}
            className="flex-1 h-10 bg-veltra-emerald hover:bg-veltra-emerald-dark text-white text-body font-medium"
          >
            Send invitation
            <Mail className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tint }: { icon: React.ElementType; label: string; value: string; tint: string }) {
  return (
    <Card className="p-4 veltra-shadow border-0 bg-card/50 backdrop-blur-sm">
      <Icon className={cn("h-4 w-4 mb-2", tint)} />
      <p className="text-title font-bold text-foreground tabular">{value}</p>
      <p className="text-micro text-muted-foreground/70 normal-case tracking-normal uppercase tracking-wider mt-0.5">{label}</p>
    </Card>
  );
}
