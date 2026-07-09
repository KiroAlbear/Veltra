"use client";

import { useVeltra, canDo } from "@/lib/veltra-store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { DollarSign, Plus, CreditCard, Banknote, Smartphone, Receipt } from "lucide-react";
import { useState } from "react";
import { formatDate, formatRelativeTime } from "@/lib/veltra-store";
import { FadeIn, StaggerGroup, StaggerItem, CountUp } from "./motion";
import { useToast } from "@/hooks/use-toast";

const BALANCE_STYLE = {
  paid: { label: "Paid", className: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" },
  due: { label: "Due", className: "bg-amber-500/10 text-amber-300 border-amber-500/20" },
  overdue: { label: "Overdue", className: "bg-red-500/10 text-red-300 border-red-500/20" },
} as const;

const PAYMENT_METHODS = [
  { id: "cash", label: "Cash", icon: Banknote },
  { id: "card", label: "Card", icon: CreditCard },
  { id: "online", label: "Online", icon: Smartphone },
];

export function BillingScreen() {
  const patients = useVeltra((s) => s.patients);
  const role = useVeltra((s) => s.currentUser?.role);
  const activeSpecialty = useVeltra((s) => s.activeSpecialty);
  const recordPayment = useVeltra((s) => s.recordPayment);
  const selectPatient = useVeltra((s) => s.selectPatient);
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ patientId: "", amount: "", method: "cash", notes: "" });

  const withBalance = patients.filter((p) => p.balance !== "paid" && p.balanceAmount);
  const totalDue = withBalance.reduce((sum, p) => sum + (p.balanceAmount || 0), 0);
  const totalCollected = patients.filter((p) => p.balance === "paid").length * (activeSpecialty?.billingItems[0]?.price || 350);

  const handleRecord = () => {
    if (!form.patientId || !form.amount) {
      toast({ title: "Missing fields", variant: "destructive" });
      return;
    }
    const patient = patients.find((p) => p.id === form.patientId);
    recordPayment({
      patientId: form.patientId,
      amount: Number(form.amount),
      method: form.method,
      notes: form.notes,
    });
    setDialogOpen(false);
    setForm({ patientId: "", amount: "", method: "cash", notes: "" });
    toast({ title: "Payment recorded ✓", description: `$${form.amount} from ${patient?.name}` });
  };

  return (
    <div className="min-h-screen veltra-ambient">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-8 sm:py-10 md:px-12 md:py-14">
        <FadeIn>
          <header className="mb-10">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="h-3.5 w-3.5 text-veltra-emerald" />
              <span className="text-micro text-veltra-emerald">Billing</span>
              <span className={cn("ml-1 flex items-center gap-1 px-2 py-0.5 rounded-md text-micro font-medium", activeSpecialty.color)}>
                <span className="text-xs">{activeSpecialty.emoji}</span>
                {activeSpecialty.name}
              </span>
            </div>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-[2.5rem] leading-[1.05] tracking-[-0.035em] text-foreground font-semibold">
                  <span className="text-editorial-italic text-muted-foreground">Recovered</span>{" "}
                  revenue.
                </h1>
                <p className="text-body text-muted-foreground mt-3">
                  {withBalance.length} patients with balance · ${totalDue.toLocaleString()} outstanding
                </p>
              </div>
              <Button onClick={() => setDialogOpen(true)} className="h-10 px-5 bg-veltra-emerald hover:bg-veltra-emerald-dark text-white">
                <Plus className="mr-1.5 h-4 w-4" />
                Record payment
              </Button>
            </div>
          </header>
        </FadeIn>

        {/* Specialty price list */}
        <FadeIn delay={0.05}>
          <div className="mb-8">
            <p className="text-micro text-muted-foreground mb-3 normal-case tracking-normal">{activeSpecialty.name} — price list</p>
            <div className="flex flex-wrap gap-2">
              {activeSpecialty.billingItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => setForm({ ...form, amount: String(item.price) })}
                  className="veltra-glass rounded-xl px-3 py-2 veltra-shadow veltra-transition hover:scale-[1.02] text-left"
                >
                  <p className="text-caption font-medium text-foreground">{item.name}</p>
                  <p className="text-micro text-veltra-emerald tabular normal-case tracking-normal">${item.price}</p>
                </button>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Stats */}
        <FadeIn delay={0.1}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card className="p-6 veltra-shadow border-0 bg-card/50 backdrop-blur-sm">
              <p className="text-micro text-muted-foreground">Outstanding</p>
              <CountUp value={totalDue} prefix="$" className="text-3xl font-semibold tabular text-foreground mt-2 block" />
              <p className="text-caption text-muted-foreground mt-1">{withBalance.length} patients</p>
            </Card>
            <Card className="p-6 veltra-shadow border-0 bg-card/50 backdrop-blur-sm">
              <p className="text-micro text-muted-foreground">Collected (est.)</p>
              <CountUp value={totalCollected} prefix="$" className="text-3xl font-semibold tabular text-foreground mt-2 block" />
              <p className="text-caption text-muted-foreground mt-1">Paid in full patients</p>
            </Card>
            <Card className="p-6 veltra-shadow border-0 bg-card/50 backdrop-blur-sm">
              <p className="text-micro text-muted-foreground">Overdue</p>
              <p className="text-3xl font-semibold tabular text-red-400 mt-2">
                {patients.filter((p) => p.balance === "overdue").length}
              </p>
              <p className="text-caption text-muted-foreground mt-1">Need follow-up</p>
            </Card>
          </div>
        </FadeIn>

        {/* Patients with balance */}
        <FadeIn delay={0.15}>
          <h2 className="text-title text-foreground mb-4">Outstanding Balances</h2>
          <StaggerGroup>
            <Card className="veltra-shadow border-0 bg-card/50 backdrop-blur-sm overflow-hidden">
              {withBalance.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <Receipt className="h-5 w-5 text-emerald-400 mx-auto mb-2" />
                  <p className="text-editorial-italic text-caption text-muted-foreground">
                    All settled. Nothing outstanding.
                  </p>
                </div>
              ) : (
                withBalance.map((p, idx) => {
                  const bal = BALANCE_STYLE[p.balance as keyof typeof BALANCE_STYLE];
                  return (
                    <StaggerItem key={p.id}>
                      <div className={cn("flex items-center gap-4 px-6 py-4 veltra-transition hover:bg-foreground/[0.03]", idx !== withBalance.length - 1 && "border-b border-border/40")}>
                        <div className={cn("h-8 w-8 rounded-full flex items-center justify-center text-caption font-semibold flex-shrink-0", p.avatarColor)}>
                          {p.name.trim().split(/\s+/).map((n) => n[0] || "").filter(Boolean).slice(0, 2).join("")}
                        </div>
                        <button onClick={() => selectPatient(p.id)} className="flex-1 min-w-0 text-left group">
                          <p className="text-body font-medium text-foreground truncate group-hover:text-veltra-emerald veltra-transition">{p.name}</p>
                          <p className="text-caption text-muted-foreground">{p.doctor} · {p.conditions[0] || "No conditions"}</p>
                        </button>
                        <div className="text-right flex-shrink-0">
                          <p className="text-body font-semibold tabular text-foreground">${p.balanceAmount}</p>
                          <Badge variant="outline" className={cn("text-micro font-medium border mt-1", bal.className)}>{bal.label}</Badge>
                        </div>
                      </div>
                    </StaggerItem>
                  );
                })
              )}
            </Card>
          </StaggerGroup>
        </FadeIn>

        {/* Record payment dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md veltra-shadow-lg">
            <DialogHeader>
              <DialogTitle className="text-title">Record payment</DialogTitle>
              <DialogDescription className="text-caption">Payment flows to patient timeline + activity + audit log.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-1.5">
                <Label className="text-micro text-muted-foreground">Patient</Label>
                <Select value={form.patientId} onValueChange={(v) => setForm({ ...form, patientId: v })}>
                  <SelectTrigger className="h-10"><SelectValue placeholder="Select patient..." /></SelectTrigger>
                  <SelectContent>
                    {patients.map((p) => <SelectItem key={p.id} value={p.id}>{p.name} {p.balanceAmount ? `· $${p.balanceAmount} due` : ""}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-micro text-muted-foreground">Amount ($)</Label>
                <Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder={String(activeSpecialty?.billingItems[0]?.price || 350)} className="h-10" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-micro text-muted-foreground">Method</Label>
                <div className="flex gap-2">
                  {PAYMENT_METHODS.map((m) => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        onClick={() => setForm({ ...form, method: m.id })}
                        className={cn(
                          "flex-1 flex flex-col items-center gap-1.5 py-3 rounded-lg border veltra-transition",
                          form.method === m.id ? "border-veltra-emerald/40 bg-veltra-emerald/10 text-veltra-emerald" : "border-border/40 bg-foreground/[0.03] text-muted-foreground"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-micro normal-case tracking-normal">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-micro text-muted-foreground">Notes (optional)</Label>
                <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Co-pay, partial, etc." className="h-10" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setDialogOpen(false)} className="h-10">Cancel</Button>
              <Button onClick={handleRecord} className="h-10 bg-veltra-emerald hover:bg-veltra-emerald-dark text-white">Record payment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
