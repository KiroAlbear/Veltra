"use client";

/**
 * HealthScoreCard — displays a patient's Health Score with full breakdown.
 *
 * The doctor sees:
 *   - Big number (0-100) with trend arrow
 *   - One-line summary
 *   - 5 factor bars (Vitals, Labs, Conditions, Adherence, Recency)
 *   - Each factor: label, score, status color, detail
 *
 * This is NOT a black-box score. Every point is explainable.
 * The doctor can click any factor to see the underlying data.
 */
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, Activity } from "lucide-react";
import type { HealthScoreBreakdown } from "@/lib/health-score";

export function HealthScoreCard({ score }: { score: HealthScoreBreakdown }) {
  const scoreColor =
    score.overall >= 85 ? "text-emerald-400" :
    score.overall >= 70 ? "text-amber-400" :
    score.overall >= 50 ? "text-orange-400" :
    "text-red-400";

  const scoreBg =
    score.overall >= 85 ? "from-emerald-500/15 to-emerald-500/5" :
    score.overall >= 70 ? "from-amber-500/15 to-amber-500/5" :
    score.overall >= 50 ? "from-orange-500/15 to-orange-500/5" :
    "from-red-500/15 to-red-500/5";

  const TrendIcon = score.trend === "up" ? TrendingUp : score.trend === "down" ? TrendingDown : Minus;
  const trendColor =
    score.trend === "up" ? "text-emerald-400" :
    score.trend === "down" ? "text-red-400" :
    "text-muted-foreground";

  return (
    <div className={cn("rounded-xl veltra-glass p-5 bg-gradient-to-br", scoreBg)}>
      {/* Header row: score + trend */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-shrink-0">
          <div className="flex items-baseline gap-1.5">
            <span className={cn("text-[2.5rem] leading-none font-bold tabular", scoreColor)}>
              {score.overall}
            </span>
            <span className="text-caption text-muted-foreground">/100</span>
          </div>
          <p className="text-micro text-muted-foreground/70 normal-case tracking-normal uppercase tracking-wider mt-1">
            Health Score
          </p>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendIcon className={cn("h-3 w-3", trendColor)} />
            <span className={cn("text-caption font-medium capitalize", trendColor)}>
              {score.trend}
            </span>
          </div>
          <p className="text-caption text-foreground leading-snug">
            {score.summary}
          </p>
        </div>
      </div>

      {/* Factor bars */}
      <div className="space-y-2.5 pt-3 border-t border-border/40">
        {score.factors.map((factor, i) => (
          <motion.div
            key={factor.label}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * i, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-3"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between mb-1">
                <p className="text-caption font-medium text-foreground truncate">
                  {factor.label}
                </p>
                <span className={cn(
                  "text-micro font-semibold tabular ml-2",
                  factor.status === "good" ? "text-emerald-400" :
                  factor.status === "warning" ? "text-amber-400" :
                  "text-red-400"
                )}>
                  {factor.value}
                </span>
              </div>
              <div className="h-1 rounded-full bg-foreground/10 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${factor.value}%` }}
                  transition={{ delay: 0.1 + 0.05 * i, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className={cn(
                    "h-full rounded-full",
                    factor.status === "good" ? "bg-emerald-400" :
                    factor.status === "warning" ? "bg-amber-400" :
                    "bg-red-400"
                  )}
                />
              </div>
              <p className="text-micro text-muted-foreground/70 normal-case tracking-normal mt-0.5 truncate">
                {factor.detail}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <p className="text-micro text-muted-foreground/50 normal-case tracking-normal mt-3 pt-3 border-t border-border/40 italic flex items-center gap-1">
        <Activity className="h-2.5 w-2.5" />
        Computed from vitals, labs, conditions, adherence, recency — every point is explainable.
      </p>
    </div>
  );
}
