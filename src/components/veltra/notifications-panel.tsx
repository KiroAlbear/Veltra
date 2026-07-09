"use client";

/**
 * Veltra Notification Center
 *
 * A 420px right side sheet (NOT a small dropdown) that opens when the user
 * clicks the bell in the TopBar or presses `N`.
 *
 * Sections:
 *   - Header: title + unread count + Mark all read + Settings (gear)
 *   - Today section: notifications from today, grouped by category
 *   - Critical: drug interactions, allergies, critical labs
 *   - Medical: labs, prescriptions, follow-ups
 *   - Appointments: check-ins, confirmations, cancellations
 *   - Financial: payments, claims, invoices
 *   - Inventory: low stock, restocks
 *   - System: backups, errors, devices
 *   - Earlier section: older notifications (collapsed)
 *
 * Each notification:
 *   - category color stripe
 *   - title + description
 *   - relative time
 *   - action button (if actionLabel present)
 *   - click-to-mark-read
 *
 * Empty state: "Nothing needs you. Enjoy the quiet."
 */
import { useVeltra } from "@/lib/veltra-store";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  X,
  Check,
  CheckCheck,
  AlertTriangle,
  Activity,
  Calendar,
  DollarSign,
  Package,
  Server,
  Settings as SettingsIcon,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/veltra-store";
import { useState } from "react";

type Category = "critical" | "medical" | "financial" | "inventory" | "appointment" | "system";

const CATEGORY_META: Record<Category, { label: string; icon: React.ElementType; color: string; stripe: string }> = {
  critical:    { label: "Critical",    icon: AlertTriangle, color: "text-red-400",       stripe: "bg-red-500" },
  medical:     { label: "Medical",     icon: Activity,      color: "text-emerald-400",   stripe: "bg-emerald-500" },
  appointment: { label: "Appointments", icon: Calendar,     color: "text-violet-400",    stripe: "bg-violet-500" },
  financial:   { label: "Financial",   icon: DollarSign,    color: "text-amber-400",     stripe: "bg-amber-500" },
  inventory:   { label: "Inventory",   icon: Package,       color: "text-pink-400",      stripe: "bg-pink-500" },
  system:      { label: "System",      icon: Server,        color: "text-blue-400",      stripe: "bg-blue-500" },
};

const CATEGORY_ORDER: Category[] = ["critical", "medical", "appointment", "financial", "inventory", "system"];

export function NotificationsPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const notifications = useVeltra((s) => s.notifications);
  const markNotificationRead = useVeltra((s) => s.markNotificationRead);
  const markAllNotificationsRead = useVeltra((s) => s.markAllNotificationsRead);
  const setView = useVeltra((s) => s.setView);
  const selectPatient = useVeltra((s) => s.selectPatient);
  const [showSettings, setShowSettings] = useState(false);

  const unread = notifications.filter((n) => !n.read);

  // Split today vs earlier
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const todayNotifs = notifications.filter((n) => new Date(n.timestamp) >= startOfToday);
  const earlierNotifs = notifications.filter((n) => new Date(n.timestamp) < startOfToday);

  // Group today's notifications by category
  const grouped: Record<Category, typeof notifications> = {
    critical: [], medical: [], appointment: [], financial: [], inventory: [], system: [],
  };
  for (const n of todayNotifs) {
    grouped[n.category].push(n);
  }

  const handleAction = (n: typeof notifications[0]) => {
    markNotificationRead(n.id);
    if (n.patientId) selectPatient(n.patientId);
    if (n.actionTarget) setView(n.actionTarget as any);
    onClose();
  };

  const renderNotif = (n: typeof notifications[0]) => {
    const meta = CATEGORY_META[n.category];
    const Icon = meta.icon;
    return (
      <div
        key={n.id}
        className={cn(
          "group relative flex gap-3 px-5 py-3.5 veltra-transition hover:bg-foreground/[0.03]",
          !n.read && "bg-veltra-emerald/[0.03]"
        )}
      >
        {/* Category stripe */}
        <div className={cn("absolute left-0 top-0 bottom-0 w-0.5", meta.stripe)} />

        {/* Icon */}
        <div className={cn("flex-shrink-0 h-7 w-7 rounded-md flex items-center justify-center mt-0.5", "bg-foreground/[0.04]")}>
          <Icon className={cn("h-3.5 w-3.5", meta.color)} />
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-0.5">
            <p className={cn(
              "text-caption leading-snug flex-1 min-w-0",
              n.read ? "font-normal text-muted-foreground" : "font-medium text-foreground"
            )}>
              {n.title}
            </p>
            {!n.read && <span className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-veltra-emerald" />}
          </div>
          <p className="text-caption text-muted-foreground leading-snug mb-1.5">
            {n.description}
          </p>
          <div className="flex items-center justify-between gap-2">
            <p className="text-micro text-muted-foreground/60 normal-case tracking-normal">
              {formatRelativeTime(n.timestamp)}
            </p>
            {n.actionLabel && n.actionTarget && (
              <button
                onClick={() => handleAction(n)}
                className="text-micro text-veltra-emerald hover:text-veltra-emerald-dark normal-case tracking-normal flex items-center gap-0.5"
              >
                {n.actionLabel}
                <ChevronRight className="h-2.5 w-2.5" />
              </button>
            )}
          </div>
        </div>

        {!n.read && (
          <button
            onClick={() => markNotificationRead(n.id)}
            className="absolute top-2 right-2 h-6 w-6 rounded-md hover:bg-foreground/[0.06] flex items-center justify-center text-muted-foreground/40 hover:text-foreground opacity-0 group-hover:opacity-100 veltra-transition"
            aria-label="Mark as read"
          >
            <Check className="h-3 w-3" />
          </button>
        )}
      </div>
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[55] bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Right side sheet — 420px */}
          <motion.div
            className="fixed right-0 top-0 bottom-0 z-[56] w-full sm:w-[420px] bg-card/95 backdrop-blur-2xl border-l border-border/40 flex flex-col veltra-shadow-lg"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/40 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <Bell className="h-4 w-4 text-veltra-emerald" />
                <h3 className="text-body font-semibold text-foreground">Notifications</h3>
                {unread.length > 0 && (
                  <span className="text-micro px-1.5 py-0 rounded-full bg-veltra-emerald/15 text-veltra-emerald normal-case tracking-normal font-medium">
                    {unread.length} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unread.length > 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={markAllNotificationsRead}
                    className="h-7 text-caption text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    <CheckCheck className="h-3 w-3" />
                    <span className="hidden sm:inline">Mark all read</span>
                  </Button>
                )}
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="h-7 w-7 rounded-md hover:bg-foreground/[0.05] flex items-center justify-center text-muted-foreground hover:text-foreground veltra-transition"
                  aria-label="Notification settings"
                >
                  <SettingsIcon className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={onClose}
                  className="h-7 w-7 rounded-md hover:bg-foreground/[0.05] flex items-center justify-center text-muted-foreground hover:text-foreground veltra-transition"
                  aria-label="Close"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Settings preview (collapsed by default) */}
            {showSettings && (
              <div className="px-5 py-3 border-b border-border/40 bg-foreground/[0.02] flex-shrink-0">
                <p className="text-micro text-muted-foreground normal-case tracking-normal mb-2">
                  Categories you receive:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORY_ORDER.map((cat) => {
                    const meta = CATEGORY_META[cat];
                    return (
                      <span key={cat} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-foreground/[0.04] text-micro text-muted-foreground normal-case tracking-normal">
                        <meta.icon className={cn("h-2.5 w-2.5", meta.color)} />
                        {meta.label}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto veltra-scrollbar">
              {notifications.length === 0 ? (
                <div className="px-5 py-20 text-center">
                  <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                    <Check className="h-5 w-5 text-emerald-400" />
                  </div>
                  <p className="text-editorial-italic text-body text-muted-foreground">
                    Nothing needs you.
                  </p>
                  <p className="text-caption text-muted-foreground/70 mt-1">
                    Enjoy the quiet.
                  </p>
                </div>
              ) : (
                <>
                  {/* Today header */}
                  <div className="px-5 pt-4 pb-2 sticky top-0 bg-card/95 backdrop-blur-xl z-10">
                    <p className="text-micro text-muted-foreground/60 normal-case tracking-normal font-medium uppercase tracking-wider">
                      Today
                    </p>
                  </div>

                  {/* Today categories */}
                  {CATEGORY_ORDER.map((cat) => {
                    const items = grouped[cat];
                    if (items.length === 0) return null;
                    const meta = CATEGORY_META[cat];
                    return (
                      <div key={cat} className="mb-2">
                        <div className="px-5 py-1.5 flex items-center gap-1.5">
                          <meta.icon className={cn("h-3 w-3", meta.color)} />
                          <p className="text-micro text-muted-foreground normal-case tracking-normal font-medium">
                            {meta.label}
                          </p>
                          <span className="text-micro text-muted-foreground/50 normal-case tracking-normal">
                            · {items.length}
                          </span>
                        </div>
                        <div className="border-t border-border/30">
                          {items.map(renderNotif)}
                        </div>
                      </div>
                    );
                  })}

                  {/* Earlier */}
                  {earlierNotifs.length > 0 && (
                    <>
                      <div className="px-5 pt-6 pb-2 sticky top-0 bg-card/95 backdrop-blur-xl z-10">
                        <p className="text-micro text-muted-foreground/60 normal-case tracking-normal font-medium uppercase tracking-wider">
                          Earlier
                        </p>
                      </div>
                      <div className="border-t border-border/30">
                        {earlierNotifs.map(renderNotif)}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Footer — quick actions */}
            <div className="px-5 py-3 border-t border-border/40 flex items-center justify-between flex-shrink-0">
              <p className="text-micro text-muted-foreground/60 normal-case tracking-normal">
                Press <kbd className="text-micro px-1 rounded bg-foreground/[0.06] mx-0.5">N</kbd> to toggle
              </p>
              <button
                onClick={() => { setView("settings"); onClose(); }}
                className="text-micro text-veltra-emerald hover:text-veltra-emerald-dark normal-case tracking-normal"
              >
                Notification settings →
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
