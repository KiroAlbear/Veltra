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
import { FlaskConical, Plus, TrendingUp, TrendingDown, AlertCircle, Check } from "lucide-react";
import { useState } from "react";
import { formatDate, formatRelativeTime } from "@/lib/veltra-store";
import { FadeIn, StaggerGroup, StaggerItem } from "./motion";
import { useToast } from "@/hooks/use-toast";

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  normal: { label: "Normal", className: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20", icon: Check },
  high: { label: "High", className: "bg-amber-500/10 text-amber-300 border-amber-500/20", icon: TrendingUp },
  low: { label: "Low", className: "bg-blue-500/10 text-blue-300 border-blue-500/20", icon: TrendingDown },
  critical: { label: "Critical", className: "bg-red-500/10 text-red-300 border-red-500/20", icon: AlertCircle },
};

export function LabsScreen() {
  const labResults = useVeltra((s) => s.labResults);
  const patients = useVeltra((s) => s.patients);
  const role = useVeltra((s) => s.currentUser?.role);
  const currentUser = useVeltra((s) => s.currentUser);
  const activeSpecialty = useVeltra((s) => s.activeSpecialty);
  const canOrderLab = canDo(role, "canOrderLab");
  const addLabResult = useVeltra((s) => s.addLabResult);
  const selectPatient = useVeltra((s) => s.selectPatient);
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    patientId: "",
    testType: "",
    value: "",
    unit: "",
    normalRange: "",
    status: "normal" as "normal" | "high" | "low" | "critical",
    notes: "",
  });

  const handleAdd = () => {
    if (!form.patientId || !form.testType || !form.value) {
      toast({ title: "Missing fields", description: "Patient, test type, and value are required.", variant: "destructive" });
      return;
    }
    const patient = patients.find((p) => p.id === form.patientId);
    addLabResult({
      patientId: form.patientId,
      patientName: patient?.name || "",
      testType: form.testType,
      value: form.value,
      unit: form.unit,
      normalRange: form.normalRange,
      status: form.status,
      orderedBy: currentUser?.name || "Unknown",
      notes: form.notes,
    });
    setDialogOpen(false);
    setForm({ patientId: "", testType: "", value: "", unit: "", normalRange: "", status: "normal", notes: "" });
    toast({ title: "Lab result added ✓", description: `${form.testType} for ${patient?.name}` });
  };

  const criticalCount = labResults.filter((l) => l.status === "critical").length;
  const abnormalCount = labResults.filter((l) => l.status === "high" || l.status === "low").length;

  return (
    <div className="min-h-screen veltra-ambient">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-8 sm:py-10 md:px-12 md:py-14">
        <FadeIn>
          <header className="mb-10">
            <div className="flex items-center gap-2 mb-3">
              <FlaskConical className="h-3.5 w-3.5 text-veltra-emerald" />
              <span className="text-micro text-veltra-emerald">Laboratory</span>
              <span className={cn("ml-1 flex items-center gap-1 px-2 py-0.5 rounded-md text-micro font-medium", activeSpecialty.color)}>
                <span className="text-xs">{activeSpecialty.emoji}</span>
                {activeSpecialty.name}
              </span>
            </div>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-[2.5rem] leading-[1.05] tracking-[-0.035em] text-foreground font-semibold">
                  <span className="text-editorial-italic text-muted-foreground">Every result,</span>{" "}
                  in context.
                </h1>
                <p className="text-body text-muted-foreground mt-3">
                  {labResults.length} results · {abnormalCount} abnormal · {criticalCount} critical
                </p>
              </div>
              {canOrderLab && (
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="h-10 px-5 bg-veltra-emerald hover:bg-veltra-emerald-dark text-white">
                      <Plus className="mr-1.5 h-4 w-4" />
                      New result
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md veltra-shadow-lg">
                    <DialogHeader>
                      <DialogTitle className="text-title">Add lab result</DialogTitle>
                      <DialogDescription className="text-caption">Results flow to the patient's timeline and brief.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                      <div className="space-y-1.5">
                        <Label className="text-micro text-muted-foreground">Patient</Label>
                        <Select value={form.patientId} onValueChange={(v) => setForm({ ...form, patientId: v })}>
                          <SelectTrigger className="h-10"><SelectValue placeholder="Select patient..." /></SelectTrigger>
                          <SelectContent>
                            {patients.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-micro text-muted-foreground">Test type</Label>
                          <Input value={form.testType} onChange={(e) => setForm({ ...form, testType: e.target.value })} placeholder={activeSpecialty.labTypes[0] || "HbA1c"} className="h-10" />
                          <div className="flex flex-wrap gap-1 pt-0.5">
                            {activeSpecialty.labTypes.slice(0, 4).map((t) => (
                              <button key={t} type="button" onClick={() => setForm({ ...form, testType: t })}
                                className={cn("text-micro px-1.5 py-0.5 rounded normal-case tracking-normal veltra-transition",
                                  form.testType === t ? "bg-veltra-emerald/20 text-veltra-emerald" : "bg-foreground/[0.04] text-muted-foreground hover:text-foreground")}>
                                {t}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-micro text-muted-foreground">Value</Label>
                          <Input value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder="Normal" className="h-10" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-micro text-muted-foreground">Unit</Label>
                          <Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="%" className="h-10" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-micro text-muted-foreground">Normal range</Label>
                          <Input value={form.normalRange} onChange={(e) => setForm({ ...form, normalRange: e.target.value })} placeholder="< 5.7" className="h-10" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-micro text-muted-foreground">Status</Label>
                        <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as "normal" | "high" | "low" | "critical" })}>
                          <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="ghost" onClick={() => setDialogOpen(false)} className="h-10">Cancel</Button>
                      <Button onClick={handleAdd} className="h-10 bg-veltra-emerald hover:bg-veltra-emerald-dark text-white">Add result</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </header>
        </FadeIn>

        <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {labResults.map((lr) => {
            const cfg = STATUS_CONFIG[lr.status];
            const Icon = cfg.icon;
            return (
              <StaggerItem key={lr.id}>
                <Card
                  onClick={() => selectPatient(lr.patientId)}
                  className="p-5 cursor-pointer veltra-shadow veltra-shadow-hover border-0 bg-card/50 backdrop-blur-sm group h-full"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-body font-semibold text-foreground">{lr.testType}</p>
                      <p className="text-caption text-muted-foreground mt-0.5">{lr.patientName}</p>
                    </div>
                    <Badge variant="outline" className={cn("text-micro font-medium border", cfg.className)}>
                      <Icon className="mr-1 h-2.5 w-2.5" />
                      {cfg.label}
                    </Badge>
                  </div>
                  <div className="flex items-baseline gap-2 mb-3">
                    <p className="text-3xl font-semibold tabular text-foreground tracking-[-0.02em]">{lr.value}</p>
                    <p className="text-caption text-muted-foreground">{lr.unit}</p>
                  </div>
                  <div className="space-y-1 pt-3 border-t border-border/40">
                    <div className="flex justify-between text-caption">
                      <span className="text-muted-foreground">Normal</span>
                      <span className="text-foreground tabular">{lr.normalRange}</span>
                    </div>
                    <div className="flex justify-between text-caption">
                      <span className="text-muted-foreground">Ordered by</span>
                      <span className="text-foreground">{lr.orderedBy}</span>
                    </div>
                    <div className="flex justify-between text-caption">
                      <span className="text-muted-foreground">Date</span>
                      <span className="text-foreground tabular">{formatDate(lr.timestamp)}</span>
                    </div>
                  </div>
                  {lr.notes && (
                    <p className="text-caption text-muted-foreground mt-3 italic">"{lr.notes}"</p>
                  )}
                </Card>
              </StaggerItem>
            );
          })}
        </StaggerGroup>

        {labResults.length === 0 && (
          <FadeIn delay={0.2}>
            <Card className="p-16 text-center veltra-shadow border-0 bg-card/50 backdrop-blur-sm">
              <div className="mx-auto h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <FlaskConical className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-editorial-italic text-body text-muted-foreground">
                No results yet. The lab will deliver.
              </p>
            </Card>
          </FadeIn>
        )}
      </div>
    </div>
  );
}
