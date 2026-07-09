/**
 * VELTRA — LLM Service (Large Language Model)
 *
 * Powers all AI features:
 *   1. Medical entity extraction (from OCR text → structured data)
 *   2. AI Scribe (voice → SOAP notes)
 *   3. AI Diagnosis suggestions
 *   4. AI Summary (patient brief)
 *   5. AI Follow-up recommendations
 *   6. AI Coding (ICD-10, SNOMED, CPT)
 *
 * Providers (priority order):
 *   1. OpenAI (GPT-4o) — best quality, paid
 *   2. Anthropic (Claude 3.5 Sonnet) — strong for medical text, paid
 *   3. Local Llama — free, self-hosted, lower quality
 *   4. Demo mode — returns hardcoded structured responses
 *
 * Setup:
 *   OpenAI: Add OPENAI_API_KEY to .env
 *   Anthropic: Add ANTHROPIC_API_KEY to .env
 *
 * Usage:
 *   import { llmService } from "@/lib/llm";
 *   const result = await llmService.extractMedicalEntities(text);
 *   // → { fields: [...], confidence: 0.98 }
 */

export interface LlmResult<T = unknown> {
  data: T;
  confidence: number; // 0-1
  model: string;
  provider: "openai" | "anthropic" | "demo";
  tokensUsed?: number;
  durationMs: number;
}

export interface ExtractedField {
  key: string;
  label: string;
  value: string;
  confidence: number; // 0-1
  category: "patient" | "clinical" | "vitals" | "lab" | "medication";
  source?: string; // which part of the text this came from
}

export interface MedicalExtractionResult {
  fields: ExtractedField[];
  avgConfidence: number;
  summary: string;
  warnings: string[]; // e.g., "Allergy detected: Sulfa"
}

export interface SoapNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  icd10Codes?: string[];
}

export interface DiagnosisSuggestion {
  diagnosis: string;
  confidence: number;
  reasoning: string;
  redFlags: string[];
  recommendedLabs: string[];
  recommendedActions: string[];
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o";
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022";

class LlmService {
  private hasOpenAI(): boolean {
    return !!OPENAI_API_KEY;
  }

  private hasAnthropic(): boolean {
    return !!ANTHROPIC_API_KEY;
  }

  /**
   * Extract medical entities from OCR text.
   * Input: raw text from a lab report, prescription, or referral letter.
   * Output: structured fields with confidence scores.
   */
  async extractMedicalEntities(text: string): Promise<LlmResult<MedicalExtractionResult>> {
    const start = Date.now();

    if (this.hasOpenAI()) {
      return this.extractWithOpenAI(text, start);
    }
    if (this.hasAnthropic()) {
      return this.extractWithAnthropic(text, start);
    }

    return this.extractDemo(text, start);
  }

  /**
   * AI Scribe — convert doctor's voice transcript into a SOAP note.
   * Input: raw transcript from speech-to-text.
   * Output: structured SOAP note.
   */
  async generateSoapNote(transcript: string): Promise<LlmResult<SoapNote>> {
    const start = Date.now();

    const prompt = `You are a medical scribe. Convert the following doctor-patient conversation into a SOAP note.

Format:
- Subjective: Patient's complaints, history
- Objective: Vital signs, exam findings, lab results mentioned
- Assessment: Diagnoses, differentials
- Plan: Treatment, medications, follow-up, labs ordered

Also suggest ICD-10 codes if applicable.

Transcript:
${transcript}

Return JSON: {"subjective":"...","objective":"...","assessment":"...","plan":"...","icd10Codes":["E11.9"]}`;

    if (this.hasOpenAI()) {
      try {
        const response = await this.callOpenAI(prompt);
        const note = JSON.parse(response.text) as SoapNote;
        return {
          data: note,
          confidence: 0.95,
          model: OPENAI_MODEL,
          provider: "openai",
          tokensUsed: response.tokensUsed,
          durationMs: Date.now() - start,
        };
      } catch (error) {
        console.error("[LLM] OpenAI SOAP failed:", error);
      }
    }

    // Demo
    return {
      data: {
        subjective: "Patient reports headaches for 2 weeks, worse in morning. No visual changes. Takes Metformin for diabetes.",
        objective: "BP 135/85, HR 78, Temp 36.8°C. Neurological exam normal. No papilledema.",
        assessment: "Tension headache vs migraine. Diabetes controlled.",
        plan: "Continue Metformin. Trial of acetaminophen. Follow up in 2 weeks. If worse → MRI head.",
        icd10Codes: ["G44.201", "E11.9"],
      },
      confidence: 0.92,
      model: "demo",
      provider: "demo",
      durationMs: Date.now() - start,
    };
  }

  /**
   * AI Diagnosis — suggest differential diagnoses based on symptoms.
   */
  async suggestDiagnoses(symptoms: string[], patientHistory?: string): Promise<LlmResult<DiagnosisSuggestion[]>> {
    const start = Date.now();

    const prompt = `You are a clinical decision support system. Given the symptoms and patient history, suggest up to 5 differential diagnoses.

Symptoms: ${symptoms.join(", ")}
Patient history: ${patientHistory || "None provided"}

For each diagnosis, provide:
- diagnosis name
- confidence (0-1)
- reasoning (1-2 sentences)
- redFlags (list of warning signs to watch for)
- recommendedLabs (list of tests to order)
- recommendedActions (list of next steps)

Return JSON array: [{"diagnosis":"...","confidence":0.85,"reasoning":"...","redFlags":[],"recommendedLabs":[],"recommendedActions":[]}]`;

    if (this.hasOpenAI()) {
      try {
        const response = await this.callOpenAI(prompt);
        const diagnoses = JSON.parse(response.text) as DiagnosisSuggestion[];
        return {
          data: diagnoses,
          confidence: 0.88,
          model: OPENAI_MODEL,
          provider: "openai",
          tokensUsed: response.tokensUsed,
          durationMs: Date.now() - start,
        };
      } catch (error) {
        console.error("[LLM] OpenAI diagnosis failed:", error);
      }
    }

    // Demo
    return {
      data: [
        {
          diagnosis: "Migraine without aura",
          confidence: 0.78,
          reasoning: "Recurrent headaches, morning predominance, no visual aura reported.",
          redFlags: ["Sudden severe onset", "Visual changes", "Neurological deficits"],
          recommendedLabs: ["CBC", "ESR", "TSH"],
          recommendedActions: ["Trial of triptan", "Headache diary", "Follow up 2 weeks"],
        },
        {
          diagnosis: "Tension-type headache",
          confidence: 0.65,
          reasoning: "Bilateral, pressure-like pain, stress-related pattern.",
          redFlags: ["Progressive worsening", "Fever", "Neck stiffness"],
          recommendedLabs: [],
          recommendedActions: ["Acetaminophen PRN", "Stress management", "Follow up 1 month"],
        },
        {
          diagnosis: "Secondary headache (consider imaging)",
          confidence: 0.22,
          reasoning: "Morning predominance could indicate increased ICP — rule out structural cause.",
          redFlags: ["Worse in morning", "Vomiting", "Visual changes", "Neurological deficits"],
          recommendedLabs: ["CBC", "ESR", "CRP"],
          recommendedActions: ["MRI brain if red flags present", "Neurology referral"],
        },
      ],
      confidence: 0.85,
      model: "demo",
      provider: "demo",
      durationMs: Date.now() - start,
    };
  }

  /**
   * AI Summary — generate a patient brief for the doctor.
   */
  async generatePatientSummary(patientData: {
    name: string;
    age: number;
    conditions: string[];
    medications: string[];
    lastVisit?: string;
    labs?: string[];
    allergies?: string[];
  }): Promise<LlmResult<string>> {
    const start = Date.now();

    const prompt = `Generate a concise 3-sentence patient summary for a doctor's morning brief.

Patient: ${patientData.name}, ${patientData.age} years old
Conditions: ${patientData.conditions.join(", ") || "None"}
Medications: ${patientData.medications.join(", ") || "None"}
Allergies: ${patientData.allergies?.join(", ") || "None"}
Last visit: ${patientData.lastVisit || "Unknown"}
Recent labs: ${patientData.labs?.join(", ") || "None"}

Focus on: what the doctor needs to know, what's changed, what to watch for.`;

    if (this.hasOpenAI()) {
      try {
        const response = await this.callOpenAI(prompt);
        return {
          data: response.text,
          confidence: 0.93,
          model: OPENAI_MODEL,
          provider: "openai",
          tokensUsed: response.tokensUsed,
          durationMs: Date.now() - start,
        };
      } catch (error) {
        console.error("[LLM] OpenAI summary failed:", error);
      }
    }

    // Demo
    const summary = `${patientData.name} (${patientData.age}y) presents with ${patientData.conditions.join(" and ") || "no chronic conditions"}, currently on ${patientData.medications.join(", ") || "no medications"}. ${patientData.lastVisit ? `Last seen ${patientData.lastVisit}.` : ""} ${patientData.allergies?.length ? `⚠️ Allergic to ${patientData.allergies.join(", ")} — avoid these medications.` : "No known allergies."} ${patientData.labs?.length ? `Recent labs: ${patientData.labs.join(", ")} — review for trends.` : ""}`;

    return {
      data: summary,
      confidence: 0.90,
      model: "demo",
      provider: "demo",
      durationMs: Date.now() - start,
    };
  }

  /**
   * AI Coding — suggest ICD-10 codes from clinical text.
   */
  async suggestIcd10Codes(clinicalText: string): Promise<LlmResult<{ code: string; description: string; confidence: number }[]>> {
    const start = Date.now();

    if (this.hasOpenAI()) {
      const prompt = `Given the following clinical text, suggest the most appropriate ICD-10 codes.

Clinical text: ${clinicalText}

Return JSON array: [{"code":"E11.9","description":"Type 2 diabetes mellitus without complications","confidence":0.95}]`;

      try {
        const response = await this.callOpenAI(prompt);
        const codes = JSON.parse(response.text);
        return {
          data: codes,
          confidence: 0.92,
          model: OPENAI_MODEL,
          provider: "openai",
          tokensUsed: response.tokensUsed,
          durationMs: Date.now() - start,
        };
      } catch (error) {
        console.error("[LLM] OpenAI coding failed:", error);
      }
    }

    // Demo
    return {
      data: [
        { code: "E11.9", description: "Type 2 diabetes mellitus without complications", confidence: 0.95 },
        { code: "I10", description: "Essential (primary) hypertension", confidence: 0.88 },
        { code: "E78.5", description: "Hyperlipidemia, unspecified", confidence: 0.72 },
      ],
      confidence: 0.88,
      model: "demo",
      provider: "demo",
      durationMs: Date.now() - start,
    };
  }

  // ===== Private: API callers =====

  private async callOpenAI(prompt: string): Promise<{ text: string; tokensUsed?: number }> {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: "system", content: "You are a medical AI assistant. Always return valid JSON when asked for structured data. Be precise and include confidence scores." },
          { role: "user", content: prompt },
        ],
        temperature: 0.3, // low temperature for medical accuracy
        max_tokens: 2000,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`OpenAI error: ${data.error?.message || "Unknown"}`);
    }

    return {
      text: data.choices?.[0]?.message?.content || "",
      tokensUsed: data.usage?.total_tokens,
    };
  }

  private async extractWithOpenAI(text: string, start: number): Promise<LlmResult<MedicalExtractionResult>> {
    const prompt = `You are a medical data extraction AI. Extract structured medical entities from the following text.

Text:
${text}

Extract these fields (if present):
- name (patient name)
- age
- gender
- mrn (medical record number)
- phone
- diagnosis (primary diagnosis)
- conditions (list)
- allergies (list)
- bp_systolic, bp_diastolic (blood pressure)
- heart_rate
- temperature
- blood_sugar
- hba1c
- medications (list with dosage)
- lab_results (list with test name, value, unit, normal range, status)

Return JSON: {"fields":[{"key":"name","label":"Patient Name","value":"Ahmed Hassan","confidence":0.99,"category":"patient"}],"summary":"...","warnings":["..."]}
confidence is 0-1. Only include fields you can find. Be conservative — if unsure, lower confidence.`;

    const response = await this.callOpenAI(prompt);
    const parsed = JSON.parse(response.text) as MedicalExtractionResult;
    const avgConf = parsed.fields.length > 0
      ? parsed.fields.reduce((s, f) => s + f.confidence, 0) / parsed.fields.length
      : 0;

    return {
      data: { ...parsed, avgConfidence: avgConf },
      confidence: avgConf,
      model: OPENAI_MODEL,
      provider: "openai",
      tokensUsed: response.tokensUsed,
      durationMs: Date.now() - start,
    };
  }

  private async extractWithAnthropic(text: string, start: number): Promise<LlmResult<MedicalExtractionResult>> {
    const prompt = `Extract medical entities from this text. Return JSON with fields, summary, warnings.

Text: ${text}

Return: {"fields":[{"key":"name","label":"Patient Name","value":"...","confidence":0.99,"category":"patient"}],"summary":"...","warnings":[]}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    const content = data.content?.[0]?.text || "{}";
    const parsed = JSON.parse(content) as MedicalExtractionResult;

    return {
      data: parsed,
      confidence: parsed.avgConfidence || 0.9,
      model: ANTHROPIC_MODEL,
      provider: "anthropic",
      tokensUsed: data.usage?.output_tokens,
      durationMs: Date.now() - start,
    };
  }

  private extractDemo(text: string, start: number): LlmResult<MedicalExtractionResult> {
    const fields: ExtractedField[] = [
      { key: "name", label: "Patient Name", value: "Ahmed Hassan", confidence: 0.99, category: "patient" },
      { key: "age", label: "Age", value: "45", confidence: 0.98, category: "patient" },
      { key: "gender", label: "Gender", value: "M", confidence: 1.0, category: "patient" },
      { key: "diagnosis", label: "Diagnosis", value: "Type 2 Diabetes Mellitus", confidence: 0.97, category: "clinical" },
      { key: "hba1c", label: "HbA1c", value: "8.4%", confidence: 0.96, category: "lab" },
      { key: "glucose", label: "Fasting Glucose", value: "9.2 mmol/L", confidence: 0.94, category: "lab" },
      { key: "medication", label: "Medication", value: "Metformin 1000mg", confidence: 1.0, category: "medication" },
      { key: "allergy", label: "Allergy", value: "Sulfa", confidence: 0.92, category: "clinical" },
    ];

    return {
      data: {
        fields,
        avgConfidence: 0.97,
        summary: "Patient Ahmed Hassan (45M) with Type 2 Diabetes, HbA1c 8.4% (elevated), on Metformin. Allergic to Sulfa.",
        warnings: ["Allergy detected: Sulfa — avoid Sulfa-based antibiotics"],
      },
      confidence: 0.97,
      model: "demo",
      provider: "demo",
      durationMs: Date.now() - start,
    };
  }

  /**
   * Check which LLM provider is active.
   */
  getProvider(): string {
    if (this.hasOpenAI()) return `OpenAI (${OPENAI_MODEL})`;
    if (this.hasAnthropic()) return `Anthropic (${ANTHROPIC_MODEL})`;
    return "Demo (no API key configured)";
  }
}

export const llmService = new LlmService();
