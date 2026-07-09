"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { SPECIALTIES, type SpecialtyConfig } from "@/lib/specialties";

const EASE = [0.16, 1, 0.3, 1] as const;

export function SpecialtySelector({ onSelect, onBack }: { onSelect: (specialty: SpecialtyConfig) => void; onBack?: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background veltra-ambient">
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.03, 0.06, 0.03] }}
          transition={{ duration: 8, repeat: Infinity, ease: EASE }}
          className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-veltra-emerald rounded-full blur-[120px]"
        />
      </div>

      <div className="relative w-full max-w-4xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }} className="text-center mb-10">
          <a href="/" className="inline-flex items-center gap-2 mb-4 justify-center veltra-transition hover:opacity-80" aria-label="Back to Veltra home">
            <img src="/logo-symbol.png" alt="Veltra" className="object-cover h-7 w-7 rounded-lg veltra-shadow" />
            <span className="text-body font-semibold tracking-tight text-foreground">Veltra</span>
          </a>
          <p className="text-micro text-veltra-emerald mb-3">Explore Veltra</p>
          <h1 className="text-[2.5rem] sm:text-[3rem] leading-[1.05] tracking-[-0.035em] font-semibold text-foreground">
            <span className="text-editorial-italic text-muted-foreground">Choose your</span> clinic.
          </h1>
          <p className="text-body text-muted-foreground mt-4 max-w-md mx-auto">
            Every specialty speaks its own language. Pick yours and see Veltra in your world.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {SPECIALTIES.map((specialty, i) => (
            <motion.button
              key={specialty.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.04, ease: EASE }}
              whileHover={{ y: -3 }}
              onClick={() => onSelect(specialty)}
              className="veltra-glass rounded-2xl p-5 veltra-shadow text-center group cursor-pointer"
            >
              <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center mx-auto mb-3 text-2xl group-hover:scale-110 veltra-transition", specialty.color)}>
                {specialty.emoji}
              </div>
              <p className="text-caption font-medium text-foreground">{specialty.name}</p>
            </motion.button>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-micro text-muted-foreground/60 normal-case tracking-normal mb-4">
            + More specialties coming soon
          </p>
          {onBack && (
            <Button variant="ghost" onClick={onBack} className="h-9 text-caption text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Back to Home
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
