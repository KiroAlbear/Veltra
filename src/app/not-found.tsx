"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background veltra-ambient">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="text-center max-w-md"
      >
        <a href="/" className="inline-block veltra-transition hover:opacity-80" aria-label="Veltra home">
          <img src="/logo-symbol.png" alt="Veltra" className="object-cover h-12 w-12 rounded-xl mx-auto mb-6 veltra-shadow-emerald" />
        </a>
        <h1 className="text-[2rem] leading-[1.1] tracking-[-0.03em] font-semibold text-foreground mb-3">
          <span className="text-editorial-italic text-muted-foreground">Nothing lives</span> here.
        </h1>
        <p className="text-body text-muted-foreground mb-8">
          Let's get you back to today's clinic.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button onClick={() => window.history.back()} variant="outline" className="h-10 px-5 veltra-shadow border-0 bg-foreground/[0.04] text-foreground font-medium">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Go Back
          </Button>
          <Button onClick={() => window.location.href = "/"} className="h-10 px-5 bg-veltra-emerald hover:bg-veltra-emerald-dark text-white font-medium">
            Return Home
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
