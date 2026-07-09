"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVeltra } from "@/lib/veltra-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Lock, ArrowRight, X, Sparkles, Shield } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

// Demo access password — in production this would be validated server-side
// For the investor demo, the password is shared verbally with qualified leads
const DEMO_PASSWORD = "veltra2030";

interface PasswordGateProps {
  open: boolean;
  onClose: () => void;
  onGranted: () => void;
  intent?: "demo" | "specialty";
}

export function PasswordGate({ open, onClose, onGranted, intent = "demo" }: PasswordGateProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const grantDemoAccess = useVeltra((s) => s.grantDemoAccess);

  useEffect(() => {
    if (!open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPassword("");
      setError(false);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim().toLowerCase() === DEMO_PASSWORD) {
      grantDemoAccess();
      onGranted();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: EASE }}
          className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.4, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md"
          >
            <motion.div
              animate={shake ? { x: [-8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="veltra-glass rounded-3xl veltra-shadow-lg overflow-hidden"
            >
              {/* Header */}
              <div className="px-8 pt-8 pb-6 text-center relative">
                <button
                  onClick={onClose}
                  className="absolute top-5 right-5 h-8 w-8 rounded-lg hover:bg-foreground/[0.05] flex items-center justify-center veltra-transition"
                  aria-label="Close"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>

                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.4, ease: EASE }}
                  className="mx-auto h-14 w-14 rounded-2xl bg-veltra-emerald/10 flex items-center justify-center mb-5"
                >
                  <Lock className="h-6 w-6 text-veltra-emerald" />
                </motion.div>

                <p className="text-micro text-veltra-emerald mb-2">Private Demo Access</p>
                <h2 className="text-[1.75rem] leading-tight tracking-[-0.02em] font-semibold text-foreground">
                  <span className="text-editorial-italic text-muted-foreground">The demo is</span> gated.
                </h2>
                <p className="text-caption text-muted-foreground mt-3 max-w-xs mx-auto leading-relaxed">
                  Veltra is a product, not a toy. The demo is shared with qualified clinics and investors only.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="px-8 pb-8">
                <div className="space-y-3">
                  <label className="block">
                    <span className="text-micro text-muted-foreground normal-case tracking-normal">Access password</span>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(false); }}
                      autoFocus
                      placeholder="Enter password"
                      className={cn(
                        "mt-1.5 w-full h-10 px-4 rounded-xl bg-background/60 backdrop-blur-sm border veltra-transition outline-none",
                        "text-foreground text-body placeholder:text-muted-foreground/50",
                        "focus:ring-2 focus:ring-veltra-emerald/30 focus:border-veltra-emerald/40",
                        error ? "border-red-500/50" : "border-border/40"
                      )}
                    />
                  </label>

                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-micro text-red-400 normal-case tracking-normal flex items-center gap-1.5"
                    >
                      <X className="h-3 w-3" /> Incorrect password. Please contact us to request access.
                    </motion.p>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-10 bg-veltra-emerald hover:bg-veltra-emerald-dark text-white font-medium"
                  >
                    {intent === "specialty" ? "Choose specialty" : "Enter demo"}
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Button>
                </div>

                {/* Request access link */}
                <div className="mt-6 pt-6 border-t border-border/30 text-center">
                  <p className="text-micro text-muted-foreground/70 normal-case tracking-normal mb-3">
                    Don't have a password?
                  </p>
                  <a
                    href="mailto:hello@veltrahealth.co?subject=Demo Access Request&body=I'd like to request access to the Veltra demo. My clinic is..."
                    className="inline-flex items-center gap-1.5 text-caption text-veltra-emerald hover:underline veltra-transition"
                  >
                    <Sparkles className="h-3 w-3" />
                    Request access
                    <ArrowRight className="h-3 w-3" />
                  </a>
                </div>

                {/* Trust indicators */}
                <div className="mt-6 flex items-center justify-center gap-4 text-micro text-muted-foreground/50 normal-case tracking-normal">
                  <span className="flex items-center gap-1">
                    <Shield className="h-2.5 w-2.5" /> HIPAA
                  </span>
                  <span className="flex items-center gap-1">
                    <Shield className="h-2.5 w-2.5" /> GDPR
                  </span>
                  <span className="flex items-center gap-1">
                    <Shield className="h-2.5 w-2.5" /> NPHIES
                  </span>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
