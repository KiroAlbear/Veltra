"use client";

import { useVeltra, canDo, PERMISSIONS, type Document as VeltraDocument, type DoctorHours } from "@/lib/veltra-store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Shield, Plus, FileText, Package, Clock, RefreshCw, MessageCircle, Mail, MapPin, AlertTriangle, Check, X, Send, ArrowRight, ExternalLink, Search } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { formatDate, formatRelativeTime } from "@/lib/veltra-store";
import { FadeIn, StaggerGroup, StaggerItem } from "./motion";
import { useToast } from "@/hooks/use-toast";

const CLAIM_STATUS: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-amber-500/10 text-amber-300 border-amber-500/20" },
  submitted: { label: "Submitted", className: "bg-blue-500/10 text-blue-300 border-blue-500/20" },
  approved: { label: "Approved", className: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" },
  rejected: { label: "Rejected", className: "bg-red-500/10 text-red-300 border-red-500/20" },
  paid: { label: "Paid", className: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" },
};

const DOC_TYPE_ICON: Record<string, string> = {
  xray: "🖼️", "lab-report": "🧪", prescription: "💊", consent: "📝", other: "📄",
};

export function ClaimsScreen() {
  const claims = useVeltra((s) => s.insuranceClaims);
  const patients = useVeltra((s) => s.patients);
  const role = useVeltra((s) => s.currentUser?.role);
  const canSubmit = canDo(role, "canManageClaims"); // claims submission needs the claims permission, not just confirm
  const submitClaim = useVeltra((s) => s.submitClaim);
  const updateClaimStatus = useVeltra((s) => s.updateClaimStatus);
  const selectPatient = useVeltra((s) => s.selectPatient);
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ patientId: "", provider: "", policyNumber: "", serviceType: "", amount: "", notes: "" });

  const handleAdd = () => {
    if (!form.patientId || !form.provider || !form.amount) {
      toast({ title: "Missing fields", variant: "destructive" });
      return;
    }
    const patient = patients.find((p) => p.id === form.patientId);
    submitClaim({
      patientId: form.patientId,
      patientName: patient?.name || "",
      provider: form.provider,
      policyNumber: form.policyNumber,
      serviceType: form.serviceType,
      amount: Number(form.amount),
      notes: form.notes,
    });
    setDialogOpen(false);
    setForm({ patientId: "", provider: "", policyNumber: "", serviceType: "", amount: "", notes: "" });
    toast({ title: "Claim submitted ✓", description: `${form.provider} — $${form.amount}` });
  };

  return (
    <div className="min-h-screen veltra-ambient">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-8 sm:py-10 md:px-12 md:py-14">
        <FadeIn>
          <header className="mb-10">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-3.5 w-3.5 text-veltra-emerald" />
                  <span className="text-micro text-veltra-emerald">Insurance Claims</span>
                </div>
                <h1 className="text-[2.5rem] leading-[1.05] tracking-[-0.035em] text-foreground font-semibold">
                  <span className="text-editorial-italic text-muted-foreground">Every claim,</span>{" "}
                  tracked.
                </h1>
                <p className="text-body text-muted-foreground mt-3">
                  {claims.length} claims · {claims.filter((c) => c.status === "pending" || c.status === "submitted").length} pending · ${claims.filter((c) => c.status === "approved" || c.status === "paid").reduce((s, c) => s + c.amount, 0).toLocaleString()} approved
                </p>
              </div>
              {canSubmit && (
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="h-10 px-5 bg-veltra-emerald hover:bg-veltra-emerald-dark text-white">
                      <Plus className="mr-1.5 h-4 w-4" /> New claim
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md veltra-shadow-lg">
                    <DialogHeader>
                      <DialogTitle className="text-title">Submit insurance claim</DialogTitle>
                      <DialogDescription className="text-caption">Claim tracks from submission to payment.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                      <div className="space-y-1.5">
                        <Label className="text-micro text-muted-foreground">Patient</Label>
                        <Select value={form.patientId} onValueChange={(v) => setForm({ ...form, patientId: v })}>
                          <SelectTrigger className="h-10"><SelectValue placeholder="Select..." /></SelectTrigger>
                          <SelectContent>{patients.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div><Label className="text-micro text-muted-foreground">Provider</Label><Input value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} placeholder="Bupa Arabia" className="h-10 mt-1" /></div>
                        <div><Label className="text-micro text-muted-foreground">Policy #</Label><Input value={form.policyNumber} onChange={(e) => setForm({ ...form, policyNumber: e.target.value })} placeholder="BUPA-2024-001" className="h-10 mt-1" /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div><Label className="text-micro text-muted-foreground">Service</Label><Input value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value })} placeholder="Consultation" className="h-10 mt-1" /></div>
                        <div><Label className="text-micro text-muted-foreground">Amount $</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="450" className="h-10 mt-1" /></div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="ghost" onClick={() => setDialogOpen(false)} className="h-10">Cancel</Button>
                      <Button onClick={handleAdd} className="h-10 bg-veltra-emerald hover:bg-veltra-emerald-dark text-white">Submit</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </header>
        </FadeIn>

        <StaggerGroup>
          <Card className="veltra-shadow border-0 bg-card/50 backdrop-blur-sm overflow-hidden">
            {claims.map((claim, idx) => {
              const cfg = CLAIM_STATUS[claim.status];
              return (
                <StaggerItem key={claim.id}>
                  <div className={cn("flex items-center gap-4 px-6 py-4 veltra-transition hover:bg-foreground/[0.03]", idx !== claims.length - 1 && "border-b border-border/40")}>
                    <button onClick={() => selectPatient(claim.patientId)} className="flex-1 min-w-0 text-left group">
                      <p className="text-body font-medium text-foreground truncate group-hover:text-veltra-emerald veltra-transition">{claim.patientName}</p>
                      <p className="text-caption text-muted-foreground truncate">{claim.provider} · {claim.policyNumber} · {claim.serviceType}</p>
                    </button>
                    <div className="text-right flex-shrink-0">
                      <p className="text-body font-semibold tabular text-foreground">${claim.amount}</p>
                      <p className="text-micro text-muted-foreground/70 normal-case tracking-normal mt-0.5">{formatRelativeTime(claim.submittedAt)}</p>
                    </div>
                    <Badge variant="outline" className={cn("text-micro font-medium border", cfg.className)}>{cfg.label}</Badge>
                    {canSubmit && (claim.status === "pending" || claim.status === "submitted") && (
                      <Button size="sm" variant="ghost" onClick={() => { updateClaimStatus(claim.id, "approved"); toast({ title: "Claim approved ✓" }); }} className="h-7 px-2 text-caption text-emerald-400 hover:bg-emerald-500/10">
                        <Check className="h-3 w-3" />
                      </Button>
                    )}
                    {canSubmit && (claim.status === "pending" || claim.status === "submitted") && (
                      <Button size="sm" variant="ghost" onClick={() => { updateClaimStatus(claim.id, "rejected"); toast({ title: "Claim rejected" }); }} className="h-7 px-2 text-caption text-red-400 hover:bg-red-500/10">
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                    {canSubmit && claim.status === "approved" && (
                      <Button size="sm" variant="ghost" onClick={() => { updateClaimStatus(claim.id, "paid"); toast({ title: "Marked as paid ✓" }); }} className="h-7 px-2 text-caption text-emerald-400 hover:bg-emerald-500/10">
                        Pay
                      </Button>
                    )}
                  </div>
                </StaggerItem>
              );
            })}
          </Card>
        </StaggerGroup>
      </div>
    </div>
  );
}

// ===== Inventory Screen =====
export function InventoryScreen() {
  const medications = useVeltra((s) => s.medications);
  const adjustStock = useVeltra((s) => s.adjustMedicationStock);
  const currentUser = useVeltra((s) => s.currentUser);
  const { toast } = useToast();

  // Permission-based gate — admin, operations, and pharmacist can adjust stock.
  // Everyone else gets view-only.
  const canAdjustStock = useVeltra((s) => {
    const role = s.currentUser?.role;
    if (!role) return false;
    return PERMISSIONS[role]?.canAdjustInventory === true;
  });

  const lowStock = medications.filter((m) => m.stock <= m.minStock);

  return (
    <div className="min-h-screen veltra-ambient">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-8 sm:py-10 md:px-12 md:py-14">
        <FadeIn>
          <header className="mb-10">
            <div className="flex items-center gap-2 mb-3">
              <Package className="h-3.5 w-3.5 text-veltra-emerald" />
              <span className="text-micro text-veltra-emerald">Pharmacy Inventory</span>
            </div>
            <h1 className="text-[2.5rem] leading-[1.05] tracking-[-0.035em] text-foreground font-semibold">
              <span className="text-editorial-italic text-muted-foreground">Every pill,</span>{" "}
              counted.
            </h1>
            <p className="text-body text-muted-foreground mt-3">
              {medications.length} medications · {lowStock.length} low stock · {medications.filter((m) => new Date(m.expiryDate) < new Date(Date.now() + 90 * 86400000)).length} expiring soon
            </p>
          </header>
        </FadeIn>

        {lowStock.length > 0 && (
          <FadeIn delay={0.05}>
            <Card className="p-4 mb-6 border-amber-500/20 bg-amber-500/5 veltra-shadow border">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0" />
                <p className="text-caption text-amber-300">
                  {lowStock.length} medications below minimum stock: {lowStock.map((m) => m.name).join(", ")}
                </p>
              </div>
            </Card>
          </FadeIn>
        )}

        <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {medications.map((med) => {
            const isLow = med.stock <= med.minStock;
            const expiringSoon = new Date(med.expiryDate) < new Date(Date.now() + 90 * 86400000);
            return (
              <StaggerItem key={med.id}>
                <Card className={cn("p-5 veltra-shadow border-0 bg-card/50 backdrop-blur-sm h-full", isLow && "ring-1 ring-amber-500/30")}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-body font-semibold text-foreground">{med.name}</p>
                      <p className="text-caption text-muted-foreground">{med.category} · {med.supplier}</p>
                    </div>
                    {isLow && <AlertTriangle className="h-4 w-4 text-amber-400" />}
                  </div>
                  <div className="flex items-baseline gap-2 mb-3">
                    <p className={cn("text-3xl font-semibold tabular", isLow ? "text-amber-400" : "text-foreground")}>{med.stock}</p>
                    <p className="text-caption text-muted-foreground">{med.unit}</p>
                    <p className="text-micro text-muted-foreground/60 normal-case tracking-normal ml-auto">min: {med.minStock}</p>
                  </div>
                  <div className="space-y-1 pt-3 border-t border-border/40">
                    <div className="flex justify-between text-caption">
                      <span className="text-muted-foreground">Price</span>
                      <span className="text-foreground tabular">${med.price}</span>
                    </div>
                    <div className="flex justify-between text-caption">
                      <span className="text-muted-foreground">Expiry</span>
                      <span className={cn("tabular", expiringSoon ? "text-amber-400" : "text-foreground")}>{med.expiryDate}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    {canAdjustStock ? (
                      <>
                        <Button size="sm" variant="outline" onClick={() => { if (med.stock >= 10) { adjustStock(med.id, -10); toast({ title: "Dispensed 10 units" }); } else { toast({ title: "Insufficient stock", description: `Only ${med.stock} ${med.unit} left`, variant: "destructive" }); } }} className="flex-1 h-8 text-caption veltra-shadow border-0 bg-foreground/[0.04]">
                          -10
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => { adjustStock(med.id, 50); toast({ title: "Restocked +50 units" }); }} className="flex-1 h-8 text-caption veltra-shadow border-0 bg-foreground/[0.04]">
                          +50
                        </Button>
                      </>
                    ) : (
                      <p className="text-micro text-muted-foreground/70 normal-case tracking-normal py-2 leading-relaxed">
                        View only — contact Operations or Admin to adjust stock.
                      </p>
                    )}
                  </div>
                </Card>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </div>
    </div>
  );
}

// ===== Messages (Patient Messages) Screen — Individual patient chats =====
export function MessagesScreen() {
  const messages = useVeltra((s) => s.whatsappMessages);
  const patients = useVeltra((s) => s.patients);
  const sendWhatsApp = useVeltra((s) => s.sendWhatsApp);
  const selectPatient = useVeltra((s) => s.selectPatient);
  const { toast } = useToast();

  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Group messages by patient
  const patientMessages = patients.map((p) => {
    const msgs = messages.filter((m) => m.patientId === p.id).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    const lastMsg = msgs[msgs.length - 1];
    return { patient: p, messages: msgs, lastMessage: lastMsg, count: msgs.length };
  }).filter((pm) => pm.count > 0 || pm.patient.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Sort by last message time (most recent first)
  patientMessages.sort((a, b) => {
    if (!a.lastMessage) return 1;
    if (!b.lastMessage) return -1;
    return new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime();
  });

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);
  const selectedMessages = selectedPatientId ? messages.filter((m) => m.patientId === selectedPatientId).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) : [];

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedMessages.length, selectedPatientId]);

  // Auto-select first patient if none selected
  useEffect(() => {
    if (!selectedPatientId && patientMessages.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedPatientId(patientMessages[0].patient.id);
    }
  }, [patientMessages.length, selectedPatientId]);

  const handleReply = () => {
    if (!selectedPatientId || !replyText.trim()) return;
    sendWhatsApp({ patientId: selectedPatientId, patientName: selectedPatient?.name || "", message: replyText.trim() });
    setReplyText("");
    toast({ title: "Sent ✓", description: `To ${selectedPatient?.name}` });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleReply();
    }
  };

  return (
    <div className="min-h-screen veltra-ambient">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <FadeIn>
          <header className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="h-3.5 w-3.5 text-veltra-emerald" />
              <span className="text-micro text-veltra-emerald">Patient Messages</span>
            </div>
            <h1 className="text-[2rem] sm:text-[2.5rem] leading-[1.05] tracking-[-0.035em] text-foreground font-semibold">
              <span className="text-editorial-italic text-muted-foreground">Conversations,</span> not calls.
            </h1>
            <p className="text-body text-muted-foreground mt-2">{messages.length} messages · {messages.filter((m) => m.direction === "outbound").length} sent · {messages.filter((m) => m.direction === "inbound").length} received</p>
          </header>
        </FadeIn>

        {/* Two-panel chat layout */}
        <FadeIn delay={0.1}>
          <div className="flex rounded-2xl veltra-shadow-lg overflow-hidden border border-border/30 bg-card/50 backdrop-blur-sm" style={{ height: "calc(100vh - 280px)", minHeight: "500px" }}>

            {/* LEFT PANEL: Patient conversation list */}
            <div className="w-full sm:w-72 md:w-80 border-r border-border/30 flex flex-col">
              {/* Search */}
              <div className="p-3 border-b border-border/30">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search patients..."
                    className="w-full h-9 pl-9 pr-3 rounded-lg bg-foreground/[0.04] border border-border/30 text-caption text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-1 focus:ring-veltra-emerald/30"
                  />
                </div>
              </div>

              {/* Patient list */}
              <div className="flex-1 overflow-y-auto veltra-scrollbar">
                {patientMessages.map((pm) => (
                  <button
                    key={pm.patient.id}
                    onClick={() => setSelectedPatientId(pm.patient.id)}
                    className={cn(
                      "w-full flex items-start gap-3 p-3 border-b border-border/20 veltra-transition text-left cursor-pointer",
                      selectedPatientId === pm.patient.id ? "bg-veltra-emerald/10" : "hover:bg-foreground/[0.03]"
                    )}
                  >
                    {/* Avatar */}
                    <div className="h-9 w-9 rounded-full bg-veltra-emerald/15 text-veltra-emerald flex items-center justify-center text-caption font-semibold flex-shrink-0">
                      {pm.patient.name.trim().split(/\s+/).map((n) => n[0] || "").filter(Boolean).slice(0, 2).join("")}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="text-caption font-medium text-foreground truncate">{pm.patient.name}</p>
                        {pm.lastMessage && (
                          <span className="text-micro text-muted-foreground/50 normal-case tracking-normal flex-shrink-0">{formatRelativeTime(pm.lastMessage.timestamp)}</span>
                        )}
                      </div>
                      <p className="text-micro text-muted-foreground/70 normal-case tracking-normal truncate mt-0.5">
                        {pm.lastMessage ? (
                          <>
                            {pm.lastMessage.direction === "outbound" && "You: "}
                            {pm.lastMessage.message}
                          </>
                        ) : (
                          "No messages yet"
                        )}
                      </p>
                    </div>
                  </button>
                ))}
                {patientMessages.length === 0 && (
                  <div className="text-center py-12 px-4">
                    <MessageCircle className="h-5 w-5 text-muted-foreground/40 mx-auto mb-3" />
                    <p className="text-micro text-muted-foreground/60 normal-case tracking-normal">No conversations found.</p>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT PANEL: Chat thread */}
            {selectedPatient ? (
              <div className="hidden sm:flex flex-1 flex-col">
                {/* Chat header */}
                <div className="flex items-center gap-3 p-3 border-b border-border/30 bg-foreground/[0.02]">
                  <button
                    onClick={() => selectPatient(selectedPatient.id)}
                    className="h-9 w-9 rounded-full bg-veltra-emerald/15 text-veltra-emerald flex items-center justify-center text-caption font-semibold flex-shrink-0 cursor-pointer hover:bg-veltra-emerald/25 veltra-transition"
                    aria-label={`Open ${selectedPatient.name} timeline`}
                  >
                    {selectedPatient.name.trim().split(/\s+/).map((n) => n[0] || "").filter(Boolean).slice(0, 2).join("")}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-body font-medium text-foreground truncate">{selectedPatient.name}</p>
                    <p className="text-micro text-muted-foreground/60 normal-case tracking-normal">{selectedPatient.conditions[0] || "No conditions"} · {selectedPatient.phone}</p>
                  </div>
                  <button
                    onClick={() => selectPatient(selectedPatient.id)}
                    className="text-micro text-veltra-emerald hover:underline normal-case tracking-normal cursor-pointer flex-shrink-0"
                  >
                    View timeline →
                  </button>
                </div>

                {/* Chat messages */}
                <div className="flex-1 overflow-y-auto veltra-scrollbar p-4 space-y-2">
                  {selectedMessages.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageCircle className="h-5 w-5 text-muted-foreground/40 mx-auto mb-3" />
                      <p className="text-micro text-muted-foreground/60 normal-case tracking-normal">No messages yet. Start the conversation below.</p>
                    </div>
                  ) : (
                    selectedMessages.map((msg) => (
                      <div key={msg.id} className={cn("flex", msg.direction === "outbound" ? "justify-end" : "justify-start")}>
                        <div className={cn(
                          "max-w-[75%] rounded-2xl px-3 py-2",
                          msg.direction === "outbound" ? "bg-veltra-emerald/15 text-foreground rounded-br-md" : "bg-foreground/[0.05] text-foreground rounded-bl-md"
                        )}>
                          <p className="text-caption text-foreground leading-relaxed">{msg.message}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-micro text-muted-foreground/50 normal-case tracking-normal">{formatRelativeTime(msg.timestamp)}</span>
                            {msg.direction === "outbound" && (
                              <span className="text-micro text-blue-400 normal-case tracking-normal">{msg.status === "read" ? "✓✓" : "✓"}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Reply input */}
                <div className="border-t border-border/30 p-3 bg-foreground/[0.02]">
                  <div className="flex items-end gap-2">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={`Reply to ${selectedPatient.name.split(" ")[0]}...`}
                      rows={1}
                      className="flex-1 px-3 py-2 rounded-lg bg-background/50 border border-border/30 text-body text-foreground placeholder:text-muted-foreground/50 resize-none outline-none focus:ring-1 focus:ring-veltra-emerald/30 max-h-24"
                      style={{ minHeight: "40px" }}
                    />
                    <Button
                      onClick={handleReply}
                      disabled={!replyText.trim()}
                      className="h-10 px-4 bg-veltra-emerald hover:bg-veltra-emerald-dark text-white flex-shrink-0"
                      aria-label="Send message"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-micro text-muted-foreground/40 normal-case tracking-normal mt-1.5">Press Enter to send · Shift+Enter for new line</p>
                </div>
              </div>
            ) : (
              <div className="hidden sm:flex flex-1 items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="h-6 w-6 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-caption text-muted-foreground/60">Select a patient to view conversation</p>
                </div>
              </div>
            )}
          </div>
        </FadeIn>

        {/* Mobile: show selected patient messages below list */}
        {selectedPatient && (
          <div className="sm:hidden mt-4">
            <div className="rounded-2xl veltra-shadow border border-border/30 bg-card/50 backdrop-blur-sm overflow-hidden">
              <div className="flex items-center gap-3 p-3 border-b border-border/30">
                <p className="text-body font-medium text-foreground">{selectedPatient.name}</p>
              </div>
              <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto veltra-scrollbar">
                {selectedMessages.map((msg) => (
                  <div key={msg.id} className={cn("flex", msg.direction === "outbound" ? "justify-end" : "justify-start")}>
                    <div className={cn("max-w-[80%] rounded-2xl px-3 py-2", msg.direction === "outbound" ? "bg-veltra-emerald/15 text-foreground" : "bg-foreground/[0.05] text-foreground")}>
                      <p className="text-caption text-foreground leading-relaxed">{msg.message}</p>
                      <span className="text-micro text-muted-foreground/50 normal-case tracking-normal">{formatRelativeTime(msg.timestamp)}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-border/30 p-3">
                <div className="flex items-end gap-2">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Reply to ${selectedPatient.name.split(" ")[0]}...`}
                    rows={1}
                    className="flex-1 px-3 py-2 rounded-lg bg-background/50 border border-border/30 text-body text-foreground placeholder:text-muted-foreground/50 resize-none outline-none"
                  />
                  <Button onClick={handleReply} disabled={!replyText.trim()} className="h-10 px-4 bg-veltra-emerald hover:bg-veltra-emerald-dark text-white">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ===== Availability (Doctor Hours) Screen — Editable schedules =====
export function AvailabilityScreen() {
  const doctorHours = useVeltra((s) => s.doctorHours);
  const updateDoctorHours = useVeltra((s) => s.updateDoctorHours);
  const currentUser = useVeltra((s) => s.currentUser);
  const users = useVeltra((s) => s.users);
  const { toast } = useToast();

  const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
  const DAY_LABELS: Record<string, string> = { monday: "Mon", tuesday: "Tue", wednesday: "Wed", thursday: "Thu", friday: "Fri", saturday: "Sat", sunday: "Sun" };

  // Permission logic
  const isAdmin = currentUser?.role === "admin";
  const isDoctor = currentUser?.role === "doctor";
  const myDoctorId = isDoctor ? currentUser?.id : null;

  // Doctors can edit only their own schedule; admins can edit all
  const canEdit = (doctorId: string) => isAdmin || (isDoctor && doctorId === myDoctorId);

  // Find current doctor's schedule (for doctors viewing their own)
  const mySchedule = isDoctor ? doctorHours.find((d) => d.doctorId === myDoctorId) : null;

  const handleToggleDay = (doctorId: string, day: string, currentHours: { start: string; end: string } | null) => {
    if (currentHours) {
      // Turn off
      updateDoctorHours(doctorId, { [day]: null } as any);
      toast({ title: `${DAY_LABELS[day]} — Off`, description: "Day marked as unavailable." });
    } else {
      // Turn on with default hours
      updateDoctorHours(doctorId, { [day]: { start: "09:00", end: "17:00" } } as any);
      toast({ title: `${DAY_LABELS[day]} — On`, description: "Default hours set: 09:00–17:00" });
    }
  };

  const handleTimeChange = (doctorId: string, day: string, field: "start" | "end", value: string) => {
    const dh = doctorHours.find((d) => d.doctorId === doctorId);
    if (!dh) return;
    const currentDay = dh[day as keyof DoctorHours] as { start: string; end: string } | null;
    if (!currentDay) return;
    updateDoctorHours(doctorId, { [day]: { ...currentDay, [field]: value } } as any);
  };

  return (
    <div className="min-h-screen veltra-ambient">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <FadeIn>
          <header className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-3.5 w-3.5 text-veltra-emerald" />
              <span className="text-micro text-veltra-emerald">Doctor Availability</span>
            </div>
            <h1 className="text-[2rem] sm:text-[2.5rem] leading-[1.05] tracking-[-0.035em] text-foreground font-semibold">
              <span className="text-editorial-italic text-muted-foreground">Working</span> hours.
            </h1>
            <p className="text-body text-muted-foreground mt-2">
              {doctorHours.length} doctors · schedules configured
              {isDoctor && <span className="text-veltra-emerald"> · editing your schedule</span>}
              {isAdmin && <span className="text-veltra-emerald"> · admin access (edit all)</span>}
            </p>
          </header>
        </FadeIn>

        {/* If doctor: show ONLY own schedule */}
        {isDoctor && mySchedule && (
          <FadeIn delay={0.05}>
            <Card className="p-5 sm:p-6 mb-6 veltra-shadow-lg border-0 bg-card/50 backdrop-blur-sm ring-1 ring-veltra-emerald/20">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-micro text-veltra-emerald mb-1">Your Schedule</p>
                  <h3 className="text-title text-foreground">{mySchedule.doctorName}</h3>
                </div>
                <span className="text-micro text-veltra-emerald bg-veltra-emerald/10 px-3 py-1 rounded-full normal-case tracking-normal">Editable</span>
              </div>
              <EditableSchedule
                doctorId={mySchedule.doctorId}
                doctorName={mySchedule.doctorName}
                doctorHours={mySchedule}
                days={DAYS}
                dayLabels={DAY_LABELS}
                canEdit={true}
                onToggleDay={handleToggleDay}
                onTimeChange={handleTimeChange}
              />
            </Card>
          </FadeIn>
        )}

        {/* Admin: show ALL doctors' schedules (editable) */}
        {/* Doctors do NOT see other doctors' schedules */}
        {isAdmin && (
          <StaggerGroup>
            {doctorHours.map((dh) => (
              <StaggerItem key={dh.doctorId}>
                <Card className="p-5 sm:p-6 mb-4 veltra-shadow border-0 bg-card/50 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-blue-500/15 text-blue-300 flex items-center justify-center text-caption font-semibold">
                        {dh.doctorName.trim().split(/\s+/).map((n) => n[0] || "").filter(Boolean).slice(0, 2).join("")}
                      </div>
                      <h3 className="text-title text-foreground">{dh.doctorName}</h3>
                    </div>
                    <span className="text-micro text-veltra-emerald bg-veltra-emerald/10 px-3 py-1 rounded-full normal-case tracking-normal">Editable</span>
                  </div>
                  <EditableSchedule
                    doctorId={dh.doctorId}
                    doctorName={dh.doctorName}
                    doctorHours={dh}
                    days={DAYS}
                    dayLabels={DAY_LABELS}
                    canEdit={true}
                    onToggleDay={handleToggleDay}
                    onTimeChange={handleTimeChange}
                  />
                </Card>
              </StaggerItem>
            ))}
          </StaggerGroup>
        )}

        {/* Non-doctor, non-admin: show all schedules read-only */}
        {!isDoctor && !isAdmin && (
          <StaggerGroup>
            {doctorHours.map((dh) => (
              <StaggerItem key={dh.doctorId}>
                <Card className="p-5 sm:p-6 mb-4 veltra-shadow border-0 bg-card/50 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-blue-500/15 text-blue-300 flex items-center justify-center text-caption font-semibold">
                        {dh.doctorName.trim().split(/\s+/).map((n) => n[0] || "").filter(Boolean).slice(0, 2).join("")}
                      </div>
                      <h3 className="text-title text-foreground">{dh.doctorName}</h3>
                    </div>
                    <span className="text-micro text-muted-foreground/50 normal-case tracking-normal">View only</span>
                  </div>
                  <EditableSchedule
                    doctorId={dh.doctorId}
                    doctorName={dh.doctorName}
                    doctorHours={dh}
                    days={DAYS}
                    dayLabels={DAY_LABELS}
                    canEdit={false}
                    onToggleDay={handleToggleDay}
                    onTimeChange={handleTimeChange}
                  />
                </Card>
              </StaggerItem>
            ))}
          </StaggerGroup>
        )}

        {/* Permission info */}
        <FadeIn delay={0.2}>
          <div className="mt-6 p-4 rounded-xl bg-foreground/[0.02] border border-border/20">
            <p className="text-micro text-muted-foreground/70 normal-case tracking-normal leading-relaxed">
              {isAdmin && "As Admin, you can edit all doctors' schedules. Changes save automatically."}
              {isDoctor && "You can edit your own schedule. Take days off or adjust hours as needed."}
              {!isAdmin && !isDoctor && "Schedules are view-only for your role. Ask an admin or doctor to make changes."}
            </p>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}

// ===== Editable Schedule Component =====
function EditableSchedule({
  doctorId,
  doctorName,
  doctorHours,
  days,
  dayLabels,
  canEdit,
  onToggleDay,
  onTimeChange,
}: {
  doctorId: string;
  doctorName: string;
  doctorHours: DoctorHours;
  days: readonly string[];
  dayLabels: Record<string, string>;
  canEdit: boolean;
  onToggleDay: (doctorId: string, day: string, current: { start: string; end: string } | null) => void;
  onTimeChange: (doctorId: string, day: string, field: "start" | "end", value: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
      {days.map((day) => {
        const hours = doctorHours[day as keyof DoctorHours] as { start: string; end: string } | null;
        const isOn = !!hours;
        return (
          <div
            key={day}
            className={cn(
              "rounded-lg p-3 text-center veltra-transition",
              isOn ? "bg-veltra-emerald/5" : "bg-foreground/[0.03]"
            )}
          >
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <p className="text-micro text-muted-foreground">{dayLabels[day]}</p>
              {canEdit && (
                <button
                  onClick={() => onToggleDay(doctorId, day, hours)}
                  className={cn(
                    "relative w-7 h-4 rounded-full veltra-transition cursor-pointer",
                    isOn ? "bg-veltra-emerald" : "bg-foreground/20"
                  )}
                  aria-label={`Toggle ${dayLabels[day]}`}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 h-3 w-3 rounded-full bg-white veltra-transition",
                      isOn ? "left-3.5" : "left-0.5"
                    )}
                  />
                </button>
              )}
            </div>
            {isOn ? (
              canEdit ? (
                <div className="space-y-1">
                  <input
                    type="time"
                    value={hours.start}
                    onChange={(e) => onTimeChange(doctorId, day, "start", e.target.value)}
                    className="w-full h-7 px-1 rounded bg-background/50 border border-border/30 text-caption text-foreground text-center tabular outline-none focus:ring-1 focus:ring-veltra-emerald/30"
                  />
                  <p className="text-micro text-muted-foreground/40 normal-case tracking-normal">to</p>
                  <input
                    type="time"
                    value={hours.end}
                    onChange={(e) => onTimeChange(doctorId, day, "end", e.target.value)}
                    className="w-full h-7 px-1 rounded bg-background/50 border border-border/30 text-caption text-foreground text-center tabular outline-none focus:ring-1 focus:ring-veltra-emerald/30"
                  />
                </div>
              ) : (
                <>
                  <p className="text-caption font-medium text-foreground tabular">{hours.start}</p>
                  <p className="text-micro text-muted-foreground/60 normal-case tracking-normal">to</p>
                  <p className="text-caption font-medium text-foreground tabular">{hours.end}</p>
                </>
              )
            ) : (
              <p className="text-micro text-muted-foreground/40 normal-case tracking-normal mt-1">Off</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ===== Recurring Appointments Screen =====
export function RecurringScreen() {
  const recurring = useVeltra((s) => s.recurringPatterns);
  const patients = useVeltra((s) => s.patients);
  const createRecurring = useVeltra((s) => s.createRecurring);
  const toggleRecurring = useVeltra((s) => s.toggleRecurring);
  const selectPatient = useVeltra((s) => s.selectPatient);
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ patientId: "", type: "", frequency: "quarterly" as "weekly" | "monthly" | "quarterly" | "custom", intervalDays: "90", doctor: "Dr. Sarah" });

  const handleAdd = () => {
    if (!form.patientId || !form.type) { toast({ title: "Missing fields", variant: "destructive" }); return; }
    const patient = patients.find((p) => p.id === form.patientId);
    createRecurring({
      patientId: form.patientId, patientName: patient?.name || "", type: form.type,
      frequency: form.frequency, intervalDays: Number(form.intervalDays),
      nextDate: new Date(Date.now() + Number(form.intervalDays) * 86400000).toISOString(),
      doctor: form.doctor,
    });
    setDialogOpen(false); setForm({ patientId: "", type: "", frequency: "quarterly", intervalDays: "90", doctor: "Dr. Sarah" });
    toast({ title: "Recurring appointment created ✓" });
  };

  return (
    <div className="min-h-screen veltra-ambient">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-8 sm:py-10 md:px-12 md:py-14">
        <FadeIn>
          <header className="mb-10">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <RefreshCw className="h-3.5 w-3.5 text-veltra-emerald" />
                  <span className="text-micro text-veltra-emerald">Recurring Appointments</span>
                </div>
                <h1 className="text-[2.5rem] leading-[1.05] tracking-[-0.035em] text-foreground font-semibold">
                  <span className="text-editorial-italic text-muted-foreground">They come</span>{" "}
                  back.
                </h1>
                <p className="text-body text-muted-foreground mt-3">{recurring.filter((r) => r.active).length} active · {recurring.filter((r) => !r.active).length} paused</p>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="h-10 px-5 bg-veltra-emerald hover:bg-veltra-emerald-dark text-white"><Plus className="mr-1.5 h-4 w-4" /> New</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md veltra-shadow-lg">
                  <DialogHeader><DialogTitle className="text-title">Create recurring appointment</DialogTitle></DialogHeader>
                  <div className="space-y-3 py-2">
                    <div className="space-y-1.5">
                      <Label className="text-micro text-muted-foreground">Patient</Label>
                      <Select value={form.patientId} onValueChange={(v) => setForm({ ...form, patientId: v })}>
                        <SelectTrigger className="h-10"><SelectValue placeholder="Select..." /></SelectTrigger>
                        <SelectContent>{patients.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label className="text-micro text-muted-foreground">Type</Label><Input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="Diabetic Follow-up" className="h-10 mt-1" /></div>
                      <div className="space-y-1.5">
                        <Label className="text-micro text-muted-foreground">Frequency</Label>
                        <Select value={form.frequency} onValueChange={(v) => { const days = { weekly: "7", monthly: "30", quarterly: "90", custom: "45" } as Record<string, string>; setForm({ ...form, frequency: v as any, intervalDays: days[v] }); }}>
                          <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="weekly">Weekly</SelectItem><SelectItem value="monthly">Monthly</SelectItem><SelectItem value="quarterly">Quarterly</SelectItem><SelectItem value="custom">Custom</SelectItem></SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="ghost" onClick={() => setDialogOpen(false)} className="h-10">Cancel</Button>
                    <Button onClick={handleAdd} className="h-10 bg-veltra-emerald hover:bg-veltra-emerald-dark text-white">Create</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </header>
        </FadeIn>

        <StaggerGroup>
          <Card className="veltra-shadow border-0 bg-card/50 backdrop-blur-sm overflow-hidden">
            {recurring.map((rec, idx) => (
              <StaggerItem key={rec.id}>
                <div className={cn("flex items-center gap-4 px-6 py-4 veltra-transition hover:bg-foreground/[0.03]", idx !== recurring.length - 1 && "border-b border-border/40", !rec.active && "opacity-50")}>
                  <RefreshCw className={cn("h-4 w-4 flex-shrink-0", rec.active ? "text-veltra-emerald" : "text-muted-foreground")} />
                  <button onClick={() => selectPatient(rec.patientId)} className="flex-1 min-w-0 text-left group">
                    <p className="text-body font-medium text-foreground truncate group-hover:text-veltra-emerald veltra-transition">{rec.patientName}</p>
                    <p className="text-caption text-muted-foreground">{rec.type} · every {rec.intervalDays} days · {rec.doctor}</p>
                  </button>
                  <div className="text-right flex-shrink-0">
                    <p className="text-micro text-muted-foreground normal-case tracking-normal">Next</p>
                    <p className="text-caption font-medium text-foreground tabular">{formatDate(rec.nextDate)}</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => { toggleRecurring(rec.id); toast({ title: rec.active ? "Paused" : "Resumed" }); }} className="h-7 px-2 text-caption text-muted-foreground hover:text-foreground">
                    {rec.active ? "Pause" : "Resume"}
                  </Button>
                </div>
              </StaggerItem>
            ))}
          </Card>
        </StaggerGroup>
      </div>
    </div>
  );
}

// ===== Documents Screen =====
export function DocumentsScreen() {
  const documents = useVeltra((s) => s.documents);
  const patients = useVeltra((s) => s.patients);
  const uploadDocument = useVeltra((s) => s.uploadDocument);
  const selectPatient = useVeltra((s) => s.selectPatient);
  const currentUser = useVeltra((s) => s.currentUser);
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ patientId: "", name: "", type: "lab-report" as VeltraDocument["type"], size: "1.2 MB" });

  const handleUpload = () => {
    if (!form.patientId || !form.name) { toast({ title: "Missing fields", variant: "destructive" }); return; }
    const patient = patients.find((p) => p.id === form.patientId);
    uploadDocument({ patientId: form.patientId, patientName: patient?.name || "", name: form.name, type: form.type, uploadedBy: currentUser?.name || "Unknown", size: form.size });
    setDialogOpen(false); setForm({ patientId: "", name: "", type: "lab-report", size: "1.2 MB" });
    toast({ title: "Document uploaded ✓" });
  };

  return (
    <div className="min-h-screen veltra-ambient">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-8 sm:py-10 md:px-12 md:py-14">
        <FadeIn>
          <header className="mb-10">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-3.5 w-3.5 text-veltra-emerald" />
                  <span className="text-micro text-veltra-emerald">Documents</span>
                </div>
                <h1 className="text-[2.5rem] leading-[1.05] tracking-[-0.035em] text-foreground font-semibold">
                  <span className="text-editorial-italic text-muted-foreground">Every file,</span>{" "}
                  in place.
                </h1>
                <p className="text-body text-muted-foreground mt-3">{documents.length} documents · {new Set(documents.map((d) => d.patientId)).size} patients</p>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="h-10 px-5 bg-veltra-emerald hover:bg-veltra-emerald-dark text-white"><Plus className="mr-1.5 h-4 w-4" /> Upload</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md veltra-shadow-lg">
                  <DialogHeader><DialogTitle className="text-title">Upload document</DialogTitle></DialogHeader>
                  <div className="space-y-3 py-2">
                    <div className="space-y-1.5">
                      <Label className="text-micro text-muted-foreground">Patient</Label>
                      <Select value={form.patientId} onValueChange={(v) => setForm({ ...form, patientId: v })}>
                        <SelectTrigger className="h-10"><SelectValue placeholder="Select..." /></SelectTrigger>
                        <SelectContent>{patients.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label className="text-micro text-muted-foreground">File name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="X-Ray.jpg" className="h-10 mt-1" /></div>
                      <div className="space-y-1.5">
                        <Label className="text-micro text-muted-foreground">Type</Label>
                        <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as VeltraDocument["type"] })}>
                          <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="xray">X-Ray</SelectItem><SelectItem value="lab-report">Lab Report</SelectItem><SelectItem value="prescription">Prescription</SelectItem><SelectItem value="consent">Consent</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="ghost" onClick={() => setDialogOpen(false)} className="h-10">Cancel</Button>
                    <Button onClick={handleUpload} className="h-10 bg-veltra-emerald hover:bg-veltra-emerald-dark text-white">Upload</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </header>
        </FadeIn>

        <StaggerGroup>
          <Card className="veltra-shadow border-0 bg-card/50 backdrop-blur-sm overflow-hidden">
            {documents.map((doc, idx) => (
              <div key={doc.id} className={cn("flex items-center gap-4 px-6 py-4 veltra-transition hover:bg-foreground/[0.03]", idx !== documents.length - 1 && "border-b border-border/40")}>
                  <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-foreground/[0.05] flex items-center justify-center text-lg">
                    {DOC_TYPE_ICON[doc.type]}
                  </div>
                  <button onClick={() => selectPatient(doc.patientId)} className="flex-1 min-w-0 text-left group">
                    <p className="text-body font-medium text-foreground truncate group-hover:text-veltra-emerald veltra-transition">{doc.name}</p>
                    <p className="text-caption text-muted-foreground truncate">{doc.patientName} · {doc.uploadedBy} · {formatDate(doc.uploadedAt)}</p>
                  </button>
                  <span className="text-caption text-muted-foreground tabular flex-shrink-0">{doc.size}</span>
                  <Badge variant="outline" className="text-micro font-medium border bg-foreground/[0.05] text-muted-foreground normal-case tracking-normal">{doc.type.replace("-", " ")}</Badge>
              </div>
            ))}
          </Card>
        </StaggerGroup>
      </div>
    </div>
  );
}
