"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVeltra } from "@/lib/veltra-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { X, Send, Headphones, Sparkles, Check } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

interface AppMessage {
  id: string;
  role: "user" | "support";
  text: string;
  timestamp: number;
}

interface SupportChatProps {
  open: boolean;
  onClose: () => void;
}

const QUICK_TOPICS = [
  { label: "How do I add a patient?", keywords: ["add", "patient", "new"] },
  { label: "Booking an appointment", keywords: ["book", "appointment", "schedule"] },
  { label: "Insurance claims", keywords: ["insurance", "claim", "provider"] },
  { label: "Switching specialty", keywords: ["specialty", "switch", "dental"] },
  { label: "Upgrade my plan", keywords: ["upgrade", "plan", "tier"] },
  { label: "Voice notes not working", keywords: ["voice", "record", "audio"] },
];

export function SupportChat({ open, onClose }: SupportChatProps) {
  const currentUser = useVeltra((s) => s.currentUser);
  const activeTier = useVeltra((s) => s.activeTier);
  const [messages, setMessages] = useState<AppMessage[]>([]);
  const [input, setInput] = useState("");
  const [supportTyping, setSupportTyping] = useState(false);
  const [resolved, setResolved] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, supportTyping]);

  useEffect(() => {
    if (open && !initialized.current) {
      initialized.current = true;
      setMessages([
        {
          id: "welcome",
          role: "support",
          text: `Hi ${currentUser?.name?.split(" ")[0] || "there"} 👋 I'm your Veltra support agent. I can see you're on the ${activeTier?.name} plan. How can I help?`,
          timestamp: Date.now(),
        },
      ]);
    }
  }, [open, currentUser, activeTier]);

  const addSupportMessage = (text: string) => {
    setSupportTyping(true);
    setTimeout(() => {
      setSupportTyping(false);
      setMessages((prev) => [
        ...prev,
        { id: `support-${Date.now()}`, role: "support", text, timestamp: Date.now() },
      ]);
    }, 800 + Math.random() * 500);
  };

  const handleSend = (text?: string) => {
    const msgText = (text || input).trim();
    if (!msgText) return;

    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: "user", text: msgText, timestamp: Date.now() },
    ]);
    setInput("");

    const lower = msgText.toLowerCase();

    setTimeout(() => {
      // Smart responses based on keywords
      if (lower.includes("patient") && (lower.includes("add") || lower.includes("new") || lower.includes("create"))) {
        addSupportMessage("To add a patient:\n\n1. Go to Patients (press 2)\n2. Click \"New patient\" (top right)\n3. Fill in name, age, phone\n4. Click \"Register patient\"\n\nThe patient appears in the list + timeline immediately. Want me to take you there?");
      } else if (lower.includes("appointment") || lower.includes("book") || lower.includes("schedule")) {
        addSupportMessage("Booking an appointment:\n\n1. Go to Appointments (press 3)\n2. Click \"New appointment\"\n3. Select patient, time, doctor, type\n4. Click \"Book appointment\"\n\nThe system sends an email reminder automatically. Need anything else?");
      } else if (lower.includes("insurance") || lower.includes("claim")) {
        addSupportMessage("Insurance claims are available on the Platform plan. You can:\n\n• Submit claims to providers (Bupa, Tawuniya, etc.)\n• Track status (pending → submitted → approved → paid)\n• Link claims to patient visits\n\nGo to Insurance (press i) to see your claims.");
      } else if (lower.includes("specialty") || lower.includes("switch") || lower.includes("dental")) {
        addSupportMessage("You can switch specialties from the sidebar — the dropdown under the Veltra logo. Each specialty (Dental, Cardiology, Dermatology, etc.) regenerates the demo data with that specialty's patients, conditions, and workflows.");
      } else if (lower.includes("upgrade") || lower.includes("plan") || lower.includes("tier")) {
        addSupportMessage(`You're currently on the ${activeTier?.name} plan. To upgrade:\n\n• Click the tier badge in the sidebar (top-left)\n• Choose Platform / Enterprise\n\nUpgrading unlocks more screens, locations, and team seats instantly.`);
      } else if (lower.includes("voice") || lower.includes("record") || lower.includes("audio")) {
        addSupportMessage("Voice notes:\n\n• Go to a patient's timeline\n• Click the mic icon to record\n• Speak naturally — Veltra transcribes it\n• The transcript appears on the timeline\n\nVoice notes work 24/7 — patients can also record from their phone at 2 AM.");
      } else if (lower.includes("thank")) {
        addSupportMessage("You're welcome! 😊 If you need anything else, I'm here. You can also email us at support@veltrahealth.co.");
        setResolved(true);
      } else if (lower.includes("bye") || lower.includes("goodbye")) {
        addSupportMessage("Take care! 👋 Remember: Technology disappears. Care remains.");
      } else {
        addSupportMessage("I understand. Let me help with that. Here are some common topics — or tell me more about what you need:", );
      }
    }, 400);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: EASE }}
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.98 }}
            transition={{ duration: 0.3, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-md h-[80vh] sm:h-[600px] veltra-glass rounded-t-3xl sm:rounded-3xl veltra-shadow-lg overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-border/40 bg-veltra-emerald/5 flex items-center gap-3">
              <div className="relative">
                <div className="h-9 w-9 rounded-full bg-veltra-emerald flex items-center justify-center text-white">
                  <Headphones className="h-4 w-4" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 border-2 border-background" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-caption font-semibold text-foreground">Veltra Support</p>
                <p className="text-micro text-veltra-emerald normal-case tracking-normal flex items-center gap-1">
                  <span className="veltra-live-dot" /> Online · replies in ~2 min
                </p>
              </div>
              <button onClick={onClose} aria-label="Close support" className="h-7 w-7 rounded-md hover:bg-foreground/[0.05] flex items-center justify-center veltra-transition">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto veltra-scrollbar p-4 space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className={cn("flex flex-col", msg.role === "user" ? "items-end" : "items-start")}>
                  <div className={cn(
                    "max-w-[85%] px-3.5 py-2.5 rounded-2xl text-caption leading-relaxed whitespace-pre-line",
                    msg.role === "user"
                      ? "bg-veltra-emerald text-white rounded-br-md"
                      : "bg-foreground/[0.05] text-foreground rounded-bl-md"
                  )}>
                    {msg.text}
                  </div>
                  <p className="text-micro text-muted-foreground/50 mt-1 normal-case tracking-normal">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              ))}

              {supportTyping && (
                <div className="flex items-start">
                  <div className="bg-foreground/[0.05] rounded-2xl rounded-bl-md px-4 py-3 flex gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}

              {resolved && (
                <div className="flex justify-center pt-2">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 text-micro font-medium normal-case tracking-normal">
                    <Check className="h-3 w-3" /> Issue resolved
                  </div>
                </div>
              )}
            </div>

            {/* Quick topics */}
            {messages.length <= 1 && (
              <div className="px-4 py-3 border-t border-border/40 bg-background/30">
                <p className="text-micro text-muted-foreground mb-2 normal-case tracking-normal">Quick topics:</p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_TOPICS.map((topic) => (
                    <button
                      key={topic.label}
                      onClick={() => handleSend(topic.label)}
                      className="px-2.5 py-1.5 rounded-lg text-micro font-medium bg-veltra-emerald/10 text-veltra-emerald hover:bg-veltra-emerald/20 veltra-transition normal-case tracking-normal"
                    >
                      {topic.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Email escalation */}
            <div className="px-4 py-2 border-t border-border/40 bg-background/30">
              <a
                href="mailto:support@veltrahealth.co?subject=Support request"
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-veltra-emerald/10 text-veltra-emerald hover:bg-veltra-emerald/20 veltra-transition text-micro font-medium normal-case tracking-normal"
              >
                <Sparkles className="h-3 w-3" /> Need urgent help? Email support
              </a>
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border/40 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Type a message..."
                className="flex-1 h-10 px-3.5 rounded-xl bg-background/50 border border-border/40 text-caption text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-veltra-emerald/40 focus:ring-2 focus:ring-veltra-emerald/20 veltra-transition"
                autoFocus
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className="h-10 w-10 rounded-xl bg-veltra-emerald hover:bg-veltra-emerald-dark text-white flex items-center justify-center veltra-transition disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                aria-label="Send"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
