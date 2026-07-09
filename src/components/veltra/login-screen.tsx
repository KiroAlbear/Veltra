"use client";

import { useState } from "react";
import { useVeltra } from "@/lib/veltra-store";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, ArrowRight, Stethoscope, User, Eye, EyeOff, AlertCircle, Loader2, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function LoginScreen() {
  const users = useVeltra((s) => s.users);
  const login = useVeltra((s) => s.login);
  const loginAs = useVeltra((s) => s.loginAs);
  const twoFactorEnabled = useVeltra((s) => s.twoFactorEnabled);
  const verifyTwoFactor = useVeltra((s) => s.verifyTwoFactor);
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [twoFactorPending, setTwoFactorPending] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    // §4.3 — spinner with timeout fallback (8s)
    const timeout = setTimeout(() => {
      setLoading(false);
      setError("Request timed out. Please try again.");
    }, 8000);
    await new Promise((r) => setTimeout(r, 500));
    clearTimeout(timeout);

    // Magic keyword: type "demo" as email → quick demo login as Dr. Sarah
    if (email.trim().toLowerCase() === "demo") {
      loginAs("u1");
      setLoading(false);
      toast({ title: "Welcome to the demo", description: "Signed in as Dr. Sarah — Senior Physician" });
      return;
    }

    const ok = login(email, password);
    setLoading(false);
    if (!ok) {
      setError("Invalid email or password. Try the demo accounts below.");
      toast({
        title: "Login failed",
        description: "Use a demo account or check your credentials.",
        variant: "destructive",
      });
    } else {
      // If 2FA is enabled, show code input
      if (twoFactorEnabled) {
        setTwoFactorPending(true);
        toast({ title: "2FA code sent", description: "Enter any 6-digit code to continue." });
      } else {
        toast({ title: "Welcome back", description: "You're in." });
      }
    }
  };

  const handle2FA = (e: React.FormEvent) => {
    e.preventDefault();
    if (twoFactorCode.length === 6) {
      verifyTwoFactor(twoFactorCode);
      setTwoFactorPending(false);
      setTwoFactorCode("");
      toast({ title: "Welcome back", description: "2FA verified. You're in." });
    } else {
      setError("Enter a 6-digit code.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 veltra-ambient">
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-veltra-emerald/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-veltra-emerald/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        className="relative w-full max-w-md"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Logo + headline */}
        <div className="text-center mb-8">
          <a href="/" className="inline-block veltra-transition hover:opacity-80" aria-label="Veltra home">
            <img src="/logo-symbol.png" alt="Veltra" className="object-cover h-12 w-12 rounded-xl mb-4 veltra-shadow-emerald" />
          </a>
          <h1 className="text-[2rem] leading-[1.05] tracking-[-0.03em] text-foreground font-semibold">
            <span className="text-editorial-italic text-muted-foreground">Welcome</span> back.
          </h1>
          <p className="text-caption text-muted-foreground mt-3">
            The Clinic Operating System.
          </p>
        </div>

        {/* Login card */}
        <div className="veltra-glass rounded-2xl p-6 veltra-shadow-lg">
          {/* Real client notice */}
          <div className="mb-5 p-3 rounded-lg bg-veltra-emerald/5 border border-veltra-emerald/15">
            <p className="text-micro text-veltra-emerald normal-case tracking-normal flex items-center gap-1.5 mb-1">
              <Shield className="h-3 w-3" /> For clinic staff
            </p>
            <p className="text-caption text-muted-foreground leading-relaxed">
              Sign in with your clinic email + password. Your data is private to your clinic.
            </p>
          </div>

          <form onSubmit={handleSubmit} className={cn("space-y-4", twoFactorPending && "hidden")} aria-label="Sign in to Veltra">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-micro text-muted-foreground">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@clinic.com  ·  or type 'demo'"
                  className="pl-10 h-11 bg-background/50"
                  autoComplete="email"
                  aria-describedby={error ? "login-error" : undefined}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-micro text-muted-foreground">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-11 bg-background/50"
                  autoComplete="current-password"
                  aria-describedby={error ? "login-error" : undefined}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground veltra-transition"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                id="login-error"
                role="alert"
                aria-live="assertive"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="flex items-center gap-2 px-3 py-2 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 dark:text-red-300 text-caption"
              >
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            <Button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full h-10 bg-veltra-emerald hover:bg-veltra-emerald-dark text-white font-medium"
            >
              {loading ? (
                "Signing in..."
              ) : (
                <>
                  Sign in
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </>
              )}
            </Button>
            <div className="flex items-center justify-between mt-1">
              <span className="text-micro text-muted-foreground/40 normal-case tracking-normal">All demo accounts use the same password</span>
              <button type="button" onClick={() => toast({ title: "Password reset", description: "Check your email for reset instructions." })} className="text-micro text-veltra-emerald hover:underline normal-case tracking-normal">
                Forgot password?
              </button>
            </div>
          </form>

          {/* 2FA step */}
          {twoFactorPending && (
            <motion.form
              onSubmit={handle2FA}
              className="space-y-4 mt-4 p-4 rounded-lg bg-veltra-emerald/5 border border-veltra-emerald/15"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-2 text-veltra-emerald">
                <Shield className="h-4 w-4" />
                <span className="text-caption font-medium">Two-factor authentication</span>
              </div>
              <p className="text-caption text-muted-foreground">Enter the 6-digit code sent to your device. (Demo: any 6 digits)</p>
              <Input
                type="text"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000" aria-label="6-digit two-factor authentication code"
                className="h-12 text-center text-2xl tracking-[0.5em] font-semibold bg-background/50"
                maxLength={6}
                autoFocus
              />
              <Button type="submit" disabled={twoFactorCode.length !== 6} className="w-full h-10 bg-veltra-emerald hover:bg-veltra-emerald-dark text-white">
                Verify
              </Button>
            </motion.form>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border/40" />
            <span className="text-micro text-muted-foreground/60 normal-case tracking-normal">demo accounts — for privacy</span>
            <div className="flex-1 h-px bg-border/40" />
          </div>

          {/* Privacy notice for demo accounts */}
          <p className="text-micro text-muted-foreground/70 normal-case tracking-normal text-center mb-3 leading-relaxed">
            These accounts show how Veltra works for each role. Real clients sign in with their own email above.
          </p>

          {/* Demo users */}
          <div className="space-y-1.5">
            {users.map((u) => (
              <button
                key={u.id}
                onClick={() => {
                  loginAs(u.id);
                  toast({ title: `Signed in as ${u.name}`, description: u.title });
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg veltra-glass hover:bg-foreground/[0.05] veltra-transition group"
              >
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-caption font-semibold flex-shrink-0 ${u.avatarColor}`}>
                  {u.initials}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-caption font-medium text-foreground truncate">{u.name}</p>
                  <p className="text-micro text-muted-foreground normal-case tracking-normal truncate">{u.title}</p>
                </div>
                <span className="text-micro text-veltra-emerald uppercase tracking-wider">
                  {u.role}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-editorial-italic text-muted-foreground/50 text-sm">
          Technology disappears. Care remains.
        </p>
      </motion.div>
    </div>
  );
}
