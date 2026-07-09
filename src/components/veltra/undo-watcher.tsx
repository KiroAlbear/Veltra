"use client";

import { useVeltra } from "@/lib/veltra-store";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { Undo2 } from "lucide-react";

export function UndoWatcher() {
  const undoStack = useVeltra((s) => s.undoStack);
  const popUndo = useVeltra((s) => s.popUndo);
  const { toast } = useToast();

  // ⌘Z for undo
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        const stack = useVeltra.getState().undoStack;
        if (stack.length > 0) {
          e.preventDefault();
          const last = stack[stack.length - 1];
          popUndo();
          toast({ title: `Undid: ${last.label}` });
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [popUndo, toast]);

  // Show toast with Undo button when new action is pushed
  useEffect(() => {
    if (undoStack.length === 0) return;
    const latest = undoStack[undoStack.length - 1];
    toast({
      title: latest.label,
      description: "Tap to undo",
      action: (
        <button
          onClick={() => {
            popUndo();
          }}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-veltra-emerald/15 text-veltra-emerald text-caption font-medium hover:bg-veltra-emerald/25 veltra-transition"
        >
          <Undo2 className="h-3 w-3" />
          Undo
        </button>
      ),
    });
  }, [undoStack, popUndo, toast]);

  return null;
}
