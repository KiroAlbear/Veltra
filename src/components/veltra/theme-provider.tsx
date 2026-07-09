"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useEffect } from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // On mount, detect system preference if no stored preference
  useEffect(() => {
    const stored = localStorage.getItem("veltra-theme");
    if (!stored) {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      localStorage.setItem("veltra-theme", prefersDark ? "dark" : "light");
    }
  }, []);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
