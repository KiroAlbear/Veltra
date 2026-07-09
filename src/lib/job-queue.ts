/**
 * VELTRA — Background Jobs Queue
 *
 * Long-running tasks (OCR, AI extraction, email sending, backups) run
 * asynchronously instead of blocking the request.
 *
 * Architecture:
 *   ┌──────────┐  enqueue   ┌───────────┐  process   ┌──────────┐
 *   │  Client  │ ─────────→ │ Job Queue │ ─────────→ │  Worker  │
 *   └──────────┘            └───────────┘            └──────────┘
 *        ↑                                                  │
 *        └──────────────  status update  ←──────────────────┘
 *
 * In production: BullMQ + Redis
 * In demo: in-memory queue with setTimeout
 *
 * Job lifecycle:
 *   pending → running → completed | failed
 *
 * Usage:
 *   import { jobQueue, JobType } from "@/lib/job-queue";
 *   const jobId = await jobQueue.enqueue(JobType.OcrImport, { fileId, tenantId });
 *   const status = jobQueue.getStatus(jobId);
 */

export type JobType =
  | "ocr_import"
  | "ai_extraction"
  | "ai_scribe"
  | "ai_analysis"
  | "send_email"
  | "send_sms"
  | "send_whatsapp"
  | "generate_invoice"
  | "backup_database"
  | "reindex_search"
  | "migration_parse"
  | "migration_match"
  | "notification_dispatch";

export type JobStatus = "pending" | "running" | "completed" | "failed";

export interface Job {
  id: string;
  type: JobType;
  tenantId: string;
  payload: Record<string, unknown>;
  status: JobStatus;
  progress: number; // 0-100
  result?: Record<string, unknown>;
  error?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  /** Estimated duration in ms (for UI progress bar) */
  estimatedDuration?: number;
}

type JobHandler = (job: Job, updateProgress: (pct: number) => void) => Promise<Record<string, unknown>>;

class JobQueue {
  private jobs: Map<string, Job> = new Map();
  private handlers: Map<JobType, JobHandler> = new Map();
  private subscribers: Map<string, (job: Job) => void> = new Map();

  /**
   * Register a handler for a job type.
   */
  register(type: JobType, handler: JobHandler): void {
    this.handlers.set(type, handler);
  }

  /**
   * Enqueue a job. Returns the job ID for status polling.
   */
  async enqueue(
    type: JobType,
    tenantId: string,
    payload: Record<string, unknown>,
    estimatedDuration?: number
  ): Promise<string> {
    const job: Job = {
      id: `job-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      tenantId,
      payload,
      status: "pending",
      progress: 0,
      createdAt: new Date().toISOString(),
      estimatedDuration,
    };

    this.jobs.set(job.id, job);

    // Process asynchronously
    setTimeout(() => this.process(job.id), 100);

    return job.id;
  }

  /**
   * Get job status.
   */
  getStatus(jobId: string): Job | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Subscribe to job updates (for real-time UI).
   */
  subscribe(jobId: string, callback: (job: Job) => void): () => void {
    this.subscribers.set(jobId, callback);
    return () => this.subscribers.delete(jobId);
  }

  /**
   * List recent jobs (for admin/observability dashboard).
   */
  listRecent(limit = 20): Job[] {
    return Array.from(this.jobs.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  /**
   * Process a job — calls the registered handler.
   */
  private async process(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) return;

    const handler = this.handlers.get(job.type);
    if (!handler) {
      job.status = "failed";
      job.error = `No handler registered for job type: ${job.type}`;
      job.completedAt = new Date().toISOString();
      this.notify(jobId);
      return;
    }

    job.status = "running";
    job.startedAt = new Date().toISOString();
    this.notify(jobId);

    const updateProgress = (pct: number) => {
      job.progress = Math.min(100, Math.max(0, pct));
      this.notify(jobId);
    };

    try {
      const result = await handler(job, updateProgress);
      job.status = "completed";
      job.progress = 100;
      job.result = result;
      job.completedAt = new Date().toISOString();
    } catch (error) {
      job.status = "failed";
      job.error = error instanceof Error ? error.message : String(error);
      job.completedAt = new Date().toISOString();
    }

    this.notify(jobId);
  }

  private notify(jobId: string): void {
    const job = this.jobs.get(jobId);
    const callback = this.subscribers.get(jobId);
    if (job && callback) callback(job);
  }
}

export const jobQueue = new JobQueue();

// ===== Register built-in job handlers =====

/**
 * OCR Import — extracts text from uploaded files.
 * In demo: simulates with delay + hardcoded result.
 * In production: calls Google Cloud Vision or Tesseract.
 */
jobQueue.register("ocr_import", async (job, updateProgress) => {
  updateProgress(20);
  await sleep(600);
  updateProgress(50);
  await sleep(800);
  updateProgress(80);
  await sleep(400);
  updateProgress(100);

  return {
    text: "Ahmed Hassan, 45, Male, Type 2 Diabetes, HbA1c 8.2%, Metformin 1000mg",
    pages: 1,
    confidence: 96,
  };
});

/**
 * AI Extraction — extracts medical entities from OCR text.
 * In demo: returns hardcoded structured data.
 * In production: calls OpenAI/Anthropic with medical prompt.
 */
jobQueue.register("ai_extraction", async (job, updateProgress) => {
  updateProgress(15);
  await sleep(800);
  updateProgress(40);
  await sleep(1000);
  updateProgress(70);
  await sleep(600);
  updateProgress(90);
  await sleep(300);
  updateProgress(100);

  return {
    fields: [
      { key: "name", value: "Ahmed Hassan", confidence: 99 },
      { key: "age", value: "45", confidence: 98 },
      { key: "diagnosis", value: "Type 2 Diabetes", confidence: 97 },
      { key: "hba1c", value: "8.2%", confidence: 96 },
      { key: "medication", value: "Metformin 1000mg", confidence: 100 },
    ],
    avgConfidence: 98,
  };
});

/**
 * Send Email — sends an email via SendGrid/Resend.
 * In demo: logs to console.
 * In production: calls email service API.
 */
jobQueue.register("send_email", async (job, updateProgress) => {
  updateProgress(50);
  await sleep(200);
  updateProgress(100);

  console.log(`[Email] To: ${job.payload.to} | Subject: ${job.payload.subject}`);
  return { sent: true, messageId: `msg-${Date.now()}` };
});

/**
 * Send SMS — sends SMS via Twilio.
 * In demo: logs to console.
 */
jobQueue.register("send_sms", async (job, updateProgress) => {
  updateProgress(50);
  await sleep(200);
  updateProgress(100);

  console.log(`[SMS] To: ${job.payload.to} | Body: ${job.payload.body}`);
  return { sent: true, messageId: `sms-${Date.now()}` };
});

/**
 * Send WhatsApp — sends WhatsApp message.
 * In demo: logs to console.
 */
jobQueue.register("send_whatsapp", async (job, updateProgress) => {
  updateProgress(50);
  await sleep(200);
  updateProgress(100);

  console.log(`[WhatsApp] To: ${job.payload.to} | Body: ${job.payload.body}`);
  return { sent: true, messageId: `wa-${Date.now()}` };
});

/**
 * Backup Database — creates a snapshot.
 */
jobQueue.register("backup_database", async (job, updateProgress) => {
  updateProgress(20);
  await sleep(2000);
  updateProgress(60);
  await sleep(1000);
  updateProgress(100);

  return {
    backupId: `backup-${Date.now()}`,
    size: "2.4 GB",
    location: "s3://veltra-backups/",
    timestamp: new Date().toISOString(),
  };
});

/**
 * Migration Parse — parses Excel/CSV rows from uploaded migration file.
 */
jobQueue.register("migration_parse", async (job, updateProgress) => {
  updateProgress(10);
  await sleep(1000);
  updateProgress(40);
  await sleep(1200);
  updateProgress(70);
  await sleep(800);
  updateProgress(100);

  return {
    rowsParsed: 382,
    columns: ["name", "age", "phone", "diagnosis", "medication"],
    sampleRows: 5,
  };
});

/**
 * Migration Match — matches parsed rows to patient entities.
 */
jobQueue.register("migration_match", async (job, updateProgress) => {
  // Simulate progressive matching with live counter
  const total = 17525;
  const steps = 20;
  for (let i = 1; i <= steps; i++) {
    updateProgress((i / steps) * 100);
    await sleep(120);
  }

  return {
    patients: 382,
    appointments: 1924,
    labs: 14002,
    prescriptions: 1832,
    invoices: 2443,
    documents: 1842,
    totalRecords: total,
    accuracy: 98.7,
  };
});

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
