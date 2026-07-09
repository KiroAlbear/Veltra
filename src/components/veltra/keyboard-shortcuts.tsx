"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVeltra } from "@/lib/veltra-store";
import { useToast } from "@/hooks/use-toast";
import {
  Briefcase,
  Users,
  CalendarClock,
  Activity,
  Command,
  Search,
  Undo2,
  RotateCcw,
  X,
  Shield,
  Settings as SettingsIcon,
  Bell,
  FlaskConical,
  DollarSign,
  BarChart3,
  MessageCircle,
  FileText,
  Package,
  Clock,
  RefreshCw,
  Stethoscope,
  Sun,
} from "lucide-react";

const SHORTCUTS = [
  { section: "Primary Nav (sidebar)", items: [
    { keys: ["1"], label: "Today's Brief", icon: Briefcase },
    { keys: ["2"], label: "Patients", icon: Users },
    { keys: ["3"], label: "Schedule", icon: CalendarClock },
    { keys: ["4"], label: "Messages", icon: MessageCircle },
    { keys: ["5"], label: "Settings", icon: SettingsIcon },
    { keys: ["N"], label: "Notifications", icon: Bell },
  ]},
  { section: "Secondary Screens (power-user)", items: [
    { keys: ["T"], label: "Patient Timeline", icon: Activity },
    { keys: ["C"], label: "Month Calendar", icon: CalendarClock },
    { keys: ["L"], label: "Lab Results", icon: FlaskConical },
    { keys: ["B"], label: "Billing", icon: DollarSign },
    { keys: ["R"], label: "Reports", icon: BarChart3 },
    { keys: ["I"], label: "Insurance Claims", icon: Shield },
    { keys: ["D"], label: "Documents", icon: FileText },
    { keys: ["P"], label: "Pharmacy Inventory", icon: Package },
    { keys: ["A"], label: "Doctor Availability", icon: Clock },
    { keys: ["U"], label: "Recurring Appointments", icon: RefreshCw },
    { keys: ["G"], label: "Patient Intake", icon: Stethoscope },
    { keys: ["Z"], label: "Audit Log (admin)", icon: Shield },
  ]},
  { section: "Quick Actions", items: [
    { keys: ["⌘ / Ctrl", "K"], label: "Open command palette (jump to anything)", icon: Command },
    { keys: ["⌘ / Ctrl", "/"], label: "Show this help", icon: Search },
    { keys: ["⌘ / Ctrl", "Z"], label: "Undo last action", icon: Undo2 },
    { keys: ["⌘ / Ctrl", "D"], label: "Toggle dark / light mode", icon: Sun },
  ]},
  { section: "Demo", items: [
    { keys: ["Shift", "⌘ / Ctrl", "R"], label: "Reset demo data", icon: RotateCcw },
  ]},
];

export function KeyboardShortcuts() {
  const [open, setOpen] = useState(false);
  const resetDemo = useVeltra((s) => s.resetDemo);
  const { toast } = useToast();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
      // ⌘R for reset (override)
      if ((e.metaKey || e.ctrlKey) && e.key === "r" && !e.shiftKey) {
        // Don't override browser refresh — use Shift+⌘R instead
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "r") {
        e.preventDefault();
        resetDemo();
        toast({ title: "Demo reset", description: "All data restored." });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [resetDemo]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            className="bg-card/95 backdrop-blur-2xl rounded-2xl veltra-shadow-lg max-w-lg w-full p-8 border border-border/40"
            initial={{ scale: 0.96, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 10 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-title text-foreground">Keyboard Shortcuts</h2>
                <p className="text-caption text-muted-foreground mt-1">
                  <span className="text-editorial-italic">Move at the speed of thought.</span>
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="h-8 w-8 rounded-md hover:bg-foreground/[0.05] flex items-center justify-center text-muted-foreground hover:text-foreground veltra-transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-6">
              {SHORTCUTS.map((group) => (
                <div key={group.section}>
                  <p className="text-micro text-muted-foreground/60 mb-3">{group.section}</p>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.label}
                          className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-foreground/[0.03] veltra-transition"
                        >
                          <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-body text-foreground flex-1">{item.label}</span>
                          <div className="flex items-center gap-1">
                            {item.keys.map((k, i) => (
                              <kbd
                                key={i}
                                className="min-w-[24px] h-6 px-1.5 rounded-md bg-foreground/[0.06] border border-border/40 text-caption font-medium text-muted-foreground flex items-center justify-center tabular"
                              >
                                {k}
                              </kbd>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-center mt-6 pt-6 border-t border-border/40 text-micro text-muted-foreground/50 normal-case tracking-normal">
              Press <kbd className="text-foreground">Esc</kbd> to close
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
