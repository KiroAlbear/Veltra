"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { MessageCircle, X, Send, Calendar, Phone, ArrowRight, Mail } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

interface Message {
  id: string;
  role: "visitor" | "agent";
  text: string;
  timestamp: number;
  quickReplies?: { label: string; action: () => void }[];
}

interface LiveChatProps {
  /** Called when visitor wants to book a demo (triggers password gate) */
  onBookDemo?: () => void;
}

export function LiveChat({ onBookDemo }: LiveChatProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [unread, setUnread] = useState(0);
  const [agentTyping, setAgentTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, agentTyping]);

  // Reset unread when opening
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUnread(0);
    }
  }, [open]);

  // Add agent message (with typing indicator)
  const addAgentMessage = (text: string, quickReplies?: { label: string; action: () => void }[]) => {
    setAgentTyping(true);
    setTimeout(() => {
      setAgentTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `agent-${Date.now()}`,
          role: "agent",
          text,
          timestamp: Date.now(),
          quickReplies,
        },
      ]);
      if (!open) setUnread((u) => u + 1);
    }, 800 + Math.random() * 600);
  };

  // Handlers
  const handleBookDemo = () => {
    addAgentMessage("Great! I'll get you into the demo. You'll need a password — I can share it with you, or you can request access.", [
      { label: "I have a password", action: () => onBookDemo?.() },
      { label: "Request access", action: () => window.location.href = "mailto:hello@veltrahealth.co?subject=Demo access request" },
    ]);
  };

  const handlePricing = () => {
    addAgentMessage("Veltra has two plans:\n\n⚡ Veltra Platform — From $999/mo (3 clinics, 15 users) — Most Popular\n🌐 Enterprise — Custom pricing (unlimited)\n\nBoth include the Veltra Launch Program (from $3,000). Want to see them?", [
      { label: "Preview plans", action: () => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" }) },
      { label: "Book a demo", action: () => handleBookDemo() },
    ]);
  };

  // Welcome message on first open (after handlers are defined)
  useEffect(() => {
    if (open && !initialized.current) {
      initialized.current = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMessages([
        {
          id: "welcome",
          role: "agent",
          text: "Hi 👋 I'm here to help. What brings you to Veltra today?",
          timestamp: Date.now(),
          quickReplies: [
            { label: "Book a demo", action: handleBookDemo },
            { label: "See pricing", action: handlePricing },
            { label: "Talk on Email", action: () => window.location.href = "mailto:hello@veltrahealth.co" },
          ],
        },
      ]);
      setUnread(0);
    }
  }, [open]);

  const handleSpecialty = () => {
    addAgentMessage("Veltra supports 19 specialties — Dental, Cardiology, Dermatology, Pediatrics, Psychiatry, and more. Each demo is customized with that specialty's vocabulary, patients, and workflows.\n\nWhich specialty should I show you?", [
      { label: "Dental", action: () => addAgentMessage("Perfect — the Dental demo includes crown follow-ups, root canals, CBCT scans, and implant placements. Want to see it?", [{ label: "Yes, show me", action: () => onBookDemo?.() }]) },
      { label: "Cardiology", action: () => addAgentMessage("The Cardiology demo has ECG reviews, troponin results, echo scheduling, and Holter monitors. Want to see it?", [{ label: "Yes, show me", action: () => onBookDemo?.() }]) },
      { label: "Psychiatry", action: () => addAgentMessage("The Psychiatry demo includes ADHD assessments, perimenopause tracking, intake forms, and voice notes — built for Dr. Balu's practice. Want to see it?", [{ label: "Yes, show me", action: () => onBookDemo?.() }]) },
    ]);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const visitorMsg: Message = {
      id: `visitor-${Date.now()}`,
      role: "visitor",
      text: input.trim(),
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, visitorMsg]);
    const userText = input.trim().toLowerCase();
    setInput("");

    // Smart responses
    setTimeout(() => {
      if (userText.includes("price") || userText.includes("cost") || userText.includes("plan")) {
        handlePricing();
      } else if (userText.includes("demo") || userText.includes("try") || userText.includes("see")) {
        handleBookDemo();
      } else if (userText.includes("dental") || userText.includes("cardio") || userText.includes("psycho") || userText.includes("special")) {
        handleSpecialty();
      } else if (userText.includes("whatsapp") || userText.includes("call") || userText.includes("phone")) {
        addAgentMessage("You can reach us directly by email. Let me open that for you.", [
          { label: "Open Email", action: () => window.location.href = "mailto:hello@veltrahealth.co" },
        ]);
      } else if (userText.includes("hi") || userText.includes("hello") || userText.includes("hey")) {
        addAgentMessage("Hello! 👋 Happy to help. Are you interested in seeing the demo, learning about pricing, or something else?", [
          { label: "Book a demo", action: () => handleBookDemo() },
          { label: "See pricing", action: () => handlePricing() },
        ]);
      } else {
        addAgentMessage("Thanks for your message! I want to make sure I help you properly. Would any of these be useful?", [
          { label: "Book a demo", action: () => handleBookDemo() },
          { label: "See pricing", action: () => handlePricing() },
          { label: "Talk on Email", action: () => window.location.href = "mailto:hello@veltrahealth.co" },
        ]);
      }
    }, 600);
  };

  return (
    <>
      {/* Floating chat button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5, ease: EASE }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full shadow-lg flex items-center justify-center veltra-shadow-lg veltra-transition",
          open ? "bg-foreground text-background rotate-90" : "bg-veltra-emerald hover:bg-veltra-emerald-dark text-white"
        )}
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-6 w-6" />}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 h-5 min-w-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1">{unread}</span>
        )}
        {!open && (
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-veltra-emerald border-2 border-background animate-pulse" />
        )}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="fixed bottom-24 right-6 z-40 w-[calc(100vw-3rem)] sm:w-96 max-h-[600px] veltra-glass rounded-2xl veltra-shadow-lg overflow-hidden flex flex-col"
            style={{ maxHeight: "70vh" }}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-border/40 bg-veltra-emerald/5 flex items-center gap-3">
              <div className="relative">
                <div className="h-9 w-9 rounded-full bg-veltra-emerald flex items-center justify-center text-white text-caption font-bold">
                  V
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 border-2 border-background" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-caption font-semibold text-foreground">Veltra Support</p>
                <p className="text-micro text-veltra-emerald normal-case tracking-normal flex items-center gap-1">
                  <span className="veltra-live-dot" /> Online now
                </p>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close chat" className="h-7 w-7 rounded-md hover:bg-foreground/[0.05] flex items-center justify-center veltra-transition">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto veltra-scrollbar p-4 space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className={cn("flex flex-col", msg.role === "visitor" ? "items-end" : "items-start")}>
                  <div className={cn(
                    "max-w-[85%] px-3.5 py-2.5 rounded-2xl text-caption leading-relaxed whitespace-pre-line",
                    msg.role === "visitor"
                      ? "bg-veltra-emerald text-white rounded-br-md"
                      : "bg-foreground/[0.05] text-foreground rounded-bl-md"
                  )}>
                    {msg.text}
                  </div>
                  {msg.quickReplies && msg.quickReplies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2 max-w-[85%]">
                      {msg.quickReplies.map((qr, i) => (
                        <button
                          key={i}
                          onClick={qr.action}
                          className="px-2.5 py-1.5 rounded-lg text-micro font-medium bg-veltra-emerald/10 text-veltra-emerald hover:bg-veltra-emerald/20 veltra-transition normal-case tracking-normal"
                        >
                          {qr.label}
                        </button>
                      ))}
                    </div>
                  )}
                  <p className="text-micro text-muted-foreground/50 mt-1 normal-case tracking-normal">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              ))}

              {/* Agent typing indicator */}
              {agentTyping && (
                <div className="flex items-start">
                  <div className="bg-foreground/[0.05] rounded-2xl rounded-bl-md px-4 py-3 flex gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div className="px-4 py-2 border-t border-border/40 flex gap-2 bg-background/30">
              <button onClick={() => handleBookDemo()} className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-veltra-emerald/10 text-veltra-emerald hover:bg-veltra-emerald/20 veltra-transition text-micro font-medium normal-case tracking-normal">
                <Calendar className="h-3 w-3" /> Book demo
              </button>
              <button onClick={() => window.location.href = "mailto:hello@veltrahealth.co"} className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-veltra-emerald/10 text-veltra-emerald hover:bg-veltra-emerald/20 veltra-transition text-micro font-medium normal-case tracking-normal">
                <Mail className="h-3 w-3" /> Email us
              </button>
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
                onClick={handleSend}
                disabled={!input.trim()}
                className="h-10 w-10 rounded-xl bg-veltra-emerald hover:bg-veltra-emerald-dark text-white flex items-center justify-center veltra-transition disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                aria-label="Send"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
