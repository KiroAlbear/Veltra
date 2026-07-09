"use client";

import { motion } from "framer-motion";
import { useId } from "react";

/* ============ Sparkline — mini trend chart ============ */
export function Sparkline({
  data,
  width = 80,
  height = 24,
  stroke = "var(--veltra-emerald)",
  fill = true,
  strokeWidth = 1.5,
}: {
  data: number[];
  width?: number;
  height?: number;
  stroke?: string;
  fill?: boolean;
  strokeWidth?: number;
}) {
  const gradientId = `spark-${useId().replace(/:/g, "")}`;
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);

  const points = data.map((v, i) => ({
    x: i * stepX,
    y: height - ((v - min) / range) * (height - 4) - 2,
  }));

  const path = points
    .map((p, i) => (i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`))
    .join(" ");

  const fillPath = `${path} L ${width},${height} L 0,${height} Z`;

  const lastPoint = points[points.length - 1];

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.25" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={fillPath} fill={`url(#${gradientId})`} />}
      <motion.path
        d={path}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.circle
        cx={lastPoint.x}
        cy={lastPoint.y}
        r={2}
        fill={stroke}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      />
    </svg>
  );
}

/* ============ Trend arrow ============ */
export function TrendBadge({
  value,
  direction,
  className,
}: {
  value: string;
  direction: "up" | "down" | "neutral";
  className?: string;
}) {
  const color =
    direction === "up"
      ? "text-emerald-400"
      : direction === "down"
      ? "text-red-400"
      : "text-muted-foreground";
  const arrow = direction === "up" ? "↗" : direction === "down" ? "↘" : "→";
  return (
    <span className={`text-caption font-medium tabular ${color} ${className || ""}`}>
      {arrow} {value}
    </span>
  );
}
