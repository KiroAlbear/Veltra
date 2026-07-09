"use client";

import { useVeltra } from "@/lib/veltra-store";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WelcomeOverlay() {
  const hasSeenWelcome = useVeltra((s) => s.hasSeenWelcome);
  const dismissWelcome = useVeltra((s) => s.dismissWelcome);
  const setView = useVeltra((s) => s.setView);

  return (
    <AnimatePresence>
      {!hasSeenWelcome && (
        <motion.div
          className="fixed inset-0 z-[70] bg-background/80 backdrop-blur-xl flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-card/90 backdrop-blur-2xl rounded-2xl veltra-shadow-lg max-w-md w-full p-8 border border-border/40 relative overflow-hidden"
            initial={{ scale: 0.96, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 12 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Ambient glow */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-veltra-emerald/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-veltra-emerald/8 rounded-full blur-3xl pointer-events-none" />

            <div className="relative">
              <button
                onClick={dismissWelcome}
                aria-label="Close welcome"
                className="absolute -top-2 -right-2 h-8 w-8 rounded-md hover:bg-foreground/[0.05] flex items-center justify-center text-muted-foreground hover:text-foreground veltra-transition"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-1.5 mb-4">
                <Sparkles className="h-3.5 w-3.5 text-veltra-emerald" />
                <span className="text-micro text-veltra-emerald">Welcome</span>
              </div>

              <h2 className="text-[2rem] leading-[1.1] tracking-[-0.03em] text-foreground font-semibold">
                <span className="text-editorial-italic text-muted-foreground">This is</span>
                <br />
                Veltra.
              </h2>

              <p className="text-body text-muted-foreground mt-4 leading-relaxed">
                A demo clinic, running on real patterns. Six patients. Six appointments. One morning brief.
                Click anything. Break anything. Reset anytime.
              </p>

              <div className="mt-6 space-y-2">
                <Tip kbd="⌘K" label="Open command palette" />
                <Tip kbd="⌘/" label="See all shortcuts" />
                <Tip kbd="1-4" label="Switch screens" />
              </div>

              <div className="mt-8 flex items-center gap-3">
                <Button
                  onClick={() => {
                    dismissWelcome();
                    setView("brief");
                  }}
                  className="flex-1 h-10 bg-veltra-emerald hover:bg-veltra-emerald-dark text-white"
                >
                  Start exploring
                </Button>
              </div>

              <p className="text-center mt-4 text-editorial-italic text-muted-foreground/60 text-sm">
                Technology disappears. Care remains.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Tip({ kbd, label }: { kbd: string; label: string }) {
  return (
    <div className="flex items-center gap-3 py-1.5 px-2 rounded-md hover:bg-foreground/[0.03] veltra-transition">
      <kbd className="min-w-[40px] h-6 px-2 rounded-md bg-foreground/[0.06] border border-border/40 text-caption font-medium text-muted-foreground flex items-center justify-center">
        {kbd}
      </kbd>
      <span className="text-caption text-foreground">{label}</span>
    </div>
  );
}
