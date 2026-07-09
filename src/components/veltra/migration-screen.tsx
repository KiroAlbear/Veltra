"use client";

/**
 * VELTRA Switch — Migration Center
 *
 * THE killer sales feature. Most clinics won't switch software because of data
 * migration fear. This feature removes that barrier.
 *
 * Flow:
 *   1. Doctor uploads files (Excel/CSV from old system, PDFs, images, exports)
 *   2. VELTRA runs the migration pipeline (simulated for demo):
 *      Upload → Parse → Match → Validate → Review
 *   3. Live counter animates as "patients found", "visits found", etc.
 *   4. Review screen shows extracted data with confidence scores
 *   5. Doctor clicks "Migrate to Veltra" — boom, done.
 *
 * In production: real OCR + LLM extraction + FHIR/HL7 mapping.
 * For demo: realistic simulated pipeline with believable numbers.
 *
 * This is what makes a doctor say: "We'll buy VELTRA."
 */
import { useState, useCallback, useRef } from "react";
import { useVeltra } from "@/lib/veltra-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  FileUp,
  FileSpreadsheet,
  FileText,
  X,
  Check,
  Loader2,
  Sparkles,
  ArrowRight,
  Database,
  Users,
  Calendar,
  FlaskConical,
  Pill,
  DollarSign,
  TrendingUp,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { FadeIn, StaggerGroup, StaggerItem } from "./motion";

type Stage = "upload" | "processing" | "review" | "done";

type PipelineStage = {
  id: string;
  label: string;
  status: "pending" | "running" | "complete";
  description: string;
};

type MigrationStat = {
  label: string;
  value: number;
  target: number;
  icon: React.ElementType;
  tint: string;
};

const PIPELINE_STAGES: PipelineStage[] = [
  { id: "upload",     label: "File received",            status: "pending", description: "Excel/CSV/PDF uploaded" },
  { id: "parse",      label: "Parsing rows",             status: "pending", description: "Reading spreadsheet rows" },
  { id: "match",      label: "Entity matching",          status: "pending", description: "Identifying patients, visits, labs" },
  { id: "validate",   label: "Validation",               status: "pending", description: "Cross-checking field types" },
  { id: "normalize",  label: "Normalization",            status: "pending", description: "Standardizing units & codes" },
];

// Demo extracted data — what the migration pipeline "finds"
const DEMO_STATS: MigrationStat[] = [
  { label: "Patients Imported",      value: 0, target: 382,   icon: Users,        tint: "text-emerald-400" },
  { label: "Visits / Appointments",  value: 0, target: 1924,  icon: Calendar,     tint: "text-violet-400" },
  { label: "Lab Results",            value: 0, target: 14002, icon: FlaskConical, tint: "text-cyan-400" },
  { label: "Prescriptions",          value: 0, target: 1832,  icon: Pill,         tint: "text-rose-400" },
  { label: "Invoices",               value: 0, target: 2443,  icon: DollarSign,   tint: "text-amber-400" },
  { label: "Documents / Files",      value: 0, target: 1842,  icon: FileText,     tint: "text-blue-400" },
];

const SAMPLE_REVIEW_ROWS = [
  { mrn: "PT-001", name: "Ahmed Hassan",     age: 54, gender: "M", phone: "+966 50 123 4567", conditions: "Diabetic, Hypertension",    confidence: 99 },
  { mrn: "PT-002", name: "Fatima Al-Zahra",  age: 32, gender: "F", phone: "+966 55 987 6543", conditions: "Hypothyroidism",            confidence: 97 },
  { mrn: "PT-003", name: "Khalid Al-Otaibi", age: 61, gender: "M", phone: "+966 53 444 2211", conditions: "Hypertension, High Cholesterol", confidence: 98 },
  { mrn: "PT-004", name: "Noura Al-Saud",    age: 28, gender: "F", phone: "+966 56 222 3344", conditions: "Migraine",                  confidence: 95 },
  { mrn: "PT-005", name: "Yusuf Al-Ghamdi",  age: 7,  gender: "M", phone: "+966 50 888 7777", conditions: "Asthma",                    confidence: 92 },
];

export function MigrationScreen() {
  const [stage, setStage] = useState<Stage>("upload");
  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<string>("");
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>(PIPELINE_STAGES);
  const [stats, setStats] = useState<MigrationStat[]>(DEMO_STATS);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const setView = useVeltra((s) => s.setView);
  const logAction = useVeltra((s) => s.logAction);
  const addPatientNote = useVeltra((s) => s.addPatientNote);
  const patients = useVeltra((s) => s.patients);

  const handleFileSelected = useCallback((file: File) => {
    setFileName(file.name);
    setFileSize(file.size > 1024 * 1024 ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB`);
    setStage("processing");
    setPipelineStages(PIPELINE_STAGES.map((s) => ({ ...s, status: "pending" })));
    setStats(DEMO_STATS.map((s) => ({ ...s, value: 0 })));

    // Run pipeline stages sequentially
    const stageDurations = [800, 2200, 2400, 1200, 800];
    let elapsed = 0;

    stageDurations.forEach((dur, idx) => {
      setTimeout(() => {
        setPipelineStages((prev) => prev.map((s, i) => i === idx ? { ...s, status: "running" } : s));
      }, elapsed);

      // During "match" stage (idx=2), animate the stat counters
      if (idx === 2) {
        const matchStart = elapsed;
        const matchDuration = dur;
        const steps = 20;
        const stepDuration = matchDuration / steps;
        for (let i = 1; i <= steps; i++) {
          setTimeout(() => {
            setStats((prev) => prev.map((s) => ({
              ...s,
              value: Math.round((s.target * i) / steps),
            })));
          }, matchStart + stepDuration * i);
        }
      }

      elapsed += dur;
      setTimeout(() => {
        setPipelineStages((prev) => prev.map((s, i) => i === idx ? { ...s, status: "complete" } : s));
      }, elapsed);
    });

    setTimeout(() => {
      setStage("review");
      toast({
        title: "Migration analysis complete",
        description: `${DEMO_STATS.reduce((s, x) => s + x.target, 0).toLocaleString()} records identified`,
      });
    }, elapsed + 200);
  }, [toast]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelected(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelected(file);
  };

  const commitMigration = () => {
    logAction?.("Added patient note", `Migration committed — ${DEMO_STATS[0].target} patients from ${fileName}`);
    // Add a note to first patient as a record
    const firstPatient = patients[0];
    if (firstPatient) {
      addPatientNote(firstPatient.id, `VELTRA Switch migration completed — ${DEMO_STATS[0].target} patients imported from legacy system (${fileName})`);
    }
    setStage("done");
    toast({
      title: "Migration complete ✓",
      description: `${DEMO_STATS[0].target} patients now live in VELTRA`,
    });
  };

  const reset = () => {
    setStage("upload");
    setFileName("");
    setFileSize("");
    setPipelineStages(PIPELINE_STAGES.map((s) => ({ ...s, status: "pending" })));
    setStats(DEMO_STATS.map((s) => ({ ...s, value: 0 })));
  };

  const totalRecords = stats.reduce((s, x) => s + x.value, 0);
  const totalTarget = DEMO_STATS.reduce((s, x) => s + x.target, 0);

  return (
    <div className="min-h-screen veltra-ambient">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-8 sm:py-10 md:px-12 md:py-14">
        <FadeIn>
          <header className="mb-10">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-3.5 w-3.5 text-veltra-emerald" />
              <span className="text-micro text-veltra-emerald">VELTRA Switch — Migration Center</span>
            </div>
            <h1 className="text-[2.5rem] leading-[1.05] tracking-[-0.035em] text-foreground font-semibold">
              <span className="text-editorial-italic text-muted-foreground">Move your clinic</span>{" "}
              in an hour.
            </h1>
            <p className="text-body text-muted-foreground mt-3 max-w-2xl leading-relaxed">
              Upload your data from any system — Excel, CSV, PDF, scanned images, or exports from
              legacy software. VELTRA's AI extracts every patient, visit, lab, and prescription.
              Your clinic is live in VELTRA before lunch.
            </p>

            <div className="flex flex-wrap gap-3 mt-5">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md veltra-glass">
                <Database className="h-3.5 w-3.5 text-veltra-emerald" />
                <span className="text-caption text-muted-foreground normal-case tracking-normal">
                  <strong className="text-foreground">382 patients</strong> in 10 min · avg
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md veltra-glass">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-caption text-muted-foreground normal-case tracking-normal">
                  <strong className="text-foreground">98.7%</strong> AI accuracy
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md veltra-glass">
                <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                <span className="text-caption text-muted-foreground normal-case tracking-normal">
                  <strong className="text-foreground">Zero data loss</strong> · review before commit
                </span>
              </div>
            </div>
          </header>
        </FadeIn>

        <AnimatePresence mode="wait">
          {/* ===== STAGE 1: UPLOAD ===== */}
          {stage === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <Card
                className="p-12 veltra-shadow border-2 border-dashed border-border/60 bg-card/40 backdrop-blur-sm text-center cursor-pointer hover:border-veltra-emerald/60 hover:bg-veltra-emerald/[0.02] veltra-transition"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".xlsx,.xls,.csv,.pdf,.jpg,.jpeg,.png,.docx"
                  onChange={handleFileInput}
                />
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="mx-auto h-16 w-16 rounded-2xl bg-veltra-emerald/10 flex items-center justify-center mb-5"
                >
                  <FileSpreadsheet className="h-7 w-7 text-veltra-emerald" />
                </motion.div>
                <p className="text-body font-medium text-foreground mb-1">
                  Drop your Excel, CSV, or PDF here
                </p>
                <p className="text-caption text-muted-foreground">
                  Export from any system — we'll do the rest
                </p>
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button className="h-9 px-4 bg-veltra-emerald hover:bg-veltra-emerald-dark text-white text-caption font-medium">
                    <FileUp className="mr-1.5 h-3.5 w-3.5" />
                    Select file to migrate
                  </Button>
                </div>
              </Card>

              {/* What we extract */}
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {DEMO_STATS.slice(0, 6).map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="flex items-center gap-3 p-4 rounded-lg veltra-glass">
                      <Icon className={cn("h-4 w-4 flex-shrink-0", stat.tint)} />
                      <div className="flex-1 min-w-0">
                        <p className="text-caption font-medium text-foreground">{stat.label}</p>
                        <p className="text-micro text-muted-foreground/70 normal-case tracking-normal">
                          extracted automatically
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* How it works */}
              <Card className="p-6 mt-8 veltra-shadow border-0 bg-card/40 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-3.5 w-3.5 text-veltra-emerald" />
                  <p className="text-micro text-veltra-emerald font-medium uppercase tracking-wider">
                    How VELTRA Switch works
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                  {[
                    { step: "1", title: "Upload", desc: "Excel, CSV, PDF, or images" },
                    { step: "2", title: "Parse", desc: "AI reads every row/page" },
                    { step: "3", title: "Match", desc: "Identify patients, visits, labs" },
                    { step: "4", title: "Review", desc: "You approve every record" },
                    { step: "5", title: "Go Live", desc: "Clinic running in VELTRA" },
                  ].map((s) => (
                    <div key={s.step} className="flex items-start gap-2.5">
                      <div className="h-6 w-6 rounded-full bg-veltra-emerald/15 flex items-center justify-center flex-shrink-0">
                        <span className="text-micro font-semibold text-veltra-emerald">{s.step}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-caption font-medium text-foreground">{s.title}</p>
                        <p className="text-micro text-muted-foreground/70 normal-case tracking-normal leading-relaxed">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* ===== STAGE 2: PROCESSING ===== */}
          {stage === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <Card className="p-8 veltra-shadow border-0 bg-card/50 backdrop-blur-sm">
                {/* File preview */}
                <div className="flex items-center gap-3 pb-5 border-b border-border/40 mb-5">
                  <div className="h-10 w-10 rounded-md bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                    <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body font-medium text-foreground truncate">{fileName}</p>
                    <p className="text-micro text-muted-foreground normal-case tracking-normal">{fileSize} · migrating</p>
                  </div>
                  <Loader2 className="h-4 w-4 text-veltra-emerald animate-spin" />
                </div>

                {/* Live stat counter */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                  {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <motion.div
                        key={stat.label}
                        className="p-3 rounded-md veltra-glass"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className={cn("h-3.5 w-3.5", stat.tint)} />
                          <p className="text-micro text-muted-foreground normal-case tracking-normal truncate">
                            {stat.label}
                          </p>
                        </div>
                        <p className={cn("text-title font-bold tabular", stat.tint)}>
                          {stat.value.toLocaleString()}
                          <span className="text-micro text-muted-foreground/50 ml-1.5 normal-case tracking-normal">
                            / {stat.target.toLocaleString()}
                          </span>
                        </p>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Pipeline stages */}
                <StaggerGroup className="space-y-3">
                  {pipelineStages.map((s) => (
                    <StaggerItem key={s.id}>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 veltra-transition",
                          s.status === "complete" && "bg-emerald-500/15",
                          s.status === "running" && "bg-veltra-emerald/15",
                          s.status === "pending" && "bg-foreground/[0.04]"
                        )}>
                          {s.status === "complete" ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                          ) : s.status === "running" ? (
                            <Loader2 className="h-3.5 w-3.5 text-veltra-emerald animate-spin" />
                          ) : (
                            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "text-caption font-medium",
                            s.status === "pending" ? "text-muted-foreground/60" : "text-foreground"
                          )}>
                            {s.label}
                          </p>
                          <p className="text-micro text-muted-foreground/70 normal-case tracking-normal">
                            {s.description}
                          </p>
                        </div>
                        {s.status === "running" && (
                          <span className="text-micro text-veltra-emerald normal-case tracking-normal flex items-center gap-1">
                            <span className="veltra-live-dot" /> working
                          </span>
                        )}
                        {s.status === "complete" && (
                          <span className="text-micro text-emerald-400 normal-case tracking-normal">✓ done</span>
                        )}
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerGroup>

                <p className="text-center text-micro text-muted-foreground/60 normal-case tracking-normal mt-6 italic">
                  Analyzing {totalTarget.toLocaleString()} records — usually 5–10 minutes for a typical clinic export.
                </p>
              </Card>
            </motion.div>
          )}

          {/* ===== STAGE 3: REVIEW ===== */}
          {stage === "review" && (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Summary banner */}
              <Card className="p-5 mb-5 veltra-shadow border-0 bg-card/50 backdrop-blur-sm">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="h-12 w-12 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-body font-semibold text-foreground">
                        {totalTarget.toLocaleString()} records ready to migrate
                      </p>
                      <p className="text-caption text-muted-foreground">
                        <span className="text-emerald-400 font-medium">98.7% AI accuracy</span>
                        <span className="mx-2">·</span>
                        5 patients need review
                        <span className="mx-2">·</span>
                        <span className="text-veltra-emerald">Review sample below</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={reset} className="h-9 text-caption veltra-shadow border-0 bg-foreground/[0.04]">
                      <X className="mr-1.5 h-3.5 w-3.5" />
                      Cancel
                    </Button>
                    <Button size="sm" onClick={commitMigration} className="h-9 px-4 bg-veltra-emerald hover:bg-veltra-emerald-dark text-white text-caption font-medium">
                      <Check className="mr-1.5 h-3.5 w-3.5" />
                      Migrate to Veltra
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Sample patient rows */}
              <Card className="p-5 mb-5 veltra-shadow border-0 bg-card/50 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="h-3.5 w-3.5 text-veltra-emerald" />
                  <p className="text-micro text-veltra-emerald font-medium uppercase tracking-wider">
                    Sample — first 5 patients
                  </p>
                </div>
                <div className="overflow-x-auto -mx-2">
                  <table className="w-full text-caption">
                    <thead>
                      <tr className="text-micro text-muted-foreground uppercase tracking-wider">
                        <th className="text-left px-2 py-2">MRN</th>
                        <th className="text-left px-2 py-2">Name</th>
                        <th className="text-left px-2 py-2">Age/Sex</th>
                        <th className="text-left px-2 py-2 hidden sm:table-cell">Phone</th>
                        <th className="text-left px-2 py-2 hidden md:table-cell">Conditions</th>
                        <th className="text-right px-2 py-2">Confidence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {SAMPLE_REVIEW_ROWS.map((row) => (
                        <tr key={row.mrn} className="border-t border-border/30">
                          <td className="px-2 py-2.5 text-muted-foreground tabular">{row.mrn}</td>
                          <td className="px-2 py-2.5 font-medium text-foreground">{row.name}</td>
                          <td className="px-2 py-2.5 text-muted-foreground">{row.age}/{row.gender}</td>
                          <td className="px-2 py-2.5 text-muted-foreground hidden sm:table-cell tabular">{row.phone}</td>
                          <td className="px-2 py-2.5 text-muted-foreground hidden md:table-cell">{row.conditions}</td>
                          <td className="px-2 py-2.5 text-right">
                            <span className={cn(
                              "text-micro font-semibold tabular px-1.5 py-0.5 rounded",
                              row.confidence >= 95 ? "text-emerald-400 bg-emerald-500/10" :
                              row.confidence >= 85 ? "text-amber-400 bg-amber-500/10" :
                              "text-red-400 bg-red-500/10"
                            )}>
                              {row.confidence}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-micro text-muted-foreground/60 normal-case tracking-normal mt-3 leading-relaxed">
                  Showing 5 of {DEMO_STATS[0].target.toLocaleString()} patients. Full list available after migration.
                </p>
              </Card>

              {/* Full migration summary */}
              <Card className="p-5 veltra-shadow border-0 bg-card/50 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Database className="h-3.5 w-3.5 text-veltra-emerald" />
                  <p className="text-micro text-veltra-emerald font-medium uppercase tracking-wider">
                    Full migration summary
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {DEMO_STATS.map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div key={stat.label} className="p-3 rounded-md veltra-glass">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className={cn("h-3.5 w-3.5", stat.tint)} />
                          <p className="text-micro text-muted-foreground normal-case tracking-normal truncate">
                            {stat.label}
                          </p>
                        </div>
                        <p className={cn("text-title font-bold tabular", stat.tint)}>
                          {stat.target.toLocaleString()}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </Card>

              <p className="text-center text-micro text-muted-foreground/60 normal-case tracking-normal mt-6 leading-relaxed">
                Click <strong className="text-foreground">Migrate to Veltra</strong> to commit all {totalTarget.toLocaleString()} records to your new VELTRA clinic.
                You can review individual patients after migration.
              </p>
            </motion.div>
          )}

          {/* ===== STAGE 4: DONE ===== */}
          {stage === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <Card className="p-10 veltra-shadow border-0 bg-card/50 backdrop-blur-sm text-center">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="mx-auto h-16 w-16 rounded-2xl bg-emerald-500/15 flex items-center justify-center mb-5"
                >
                  <Check className="h-8 w-8 text-emerald-400" />
                </motion.div>
                <h2 className="text-title text-foreground font-semibold mb-2">
                  Welcome to VELTRA 🎉
                </h2>
                <p className="text-body text-muted-foreground max-w-md mx-auto leading-relaxed mb-6">
                  Your clinic is live. <strong className="text-foreground">{DEMO_STATS[0].target.toLocaleString()} patients</strong>,{" "}
                  {DEMO_STATS[1].target.toLocaleString()} visits, and{" "}
                  {DEMO_STATS[2].target.toLocaleString()} lab results migrated from{" "}
                  <span className="text-foreground font-medium">{fileName}</span>.
                </p>

                <StaggerGroup className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg mx-auto mb-7">
                  {DEMO_STATS.slice(0, 6).map((stat) => (
                    <StaggerItem key={stat.label}>
                      <div className="text-center p-3 rounded-md veltra-glass">
                        <stat.icon className={cn("h-4 w-4 mx-auto mb-1", stat.tint)} />
                        <p className={cn("text-body font-bold tabular", stat.tint)}>
                          {stat.target.toLocaleString()}
                        </p>
                        <p className="text-micro text-muted-foreground/70 normal-case tracking-normal uppercase tracking-wider mt-1">
                          {stat.label}
                        </p>
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerGroup>

                <div className="flex items-center justify-center gap-2">
                  <Button variant="outline" size="sm" onClick={reset} className="h-9 text-caption veltra-shadow border-0 bg-foreground/[0.04]">
                    <FileUp className="mr-1.5 h-3.5 w-3.5" />
                    Migrate another file
                  </Button>
                  <Button size="sm" onClick={() => setView("brief")} className="h-9 px-4 bg-veltra-emerald hover:bg-veltra-emerald-dark text-white text-caption font-medium">
                    Go to Today's Brief
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
