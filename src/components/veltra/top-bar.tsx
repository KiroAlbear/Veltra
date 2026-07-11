"use client";

/**
 * Veltra TopBar
 *
 * A slim, sticky header that sits ABOVE the main content area (right of the sidebar).
 * It shows:
 *   - Current view title + contextual subtitle
 *   - Today's date (long form, editorial)
 *   - Live status pill (system health)
 *   - Notifications bell with unread count + click-to-open
 *
 * Why: The notification bell was buried in the sidebar footer alongside Support and
 * the user dropdown — it competed for attention. Promoting it to a top bar gives it
 * a permanent, predictable home and frees up the sidebar footer to be just the user.
 *
 * Design rule: Apple's macOS menu bar is always in the same place, always thin.
 */
import { useVeltra } from "@/lib/veltra-store";
import { Bell, Calendar, Menu, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const VIEW_META: Record<string, { title: string; subtitle: string }> = {
  brief:        { title: "Today's Brief",   subtitle: "Your morning intelligence" },
  patients:     { title: "Patients",        subtitle: "Every chart, one timeline" },
  appointments: { title: "Schedule",        subtitle: "Today's appointments" },
  calendar:     { title: "Calendar",        subtitle: "Month view" },
  recurring:    { title: "Recurring",       subtitle: "Recurring visits" },
  availability: { title: "Availability",    subtitle: "Doctor working hours" },
  timeline:     { title: "Patient Timeline", subtitle: "The full chart, in order" },
  labs:         { title: "Lab Results",     subtitle: "Across all patients" },
  billing:      { title: "Billing",         subtitle: "Payments and balances" },
  reports:      { title: "Reports",         subtitle: "Insights and trends" },
  claims:       { title: "Insurance",       subtitle: "Claims and pre-authorizations" },
  messages:     { title: "Messages",        subtitle: "Patient chats — like WhatsApp" },
  documents:    { title: "Documents",       subtitle: "Letters, referrals, reports" },
  inventory:    { title: "Inventory",       subtitle: "Pharmacy stock" },
  intake:       { title: "New Patient",     subtitle: "Register a new patient" },
  import:       { title: "Smart Import",    subtitle: "Upload a file — AI extracts the data" },
  migrate:      { title: "VELTRA Switch",   subtitle: "Migrate your clinic in an hour" },
  security:     { title: "Security Center", subtitle: "Calm by design" },
  users:        { title: "User Management", subtitle: "Who has access" },
  audit:        { title: "Audit Log",       subtitle: "Every action, remembered" },
  settings:     { title: "Settings",        subtitle: "Your account and preferences" },
};

export function TopBar({ onNotificationsOpen }: { onNotificationsOpen: () => void }) {
  const activeView = useVeltra((s) => s.activeView);
  const notifications = useVeltra((s) => s.notifications);
  const unread = notifications.filter((n) => !n.read).length;

  const meta = VIEW_META[activeView] || { title: "Veltra", subtitle: "" };

  // Long-form editorial date — "Tuesday, July 8"
  const today = new Date();
  const dateLong = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <TooltipProvider delayDuration={400}>
    <header
      className="
        sticky top-0 z-20
        flex items-center gap-4
        h-12 px-5 sm:px-8
        border-b border-border/40
        bg-background/80 backdrop-blur-xl
      "
    >
      {/* Left: Page title + subtitle */}
      <div className="flex items-baseline gap-3 min-w-0 flex-1">
        <h1 className="text-title font-semibold text-foreground truncate">{meta.title}</h1>
        <span className="text-caption text-muted-foreground/70 truncate hidden sm:inline">
          {meta.subtitle}
        </span>
      </div>

      {/* Center: Date — desktop only */}
      <div className="hidden md:flex items-center gap-1.5 text-caption text-muted-foreground/80">
        <Calendar className="h-4 w-4" />
        <span className="tabular">{dateLong}</span>
      </div>

      {/* Right: Search hint + Notifications */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
          className="hidden sm:flex items-center gap-2 h-8 px-3 rounded-md hover:bg-foreground/[0.05] veltra-transition text-micro text-muted-foreground"
          aria-label="Search (⌘K)"
        >
          <Search className="h-4 w-4" />
          <span className="normal-case tracking-normal">Search</span>
          <kbd className="text-micro text-muted-foreground/70 normal-case tracking-normal">⌘K</kbd>
        </button>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onNotificationsOpen}
              className="relative h-8 w-8 flex items-center justify-center rounded-md hover:bg-foreground/[0.05] veltra-transition"
              aria-label={`Notifications${unread > 0 ? ` — ${unread} unread` : ""}`}
            >
              <Bell className={cn("h-4 w-4", unread > 0 ? "text-veltra-emerald" : "text-muted-foreground")} />
              {unread > 0 && (
                <span
                  className="
                    absolute top-1 right-1
                    h-3.5 min-w-3.5 px-1
                    rounded-full bg-veltra-emerald
                    text-[9px] font-bold text-white
                    flex items-center justify-center
                  "
                >
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-foreground text-background border-border/40">
            <p className="text-caption">
              {unread > 0 ? `${unread} unread notification${unread === 1 ? "" : "s"}` : "You're all caught up"}
              <span className="text-micro text-background/60 ml-1.5 normal-case tracking-normal">(N)</span>
            </p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => window.dispatchEvent(new Event("veltra:open-sidebar"))}
              className="md:hidden h-8 w-8 flex items-center justify-center rounded-md hover:bg-foreground/[0.05] veltra-transition"
              aria-label="Open navigation"
            >
              <Menu className="h-4 w-4 text-muted-foreground" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-foreground text-background border-border/40">
            <p className="text-caption">Open navigation</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </header>
    </TooltipProvider>
  );
}
