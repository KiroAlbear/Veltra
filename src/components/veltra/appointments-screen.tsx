"use client";

import { useVeltra, canDo, canAccess, type Appointment, type AppointmentStatus } from "@/lib/veltra-store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuLabel,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Plus,
  Calendar,
  Check,
  X,
  UserCheck,
  ArrowRight,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const STATUS_CONFIG: Record<
  AppointmentStatus,
  { label: string; className: string }
> = {
  scheduled: { label: "Scheduled", className: "bg-amber-500/10 text-amber-300 border-amber-500/20" },
  confirmed: { label: "Confirmed", className: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" },
  "checked-in": { label: "Waiting", className: "bg-violet-500/10 text-violet-300 border-violet-500/20" },
  "in-room": { label: "In room", className: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20" },
  completed: { label: "Done", className: "bg-slate-500/10 text-slate-300 border-slate-500/20" },
  "no-show": { label: "No-show", className: "bg-red-500/10 text-red-300 border-red-500/20" },
  cancelled: { label: "Cancelled", className: "bg-slate-500/5 text-slate-400 border-slate-500/10" },
};

const APPT_TYPES = [
  "Consultation",
  "Follow-up",
  "Lab Review",
  "Skin Consult",
  "Cardiac Review",
  "Diabetic Follow-up",
  "Migraine Review",
  "Asthma Follow-up",
  "New Patient",
];

const DOCTORS = ["Dr. Sarah", "Dr. Omar", "Dr. Layla"];
const TIME_SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00",
];

export function AppointmentsScreen() {
  const appointments = useVeltra((s) => s.appointments);
  const patients = useVeltra((s) => s.patients);
  const role = useVeltra((s) => s.currentUser?.role);
  const canBook = canDo(role, "canBook");
  const confirmAppt = useVeltra((s) => s.confirmAppointment);
  const checkIn = useVeltra((s) => s.checkIn);
  const completeAppt = useVeltra((s) => s.completeAppointment);
  const cancelAppt = useVeltra((s) => s.cancelAppointment);
  const addAppt = useVeltra((s) => s.addAppointment);
  const selectPatient = useVeltra((s) => s.selectPatient);
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    patientId: "",
    time: "09:00",
    type: "Consultation",
    doctor: "Dr. Sarah",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const todays = appointments
    .filter((a) => a.status !== "cancelled")
    .sort((a, b) => a.time.localeCompare(b.time));

  const handleAdd = async () => {
    if (!form.patientId) {
      toast({
        title: "Pick a patient",
        description: "Select who this appointment is for.",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    addAppt(form);
    setSubmitting(false);
    setDialogOpen(false);
    setForm({ patientId: "", time: "09:00", type: "Consultation", doctor: "Dr. Sarah", notes: "" });
    toast({
      title: "Appointment booked",
      description: "Booked. Set a reminder?",
    });
  };

  return (
    <div className="min-h-screen veltra-ambient">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-8 sm:py-10 md:px-10 md:py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-3.5 w-3.5 text-veltra-emerald" />
              <span className="text-micro text-veltra-emerald">Schedule</span>
            </div>
            <h1 className="text-[2.5rem] leading-[1.05] tracking-[-0.035em] text-foreground font-semibold">
              <span className="text-editorial-italic text-muted-foreground">Today's</span> schedule.
            </h1>
            <p className="text-body text-muted-foreground mt-3">
              {todays.length} today · {todays.filter((a) => a.status === "scheduled").length} pending · {todays.filter((a) => a.status === "checked-in").length} waiting · {todays.filter((a) => a.status === "completed").length} done
            </p>
          </div>

          {canBook && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="default" className="h-10 px-5 bg-veltra-emerald hover:bg-veltra-emerald-dark text-white">
                  <Plus className="mr-1.5 h-4 w-4" />
                  New appointment
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md veltra-shadow-lg">
              <DialogHeader>
                <DialogTitle className="text-title">Book appointment</DialogTitle>
                <DialogDescription className="text-caption">
                  Booking flows everywhere — Brief, Timeline, Calendar, Revenue, Notifications, Activity.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label htmlFor="patient" className="text-micro text-muted-foreground">Patient</Label>
                  <Select
                    value={form.patientId}
                    onValueChange={(v) => setForm({ ...form, patientId: v })}
                  >
                    <SelectTrigger id="patient" className="h-10">
                      <SelectValue placeholder="Select patient..." />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} · {p.conditions[0] || "No conditions"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="time" className="text-micro text-muted-foreground">Time</Label>
                    <Select
                      value={form.time}
                      onValueChange={(v) => setForm({ ...form, time: v })}
                    >
                      <SelectTrigger id="time" className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_SLOTS.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="doctor" className="text-micro text-muted-foreground">Doctor</Label>
                    <Select
                      value={form.doctor}
                      onValueChange={(v) => setForm({ ...form, doctor: v })}
                    >
                      <SelectTrigger id="doctor" className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DOCTORS.map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="type" className="text-micro text-muted-foreground">Visit type</Label>
                  <Select
                    value={form.type}
                    onValueChange={(v) => setForm({ ...form, type: v })}
                  >
                    <SelectTrigger id="type" className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {APPT_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="notes" className="text-micro text-muted-foreground">Notes (optional)</Label>
                  <Input
                    id="notes"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Reason for visit, prep notes..."
                    className="h-10"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="ghost"
                  onClick={() => setDialogOpen(false)}
                  className="h-10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAdd}
                  disabled={submitting || !form.patientId}
                  className="h-10 bg-veltra-emerald hover:bg-veltra-emerald-dark text-white"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    "Book appointment"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          )}
        </div>

        {/* Schedule list — refined */}
        {todays.length === 0 ? (
          <Card className="p-16 text-center veltra-shadow border-0 bg-card/50 backdrop-blur-sm">
            <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
              <Calendar className="h-5 w-5 text-veltra-emerald" />
            </div>
            <p className="text-editorial-italic text-body text-muted-foreground">
              A quiet day. Or the calm before it.
            </p>
            <p className="text-caption text-muted-foreground/70 mt-2 mb-6">
              Book an appointment to see the system come alive.
            </p>
            {canBook && (
              <Button size="sm" onClick={() => setDialogOpen(true)} className="h-9 bg-veltra-emerald hover:bg-veltra-emerald-dark text-white">
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                New appointment
              </Button>
            )}
          </Card>
        ) : (
          <Card className="veltra-shadow border-0 bg-card/50 backdrop-blur-sm overflow-hidden">
            {todays.map((a, idx) => (
              <AppointmentRow
                key={a.id}
                appt={a}
                isLast={idx === todays.length - 1}
                onConfirm={() => {
                  confirmAppt(a.id);
                  toast({ title: "Confirmed ✓", description: `${a.patientName} at ${a.time}` });
                }}
                onCheckIn={() => {
                  checkIn(a.id);
                  toast({ title: "Checked in ✓", description: `${a.patientName} is now waiting.` });
                }}
                onComplete={() => {
                  completeAppt(a.id);
                  toast({ title: "Visit completed ✓", description: `$350 collected. Activity logged.` });
                }}
                onCancel={() => {
                  cancelAppt(a.id);
                  toast({ title: "Cancelled", description: `${a.patientName} · ${a.time} — Undo available`, variant: "destructive" });
                }}
                onOpenPatient={() => selectPatient(a.patientId)}
              />
            ))}
          </Card>
        )}

        {/* Tip — refined */}
        <Card className="mt-6 p-5 border-emerald-500/15 bg-emerald-500/[0.04] border veltra-shadow">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-veltra-emerald/10 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="h-4 w-4 text-veltra-emerald" />
            </div>
            <div>
              <p className="text-caption font-medium text-foreground">Watch the system react</p>
              <p className="text-caption text-muted-foreground mt-1 leading-relaxed">
                Every action — book, confirm, check-in, complete — flows to Today's Brief, the patient's Timeline, the Activity feed, and Notifications. Switch tabs to see it.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function AppointmentRow({
  appt,
  isLast,
  onConfirm,
  onCheckIn,
  onComplete,
  onCancel,
  onOpenPatient,
}: {
  appt: Appointment;
  isLast: boolean;
  onConfirm: () => void;
  onCheckIn: () => void;
  onComplete: () => void;
  onCancel: () => void;
  onOpenPatient: () => void;
}) {
  const cfg = STATUS_CONFIG[appt.status];
  const role = useVeltra((s) => s.currentUser?.role);
  const canConfirm = canDo(role, "canConfirm");
  const canCheckIn = canDo(role, "canCheckIn");
  const canComplete = canDo(role, "canComplete");
  const canCancel = canDo(role, "canCancel");

  const row = (
    <div
      className={cn(
        "flex items-center gap-4 px-5 py-4 veltra-transition hover:bg-foreground/[0.03] cursor-default",
        !isLast && "border-b border-border/40"
      )}
    >
      {/* Time */}
      <div className="flex-shrink-0 w-14 text-left">
        <p className="text-body font-semibold tabular text-foreground">
          {appt.time}
        </p>
        <p className="text-micro text-muted-foreground normal-case tracking-normal mt-0.5">
          {appt.duration}min
        </p>
      </div>

      {/* Patient + type */}
      <button
        onClick={onOpenPatient}
        className="flex-1 min-w-0 text-left group"
      >
        <p className="text-body font-medium text-foreground truncate group-hover:text-veltra-emerald veltra-transition">
          {appt.patientName}
        </p>
        <p className="text-caption text-muted-foreground truncate">
          {appt.type} · {appt.doctor}
        </p>
        {appt.notes && (
          <p className="text-caption text-muted-foreground/70 truncate mt-0.5 italic">
            {appt.notes}
          </p>
        )}
      </button>

      {/* Status + actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Badge variant="outline" className={cn("text-micro font-medium hidden sm:inline-flex border", cfg.className)}>
          {cfg.label}
        </Badge>

        {appt.status === "scheduled" && canConfirm && (
          <>
            <Button size="sm" variant="outline" onClick={onConfirm} className="h-8 px-3 text-caption veltra-shadow border-0 bg-foreground/[0.04]">
              <Check className="mr-1 h-3 w-3" />
              <span className="hidden md:inline">Confirm</span>
            </Button>
            {canCancel && (
              <Button size="sm" variant="ghost" onClick={onCancel} className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive" aria-label="Cancel appointment">
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </>
        )}

        {appt.status === "confirmed" && canCheckIn && (
          <Button size="sm" variant="outline" onClick={onCheckIn} className="h-8 px-3 text-caption veltra-shadow border-0 bg-foreground/[0.04]">
            <UserCheck className="mr-1 h-3 w-3" />
            <span className="hidden sm:inline">Check in</span>
            <span className="sm:hidden">In</span>
          </Button>
        )}

        {appt.status === "checked-in" && canComplete && (
          <Button size="sm" onClick={onComplete} className="h-8 px-3 text-caption bg-veltra-emerald hover:bg-veltra-emerald-dark text-white">
            <Check className="mr-1 h-3 w-3" />
            Complete
          </Button>
        )}

        {appt.status === "completed" && (
          <Check className="h-4 w-4 text-emerald-400" />
        )}

        <Button
          size="sm"
          variant="ghost"
          onClick={onOpenPatient}
          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
        >
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );

  // Wrap with context menu
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {row}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56 veltra-shadow-lg bg-card/95 backdrop-blur-xl border-border/40">
        <ContextMenuLabel className="text-micro text-muted-foreground">
          {appt.patientName}
        </ContextMenuLabel>
        <ContextMenuSeparator />

        {appt.status === "scheduled" && (
          <ContextMenuItem onClick={onConfirm} className="text-body cursor-pointer">
            <Check className="mr-2 h-3.5 w-3.5 text-emerald-400" />
            Confirm appointment
          </ContextMenuItem>
        )}

        {appt.status === "confirmed" && (
          <ContextMenuItem onClick={onCheckIn} className="text-body cursor-pointer">
            <UserCheck className="mr-2 h-3.5 w-3.5 text-violet-400" />
            Check in patient
          </ContextMenuItem>
        )}

        {appt.status === "checked-in" && (
          <ContextMenuItem onClick={onComplete} className="text-body cursor-pointer">
            <Check className="mr-2 h-3.5 w-3.5 text-emerald-400" />
            Complete visit
          </ContextMenuItem>
        )}

        <ContextMenuItem onClick={onOpenPatient} className="text-body cursor-pointer">
          <ArrowRight className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
          Open patient timeline
        </ContextMenuItem>

        {appt.status !== "cancelled" && appt.status !== "completed" && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem
              onClick={onCancel}
              className="text-body cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-500/10"
            >
              <X className="mr-2 h-3.5 w-3.5" />
              Cancel appointment
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
