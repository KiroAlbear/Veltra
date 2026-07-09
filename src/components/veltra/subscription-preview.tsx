"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Check, Minus, ArrowRight, Sparkles, Building2, Users, Brain, HardDrive, Headphones, Clock } from "lucide-react";
import { TIERS, TIER_COMPARISON, type TierConfig, type TierId } from "@/lib/subscription-tiers";

const EASE = [0.16, 1, 0.3, 1] as const;

interface SubscriptionPreviewProps {
  open: boolean;
  onClose: () => void;
  initialTier?: TierId;
  onTryTier: (tier: TierConfig) => void;
}

export function SubscriptionPreview({ open, onClose, initialTier = "platform", onTryTier }: SubscriptionPreviewProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: EASE }}
          className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md overflow-y-auto"
          onClick={onClose}
        >
          <div className="min-h-screen flex items-start sm:items-center justify-center p-4 sm:p-8">
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.4, ease: EASE }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl veltra-glass rounded-3xl veltra-shadow-lg overflow-hidden my-auto"
            >
              {/* Header */}
              <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/40 px-6 sm:px-10 py-5 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-veltra-emerald" />
                    <span className="text-micro text-veltra-emerald">Plan Preview</span>
                  </div>
                  <h2 className="text-[1.75rem] sm:text-[2rem] leading-tight tracking-[-0.03em] font-semibold text-foreground">
                    <span className="text-editorial-italic text-muted-foreground">See the size</span> before you subscribe.
                  </h2>
                  <p className="text-caption text-muted-foreground mt-1.5 max-w-md">
                    Two plans, one product. Tap any plan to preview the demo — flip between them without commitment.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="flex-shrink-0 h-9 w-9 rounded-lg hover:bg-foreground/[0.05] flex items-center justify-center veltra-transition"
                  aria-label="Close preview"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 sm:px-10 py-8 max-h-[75vh] overflow-y-auto veltra-scrollbar">
                {/* Tier cards row — 2 tiers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 max-w-3xl mx-auto">
                  {TIERS.map((tier) => (
                    <TierCard key={tier.id} tier={tier} onTry={() => onTryTier(tier)} />
                  ))}
                </div>

                {/* Tailored implementation note (replaces Founding Partner strip — sales-only now) */}
                <div className="mb-10 p-4 rounded-2xl veltra-glass border border-border/30 text-center">
                  <p className="text-micro text-muted-foreground/80 normal-case tracking-normal">
                    Every implementation is tailored to your clinic's workflow and operational needs.
                  </p>
                </div>

                {/* Comparison table — Platform vs Enterprise */}
                <div className="mb-4">
                  <p className="text-micro text-veltra-emerald mb-4">Full comparison</p>
                  <div className="veltra-glass rounded-2xl overflow-hidden">
                    {/* Header row */}
                    <div className="grid grid-cols-3 gap-2 px-4 sm:px-6 py-3 border-b border-border/40 bg-foreground/[0.02]">
                      <p className="text-micro text-muted-foreground normal-case tracking-normal">Capability</p>
                      <p className="text-micro font-semibold text-veltra-emerald text-center">Platform</p>
                      <p className="text-micro font-semibold text-violet-300 text-center">Enterprise</p>
                    </div>
                    {/* Body rows */}
                    {TIER_COMPARISON.map((row, i) => (
                      <div
                        key={row.label}
                        className={cn(
                          "grid grid-cols-3 gap-2 px-4 sm:px-6 py-2.5 text-caption items-center",
                          i !== TIER_COMPARISON.length - 1 && "border-b border-border/20",
                          i % 2 === 1 && "bg-foreground/[0.015]"
                        )}
                      >
                        <p className="text-muted-foreground">{row.label}</p>
                        <CompareCell value={row.platform} tier="platform" />
                        <CompareCell value={row.enterprise} tier="enterprise" />
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-center text-micro text-muted-foreground/60 normal-case tracking-normal mt-6">
                  14-day free trial · Veltra Launch Program from $3,000 · Cancel anytime
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TierCard({ tier, onTry }: { tier: TierConfig; onTry: () => void }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.3, ease: EASE }}
      className={cn(
        "relative rounded-2xl p-6 flex flex-col",
        "veltra-glass veltra-shadow",
        tier.featured && "ring-1 ring-veltra-emerald/40"
      )}
    >
      {tier.badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-veltra-emerald text-white text-micro normal-case tracking-normal font-medium">
          {tier.badge}
        </span>
      )}

      <div className="flex items-center gap-2.5 mb-2">
        <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center text-lg", tier.accentColor)}>
          {tier.emoji}
        </div>
        <div>
          <p className="text-body font-semibold text-foreground">{tier.name}</p>
          <p className="text-micro text-muted-foreground normal-case tracking-normal">{tier.tagline}</p>
        </div>
      </div>

      <p className="text-caption text-muted-foreground leading-relaxed mb-4 min-h-[3rem]">{tier.description}</p>

      {/* Price */}
      <div className="mb-4 pb-4 border-b border-border/30">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[2rem] font-semibold tabular text-foreground tracking-[-0.02em]">{tier.priceLabel}</span>
          {tier.period && <span className="text-caption text-muted-foreground">{tier.period}</span>}
        </div>
        {tier.priceMonthly && (
          <p className="text-micro text-veltra-emerald normal-case tracking-normal mt-1">
            $9,990/year billed annually — save 17%
          </p>
        )}
        {tier.launchPrice !== null && (
          <p className="text-micro text-muted-foreground/70 normal-case tracking-normal mt-1">
            + {tier.launchLabel}
          </p>
        )}
      </div>

      {/* Limits grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <LimitChip icon={Building2} label="Locations" value={String(tier.limits.locations)} />
        <LimitChip icon={Users} label="Team seats" value={String(tier.limits.users)} />
        <LimitChip icon={Brain} label="Memory" value={tier.limits.memoryRetentionDays === "unlimited" ? "Unlimited" : `${tier.limits.memoryRetentionDays} days`} />
        <LimitChip icon={HardDrive} label="Storage" value={tier.limits.storage} />
      </div>

      {/* Top features */}
      <div className="space-y-1.5 mb-5 flex-1">
        {tier.included.slice(0, 6).map((f) => (
          <div key={f} className="flex items-start gap-2">
            <Check className="h-3 w-3 text-veltra-emerald flex-shrink-0 mt-0.5" />
            <span className="text-caption text-foreground">{f}</span>
          </div>
        ))}
        {tier.included.length > 6 && (
          <p className="text-micro text-muted-foreground/70 normal-case tracking-normal pl-5">+ {tier.included.length - 6} more</p>
        )}
      </div>

      {/* Support tier */}
      <div className="mb-5 p-3 rounded-lg bg-foreground/[0.03]">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Headphones className="h-3 w-3 text-muted-foreground" />
          <p className="text-micro text-muted-foreground normal-case tracking-normal">Support</p>
        </div>
        <div className="flex flex-wrap gap-1">
          {tier.support.channels.map((c) => (
            <Badge key={c} variant="secondary" className="text-micro normal-case tracking-normal font-normal">{c}</Badge>
          ))}
          {tier.support.slaHours && (
            <Badge variant="outline" className="text-micro normal-case tracking-normal font-normal ml-auto">
              <Clock className="mr-1 h-2.5 w-2.5" /> {tier.support.slaHours}h SLA
            </Badge>
          )}
        </div>
      </div>

      {/* CTA */}
      <Button
        onClick={onTry}
        className={cn(
          "w-full h-10 font-medium",
          tier.featured
            ? "bg-veltra-emerald hover:bg-veltra-emerald-dark text-white"
            : "veltra-shadow border-0 bg-foreground/[0.05] text-foreground hover:bg-foreground/[0.08]"
        )}
      >
        Preview this plan <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
      </Button>
    </motion.div>
  );
}

function LimitChip({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon className="h-3 w-3 text-muted-foreground/60 flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-micro text-muted-foreground/70 normal-case tracking-normal leading-none mb-0.5">{label}</p>
        <p className="text-caption font-medium text-foreground tabular truncate">{value}</p>
      </div>
    </div>
  );
}

function CompareCell({ value, tier }: { value: string | boolean; tier: TierId }) {
  const tierColor = tier === "platform" ? "text-veltra-emerald" : "text-violet-300";
  if (typeof value === "boolean") {
    return (
      <div className="flex justify-center">
        {value ? (
          <Check className={cn("h-3.5 w-3.5", tierColor)} />
        ) : (
          <Minus className="h-3.5 w-3.5 text-muted-foreground/30" />
        )}
      </div>
    );
  }
  return <p className={cn("text-center font-medium tabular", tierColor)}>{value}</p>;
}
