"use client";

/**
 * Veltra Command Palette — ⌘K
 *
 * The single escape hatch. The sidebar shows 5 primary items, but every
 * secondary screen is reachable from here. Power users never feel limited;
 * new users never feel overwhelmed.
 *
 * Layers:
 *   1. Primary nav (5 items) — always visible
 *   2. Secondary screens — labs, billing, reports, inventory, audit, calendar, etc.
 *   3. Patients — quick jump to a patient's timeline
 *   4. Demo controls
 */
import { useEffect, useState, useMemo } from "react";
import { useVeltra, canAccessWithTier, canDo } from "@/lib/veltra-store";
import { globalSearch, SEARCH_TYPE_META, type SearchResult } from "@/lib/global-search";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Briefcase,
  Users,
  CalendarClock,
  MessageCircle,
  Settings as SettingsIcon,
  Activity,
  FlaskConical,
  DollarSign,
  BarChart3,
  Shield,
  FileText,
  Package,
  Clock,
  RefreshCw,
  Calendar as CalendarIcon,
  Search,
  RotateCcw,
  UserPlus,
  Stethoscope,
  Phone,
  Pill,
  Printer,
  FileUp,
  Bell,
  ChevronRight,
  Database,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ScreenEntry = {
  id: string;
  label: string;
  hint: string;
  icon: React.ElementType;
  group: "Navigate" | "Patients" | "Schedule" | "Operations" | "More";
};

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const setView = useVeltra((s) => s.setView);
  const selectPatient = useVeltra((s) => s.selectPatient);
  const patients = useVeltra((s) => s.patients);
  const appointments = useVeltra((s) => s.appointments);
  const labResults = useVeltra((s) => s.labResults);
  const prescriptions = useVeltra((s) => s.prescriptions);
  const documents = useVeltra((s) => s.documents);
  const medications = useVeltra((s) => s.medications);
  const insuranceClaims = useVeltra((s) => s.insuranceClaims);
  const auditLog = useVeltra((s) => s.auditLog);
  const resetDemo = useVeltra((s) => s.resetDemo);
  const currentUser = useVeltra((s) => s.currentUser);
  const activeTier = useVeltra((s) => s.activeTier);
  const { toast } = useToast();

  const tierScreens = activeTier?.screensEnabled || [];

  // Global search across all entities — memoized per query
  const searchResults = useMemo(() => {
    if (!search.trim()) return null;
    return globalSearch(search, {
      patients, appointments, labResults, prescriptions,
      documents, medications, insuranceClaims, auditLog,
    });
  }, [search, patients, appointments, labResults, prescriptions, documents, medications, insuranceClaims, auditLog]);

  const handleResultClick = (r: SearchResult) => {
    if (r.actionPayload) selectPatient(r.actionPayload);
    setView(r.actionTarget as any);
    setOpen(false);
    toast({ title: r.title, description: r.subtitle });
  };

  // All screens reachable from ⌘K. Filtered by role+tier access.
  const ALL_SCREENS: ScreenEntry[] = [
    // Primary (always shown first)
    { id: "brief",        label: "Today's Brief",  hint: "Your morning intelligence", icon: Briefcase,    group: "Navigate" },
    { id: "patients",     label: "Patients",       hint: "All patients",              icon: Users,         group: "Navigate" },
    { id: "appointments", label: "Schedule",       hint: "Today's appointments",      icon: CalendarClock, group: "Navigate" },
    { id: "messages",     label: "Messages",       hint: "Patient chats",             icon: MessageCircle, group: "Navigate" },
    { id: "settings",     label: "Settings",       hint: "Account & preferences",     icon: SettingsIcon,  group: "Navigate" },

    // Patient-related secondary
    { id: "timeline",  label: "Patient Timeline", hint: "Open last patient's chart", icon: Activity,    group: "Patients" },
    { id: "labs",      label: "Lab Results",      hint: "All lab results",           icon: FlaskConical, group: "Patients" },
    { id: "documents", label: "Documents",        hint: "Patient documents",         icon: FileText,     group: "Patients" },
    { id: "intake",    label: "New Patient Intake", hint: "Register a new patient",  icon: UserPlus,     group: "Patients" },
    { id: "import",    label: "Smart Import",     hint: "Upload file — AI extracts data", icon: FileUp,  group: "Patients" },
    { id: "migrate",   label: "VELTRA Switch",    hint: "Migrate your whole clinic from any system", icon: Database, group: "Patients" },
    { id: "security",  label: "Security Center",  hint: "Security score, sessions, devices, API keys", icon: Shield, group: "More" },
    { id: "users",     label: "User Management",  hint: "Invite, suspend, deactivate, MFA", icon: Users, group: "More" },

    // Schedule-related secondary
    { id: "calendar",      label: "Month Calendar",     hint: "Month view of schedule", icon: CalendarIcon, group: "Schedule" },
    { id: "recurring",     label: "Recurring Visits",   hint: "Recurring appointments", icon: RefreshCw,    group: "Schedule" },
    { id: "availability",  label: "Doctor Availability", hint: "Working hours",        icon: Clock,        group: "Schedule" },

    // Operations
    { id: "billing",   label: "Billing",    hint: "Payments & balances",   icon: DollarSign, group: "Operations" },
    { id: "claims",    label: "Insurance",  hint: "Insurance claims",      icon: Shield,     group: "Operations" },
    { id: "inventory", label: "Inventory",  hint: "Pharmacy stock",        icon: Package,    group: "Operations" },
    { id: "reports",   label: "Reports",    hint: "Insights & trends",     icon: BarChart3,  group: "Operations" },

    // Admin
    { id: "audit", label: "Audit Log", hint: "Action history (admin)", icon: Shield, group: "More" },
  ];

  const visibleScreens = ALL_SCREENS.filter((s) =>
    canAccessWithTier(currentUser?.role, s.id, tierScreens)
  );

  // Group screens by their group field, preserving order
  const groups: { name: ScreenEntry["group"]; items: ScreenEntry[] }[] = [];
  for (const screen of visibleScreens) {
    let g = groups.find((x) => x.name === screen.group);
    if (!g) {
      g = { name: screen.group, items: [] };
      groups.push(g);
    }
    g.items.push(screen);
  }

  // Group display order
  const GROUP_ORDER: ScreenEntry["group"][] = ["Navigate", "Patients", "Schedule", "Operations", "More"];
  groups.sort((a, b) => GROUP_ORDER.indexOf(a.name) - GROUP_ORDER.indexOf(b.name));

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => {
          if (!o) setSearch(""); // clear search when opening
          return !o;
        });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const go = (id: string) => {
    setView(id as any);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 overflow-hidden border-0 veltra-shadow-lg veltra-glass-strong max-w-xl" showCloseButton={false}>
        <DialogTitle className="sr-only">Command Palette</DialogTitle>
        <DialogDescription className="sr-only">Search or jump to any action, patient, or screen.</DialogDescription>
        <Command className="bg-transparent" shouldFilter={false}>
          <CommandInput
            placeholder="Search patients, labs, prescriptions, files… or jump to a screen"
            className="h-12"
            value={search}
            onValueChange={setSearch}
          />
          <CommandList className="max-h-[60vh] veltra-scrollbar">
            <CommandEmpty className="py-6 text-center text-caption text-muted-foreground">
              <span className="text-editorial-italic">Nothing found.</span>
            </CommandEmpty>

            {/* ===== GLOBAL SEARCH RESULTS — shown when query matches data ===== */}
            {searchResults && searchResults.total > 0 && (
              <>
                <CommandGroup heading={`Search Results — ${searchResults.total} found`} className="text-micro text-muted-foreground">
                  {searchResults.top.map((r) => {
                    const meta = SEARCH_TYPE_META[r.type];
                    return (
                      <CommandItem
                        key={r.id}
                        onSelect={() => handleResultClick(r)}
                        className="py-2.5 cursor-pointer"
                      >
                        <span className="mr-3 text-base flex-shrink-0">{meta.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-body text-foreground truncate">{r.title}</p>
                          <p className="text-micro text-muted-foreground/70 normal-case tracking-normal truncate">
                            {meta.label} · {r.subtitle}
                          </p>
                        </div>
                        <span className="ml-auto text-micro text-veltra-emerald normal-case tracking-normal flex items-center gap-0.5">
                          {r.actionLabel}
                          <ChevronRight className="h-2.5 w-2.5" />
                        </span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
                <CommandSeparator />
              </>
            )}

            {groups.map((group, gi) => (
              <div key={group.name}>
                {gi > 0 && <CommandSeparator />}
                <CommandGroup heading={group.name} className="text-micro text-muted-foreground">
                  {group.items.map((screen) => {
                    const isPrimary = ["brief", "patients", "appointments", "messages", "settings"].includes(screen.id);
                    return (
                      <CommandItem
                        key={screen.id}
                        onSelect={() => go(screen.id)}
                        className="py-2.5 cursor-pointer"
                      >
                        <screen.icon className={`mr-3 h-4 w-4 ${isPrimary ? "text-veltra-emerald" : "text-muted-foreground"}`} />
                        <span className="text-body">{screen.label}</span>
                        <span className="ml-2 text-micro text-muted-foreground/70 normal-case tracking-normal hidden sm:inline">
                          {screen.hint}
                        </span>
                        {isPrimary && (
                          <kbd className="ml-auto text-micro text-muted-foreground normal-case tracking-normal">
                            {screen.id === "brief" ? "1" : screen.id === "patients" ? "2" : screen.id === "appointments" ? "3" : screen.id === "messages" ? "4" : "5"}
                          </kbd>
                        )}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </div>
            ))}

            {/* Quick patient jump */}
            {patients.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Jump to Patient" className="text-micro text-muted-foreground">
                  {patients.slice(0, 6).map((p) => (
                    <CommandItem
                      key={p.id}
                      onSelect={() => { selectPatient(p.id); setOpen(false); }}
                      className="py-2.5 cursor-pointer"
                    >
                      <Search className="mr-3 h-4 w-4 text-muted-foreground" />
                      <span className="text-body">{p.name}</span>
                      <span className="ml-auto text-caption text-muted-foreground">
                        {p.conditions[0] || "No conditions"}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}

            {/* ===== ACTIONS (not just navigation) ===== */}
            <CommandSeparator />
            <CommandGroup heading="Actions — execute, don't just navigate" className="text-micro text-muted-foreground">
              <CommandItem
                onSelect={() => { setView("intake"); setOpen(false); toast({ title: "New patient intake", description: "Form opened" }); }}
                className="py-2.5 cursor-pointer"
              >
                <UserPlus className="mr-3 h-4 w-4 text-veltra-emerald" />
                <span className="text-body">New patient</span>
                <span className="ml-2 text-micro text-muted-foreground/70 normal-case tracking-normal hidden sm:inline">register a new patient</span>
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  const firstPatient = patients[0];
                  if (firstPatient) {
                    selectPatient(firstPatient.id);
                    setView("timeline");
                    toast({ title: "Starting visit", description: `Opened chart for ${firstPatient.name}` });
                  } else {
                    toast({ title: "No patients yet", description: "Register a patient first" });
                  }
                  setOpen(false);
                }}
                className="py-2.5 cursor-pointer"
              >
                <Stethoscope className="mr-3 h-4 w-4 text-veltra-emerald" />
                <span className="text-body">Start visit</span>
                <span className="ml-2 text-micro text-muted-foreground/70 normal-case tracking-normal hidden sm:inline">open first patient's chart</span>
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  const target = patients.find((p) => p.name.toLowerCase().includes("ahmed")) || patients[0];
                  if (target) {
                    selectPatient(target.id);
                    setView("messages");
                    toast({ title: `Calling ${target.name}`, description: target.phone });
                    window.location.href = `tel:${target.phone.replace(/\s+/g, "")}`;
                  }
                  setOpen(false);
                }}
                className="py-2.5 cursor-pointer"
              >
                <Phone className="mr-3 h-4 w-4 text-blue-400" />
                <span className="text-body">Call patient</span>
                <span className="ml-2 text-micro text-muted-foreground/70 normal-case tracking-normal hidden sm:inline">dial first patient</span>
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  setView("timeline");
                  setOpen(false);
                  setTimeout(() => toast({ title: "Prescription pad", description: "Open a patient first, then write Rx" }), 200);
                }}
                className="py-2.5 cursor-pointer"
              >
                <Pill className="mr-3 h-4 w-4 text-rose-400" />
                <span className="text-body">Write prescription</span>
                <span className="ml-2 text-micro text-muted-foreground/70 normal-case tracking-normal hidden sm:inline">open chart to prescribe</span>
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  setView("labs");
                  setOpen(false);
                  toast({ title: "Lab ordering", description: "Open a patient to order labs" });
                }}
                className="py-2.5 cursor-pointer"
              >
                <FlaskConical className="mr-3 h-4 w-4 text-cyan-400" />
                <span className="text-body">Order lab</span>
                <span className="ml-2 text-micro text-muted-foreground/70 normal-case tracking-normal hidden sm:inline">request lab tests</span>
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  setView("inventory");
                  setOpen(false);
                  toast({ title: "Pharmacy", description: "Inventory opened" });
                }}
                className="py-2.5 cursor-pointer"
              >
                <Package className="mr-3 h-4 w-4 text-pink-400" />
                <span className="text-body">Pharmacy / Inventory</span>
                <span className="ml-2 text-micro text-muted-foreground/70 normal-case tracking-normal hidden sm:inline">manage stock</span>
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  setView("billing");
                  setOpen(false);
                  toast({ title: "New invoice", description: "Billing screen opened" });
                }}
                className="py-2.5 cursor-pointer"
              >
                <DollarSign className="mr-3 h-4 w-4 text-amber-400" />
                <span className="text-body">New invoice</span>
                <span className="ml-2 text-micro text-muted-foreground/70 normal-case tracking-normal hidden sm:inline">bill a patient</span>
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  setView("timeline");
                  setOpen(false);
                  setTimeout(() => window.print(), 400);
                }}
                className="py-2.5 cursor-pointer"
              >
                <Printer className="mr-3 h-4 w-4 text-muted-foreground" />
                <span className="text-body">Print chart</span>
                <span className="ml-2 text-micro text-muted-foreground/70 normal-case tracking-normal hidden sm:inline">print first patient summary</span>
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  setView("import" as any);
                  setOpen(false);
                  toast({ title: "Smart Import Center", description: "Drop a file — Veltra will read it" });
                }}
                className="py-2.5 cursor-pointer"
              >
                <FileUp className="mr-3 h-4 w-4 text-violet-400" />
                <span className="text-body">Import patient file</span>
                <span className="ml-2 text-micro text-muted-foreground/70 normal-case tracking-normal hidden sm:inline">upload PDF/image for AI extraction</span>
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  setView("migrate" as any);
                  setOpen(false);
                  toast({ title: "VELTRA Switch", description: "Migrate your clinic in an hour" });
                }}
                className="py-2.5 cursor-pointer"
              >
                <Database className="mr-3 h-4 w-4 text-emerald-400" />
                <span className="text-body">Migrate clinic from another system</span>
                <span className="ml-2 text-micro text-muted-foreground/70 normal-case tracking-normal hidden sm:inline">Excel/CSV/PDF — full clinic migration</span>
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  setOpen(false);
                  window.dispatchEvent(new KeyboardEvent("keydown", { key: "n" }));
                }}
                className="py-2.5 cursor-pointer"
              >
                <Bell className="mr-3 h-4 w-4 text-veltra-emerald" />
                <span className="text-body">Open notifications</span>
                <kbd className="ml-auto text-micro text-muted-foreground normal-case tracking-normal">N</kbd>
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />

            {canDo(currentUser?.role, "canResetDemo") && (
              <CommandGroup heading="Demo Controls" className="text-micro text-muted-foreground">
                <CommandItem
                  onSelect={() => {
                    resetDemo();
                    toast({ title: "Demo reset", description: "All data restored." });
                    setOpen(false);
                  }}
                  className="py-2.5 cursor-pointer text-red-400"
                >
                  <RotateCcw className="mr-3 h-4 w-4" />
                  <span className="text-body">Reset demo data</span>
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
