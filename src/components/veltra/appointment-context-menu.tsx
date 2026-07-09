"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVeltra } from "@/lib/veltra-store";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  ContextMenuLabel,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from "@/components/ui/context-menu";
import {
  Check,
  X,
  UserCheck,
  ArrowRight,
  Phone,
  MessageCircle,
  Calendar,
  RotateCcw,
  Stethoscope,
  Eye,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Appointment } from "@/lib/veltra-store";

export function AppointmentContextMenu({
  appointment,
  children,
  onConfirm,
  onCheckIn,
  onComplete,
  onCancel,
  onOpenPatient,
}: {
  appointment: Appointment;
  children: React.ReactNode;
  onConfirm: () => void;
  onCheckIn: () => void;
  onComplete: () => void;
  onCancel: () => void;
  onOpenPatient: () => void;
}) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-56 veltra-shadow-lg bg-card/95 backdrop-blur-xl border-border/40">
        <ContextMenuLabel className="text-micro text-muted-foreground">
          {appointment.patientName}
        </ContextMenuLabel>
        <ContextMenuSeparator />

        {appointment.status === "scheduled" && (
          <ContextMenuItem onClick={onConfirm} className="text-body cursor-pointer">
            <Check className="mr-2 h-3.5 w-3.5 text-emerald-400" />
            Confirm appointment
          </ContextMenuItem>
        )}

        {appointment.status === "confirmed" && (
          <ContextMenuItem onClick={onCheckIn} className="text-body cursor-pointer">
            <UserCheck className="mr-2 h-3.5 w-3.5 text-violet-400" />
            Check in patient
          </ContextMenuItem>
        )}

        {appointment.status === "checked-in" && (
          <ContextMenuItem onClick={onComplete} className="text-body cursor-pointer">
            <Check className="mr-2 h-3.5 w-3.5 text-emerald-400" />
            Complete visit
          </ContextMenuItem>
        )}

        <ContextMenuItem onClick={onOpenPatient} className="text-body cursor-pointer">
          <Eye className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
          Open patient timeline
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuSub>
          <ContextMenuSubTrigger className="text-body cursor-pointer">
            <Phone className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
            Contact patient
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-44">
            <ContextMenuItem className="text-body cursor-pointer">
              <Phone className="mr-2 h-3.5 w-3.5" />
              Call
            </ContextMenuItem>
            <ContextMenuItem className="text-body cursor-pointer">
              <MessageCircle className="mr-2 h-3.5 w-3.5" />
              Message
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        {appointment.status !== "cancelled" && appointment.status !== "completed" && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem
              onClick={onCancel}
              className="text-body cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-500/10"
            >
              <X className="mr-2 h-3.5 w-3.5" />
              Cancel appointment
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
