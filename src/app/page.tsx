"use client";

import { useVeltra, canAccessWithTier, canDo } from "@/lib/veltra-store";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { DemoBanner } from "@/components/veltra/demo-banner";
import { Sidebar } from "@/components/veltra/sidebar";
import { TopBar } from "@/components/veltra/top-bar";
import { BriefScreen } from "@/components/veltra/brief-screen";
import { PatientsScreen } from "@/components/veltra/patients-screen";
import { AppointmentsScreen } from "@/components/veltra/appointments-screen";
import { TimelineScreen } from "@/components/veltra/timeline-screen";
import { AuditScreen } from "@/components/veltra/audit-screen";
import { SettingsScreen } from "@/components/veltra/settings-screen";
import { LabsScreen } from "@/components/veltra/labs-screen";
import { CalendarScreen } from "@/components/veltra/calendar-screen";
import { BillingScreen } from "@/components/veltra/billing-screen";
import { ReportsScreen } from "@/components/veltra/reports-screen";
import { ClaimsScreen, InventoryScreen, MessagesScreen, AvailabilityScreen, RecurringScreen, DocumentsScreen } from "@/components/veltra/production-screens";
import { IntakeScreen } from "@/components/veltra/intake-screen";
import { ImportScreen } from "@/components/veltra/import-screen";
import { MigrationScreen } from "@/components/veltra/migration-screen";
import { SecurityScreen } from "@/components/veltra/security-screen";
import { UserManagementScreen } from "@/components/veltra/user-management-screen";
import { PatientPortal } from "@/components/veltra/patient-portal";
import { SpecialtySelector } from "@/components/veltra/specialty-selector";
import { LoginScreen } from "@/components/veltra/login-screen";
import { LandingPage } from "@/components/veltra/landing-page";
import { LandingPageV3 } from "@/components/veltra/landing-page-v3";
import { CommandPalette } from "@/components/veltra/command-palette";
import { KeyboardShortcuts } from "@/components/veltra/keyboard-shortcuts";
import { UndoWatcher } from "@/components/veltra/undo-watcher";
import { NotificationsPanel } from "@/components/veltra/notifications-panel";
import { WelcomeOverlay } from "@/components/veltra/welcome-overlay";
import { ErrorBoundary } from "@/components/veltra/error-boundary";
import { Toaster } from "@/components/ui/toaster";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";

export default function Home() {
  const activeView = useVeltra((s) => s.activeView);
  const setView = useVeltra((s) => s.setView);
  const currentUser = useVeltra((s) => s.currentUser);
  const logout = useVeltra((s) => s.logout);
  const language = useVeltra((s) => s.language);
  const setLanguage = useVeltra((s) => s.setLanguage);
  const { theme, setTheme } = useTheme();
  const [notifOpen, setNotifOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  // On mount, if currentUser is already set (from persisted store), skip landing
  const [showLanding, setShowLanding] = useState(true);
  const [showSpecialtySelector, setShowSpecialtySelector] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showPatientPortal, setShowPatientPortal] = useState(false);

  // After mount: if user is logged in (from persisted Zustand store),
  // skip landing page and go straight to app
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    // Check if user was logged in before refresh (Zustand persist restores it)
    const state = useVeltra.getState();
    if (state.currentUser) {
      setShowLanding(false);
    }
  }, []);

  // Watch for logout → go to sign in page
  useEffect(() => {
    if (!currentUser && !showLanding && !showLogin && mounted) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowLanding(false);
      setShowLogin(true);
    }
  }, [currentUser, showLanding, showLogin, mounted]);

  // Apply RTL/LTR on language change
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = language;
    }
  }, [language]);

  // Dynamic page title
  useEffect(() => {
    if (currentUser && !loading) {
      const titles: Record<string, string> = {
        brief: "Today's Brief — Veltra",
        patients: "Patients — Veltra",
        appointments: "Appointments — Veltra",
        calendar: "Calendar — Veltra",
        timeline: "Timeline — Veltra",
        labs: "Lab Results — Veltra",
        billing: "Billing — Veltra",
        reports: "Reports — Veltra",
        claims: "Insurance — Veltra",
        messages: "Messages — Veltra",
        documents: "Documents — Veltra",
        inventory: "Inventory — Veltra",
        availability: "Availability — Veltra",
        recurring: "Recurring — Veltra",
        audit: "Audit Log — Veltra",
        settings: "Settings — Veltra",
      };
      document.title = titles[activeView] || "Veltra";
    } else if (showLanding) {
      document.title = "Veltra — The Clinic Operating System";
    }
  }, [activeView, currentUser, loading, showLanding]);

  // Tier guard: if activeView is not enabled in current tier, redirect to brief
  useEffect(() => {
    if (currentUser && !loading) {
      const tier = useVeltra.getState().activeTier;
      const tierScreens = tier?.screensEnabled || [];
      if (!tierScreens.includes(activeView) && activeView !== "brief") {
        useVeltra.getState().setView("brief");
      }
    }
  }, [activeView, currentUser, loading]);

  // Keyboard shortcuts: 1-6 to switch views, N for notifications, ⌘D theme, Esc to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT" || target.isContentEditable) {
        return;
      }

      // ⌘D for theme toggle
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "d") {
        e.preventDefault();
        setTheme(theme === "dark" ? "light" : "dark");
        return;
      }

      if (e.metaKey || e.ctrlKey || e.altKey) return;

      // RBAC: every shortcut checks both role permission AND tier access.
      // Without this, a finance user pressing "2" would land on Patients
      // (a screen they don't have permission to view).
      const role = useVeltra.getState().currentUser?.role;
      const tierScreens = useVeltra.getState().activeTier?.screensEnabled || [];
      const tryNav = (screen: string) => {
        if (canAccessWithTier(role, screen, tierScreens)) {
          setView(screen as any);
        }
      };

      // 1-5 = primary nav (matches sidebar).
      if (e.key === "1") tryNav("brief");
      if (e.key === "2") tryNav("patients");
      if (e.key === "3") tryNav("appointments");
      if (e.key === "4") tryNav("messages");
      if (e.key === "5") tryNav("settings");
      // Secondary screens — reachable via letters or ⌘K command palette
      if (e.key.toLowerCase() === "t") tryNav("timeline");
      if (e.key.toLowerCase() === "c") tryNav("calendar");
      if (e.key.toLowerCase() === "l") tryNav("labs");
      if (e.key.toLowerCase() === "b") tryNav("billing");
      if (e.key.toLowerCase() === "r") tryNav("reports");
      if (e.key.toLowerCase() === "i") tryNav("claims");
      if (e.key.toLowerCase() === "d") tryNav("documents");
      if (e.key.toLowerCase() === "p") tryNav("inventory");
      if (e.key.toLowerCase() === "a") tryNav("availability");
      if (e.key.toLowerCase() === "u") tryNav("recurring");
      if (e.key.toLowerCase() === "g") tryNav("intake");
      if (e.key.toLowerCase() === "z") tryNav("audit");
      if (e.key.toLowerCase() === "f") tryNav("import"); // F = File import
      if (e.key.toLowerCase() === "m" && !e.shiftKey) tryNav("migrate"); // M = Migrate clinic
      if (e.key.toLowerCase() === "n") {
        e.preventDefault();
        setNotifOpen((o) => !o);
      }
      if (e.key === "Escape") setNotifOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setView, setTheme, theme]);

  // Loading state before mount (prevents hydration mismatch) — cinematic
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background veltra-ambient">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="h-10 w-10 rounded-xl overflow-hidden"
        >
          <img src="/logo-symbol.png" alt="Veltra" className="object-cover h-full w-full" />
        </motion.div>
      </div>
    );
  }

  // Loading screen after login — cinematic enterprise animation
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background veltra-ambient">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          {/* Logo with glow */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative mx-auto mb-8"
          >
            <div className="absolute inset-0 bg-veltra-emerald/30 rounded-2xl blur-xl animate-pulse" />
            <img src="/logo-symbol.png" alt="Veltra" className="object-cover relative h-14 w-14 rounded-2xl" />
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-editorial-italic text-body text-muted-foreground mb-8"
          >
            Preparing today's brief...
          </motion.p>

          {/* Loading items — staggered checkmarks */}
          <div className="space-y-2.5 max-w-xs mx-auto">
            {["Patients", "Appointments", "Memory", "Messages"].map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.12, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-2.5 text-caption text-muted-foreground"
              >
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6 + i * 0.12, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="h-4 w-4 rounded-full bg-veltra-emerald/15 flex items-center justify-center flex-shrink-0"
                >
                  <Check className="h-2.5 w-2.5 text-veltra-emerald" />
                </motion.span>
                {item}
              </motion.div>
            ))}
          </div>

          {/* Subtle progress bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="mt-10 mx-auto w-32 h-0.5 bg-foreground/[0.06] rounded-full overflow-hidden"
          >
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], repeat: Infinity }}
              className="h-full w-full bg-veltra-emerald rounded-full"
            />
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Patient Portal overlay — separate from staff app
  if (showPatientPortal) {
    return (
      <ErrorBoundary>
        <PatientPortal onClose={() => setShowPatientPortal(false)} />
        <Toaster />
      </ErrorBoundary>
    );
  }

  // Landing page → entry point
  if (showLanding && !currentUser && !showSpecialtySelector && !showLogin) {
    return (
      <ErrorBoundary>
        <LandingPageV3 onEnter={(userId) => {
          // Direct entry — no password gate. Book a Demo / See it live / Specialty cards
          // all enter the interactive demo immediately.
          if (userId) {
            useVeltra.getState().loginAs(userId);
          } else {
            useVeltra.getState().loginAs("u1");
          }
          setShowLanding(false);
          setLoading(true);
          setTimeout(() => setLoading(false), 1500);
        }} onSignIn={() => {
          // Sign In goes DIRECTLY to login screen — for clinic staff with real accounts
          setShowLogin(true);
        }} onSpecialtySelect={() => {
          // Specialty selector entry — no gate
          setShowSpecialtySelector(true);
        }} onPatientPortal={() => {
          // Patient Portal — separate from staff app
          setShowPatientPortal(true);
        }} />
        <Toaster />
      </ErrorBoundary>
    );
  }

  // Specialty selector
  if (showSpecialtySelector && !currentUser) {
    return (
      <ErrorBoundary>
        <SpecialtySelector
          onSelect={(specialty) => {
            useVeltra.getState().setSpecialty(specialty.id);
            useVeltra.getState().loginAs("u1"); // Auto-login as Dr. Sarah
            setShowSpecialtySelector(false);
            setShowLanding(false);
            setLoading(true);
            setTimeout(() => setLoading(false), 1500);
          }}
          onBack={() => setShowSpecialtySelector(false)}
        />
        <Toaster />
      </ErrorBoundary>
    );
  }

  // Login screen (direct access from "Sign In" button)
  if (showLogin && !currentUser) {
    return (
      <ErrorBoundary>
        <LoginScreen />
        <Toaster />
      </ErrorBoundary>
    );
  }

  // If not logged in → show login screen
  if (!currentUser) {
    return (
      <ErrorBoundary>
        <LoginScreen />
        <Toaster />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <DemoBanner />

        <div className="flex flex-1 min-h-0">
          <Sidebar onNotificationsOpen={() => setNotifOpen(true)} />

          <main className="flex-1 min-w-0 overflow-x-hidden flex flex-col">
            <TopBar onNotificationsOpen={() => setNotifOpen(true)} />
            <div className="flex-1 min-h-0">
              <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 16, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.99 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                {activeView === "brief" && <BriefScreen />}
                {activeView === "patients" && <PatientsScreen />}
                {activeView === "appointments" && <AppointmentsScreen />}
                {activeView === "calendar" && <CalendarScreen />}
                {activeView === "timeline" && <TimelineScreen />}
                {activeView === "labs" && <LabsScreen />}
                {activeView === "billing" && <BillingScreen />}
                {activeView === "reports" && <ReportsScreen />}
                {activeView === "claims" && <ClaimsScreen />}
                {activeView === "messages" && <MessagesScreen />}
                {activeView === "documents" && <DocumentsScreen />}
                {activeView === "inventory" && <InventoryScreen />}
                {activeView === "availability" && <AvailabilityScreen />}
                {activeView === "recurring" && <RecurringScreen />}
                {activeView === "intake" && <IntakeScreen />}
                {activeView === "import" && <ImportScreen />}
                {activeView === "migrate" && <MigrationScreen />}
                {activeView === "security" && <SecurityScreen />}
                {activeView === "users" && <UserManagementScreen />}
                {activeView === "audit" && <AuditScreen />}
                {activeView === "settings" && <SettingsScreen />}
              </motion.div>
            </AnimatePresence>
            </div>
          </main>
        </div>

        {/* Overlays & Systems */}
        <CommandPalette />
        <KeyboardShortcuts />
        <UndoWatcher />
        <WelcomeOverlay />
        <NotificationsPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
        <Toaster />
      </div>
    </ErrorBoundary>
  );
}
