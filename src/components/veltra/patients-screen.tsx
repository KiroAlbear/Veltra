"use client";

import { useVeltra, type Patient } from "@/lib/veltra-store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Search,
  Phone,
  MessageCircle,
  User as UserIcon,
  AlertTriangle,
  Check,
  Clock,
  Calendar,
  Wallet,
  Stethoscope,
  ArrowRight,
  Plus,
  Crown,
  Sparkles,
  Users,
  Filter,
  MapPin,
  TrendingUp,
  Activity,
} from "lucide-react";
import { useMemo, useState } from "react";
import { formatRelativeTime, formatDate } from "@/lib/veltra-store";
import { FadeIn, StaggerGroup, HoverLift, CountUp } from "./motion";
import { useToast } from "@/hooks/use-toast";

const CHANNEL_ICON = {
  whatsapp: MessageCircle,
  call: Phone,
  sms: MessageCircle,
  "in-person": UserIcon,
} as const;

const CHANNEL_LABEL = {
  whatsapp: "Messaging",
  call: "Phone",
  sms: "SMS",
  "in-person": "In-person",
} as const;

const INSURANCE_STYLE = {
  verified: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
  pending: "text-amber-300 bg-amber-500/10 border-amber-500/20",
  none: "text-slate-300 bg-slate-500/10 border-slate-500/20",
} as const;

const BALANCE_STYLE = {
  paid: { label: "Paid", className: "text-emerald-400" },
  due: { label: "Due", className: "text-amber-400" },
  overdue: { label: "Overdue", className: "text-red-400" },
} as const;

const TIER_STYLE = {
  platinum: { label: "Platinum", className: "text-cyan-300 bg-cyan-500/10 border-cyan-500/20", icon: Crown },
  gold: { label: "Gold", className: "text-amber-300 bg-amber-500/10 border-amber-500/20", icon: Crown },
  silver: { label: "Silver", className: "text-slate-300 bg-slate-500/10 border-slate-500/20", icon: Sparkles },
  bronze: { label: "Bronze", className: "text-orange-300 bg-orange-500/10 border-orange-500/20", icon: Sparkles },
} as const;

const STATUS_STYLE = {
  active: { label: "Active", className: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" },
  inactive: { label: "Inactive", className: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
  new: { label: "New", className: "bg-veltra-emerald/10 text-veltra-emerald border-veltra-emerald/20" },
} as const;

export function PatientsScreen() {
  const patients = useVeltra((s) => s.patients);
  const selectPatient = useVeltra((s) => s.selectPatient);
  const addPatient = useVeltra((s) => s.addPatient);
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "risk" | "overdue" | "due" | "vip" | "new" | "inactive">("all");
  const [doctorFilter, setDoctorFilter] = useState<string>("all");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [conditionFilter, setConditionFilter] = useState<string>("all");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [newPatient, setNewPatient] = useState({ name: "", age: "", gender: "M" as "M" | "F", phone: "", conditions: "", doctor: "Dr. Sarah", preferredChannel: "whatsapp" as const });

  const doctors = useMemo(() => [...new Set(patients.map((p) => p.doctor))], [patients]);
  const specialties = useMemo(() => [...new Set(patients.map((p) => p.specialty))], [patients]);
  const cities = useMemo(() => [...new Set(patients.map((p) => p.city))], [patients]);
  const activeSpecialty = useVeltra((s) => s.activeSpecialty);

  const filtered = useMemo(() => {
    let list = patients;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.phone.toLowerCase().includes(q) ||
          p.conditions.some((c) => c.toLowerCase().includes(q)) ||
          p.doctor.toLowerCase().includes(q) ||
          p.balance.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          p.city.toLowerCase().includes(q) ||
          p.specialty.toLowerCase().includes(q)
      );
    }
    if (filter === "risk") list = list.filter((p) => p.riskScore >= 50);
    if (filter === "overdue") list = list.filter((p) => p.balance === "overdue");
    if (filter === "due") list = list.filter((p) => p.balance === "due" || p.balance === "overdue");
    if (filter === "vip") list = list.filter((p) => p.loyaltyTier === "platinum" || p.loyaltyTier === "gold");
    if (filter === "new") list = list.filter((p) => p.status === "new");
    if (filter === "inactive") list = list.filter((p) => p.status === "inactive");
    if (doctorFilter !== "all") list = list.filter((p) => p.doctor === doctorFilter);
    if (tierFilter !== "all") list = list.filter((p) => p.loyaltyTier === tierFilter);
    if (sourceFilter !== "all") list = list.filter((p) => p.leadSource === sourceFilter);
    if (specialtyFilter !== "all") list = list.filter((p) => p.specialty === specialtyFilter);
    if (cityFilter !== "all") list = list.filter((p) => p.city === cityFilter);
    if (statusFilter !== "all") list = list.filter((p) => p.status === statusFilter);
    if (conditionFilter !== "all") list = list.filter((p) => p.conditions.some((c) => c.toLowerCase() === conditionFilter.toLowerCase()));
    return list;
  }, [patients, query, filter, doctorFilter, tierFilter, sourceFilter, specialtyFilter, cityFilter, statusFilter, conditionFilter]);

  // Stats
  const stats = useMemo(() => ({
    total: patients.length,
    vip: patients.filter((p) => p.loyaltyTier === "platinum" || p.loyaltyTier === "gold").length,
    newPatients: patients.filter((p) => p.status === "new").length,
    atRisk: patients.filter((p) => p.riskScore >= 50).length,
    overdue: patients.filter((p) => p.balance === "overdue").length,
    totalRevenue: patients.reduce((s, p) => s + p.totalRevenue, 0),
    active: patients.filter((p) => p.status === "active").length,
    inactive: patients.filter((p) => p.status === "inactive").length,
  }), [patients]);

  const handleAddPatient = () => {
    if (!newPatient.name || !newPatient.phone) {
      toast({ title: "Name and phone required", variant: "destructive" });
      return;
    }
    addPatient({
      name: newPatient.name,
      age: Number(newPatient.age) || 0,
      gender: newPatient.gender,
      phone: newPatient.phone,
      conditions: newPatient.conditions ? newPatient.conditions.split(",").map((c) => c.trim()) : [],
      doctor: newPatient.doctor,
      preferredChannel: newPatient.preferredChannel,
    });
    setAddOpen(false);
    setNewPatient({ name: "", age: "", gender: "M", phone: "", conditions: "", doctor: "Dr. Sarah", preferredChannel: "whatsapp" });
    toast({ title: "Patient registered ✓", description: newPatient.name });
  };

  return (
    <div className="min-h-screen veltra-ambient">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-10 md:px-12 md:py-14">
        <FadeIn>
          <header className="mb-8">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-3.5 w-3.5 text-veltra-emerald" />
                  <p className="text-micro text-veltra-emerald">Patients</p>
                  <span className={cn("flex items-center gap-1 px-2 py-0.5 rounded-md text-micro font-medium", activeSpecialty.color)}>
                    <span className="text-xs">{activeSpecialty.emoji}</span>
                    {activeSpecialty.name}
                  </span>
                </div>
                <h1 className="text-[2.5rem] leading-[1.05] tracking-[-0.035em] text-foreground">
                  <span className="text-editorial-italic text-muted-foreground">Every person,</span>{" "}
                  <span className="font-semibold">a story.</span>
                </h1>
              </div>
              <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogTrigger asChild>
                  <Button className="h-10 px-5 bg-veltra-emerald hover:bg-veltra-emerald-dark text-white">
                    <Plus className="mr-1.5 h-4 w-4" />
                    New patient
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md veltra-shadow-lg">
                  <DialogHeader>
                    <DialogTitle className="text-title">Register new patient</DialogTitle>
                    <DialogDescription className="text-caption">Patient appears in list + timeline immediately.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 py-2">
                    <div className="space-y-1.5">
                      <Label className="text-micro text-muted-foreground">Full name</Label>
                      <Input value={newPatient.name} onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })} placeholder="Ahmed Hassan" className="h-10" />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-micro text-muted-foreground">Age</Label>
                        <Input type="number" value={newPatient.age} onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })} placeholder="54" className="h-10" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-micro text-muted-foreground">Gender</Label>
                        <Select value={newPatient.gender} onValueChange={(v) => setNewPatient({ ...newPatient, gender: v as "M" | "F" })}>
                          <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="M">Male</SelectItem><SelectItem value="F">Female</SelectItem></SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-micro text-muted-foreground">Channel</Label>
                        <Select value={newPatient.preferredChannel} onValueChange={(v) => setNewPatient({ ...newPatient, preferredChannel: v as "whatsapp" })}>
                          <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="whatsapp">Messaging</SelectItem><SelectItem value="call">Phone</SelectItem><SelectItem value="sms">SMS</SelectItem></SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-micro text-muted-foreground">Phone</Label>
                      <Input value={newPatient.phone} onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })} placeholder="+966 50 123 4567" className="h-10" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-micro text-muted-foreground">Conditions (comma-separated)</Label>
                        <Input value={newPatient.conditions} onChange={(e) => setNewPatient({ ...newPatient, conditions: e.target.value })} placeholder="Diabetic, Hypertension" className="h-10" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-micro text-muted-foreground">Doctor</Label>
                        <Select value={newPatient.doctor} onValueChange={(v) => setNewPatient({ ...newPatient, doctor: v })}>
                          <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="Dr. Sarah">Dr. Sarah</SelectItem><SelectItem value="Dr. Omar">Dr. Omar</SelectItem><SelectItem value="Dr. Layla">Dr. Layla</SelectItem></SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="ghost" onClick={() => setAddOpen(false)} className="h-10">Cancel</Button>
                    <Button onClick={handleAddPatient} className="h-10 bg-veltra-emerald hover:bg-veltra-emerald-dark text-white">Register patient</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </header>
        </FadeIn>

        {/* ===== Patient Stats Dashboard ===== */}
        <FadeIn delay={0.05}>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
            <StatChip icon={Users} label="Total" value={stats.total} tone="default" />
            <StatChip icon={Crown} label="VIP" value={stats.vip} tone="vip" />
            <StatChip icon={Sparkles} label="New" value={stats.newPatients} tone="new" />
            <StatChip icon={AlertTriangle} label="At Risk" value={stats.atRisk} tone="risk" />
            <StatChip icon={Wallet} label="Overdue" value={stats.overdue} tone="danger" />
            <StatChip icon={Activity} label="Active" value={stats.active} tone="success" />
            <StatChip icon={TrendingUp} label="Revenue" value={`$${(stats.totalRevenue / 1000).toFixed(1)}k`} tone="default" />
          </div>
        </FadeIn>

        {/* ===== Search + Quick Filters ===== */}
        <FadeIn delay={0.1}>
          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name, phone, condition, doctor, tags, city, specialty..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 h-10 bg-card/50 backdrop-blur-sm veltra-shadow border-0"
              />
            </div>
            <Select value={doctorFilter} onValueChange={setDoctorFilter}>
              <SelectTrigger className="h-10 w-full sm:w-36 bg-card/50 backdrop-blur-sm veltra-shadow border-0">
                <SelectValue placeholder="All doctors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All doctors</SelectItem>
                {doctors.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" onClick={() => setShowAdvanced(!showAdvanced)} className={cn("h-10 px-4 veltra-shadow border-0 bg-card/50", showAdvanced && "bg-veltra-emerald/10 text-veltra-emerald")}>
              <Filter className="mr-1.5 h-3.5 w-3.5" />
              Filters
            </Button>
          </div>
        </FadeIn>

        {/* ===== Quick Filter Pills ===== */}
        <FadeIn delay={0.12}>
          <div className="flex gap-1.5 mb-3 overflow-x-auto veltra-no-scrollbar">
            {([
              { id: "all", label: "All" },
              { id: "vip", label: "VIP" },
              { id: "new", label: "New" },
              { id: "risk", label: "At Risk" },
              { id: "overdue", label: "Overdue" },
              { id: "due", label: "Balance Due" },
              { id: "inactive", label: "Inactive" },
            ] as const).map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  "px-3 h-8 rounded-full text-caption font-medium veltra-transition whitespace-nowrap",
                  filter === f.id
                    ? "bg-veltra-emerald/15 text-veltra-emerald"
                    : "bg-foreground/[0.04] text-muted-foreground hover:text-foreground"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </FadeIn>

        {/* ===== Specialty Condition Chips ===== */}
        <FadeIn delay={0.14}>
          <div className="flex items-center gap-1.5 mb-4 overflow-x-auto veltra-no-scrollbar">
            <span className="text-micro text-muted-foreground/60 normal-case tracking-normal mr-1 whitespace-nowrap">{activeSpecialty.name}:</span>
            <button
              onClick={() => setConditionFilter("all")}
              className={cn(
                "px-2.5 h-7 rounded-full text-micro font-medium veltra-transition whitespace-nowrap",
                conditionFilter === "all"
                  ? "bg-veltra-emerald/15 text-veltra-emerald"
                  : "bg-foreground/[0.04] text-muted-foreground hover:text-foreground"
              )}
            >
              All conditions
            </button>
            {activeSpecialty.conditions.slice(0, 8).map((c) => (
              <button
                key={c}
                onClick={() => setConditionFilter(c)}
                className={cn(
                  "px-2.5 h-7 rounded-full text-micro font-medium veltra-transition whitespace-nowrap",
                  conditionFilter === c
                    ? "bg-veltra-emerald/15 text-veltra-emerald"
                    : "bg-foreground/[0.04] text-muted-foreground hover:text-foreground"
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </FadeIn>

        {/* ===== Advanced Filters (collapsible) ===== */}
        {showAdvanced && (
          <FadeIn delay={0.05}>
            <Card className="p-4 mb-4 veltra-shadow border-0 bg-card/50 backdrop-blur-sm">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <Label className="text-micro text-muted-foreground mb-1.5 block">Loyalty Tier</Label>
                  <Select value={tierFilter} onValueChange={setTierFilter}>
                    <SelectTrigger className="h-10 bg-background/50"><SelectValue placeholder="All tiers" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All tiers</SelectItem>
                      <SelectItem value="platinum">Platinum</SelectItem>
                      <SelectItem value="gold">Gold</SelectItem>
                      <SelectItem value="silver">Silver</SelectItem>
                      <SelectItem value="bronze">Bronze</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-micro text-muted-foreground mb-1.5 block">Lead Source</Label>
                  <Select value={sourceFilter} onValueChange={setSourceFilter}>
                    <SelectTrigger className="h-10 bg-background/50"><SelectValue placeholder="All sources" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All sources</SelectItem>
                      <SelectItem value="whatsapp">Messaging</SelectItem>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="voice">Voice Call</SelectItem>
                      <SelectItem value="google">Google</SelectItem>
                      <SelectItem value="meta">Meta Ads</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                      <SelectItem value="walk-in">Walk-in</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-micro text-muted-foreground mb-1.5 block">Specialty</Label>
                  <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                    <SelectTrigger className="h-10 bg-background/50"><SelectValue placeholder="All specialties" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All specialties</SelectItem>
                      {specialties.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-micro text-muted-foreground mb-1.5 block">City</Label>
                  <Select value={cityFilter} onValueChange={setCityFilter}>
                    <SelectTrigger className="h-10 bg-background/50"><SelectValue placeholder="All cities" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All cities</SelectItem>
                      {cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
                <p className="text-caption text-muted-foreground">{filtered.length} of {patients.length} patients</p>
                <button
                  onClick={() => { setFilter("all"); setDoctorFilter("all"); setTierFilter("all"); setSourceFilter("all"); setSpecialtyFilter("all"); setCityFilter("all"); setStatusFilter("all"); setQuery(""); }}
                  className="text-caption text-veltra-emerald hover:underline"
                >
                  Reset all filters
                </button>
              </div>
            </Card>
          </FadeIn>
        )}

        {/* ===== Patient Cards ===== */}
        {filtered.length === 0 ? (
          <FadeIn delay={0.2}>
            <Card className="p-16 text-center veltra-shadow border-0 bg-card/50 backdrop-blur-sm">
              <div className="mx-auto h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-editorial-italic text-body text-muted-foreground">
                No one here. Try a different search.
              </p>
            </Card>
          </FadeIn>
        ) : (
          <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" stagger={0.05}>
            {filtered.map((p) => (
              <HoverLift key={p.id} intensity={3}>
                  <Card
                    onClick={() => selectPatient(p.id)}
                    className="p-5 cursor-pointer veltra-shadow veltra-shadow-hover border-0 bg-card/50 backdrop-blur-sm group h-full"
                  >
                    {/* Header: avatar + name + tier badge */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className={cn("h-11 w-11 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0", p.avatarColor)}>
                        {p.name.trim().split(/\s+/).map((n) => n[0] || "").filter(Boolean).slice(0, 2).join("")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-body font-semibold text-foreground truncate group-hover:text-veltra-emerald veltra-transition">{p.name}</p>
                          {p.riskScore >= 70 && <AlertTriangle className="h-3.5 w-3.5 text-red-400 flex-shrink-0" />}
                        </div>
                        <p className="text-caption text-muted-foreground">{p.age}{p.gender} · {p.doctor} · {p.city}</p>
                      </div>
                      {(() => {
                        const tier = TIER_STYLE[p.loyaltyTier];
                        const TierIcon = tier.icon;
                        return (
                          <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-micro border normal-case tracking-normal flex-shrink-0", tier.className)}>
                            <TierIcon className="h-2.5 w-2.5" />
                            {tier.label}
                          </span>
                        );
                      })()}
                    </div>

                    {/* Conditions + Tags */}
                    {p.conditions.length > 0 ? (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {p.conditions.map((c) => (
                          <span key={c} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-micro bg-foreground/[0.05] text-muted-foreground normal-case tracking-normal">
                            <Stethoscope className="h-2.5 w-2.5" />
                            {c}
                          </span>
                        ))}
                        {p.tags.map((t) => (
                          <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-micro bg-veltra-emerald/5 text-veltra-emerald normal-case tracking-normal">
                            {t}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-caption text-muted-foreground/60 italic mb-3">No active conditions</p>
                    )}

                    {/* Story rows */}
                    <div className="space-y-2 mb-3">
                      <StoryRow icon={Clock} label="Last visit" value={formatRelativeTime(p.lastVisit)} />
                      <StoryRow icon={Calendar} label="Next visit" value={p.nextVisit ? formatDate(p.nextVisit) : "Not scheduled"} highlight={!!p.nextVisit} />
                      <StoryRow icon={CHANNEL_ICON[p.preferredChannel]} label="Prefers" value={CHANNEL_LABEL[p.preferredChannel]} />
                      <StoryRow icon={MapPin} label="Lead source" value={p.leadSource} />
                    </div>

                    {/* Footer: status + insurance + balance + revenue */}
                    <div className="flex items-center justify-between pt-3 border-t border-border/40 flex-wrap gap-2">
                      <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-micro border normal-case tracking-normal", STATUS_STYLE[p.status].className)}>
                        {STATUS_STYLE[p.status].label}
                      </span>
                      <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-micro border normal-case tracking-normal", INSURANCE_STYLE[p.insurance])}>
                        {p.insurance === "verified" && <Check className="h-2.5 w-2.5" />}
                        {p.insurance === "verified" ? "Insured" : p.insurance === "pending" ? "Pending" : "Self-pay"}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {p.balanceAmount && <span className="text-caption text-muted-foreground tabular">${p.balanceAmount}</span>}
                        <span className={cn("inline-flex items-center gap-1 text-micro normal-case tracking-normal font-medium", BALANCE_STYLE[p.balance].className)}>
                          <Wallet className="h-2.5 w-2.5" />
                          {BALANCE_STYLE[p.balance].label}
                        </span>
                      </div>
                    </div>

                    {/* Revenue + Visits */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/20">
                      <span className="text-micro text-muted-foreground normal-case tracking-normal">{p.totalVisits} visits</span>
                      <span className="text-caption font-medium text-foreground tabular">${p.totalRevenue.toLocaleString()} lifetime</span>
                    </div>

                    {/* Hover affordance */}
                    <div className="mt-3 flex items-center text-micro text-veltra-emerald normal-case tracking-normal opacity-0 group-hover:opacity-100 veltra-transition">
                      <span>Open timeline</span>
                      <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </Card>
              </HoverLift>
            ))}
          </StaggerGroup>
        )}
      </div>
    </div>
  );
}

function StatChip({ icon: Icon, label, value, tone }: {
  icon: React.ElementType; label: string; value: string | number; tone: "default" | "vip" | "new" | "risk" | "danger" | "success";
}) {
  const toneClass = {
    default: "text-foreground",
    vip: "text-cyan-400",
    new: "text-veltra-emerald",
    risk: "text-amber-400",
    danger: "text-red-400",
    success: "text-emerald-400",
  }[tone];
  return (
    <Card className="p-3 veltra-shadow border-0 bg-card/50 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={cn("h-3 w-3", toneClass)} />
        <p className="text-micro text-muted-foreground">{label}</p>
      </div>
      <p className={cn("text-xl font-semibold tabular", toneClass)}>{value}</p>
    </Card>
  );
}

function StoryRow({
  icon: Icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 text-caption">
      <Icon className="h-3 w-3 text-muted-foreground/70 flex-shrink-0" />
      <span className="text-muted-foreground">{label}</span>
      <span className={cn(
        "ml-auto font-medium text-right truncate tabular",
        highlight ? "text-amber-400" : "text-foreground"
      )}>
        {value}
      </span>
    </div>
  );
}
