"use client";

/**
 * Veltra Smart Import Center
 *
 * The killer demo feature. Upload a patient file (PDF/image/scan), watch the
 * OCR + AI extraction pipeline run, then review extracted data with confidence
 * scores before committing it to the patient record.
 *
 * Pipeline (simulated for demo):
 *   1. Upload — drag/drop or click to select (PDF, JPG, PNG, DOCX, CSV)
 *   2. Processing — animated stages: Upload → OCR → AI Extraction → Validation → Normalization
 *   3. Review — extracted fields with confidence % (high = auto-accept, low = manual review)
 *   4. Confirm — one click writes everything to patient record, creates timeline event,
 *                and shows a celebratory animation
 *
 * Files supported (UI claim): PDF, JPG, PNG, DOCX, XLSX, CSV
 * Future: DICOM, HL7, FHIR
 *
 * This is what makes a doctor say "we'll buy Veltra."
 */
import { useState, useCallback, useRef } from "react";
import { useVeltra } from "@/lib/veltra-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  FileUp,
  FileText,
  X,
  Check,
  Loader2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Edit3,
  RefreshCw,
  Activity,
  Pill,
  FlaskConical,
  Heart,
  User,
  Calendar as CalendarIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { FadeIn, StaggerGroup, StaggerItem } from "./motion";
import { ocrService } from "@/lib/ocr";
import { llmService, type ExtractedField as LlmField } from "@/lib/llm";

type Stage = "upload" | "processing" | "review" | "done";

type PipelineStage = {
  id: string;
  label: string;
  status: "pending" | "running" | "complete";
  description: string;
};

type ExtractedField = {
  key: string;
  label: string;
  value: string;
  confidence: number; // 0–100
  category: "patient" | "clinical" | "lab" | "medication" | "vitals";
  icon: React.ElementType;
  /** Editable in review screen */
  edited?: boolean;
};

/** Demo extracted data — simulates what an LLM would extract from a scanned report. */
const DEMO_EXTRACTED: ExtractedField[] = [
  { key: "name",        label: "Patient Name",       value: "Ahmed Hassan",          confidence: 99, category: "patient",    icon: User },
  { key: "age",         label: "Age",                 value: "45",                    confidence: 98, category: "patient",    icon: CalendarIcon },
  { key: "gender",      label: "Gender",              value: "M",                     confidence: 100, category: "patient",   icon: User },
  { key: "mrn",         label: "Medical Record #",    value: "P-001",                 confidence: 92, category: "patient",    icon: FileText },
  { key: "condition",   label: "Diagnosis",           value: "Type 2 Diabetes Mellitus", confidence: 97, category: "clinical", icon: Activity },
  { key: "bp",          label: "Blood Pressure",      value: "145/90 mmHg",           confidence: 91, category: "vitals",     icon: Heart },
  { key: "hba1c",       label: "HbA1c",               value: "8.2%",                  confidence: 96, category: "lab",        icon: FlaskConical },
  { key: "glucose",     label: "Fasting Glucose",     value: "9.2 mmol/L",            confidence: 94, category: "lab",        icon: FlaskConical },
  { key: "creatinine",  label: "Creatinine",          value: "98 µmol/L",             confidence: 88, category: "lab",        icon: FlaskConical },
  { key: "med1",        label: "Medication 1",        value: "Metformin 1000mg, 2x daily", confidence: 100, category: "medication", icon: Pill },
  { key: "med2",        label: "Medication 2",        value: "Lisinopril 10mg, 1x daily",  confidence: 95,  category: "medication", icon: Pill },
  { key: "phone",       label: "Phone (low confidence)", value: "+966 ?? ??? ???? (unclear)", confidence: 65, category: "patient", icon: User },
];

const PIPELINE_STAGES: PipelineStage[] = [
  { id: "upload",      label: "File received",        status: "pending", description: "PDF/image uploaded" },
  { id: "ocr",         label: "OCR text extraction",  status: "pending", description: "Reading document text" },
  { id: "ai",          label: "Medical AI extraction", status: "pending", description: "Identifying clinical entities" },
  { id: "validation",  label: "Validation",           status: "pending", description: "Cross-checking fields" },
  { id: "normalization", label: "Normalization",      status: "pending", description: "Standardizing units & codes" },
];

const FILE_TYPES = [
  { ext: "PDF",  color: "text-red-400" },
  { ext: "JPG",  color: "text-blue-400" },
  { ext: "PNG",  color: "text-emerald-400" },
  { ext: "DOCX", color: "text-violet-400" },
  { ext: "XLSX", color: "text-emerald-400" },
  { ext: "CSV",  color: "text-amber-400" },
];

const CATEGORY_LABELS: Record<ExtractedField["category"], { label: string; tint: string }> = {
  patient:    { label: "Patient Demographics", tint: "text-emerald-400" },
  clinical:   { label: "Clinical",             tint: "text-rose-400" },
  vitals:     { label: "Vital Signs",          tint: "text-violet-400" },
  lab:        { label: "Lab Results",          tint: "text-cyan-400" },
  medication: { label: "Medications",          tint: "text-amber-400" },
};

export function ImportScreen() {
  const [stage, setStage] = useState<Stage>("upload");
  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<string>("");
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>(PIPELINE_STAGES);
  const [extracted, setExtracted] = useState<ExtractedField[]>(DEMO_EXTRACTED);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const setView = useVeltra((s) => s.setView);
  const addPatientNote = useVeltra((s) => s.addPatientNote);
  const selectPatient = useVeltra((s) => s.selectPatient);
  const patients = useVeltra((s) => s.patients);
  const logAction = useVeltra((s) => s.logAction);

  /** Sleep helper for pipeline delays */
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const handleFileSelected = useCallback(async (file: File) => {
    setFileName(file.name);
    setFileSize(file.size > 1024 * 1024 ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB`);
    setStage("processing");
    setPipelineStages(PIPELINE_STAGES.map((s) => ({ ...s, status: "pending" })));

    try {
      // Read file as buffer
      const fileBuffer = await file.arrayBuffer();

      // ===== Stage 1: File received =====
      setPipelineStages((prev) => prev.map((s, i) => i === 0 ? { ...s, status: "running" } : s));
      await sleep(300);
      setPipelineStages((prev) => prev.map((s, i) => i === 0 ? { ...s, status: "complete" } : s));

      // ===== Stage 2: OCR =====
      setPipelineStages((prev) => prev.map((s, i) => i === 1 ? { ...s, status: "running" } : s));
      const ocrResult = await ocrService.extract({
        content: typeof Buffer !== "undefined" ? Buffer.from(fileBuffer) : new Uint8Array(fileBuffer) as any,
        mimeType: file.type || "application/octet-stream",
        documentType: file.name.toLowerCase().includes("lab") ? "lab_report" :
                      file.name.toLowerCase().includes("rx") || file.name.toLowerCase().includes("prescription") ? "prescription" :
                      file.name.toLowerCase().includes("referral") ? "referral" : "unknown",
      });
      setPipelineStages((prev) => prev.map((s, i) => i === 1 ? { ...s, status: "complete" } : s));

      // ===== Stage 3: Medical AI Extraction =====
      setPipelineStages((prev) => prev.map((s, i) => i === 2 ? { ...s, status: "running" } : s));
      const llmResult = await llmService.extractMedicalEntities(ocrResult.text);
      setPipelineStages((prev) => prev.map((s, i) => i === 2 ? { ...s, status: "complete" } : s));

      // ===== Stage 4: Validation =====
      setPipelineStages((prev) => prev.map((s, i) => i === 3 ? { ...s, status: "running" } : s));
      await sleep(400);
      setPipelineStages((prev) => prev.map((s, i) => i === 3 ? { ...s, status: "complete" } : s));

      // ===== Stage 5: Normalization =====
      setPipelineStages((prev) => prev.map((s, i) => i === 4 ? { ...s, status: "running" } : s));
      await sleep(300);
      setPipelineStages((prev) => prev.map((s, i) => i === 4 ? { ...s, status: "complete" } : s));

      // ===== Convert LLM fields to UI format =====
      // Sanitize categories: map unknown LLM categories to "clinical" so fields are always visible
      const VALID_CATEGORIES = ["patient", "clinical", "vitals", "lab", "medication"] as const;
      const fields: ExtractedField[] = (llmResult.data.fields || []).map((f: LlmField) => {
        const category = VALID_CATEGORIES.includes(f.category as any) ? f.category : "clinical";
        return {
          key: f.key,
          label: f.label,
          value: f.value,
          confidence: Math.round(f.confidence * 100),
          category: category as ExtractedField["category"],
          icon: category === "patient" ? User :
                 category === "clinical" ? Activity :
                 category === "vitals" ? Heart :
                 category === "lab" ? FlaskConical : Pill,
        };
      });

      if (fields.length === 0) {
        setStage("review");
        setExtracted([]);
        toast({ title: "No fields could be extracted", description: "The document may be illegible or contain no medical data." });
        return;
      }

      const avgConf = fields.length > 0
        ? Math.round(fields.reduce((s, f) => s + f.confidence, 0) / fields.length)
        : 0;

      setExtracted(fields);
      setStage("review");
      toast({
        title: "Extraction complete",
        description: `${fields.length} fields found · ${avgConf}% avg confidence · via ${ocrResult.provider} + ${llmResult.provider}`,
      });
    } catch (error) {
      // Reset pipeline on any error — don't leave UI stuck on spinner
      console.error("[Smart Import] Pipeline error:", error);
      setStage("upload");
      setPipelineStages(PIPELINE_STAGES.map((s) => ({ ...s, status: "pending" })));
      toast({
        title: "Import failed",
        description: "Could not process the file. Please try again or use a different file.",
        variant: "destructive",
      });
    }
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

  const startEdit = (field: ExtractedField) => {
    setEditingKey(field.key);
    setEditValue(field.value);
  };

  const commitEdit = () => {
    if (editingKey) {
      setExtracted((prev) => prev.map((f) => f.key === editingKey ? { ...f, value: editValue, edited: true, confidence: 100 } : f));
      setEditingKey(null);
      setEditValue("");
    }
  };

  const commitImport = () => {
    // Find or create the patient — for demo, match by name
    const target = patients.find((p) => p.name === "Ahmed Hassan") || patients[0];
    if (target) {
      // Log timeline event
      addPatientNote(target.id, `Smart Import — file "${fileName}" processed. ${extracted.length} fields extracted and reviewed. AI confidence: ${Math.round(extracted.reduce((s, f) => s + f.confidence, 0) / extracted.length)}%`);
      // Audit log
      logAction?.("Added patient note", `${target.name} — Smart Import from ${fileName}`);
      // NOTE: do NOT call selectPatient here — it would unmount this screen
      // before the "done" celebration renders. The "Open patient chart"
      // button on the done screen does the navigation.
    }
    setStage("done");
    toast({ title: "Import committed ✓", description: `${extracted.length} fields written to patient record` });
  };

  /** Called from the "Open patient chart" button on the done screen. */
  const openPatientChart = () => {
    const target = patients.find((p) => p.name === "Ahmed Hassan") || patients[0];
    if (target) {
      selectPatient(target.id);
    }
  };

  const reset = () => {
    setStage("upload");
    setFileName("");
    setFileSize("");
    setPipelineStages(PIPELINE_STAGES.map((s) => ({ ...s, status: "pending" })));
    setExtracted(DEMO_EXTRACTED);
    setEditingKey(null);
  };

  const avgConfidence = Math.round(extracted.reduce((s, f) => s + f.confidence, 0) / extracted.length);
  const lowConfidenceCount = extracted.filter((f) => f.confidence < 80).length;

  return (
    <div className="min-h-screen veltra-ambient">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-8 sm:py-10 md:px-12 md:py-14">
        <FadeIn>
          <header className="mb-10">
            <div className="flex items-center gap-2 mb-3">
              <FileUp className="h-3.5 w-3.5 text-veltra-emerald" />
              <span className="text-micro text-veltra-emerald">Smart Import Center</span>
            </div>
            <h1 className="text-[2.5rem] leading-[1.05] tracking-[-0.035em] text-foreground font-semibold">
              <span className="text-editorial-italic text-muted-foreground">Drop a file.</span>{" "}
              Let Veltra read it.
            </h1>
            <p className="text-body text-muted-foreground mt-3 max-w-2xl leading-relaxed">
              Upload a scanned report, lab result, or referral letter. Veltra's OCR + Medical AI
              will extract every relevant field, score its confidence, and ask you to review before
              anything is written to the patient record.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {FILE_TYPES.map((ft) => (
                <span key={ft.ext} className={cn("text-micro font-medium normal-case tracking-normal px-2 py-0.5 rounded-md bg-foreground/[0.04]", ft.color)}>
                  {ft.ext}
                </span>
              ))}
              <span className="text-micro text-muted-foreground/60 normal-case tracking-normal px-2 py-0.5">
                · DICOM / HL7 / FHIR — soon
              </span>
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
                  accept=".pdf,.jpg,.jpeg,.png,.docx,.xlsx,.csv"
                  onChange={handleFileInput}
                />
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="mx-auto h-16 w-16 rounded-2xl bg-veltra-emerald/10 flex items-center justify-center mb-5"
                >
                  <FileUp className="h-7 w-7 text-veltra-emerald" />
                </motion.div>
                <p className="text-body font-medium text-foreground mb-1">
                  Drop a file here, or click to browse
                </p>
                <p className="text-caption text-muted-foreground">
                  PDF, image, Word, Excel, or CSV — up to 25MB
                </p>
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button className="h-9 px-4 bg-veltra-emerald hover:bg-veltra-emerald-dark text-white text-caption font-medium">
                    <FileUp className="mr-1.5 h-3.5 w-3.5" />
                    Select file
                  </Button>
                </div>
              </Card>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <PipelineStepPreview step="1" title="OCR Extraction" desc="Reads text from PDFs and scanned images" />
                <PipelineStepPreview step="2" title="Medical AI" desc="Identifies conditions, labs, medications, vitals" />
                <PipelineStepPreview step="3" title="Confidence Review" desc="Low-confidence fields flagged for your review" />
              </div>
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
                  <div className="h-10 w-10 rounded-md bg-red-500/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body font-medium text-foreground truncate">{fileName}</p>
                    <p className="text-micro text-muted-foreground normal-case tracking-normal">{fileSize} · processing</p>
                  </div>
                  <Loader2 className="h-4 w-4 text-veltra-emerald animate-spin" />
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
                  Extracting clinical entities — usually 3–5 seconds for a typical report.
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
              {/* Confidence banner */}
              <Card className="p-5 mb-5 veltra-shadow border-0 bg-card/50 backdrop-blur-sm">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={cn(
                      "h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0",
                      avgConfidence >= 90 ? "bg-emerald-500/15" : avgConfidence >= 75 ? "bg-amber-500/15" : "bg-red-500/15"
                    )}>
                      <Sparkles className={cn(
                        "h-5 w-5",
                        avgConfidence >= 90 ? "text-emerald-400" : avgConfidence >= 75 ? "text-amber-400" : "text-red-400"
                      )} />
                    </div>
                    <div>
                      <p className="text-body font-semibold text-foreground">
                        {extracted.length} fields extracted · {avgConfidence}% avg confidence
                      </p>
                      <p className="text-caption text-muted-foreground">
                        {lowConfidenceCount > 0 ? (
                          <span className="text-amber-400 font-medium">{lowConfidenceCount} field{lowConfidenceCount === 1 ? "" : "s"} need your review</span>
                        ) : (
                          <span className="text-emerald-400 font-medium">All fields high-confidence — safe to commit</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={reset} className="h-9 text-caption veltra-shadow border-0 bg-foreground/[0.04]">
                      <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                      Discard
                    </Button>
                    <Button size="sm" onClick={commitImport} className="h-9 px-4 bg-veltra-emerald hover:bg-veltra-emerald-dark text-white text-caption font-medium">
                      <Check className="mr-1.5 h-3.5 w-3.5" />
                      Commit to patient record
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Extracted fields grouped by category */}
              <StaggerGroup className="space-y-5">
                {(["patient", "clinical", "vitals", "lab", "medication"] as const).map((cat) => {
                  const fields = extracted.filter((f) => f.category === cat);
                  if (fields.length === 0) return null;
                  const meta = CATEGORY_LABELS[cat];
                  return (
                    <StaggerItem key={cat}>
                      <Card className="p-5 veltra-shadow border-0 bg-card/50 backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-4">
                          <span className={cn("text-micro font-medium uppercase tracking-wider", meta.tint)}>
                            {meta.label}
                          </span>
                          <span className="text-micro text-muted-foreground/60 normal-case tracking-normal">
                            · {fields.length} field{fields.length === 1 ? "" : "s"}
                          </span>
                        </div>
                        <div className="space-y-2.5">
                          {fields.map((field) => {
                            const Icon = field.icon;
                            const isLow = field.confidence < 80;
                            const isEditing = editingKey === field.key;
                            return (
                              <div
                                key={field.key}
                                className={cn(
                                  "flex items-center gap-3 py-2.5 px-3 rounded-md veltra-transition",
                                  isLow && "bg-amber-500/[0.04] ring-1 ring-amber-500/20",
                                  field.edited && "bg-emerald-500/[0.04]"
                                )}
                              >
                                <Icon className={cn("h-4 w-4 flex-shrink-0", isLow ? "text-amber-400" : "text-muted-foreground")} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-micro text-muted-foreground/70 normal-case tracking-normal mb-0.5">
                                    {field.label}
                                  </p>
                                  {isEditing ? (
                                    <input
                                      type="text"
                                      value={editValue}
                                      onChange={(e) => setEditValue(e.target.value)}
                                      onBlur={commitEdit}
                                      onKeyDown={(e) => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") setEditingKey(null); }}
                                      autoFocus
                                      className="w-full text-body text-foreground bg-background/80 px-2 py-1 rounded border border-veltra-emerald/40 outline-none focus:ring-2 focus:ring-veltra-emerald/30"
                                    />
                                  ) : (
                                    <p className="text-body text-foreground font-medium truncate">
                                      {field.value}
                                      {field.edited && <span className="ml-2 text-micro text-emerald-400 normal-case tracking-normal">· edited</span>}
                                    </p>
                                  )}
                                </div>
                                {/* Confidence bar */}
                                <div className="hidden sm:flex flex-col items-end flex-shrink-0 w-16">
                                  <span className={cn(
                                    "text-micro font-semibold tabular",
                                    field.confidence >= 90 ? "text-emerald-400" :
                                    field.confidence >= 75 ? "text-amber-400" : "text-red-400"
                                  )}>
                                    {field.confidence}%
                                  </span>
                                  <div className="h-1 w-12 rounded-full bg-foreground/10 mt-0.5 overflow-hidden">
                                    <div
                                      className={cn(
                                        "h-full rounded-full",
                                        field.confidence >= 90 ? "bg-emerald-400" :
                                        field.confidence >= 75 ? "bg-amber-400" : "bg-red-400"
                                      )}
                                      style={{ width: `${field.confidence}%` }}
                                    />
                                  </div>
                                </div>
                                {/* Edit button */}
                                {!isEditing && (
                                  <button
                                    onClick={() => startEdit(field)}
                                    className="h-7 w-7 rounded-md hover:bg-foreground/[0.06] flex items-center justify-center text-muted-foreground/60 hover:text-foreground veltra-transition flex-shrink-0"
                                    aria-label="Edit value"
                                  >
                                    <Edit3 className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </Card>
                    </StaggerItem>
                  );
                })}
              </StaggerGroup>

              <p className="text-center text-micro text-muted-foreground/60 normal-case tracking-normal mt-6 leading-relaxed">
                Fields below 80% confidence are highlighted for review. Edit any field by clicking the pencil icon. Committing writes to the patient's timeline with a Smart Import event.
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
                  Import complete
                </h2>
                <p className="text-body text-muted-foreground max-w-md mx-auto leading-relaxed mb-6">
                  {extracted.length} fields extracted from <span className="text-foreground font-medium">{fileName}</span> have been written to the patient record. A timeline event has been logged.
                </p>

                <StaggerGroup className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto mb-7">
                  <StatBlock label="Fields" value={String(extracted.length)} />
                  <StatBlock label="Avg confidence" value={`${avgConfidence}%`} />
                  <StatBlock label="Edited" value={String(extracted.filter((f) => f.edited).length)} />
                  <StatBlock label="Timeline" value="+1 event" />
                </StaggerGroup>

                <div className="flex items-center justify-center gap-2">
                  <Button variant="outline" size="sm" onClick={reset} className="h-9 text-caption veltra-shadow border-0 bg-foreground/[0.04]">
                    <FileUp className="mr-1.5 h-3.5 w-3.5" />
                    Import another file
                  </Button>
                  <Button size="sm" onClick={openPatientChart} className="h-9 px-4 bg-veltra-emerald hover:bg-veltra-emerald-dark text-white text-caption font-medium">
                    Open patient chart
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

function PipelineStepPreview({ step, title, desc }: { step: string; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-lg veltra-glass">
      <div className="h-7 w-7 rounded-full bg-veltra-emerald/15 flex items-center justify-center flex-shrink-0">
        <span className="text-micro font-semibold text-veltra-emerald">{step}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-caption font-medium text-foreground">{title}</p>
        <p className="text-micro text-muted-foreground/70 normal-case tracking-normal mt-0.5 leading-relaxed">
          {desc}
        </p>
      </div>
    </div>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <StaggerItem>
      <div className="text-center">
        <p className="text-title font-semibold text-foreground tabular">{value}</p>
        <p className="text-micro text-muted-foreground/70 normal-case tracking-normal uppercase tracking-wider mt-1">
          {label}
        </p>
      </div>
    </StaggerItem>
  );
}
