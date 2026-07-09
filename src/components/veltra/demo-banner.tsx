"use client";

import { useRouter } from "next/navigation";
import { useVeltra, canDo } from "@/lib/veltra-store";
import { FlaskConical, X } from "lucide-react";

export function DemoBanner() {
  const router = useRouter();
  const logout = useVeltra((s) => s.logout);
  const resetDemo = useVeltra((s) => s.resetDemo);
  const role = useVeltra((s) => s.currentUser?.role);

  // Only admin can reset demo data — prevents accidental data wipe by other roles.
  const canReset = canDo(role, "canResetDemo");

  const handleExit = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="sticky top-0 z-40 w-full border-b border-emerald-500/15 bg-emerald-500/[0.04] backdrop-blur-xl">
      <div className="flex h-10 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center gap-1.5">
            <FlaskConical className="h-3 w-3 text-emerald-400" />
            <span className="text-micro text-emerald-300">Demo Environment</span>
          </div>
          <span className="hidden sm:inline text-caption text-emerald-400/60">
            · No real patient information is displayed.
          </span>
        </div>

        <div className="flex items-center gap-1">
          {canReset && (
            <button
              onClick={resetDemo}
              className="h-7 px-2.5 text-caption text-emerald-300/70 hover:bg-emerald-500/10 hover:text-emerald-200 rounded-md veltra-transition"
            >
              Reset Demo
            </button>
          )}
          <button
            onClick={handleExit}
            className="h-7 px-2.5 text-caption text-emerald-300 hover:bg-emerald-500/10 hover:text-emerald-200 rounded-md veltra-transition flex items-center gap-1.5"
            aria-label="Exit demo"
          >
            <X className="h-3 w-3" />
            <span className="hidden sm:inline">Exit</span>
          </button>
        </div>
      </div>
    </div>
  );
}
