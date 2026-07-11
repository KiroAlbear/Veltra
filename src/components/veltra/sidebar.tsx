"use client";

/**
 * Veltra Sidebar — Radical Simplicity
 *
 * 5 primary nav items only. Everything else is contextual:
 *   - Secondary screens (labs, billing, reports, inventory, audit, etc.)
 *     are reachable via Command Palette (⌘K) or in-screen buttons.
 *   - The user dropdown still exposes Settings + Audit + Sign out.
 *
 * Design rule: Apple doesn't show you 200 screens. It shows you 7 in the dock.
 * The rest appear when you need them.
 */
import { useVeltra, canAccessWithTier } from "@/lib/veltra-store";
import { SPECIALTIES } from "@/lib/specialties";
import { TIERS } from "@/lib/subscription-tiers";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  Users,
  CalendarClock,
  MessageCircle,
  Settings as SettingsIcon,
  Shield,
  LogOut,
  MapPin,
  ChevronDown,
  Bell,
  Menu,
  X,
  Command,
  Sparkles,
  Check,
  Headphones,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { SupportChat } from "./support-chat";
import { useToast } from "@/hooks/use-toast";
import { AnimatePresence, motion } from "framer-motion";

type NavItem = {
  id:
    | "brief"
    | "patients"
    | "appointments"
    | "messages"
    | "settings";
  label: string;
  icon: React.ElementType;
  shortcut: string;
  tip: string;
};

const PRIMARY_NAV: NavItem[] = [
  { id: "brief",        label: "Today's Brief", icon: Briefcase,    shortcut: "1", tip: "Your daily morning intelligence — patients to see, things to follow up." },
  { id: "patients",     label: "Patients",      icon: Users,         shortcut: "2", tip: "All patients in this clinic. Open one to see timeline, labs, documents." },
  { id: "appointments", label: "Schedule",      icon: CalendarClock, shortcut: "3", tip: "Today's appointments, calendar, recurring, doctor availability." },
  { id: "messages",     label: "Messages",      icon: MessageCircle, shortcut: "4", tip: "Individual patient chats — like WhatsApp, but clinical." },
  { id: "settings",     label: "Settings",      icon: SettingsIcon,  shortcut: "5", tip: "Your account, preferences, location, billing." },
];

export function Sidebar({ onNotificationsOpen }: { onNotificationsOpen?: () => void }) {
  const activeView = useVeltra((s) => s.activeView);
  const setView = useVeltra((s) => s.setView);
  const currentUser = useVeltra((s) => s.currentUser);
  const logout = useVeltra((s) => s.logout);
  const mode = useVeltra((s) => s.mode);
  const notifications = useVeltra((s) => s.notifications);
  const activeTier = useVeltra((s) => s.activeTier);
  const unread = notifications.filter((n) => !n.read).length;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [supportChatOpen, setSupportChatOpen] = useState(false);
  const { toast } = useToast();

  const tierScreens = activeTier?.screensEnabled || [];
  const hideMobileSidebar = mode === "demo";

  const handleNav = (id: NavItem["id"]) => {
    setView(id);
    setMobileOpen(false);
  };

  useEffect(() => {
    const openMobileSidebar = () => setMobileOpen(true);

    window.addEventListener("veltra:open-sidebar", openMobileSidebar);
    return () => window.removeEventListener("veltra:open-sidebar", openMobileSidebar);
  }, []);

  // Filter primary nav by tier+role. Settings + Brief are always available.
  const visibleNav = PRIMARY_NAV.filter((item) =>
    canAccessWithTier(currentUser?.role, item.id, tierScreens)
  );

  const renderNavItem = (item: NavItem) => {
    const active =
      activeView === item.id ||
      // Treat "appointments" nav as active for related schedule screens
      (item.id === "appointments" &&
        ["calendar", "recurring", "availability"].includes(activeView)) ||
      // Treat "patients" nav as active for related patient screens
      (item.id === "patients" &&
        ["timeline", "labs", "documents", "intake"].includes(activeView)) ||
      // Treat "messages" nav as active for related comms
      (item.id === "messages" && activeView === "messages");

    return (
      <Tooltip key={item.id}>
        <TooltipTrigger asChild>
          <button
            onClick={() => handleNav(item.id)}
            className={cn(
              "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-body veltra-transition",
              active
                ? "bg-veltra-emerald/15 text-veltra-emerald font-medium"
                : "text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground"
            )}
            aria-current={active ? "page" : undefined}
          >
            <item.icon className="h-4 w-4 flex-shrink-0" />
            <span className="flex-1 text-left">{item.label}</span>
            <kbd className="text-micro text-muted-foreground/70 normal-case tracking-normal hidden lg:inline">
              {item.shortcut}
            </kbd>
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-foreground text-background border-border/40 max-w-[220px]">
          <p className="text-caption leading-relaxed">{item.tip}</p>
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <TooltipProvider delayDuration={400}>
      <>
        {/* Mobile top bar */}
        {!hideMobileSidebar && (
        <div className="md:hidden sticky top-10 z-30 flex h-12 items-center justify-between border-b border-border/40 bg-background/80 backdrop-blur-xl px-4">
          <Button size="sm" variant="ghost" onClick={() => setMobileOpen(true)} className="h-8 w-8 p-0" aria-label="Open navigation">
            <Menu className="h-4 w-4" />
          </Button>
          <span className="text-caption font-medium text-foreground">
            {(() => {
              const item = PRIMARY_NAV.find((i) => i.id === activeView);
              if (item) return item.label;
              // Map secondary screens to their parent label
              if (["timeline", "labs", "documents", "intake"].includes(activeView)) return "Patients";
              if (["calendar", "recurring", "availability"].includes(activeView)) return "Schedule";
              return "Veltra";
            })()}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setSupportChatOpen(true)} className="relative h-8 w-8 flex items-center justify-center rounded-md hover:bg-veltra-emerald/10 hover:text-veltra-emerald veltra-transition" aria-label="Support">
              <Headphones className="h-4 w-4 text-muted-foreground" />
            </button>
            <button onClick={onNotificationsOpen} aria-label="Notifications" className="relative h-8 w-8 flex items-center justify-center rounded-md hover:bg-foreground/[0.05] veltra-transition">
              <Bell className="h-4 w-4 text-muted-foreground" />
              {unread > 0 && (
                <span className="absolute top-1 right-1 h-3.5 min-w-3.5 rounded-full bg-veltra-emerald text-[9px] font-bold text-white flex items-center justify-center px-1">{unread}</span>
              )}
            </button>
          </div>
        </div>
        )}

        {/* Mobile drawer */}
        <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              className="absolute left-0 top-0 h-full w-72 bg-card/95 backdrop-blur-xl shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 420, damping: 38, mass: 0.8 }}
            >
              <div className="flex h-14 items-center gap-2 border-b border-border/40 px-4">
                <button onClick={() => handleNav("brief")} className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer" aria-label="Back to home">
                  <img src="/logo-symbol.png" alt="Veltra" className="object-cover h-7 w-7 rounded-lg veltra-shadow flex-shrink-0" />
                  <span className="text-body font-semibold tracking-tight text-foreground truncate">Veltra</span>
                </button>
                <LocationSwitcher />
                <TierBadge />
                <Button size="sm" variant="ghost" onClick={() => setMobileOpen(false)} className="h-8 w-8 p-0" aria-label="Close menu">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="px-3 pt-3 pb-1">
                <SpecialtySwitcher />
              </div>

              <nav className="flex-1 p-3 overflow-y-auto veltra-scrollbar">
                <p className="text-micro text-muted-foreground/60 px-3 mb-2 mt-1">Workspace</p>
                <div className="space-y-0.5">
                  {visibleNav.map((item) => renderNavItem(item))}
                </div>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
                  }}
                  className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-body text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground veltra-transition mt-3"
                >
                  <Command className="h-4 w-4" />
                  <span className="flex-1 text-left">Search & jump</span>
                  <kbd className="text-micro text-muted-foreground/40 normal-case tracking-normal">⌘K</kbd>
                </button>
              </nav>

              <div className="border-t border-border/40 p-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="mt-1.5 w-full flex items-center gap-2 px-2.5 py-2 rounded-lg bg-foreground/[0.04] hover:bg-foreground/[0.07] veltra-transition">
                      <div className={cn("h-7 w-7 rounded-full flex items-center justify-center text-micro font-semibold flex-shrink-0", currentUser?.avatarColor || "bg-foreground/20")}>
                        {currentUser?.initials || "?"}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-caption font-medium text-foreground truncate leading-tight">{currentUser?.name || "Not signed in"}</p>
                        <p className="text-micro text-muted-foreground normal-case tracking-normal truncate leading-tight mt-0.5 capitalize">{currentUser?.role || "—"}</p>
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" side="top" className="w-56 veltra-shadow-lg bg-card/95 backdrop-blur-xl border-border/40 mb-2">
                    <DropdownMenuLabel className="text-micro text-muted-foreground">{currentUser?.email}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleNav("settings")} className="text-body cursor-pointer">
                      <SettingsIcon className="mr-2 h-3.5 w-3.5" /> Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setMobileOpen(false); setSupportChatOpen(true); }} className="text-body cursor-pointer">
                      <Headphones className="mr-2 h-3.5 w-3.5" /> Support
                      <span className="ml-auto text-micro text-veltra-emerald normal-case tracking-normal flex items-center gap-1">
                        <span className="veltra-live-dot" /> Live
                      </span>
                    </DropdownMenuItem>
                    {canAccessWithTier(currentUser?.role, "security", tierScreens) && (
                      <DropdownMenuItem onClick={() => { setMobileOpen(false); setView("security" as any); }} className="text-body cursor-pointer">
                        <Shield className="mr-2 h-3.5 w-3.5" /> Security
                      </DropdownMenuItem>
                    )}
                    {canAccessWithTier(currentUser?.role, "users", tierScreens) && (
                      <DropdownMenuItem onClick={() => { setMobileOpen(false); setView("users" as any); }} className="text-body cursor-pointer">
                        <Users className="mr-2 h-3.5 w-3.5" /> Users
                      </DropdownMenuItem>
                    )}
                    {canAccessWithTier(currentUser?.role, "audit", tierScreens) && (
                      <DropdownMenuItem onClick={() => { setMobileOpen(false); setView("audit" as any); }} className="text-body cursor-pointer">
                        <Sparkles className="mr-2 h-3.5 w-3.5" /> Audit log
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => { setMobileOpen(false); logout(); toast({ title: "Signed out", description: "You've been signed out." }); }} className="text-body cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-500/10">
                      <LogOut className="mr-2 h-3.5 w-3.5" /> Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>

        {/* Desktop sidebar */}
        <aside className="hidden md:flex md:w-64 md:flex-shrink-0 md:flex-col md:border-r md:border-border/40 md:bg-sidebar/50 md:backdrop-blur-xl h-full min-h-0 overflow-hidden">
          {/* Brand row */}
          <div className="flex h-14 items-center gap-2 border-b border-border/40 px-4">
            <button onClick={() => handleNav("brief")} className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer" aria-label="Back to home">
              <img src="/logo-symbol.png" alt="Veltra" className="object-cover h-7 w-7 rounded-lg veltra-shadow flex-shrink-0" />
              <span className="text-body font-semibold tracking-tight text-foreground truncate">Veltra</span>
            </button>
            <LocationSwitcher />
            <TierBadge />
          </div>

          {/* Specialty switcher */}
          <div className="px-3 pt-3 pb-1">
            <SpecialtySwitcher />
          </div>

          {/* Primary nav — 5 items, flat */}
          <nav className="flex-1 p-3 overflow-y-auto veltra-scrollbar">
            <p className="text-micro text-muted-foreground/60 px-3 mb-2 mt-1">Workspace</p>
            <div className="space-y-0.5">
              {visibleNav.map((item) => renderNavItem(item))}
            </div>

            {/* Command palette hint */}
            <button
              onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
              className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-body text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground veltra-transition mt-3"
            >
              <Command className="h-4 w-4" />
              <span className="flex-1 text-left">Search & jump</span>
              <kbd className="text-micro text-muted-foreground/40 normal-case tracking-normal">⌘K</kbd>
            </button>
          </nav>

          {/* Footer — User only. Notifications moved to TopBar, Support moved to Profile dropdown. */}
          <div className="border-t border-border/40 p-2">
            {/* User dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="mt-1.5 w-full flex items-center gap-2 px-2.5 py-2 rounded-lg bg-foreground/[0.04] hover:bg-foreground/[0.07] veltra-transition">
                  <div className={cn("h-7 w-7 rounded-full flex items-center justify-center text-micro font-semibold flex-shrink-0", currentUser?.avatarColor || "bg-foreground/20")}>
                    {currentUser?.initials || "?"}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-caption font-medium text-foreground truncate leading-tight">{currentUser?.name || "Not signed in"}</p>
                    <p className="text-micro text-muted-foreground normal-case tracking-normal truncate leading-tight mt-0.5 capitalize">{currentUser?.role || "—"}</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="top" className="w-56 veltra-shadow-lg bg-card/95 backdrop-blur-xl border-border/40 mb-2">
                <DropdownMenuLabel className="text-micro text-muted-foreground">{currentUser?.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleNav("settings")} className="text-body cursor-pointer">
                  <SettingsIcon className="mr-2 h-3.5 w-3.5" /> Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSupportChatOpen(true)} className="text-body cursor-pointer">
                  <Headphones className="mr-2 h-3.5 w-3.5" /> Support
                  <span className="ml-auto text-micro text-veltra-emerald normal-case tracking-normal flex items-center gap-1">
                    <span className="veltra-live-dot" /> Live
                  </span>
                </DropdownMenuItem>
                {canAccessWithTier(currentUser?.role, "security", tierScreens) && (
                  <DropdownMenuItem onClick={() => setView("security" as any)} className="text-body cursor-pointer">
                    <Shield className="mr-2 h-3.5 w-3.5" /> Security
                  </DropdownMenuItem>
                )}
                {canAccessWithTier(currentUser?.role, "users", tierScreens) && (
                  <DropdownMenuItem onClick={() => setView("users" as any)} className="text-body cursor-pointer">
                    <Users className="mr-2 h-3.5 w-3.5" /> Users
                  </DropdownMenuItem>
                )}
                {canAccessWithTier(currentUser?.role, "audit", tierScreens) && (
                  <DropdownMenuItem onClick={() => setView("audit" as any)} className="text-body cursor-pointer">
                    <Sparkles className="mr-2 h-3.5 w-3.5" /> Audit log
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { logout(); toast({ title: "Signed out", description: "You've been signed out." }); }} className="text-body cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-500/10">
                  <LogOut className="mr-2 h-3.5 w-3.5" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>
      </>

      <SupportChat open={supportChatOpen} onClose={() => setSupportChatOpen(false)} />
    </TooltipProvider>
  );
}

function LocationSwitcher() {
  const locations = useVeltra((s) => s.locations);
  const currentLocationId = useVeltra((s) => s.currentLocationId);
  const switchLocation = useVeltra((s) => s.switchLocation);
  const current = locations.find((l) => l.id === currentLocationId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="ml-auto mr-0 flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-foreground/[0.05] veltra-transition text-micro text-muted-foreground hover:text-foreground">
          <MapPin className="h-3 w-3" />
          <span className="truncate max-w-[80px]">{current?.name.split(" — ")[0] || "Location"}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 veltra-shadow-lg bg-card/95 backdrop-blur-xl border-border/40">
        <DropdownMenuLabel className="text-micro text-muted-foreground">Locations</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {locations.map((loc) => (
          <DropdownMenuItem key={loc.id} onClick={() => switchLocation(loc.id)} className={cn("text-body cursor-pointer", loc.id === currentLocationId && "text-veltra-emerald")}>
            <MapPin className="mr-2 h-3.5 w-3.5" />
            {loc.name}
            {loc.isPrimary && <Badge variant="secondary" className="ml-auto text-micro normal-case tracking-normal">Primary</Badge>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SpecialtySwitcher() {
  const activeSpecialty = useVeltra((s) => s.activeSpecialty);
  const setSpecialty = useVeltra((s) => s.setSpecialty);
  const setView = useVeltra((s) => s.setView);
  const { toast } = useToast();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={cn(
          "w-full flex items-center gap-2 px-3 py-2 rounded-lg veltra-transition veltra-glass border-0 text-left",
          ""
        )}>
          <div className={cn("h-7 w-7 rounded-md flex items-center justify-center text-sm flex-shrink-0", activeSpecialty.color)}>
            {activeSpecialty.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-micro text-muted-foreground/70 normal-case tracking-normal leading-none mb-0.5">Specialty</p>
            <p className="text-caption font-medium text-foreground truncate">{activeSpecialty.name}</p>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/50 flex-shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="bottom" className="w-72 max-h-[60vh] overflow-y-auto veltra-scrollbar veltra-shadow-lg bg-card/95 backdrop-blur-xl border-border/40">
        <DropdownMenuLabel className="text-micro text-muted-foreground flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-veltra-emerald" />
          Switch specialty
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {SPECIALTIES.map((s) => (
          <DropdownMenuItem
            key={s.id}
            onClick={() => {
              setSpecialty(s.id);
              setView("brief");
              toast({ title: `Switched to ${s.name}`, description: "Demo data regenerated for this specialty." });
            }}
            className={cn("text-body cursor-pointer gap-2.5", s.id === activeSpecialty.id && "bg-veltra-emerald/10")}
          >
            <span className={cn("h-6 w-6 rounded-md flex items-center justify-center text-xs flex-shrink-0", s.color)}>
              {s.emoji}
            </span>
            <span className="flex-1">{s.name}</span>
            {s.id === activeSpecialty.id && <Check className="h-3.5 w-3.5 text-veltra-emerald" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function TierBadge() {
  const activeTier = useVeltra((s) => s.activeTier);
  const setActiveTier = useVeltra((s) => s.setActiveTier);
  const { toast } = useToast();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={cn("ml-auto mr-0 flex items-center gap-1 px-1.5 py-0.5 rounded-md text-micro font-medium veltra-transition", activeTier.accentColor)}>
          
          <span className="truncate max-w-[50px] hidden lg:inline">{activeTier.name}</span>
          <ChevronDown className="h-2.5 w-2.5 opacity-60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="bottom" className="w-72 veltra-shadow-lg bg-card/95 backdrop-blur-xl border-border/40">
        <DropdownMenuLabel className="text-micro text-muted-foreground flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-veltra-emerald" />
          Subscription tier — what's unlocked
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {TIERS.map((t) => {
          const isActive = t.id === activeTier.id;
          const locCount = t.limits.locations === "unlimited" ? "∞" : t.limits.locations;
          const userCount = t.limits.users === "unlimited" ? "∞" : t.limits.users;
          const memory = t.limits.memoryRetentionDays === "unlimited" ? "∞" : t.limits.memoryRetentionDays === 90 ? "90d" : t.limits.memoryRetentionDays === 730 ? "2yr" : "∞";
          return (
            <DropdownMenuItem
              key={t.id}
              onClick={() => {
                setActiveTier(t.id);
                toast({
                  title: `Switched to ${t.name}`,
                  description: `${locCount} location${String(locCount) !== "1" ? "s" : ""} · ${userCount} users · ${t.screensEnabled.length} screens unlocked`,
                });
              }}
              className={cn("text-body cursor-pointer gap-2.5 p-3", isActive && "bg-veltra-emerald/10")}
            >
              <span className={cn("h-8 w-8 rounded-md flex items-center justify-center text-sm flex-shrink-0", t.accentColor)}>
                {t.emoji}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-caption font-semibold text-foreground truncate">{t.name}</p>
                  {t.badge && (
                    <span className="text-micro px-1.5 py-0 rounded bg-veltra-emerald/15 text-veltra-emerald normal-case tracking-normal">{t.badge}</span>
                  )}
                </div>
                <p className="text-micro text-muted-foreground/70 normal-case tracking-normal truncate mt-0.5">{t.tagline}</p>
                <div className="flex items-center gap-3 mt-1.5 text-micro text-muted-foreground/80 normal-case tracking-normal tabular">
                  <span>📍 {locCount}</span>
                  <span>👥 {userCount}</span>
                  <span>🧠 {memory}</span>
                  <span className="text-veltra-emerald">{t.screensEnabled.length} screens</span>
                </div>
              </div>
              {isActive && <Check className="h-3.5 w-3.5 text-veltra-emerald flex-shrink-0" />}
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <p className="text-micro text-muted-foreground/60 normal-case tracking-normal px-3 py-2 leading-relaxed">
          Switching tier updates the visible screens + location count in real time.
        </p>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
