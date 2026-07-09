"use client";

import { useVeltra } from "@/lib/veltra-store";
import { Globe, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SUPPORTED_LOCALES, ACTIVE_LOCALES, COMING_SOON_LOCALES, getLocale } from "@/lib/locales";

export function LanguageToggle({ compact = false }: { compact?: boolean }) {
  const language = useVeltra((s) => s.language);
  const setLanguage = useVeltra((s) => s.setLanguage);
  const currentLocale = getLocale(language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "rounded-md hover:bg-foreground/[0.05] flex items-center justify-center text-muted-foreground hover:text-foreground veltra-transition",
            compact ? "h-8 w-8" : "h-8 px-2 gap-1.5"
          )}
          aria-label={`Language: ${currentLocale.englishName}`}
          title={`Language: ${currentLocale.englishName}`}
        >
          <Globe className="h-3.5 w-3.5" />
          {!compact && (
            <span className="text-caption font-medium">{currentLocale.code.toUpperCase()}</span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 veltra-shadow-lg bg-card/95 backdrop-blur-xl border-border/40">
        <DropdownMenuLabel className="text-micro text-muted-foreground flex items-center gap-1.5">
          <Globe className="h-3 w-3" /> Language
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Active languages */}
        {ACTIVE_LOCALES.map((locale) => (
          <DropdownMenuItem
            key={locale.code}
            onClick={() => setLanguage(locale.code as any)}
            className={cn("text-body cursor-pointer gap-2.5", locale.code === language && "bg-veltra-emerald/10")}
          >
            <span className="text-sm flex-shrink-0">{locale.flag}</span>
            <span className="flex-1">{locale.name}</span>
            {locale.code === language && <Check className="h-3.5 w-3.5 text-veltra-emerald flex-shrink-0" />}
          </DropdownMenuItem>
        ))}

        {/* All 11 languages active — no "coming soon" section */}
        {COMING_SOON_LOCALES.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <p className="text-micro text-muted-foreground/50 px-2 py-1 normal-case tracking-normal">
              Coming soon
            </p>
            {COMING_SOON_LOCALES.map((locale) => (
              <div
                key={locale.code}
                className="flex items-center gap-2.5 px-2 py-1.5 text-body text-muted-foreground/40 cursor-not-allowed"
              >
                <span className="text-sm flex-shrink-0 opacity-50">{locale.flag}</span>
                <span className="flex-1">{locale.name}</span>
                <span className="text-micro text-muted-foreground/30 normal-case tracking-normal">soon</span>
              </div>
            ))}
          </>
        )}

      </DropdownMenuContent>
    </DropdownMenu>
  );
}
