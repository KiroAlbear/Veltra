"use client";

import { useVeltra } from "@/lib/veltra-store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useMemo } from "react";
import { FadeIn } from "./motion";

const APPT_STATUS_COLOR: Record<string, string> = {
  scheduled: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  confirmed: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  "checked-in": "bg-violet-500/20 text-violet-300 border-violet-500/30",
  completed: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  "no-show": "bg-red-500/20 text-red-300 border-red-500/30",
  cancelled: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

export function CalendarScreen() {
  const appointments = useVeltra((s) => s.appointments);
  const selectPatient = useVeltra((s) => s.selectPatient);
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const cells: (Date | null)[] = [];
    for (let i = 0; i < startDayOfWeek; i++) cells.push(null);
    for (let d = 1; d <= totalDays; d++) cells.push(new Date(year, month, d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [year, month]);

  const todayISO = new Date().toISOString().split("T")[0];
  const apptsByDate = useMemo(() => {
    const map: Record<string, typeof appointments> = {};
    appointments.forEach((a) => {
      if (!map[a.date]) map[a.date] = [];
      map[a.date].push(a);
    });
    return map;
  }, [appointments]);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const todayAppointments = apptsByDate[todayISO] || [];
  const selectedDayAppts = (date: Date) => {
    const iso = date.toISOString().split("T")[0];
    return apptsByDate[iso] || [];
  };

  return (
    <div className="min-h-screen veltra-ambient">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-10 md:px-12 md:py-14">
        <FadeIn>
          <header className="mb-10">
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays className="h-3.5 w-3.5 text-veltra-emerald" />
              <span className="text-micro text-veltra-emerald">Calendar</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-[2.5rem] leading-[1.05] tracking-[-0.035em] text-foreground font-semibold">
                  <span className="text-editorial-italic text-muted-foreground">{monthName}</span>
                </h1>
                <p className="text-body text-muted-foreground mt-3">
                  {appointments.length} appointments · {todayAppointments.length} today
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={prevMonth} className="h-9 w-9 p-0 veltra-shadow border-0 bg-foreground/[0.04]" aria-label="Previous month">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={goToToday} className="h-9 px-4 text-caption veltra-shadow border-0 bg-foreground/[0.04]">
                  Today
                </Button>
                <Button size="sm" variant="outline" onClick={nextMonth} className="h-9 w-9 p-0 veltra-shadow border-0 bg-foreground/[0.04]" aria-label="Next month">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>
        </FadeIn>

        <FadeIn delay={0.1}>
          <Card className="p-6 veltra-shadow border-0 bg-card/50 backdrop-blur-sm">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="text-center text-micro text-muted-foreground/60 py-2">{d}</div>
              ))}
            </div>
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((date, idx) => {
                if (!date) return <div key={idx} className="aspect-square" />;
                const iso = date.toISOString().split("T")[0];
                const dayAppts = apptsByDate[iso] || [];
                const isToday = iso === todayISO;
                return (
                  <button
                    key={idx}
                    onClick={() => dayAppts.length > 0 && selectPatient(dayAppts[0].patientId)}
                    className={cn(
                      "aspect-square rounded-lg p-1.5 text-left veltra-transition border",
                      isToday ? "border-veltra-emerald/40 bg-veltra-emerald/5" : "border-transparent hover:border-border/40 hover:bg-foreground/[0.03]",
                      dayAppts.length > 0 && "cursor-pointer"
                    )}
                  >
                    <p className={cn(
                      "text-caption font-medium tabular",
                      isToday ? "text-veltra-emerald" : "text-foreground"
                    )}>
                      {date.getDate()}
                    </p>
                    <div className="space-y-0.5 mt-1">
                      {dayAppts.slice(0, 2).map((a) => (
                        <div key={a.id} className={cn("text-[10px] px-1 py-0.5 rounded truncate", APPT_STATUS_COLOR[a.status])}>
                          {a.time} {a.patientName.split(" ")[0]}
                        </div>
                      ))}
                      {dayAppts.length > 2 && (
                        <p className="text-[10px] text-muted-foreground">+{dayAppts.length - 2} more</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        </FadeIn>

        {/* Today's appointments detail */}
        <FadeIn delay={0.2}>
          <div className="mt-8">
            <h2 className="text-title text-foreground mb-4">Today — {todayAppointments.length} appointments</h2>
            <Card className="veltra-shadow border-0 bg-card/50 backdrop-blur-sm overflow-hidden">
              {todayAppointments.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <p className="text-editorial-italic text-caption text-muted-foreground">A quiet day. Or the calm before it.</p>
                </div>
              ) : (
                todayAppointments.map((a, idx) => (
                  <button
                    key={a.id}
                    onClick={() => selectPatient(a.patientId)}
                    className={cn(
                      "w-full flex items-center gap-4 px-6 py-4 text-left veltra-transition hover:bg-foreground/[0.03]",
                      idx !== todayAppointments.length - 1 && "border-b border-border/40"
                    )}
                  >
                    <div className="flex-shrink-0 w-12">
                      <p className="text-body font-semibold tabular text-foreground">{a.time}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-body font-medium text-foreground truncate">{a.patientName}</p>
                      <p className="text-caption text-muted-foreground truncate">{a.type} · {a.doctor}</p>
                    </div>
                    <Badge variant="outline" className={cn("text-micro font-medium border", APPT_STATUS_COLOR[a.status])}>
                      {a.status}
                    </Badge>
                  </button>
                ))
              )}
            </Card>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
