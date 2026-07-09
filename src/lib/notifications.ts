/**
 * VELTRA — Notification Service
 *
 * Sends real notifications via:
 *   - Email (Resend / SendGrid)
 *   - SMS (Twilio)
 *   - WhatsApp (Twilio WhatsApp API)
 *   - Push (future — Firebase Cloud Messaging)
 *
 * All sends go through the Background Job Queue (non-blocking).
 *
 * Setup:
 *   Email:  Add RESEND_API_KEY or SENDGRID_API_KEY to .env
 *   SMS:    Add TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN + TWILIO_PHONE_NUMBER
 *   WhatsApp: Same Twilio credentials + TWILIO_WHATSAPP_NUMBER
 *
 * In demo: logs to console.
 * In production: calls real APIs.
 */

import { jobQueue } from "./job-queue";
import { eventBus, createEvent } from "./event-bus";

// ===== Email =====

export interface EmailInput {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  /** Template name (if using a template service) */
  template?: "welcome" | "appointment_reminder" | "lab_result" | "invoice" | "password_reset" | "invitation";
  templateData?: Record<string, string>;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

class EmailService {
  private hasProvider(): boolean {
    return !!(process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY);
  }

  /**
   * Send an email. Non-blocking — goes through job queue.
   */
  async send(input: EmailInput): Promise<string> {
    return jobQueue.enqueue("send_email", "default", {
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      template: input.template,
      templateData: input.templateData,
    });
  }

  /**
   * Send and wait for result (blocking — use sparingly).
   */
  async sendSync(input: EmailInput): Promise<EmailResult> {
    if (!this.hasProvider()) {
      console.log(`[Email Demo] To: ${input.to.slice(0, 3)}*** | Subject: ${input.subject}`);
      return { success: true, messageId: `demo-${Date.now()}` };
    }

    try {
      // Use Resend (preferred) or SendGrid
      if (process.env.RESEND_API_KEY) {
        return await this.sendWithResend(input);
      } else {
        return await this.sendWithSendGrid(input);
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  private async sendWithResend(input: EmailInput): Promise<EmailResult> {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Veltra <noreply@veltrahealth.co>",
        to: input.to,
        subject: input.subject,
        html: input.html || input.text,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || "Resend error" };
    }

    return { success: true, messageId: data.id };
  }

  private async sendWithSendGrid(input: EmailInput): Promise<EmailResult> {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: input.to }] }],
        from: { email: "noreply@veltrahealth.co", name: "Veltra" },
        subject: input.subject,
        content: [{ type: "text/html", value: input.html || input.text || "" }],
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      return { success: false, error: data.errors?.[0]?.message || "SendGrid error" };
    }

    return { success: true, messageId: response.headers.get("x-message-id") || undefined };
  }
}

// ===== SMS =====

export interface SmsInput {
  to: string; // E.164 format: +966501234567
  body: string;
}

export interface SmsResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

class SmsService {
  private hasTwilio(): boolean {
    return !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);
  }

  /**
   * Send SMS. Non-blocking — goes through job queue.
   */
  async send(input: SmsInput): Promise<string> {
    return jobQueue.enqueue("send_sms", "default", {
      to: input.to,
      body: input.body,
    });
  }

  /**
   * Send and wait (blocking).
   */
  async sendSync(input: SmsInput): Promise<SmsResult> {
    if (!this.hasTwilio()) {
      console.log(`[SMS Demo] To: ${input.to.slice(0, 5)}*** | Channel: SMS`);
      return { success: true, messageId: `demo-${Date.now()}` };
    }

    const sid = process.env.TWILIO_ACCOUNT_SID!;
    const token = process.env.TWILIO_AUTH_TOKEN!;
    const from = process.env.TWILIO_PHONE_NUMBER!;

    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: input.to,
        From: from,
        Body: input.body,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || "Twilio error" };
    }

    return { success: true, messageId: data.sid };
  }
}

// ===== WhatsApp =====

export interface WhatsAppInput {
  to: string; // E.164 format
  body: string;
  /** Optional: send a template message */
  template?: string;
  templateParams?: string[];
}

export interface WhatsAppResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

class WhatsAppService {
  private hasTwilio(): boolean {
    return !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_WHATSAPP_NUMBER);
  }

  /**
   * Send WhatsApp message. Non-blocking — goes through job queue.
   */
  async send(input: WhatsAppInput): Promise<string> {
    return jobQueue.enqueue("send_whatsapp", "default", {
      to: input.to,
      body: input.body,
      template: input.template,
      templateParams: input.templateParams,
    });
  }

  /**
   * Send and wait (blocking).
   */
  async sendSync(input: WhatsAppInput): Promise<WhatsAppResult> {
    if (!this.hasTwilio()) {
      console.log(`[WhatsApp Demo] To: ${input.to.slice(0, 5)}*** | Channel: WhatsApp`);
      return { success: true, messageId: `demo-${Date.now()}` };
    }

    const sid = process.env.TWILIO_ACCOUNT_SID!;
    const token = process.env.TWILIO_AUTH_TOKEN!;
    const from = `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER!}`;

    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: `whatsapp:${input.to}`,
        From: from,
        Body: input.body,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || "Twilio WhatsApp error" };
    }

    return { success: true, messageId: data.sid };
  }
}

// ===== Export singletons =====
export const emailService = new EmailService();
export const smsService = new SmsService();
export const whatsappService = new WhatsAppService();

// ===== Notification helpers (common use cases) =====

/**
 * Send appointment reminder to patient.
 */
export async function sendAppointmentReminder(
  patientName: string,
  patientPhone: string,
  patientEmail: string,
  appointmentTime: string,
  doctorName: string,
  channel: "whatsapp" | "sms" | "email" = "whatsapp"
): Promise<void> {
  const message = `Reminder: ${patientName}, you have an appointment with ${doctorName} tomorrow at ${appointmentTime}. Reply YES to confirm.`;

  if (channel === "whatsapp") {
    await whatsappService.send({ to: patientPhone, body: message });
  } else if (channel === "sms") {
    await smsService.send({ to: patientPhone, body: message });
  } else {
    await emailService.send({
      to: patientEmail,
      subject: `Appointment Reminder — ${appointmentTime}`,
      text: message,
      template: "appointment_reminder",
      templateData: { patientName, appointmentTime, doctorName },
    });
  }

  eventBus.emit(createEvent("reminder.sent", "default", {
    patientName, channel, appointmentTime,
  }));
}

/**
 * Send lab result notification to patient.
 */
export async function sendLabResultNotification(
  patientName: string,
  patientEmail: string,
  testName: string,
  result: string,
  status: string
): Promise<void> {
  await emailService.send({
    to: patientEmail,
    subject: `Lab Result: ${testName}`,
    text: `Hi ${patientName}, your ${testName} result is ${result} (${status}). Please log in to your patient portal to view details.`,
    template: "lab_result",
    templateData: { patientName, testName, result, status },
  });
}

/**
 * Send invoice to patient.
 */
export async function sendInvoiceNotification(
  patientName: string,
  patientEmail: string,
  amount: number,
  invoiceUrl: string
): Promise<void> {
  await emailService.send({
    to: patientEmail,
    subject: `Invoice from Veltra — $${amount}`,
    text: `Hi ${patientName}, you have an invoice for $${amount}. Pay online: ${invoiceUrl}`,
    template: "invoice",
    templateData: { patientName, amount: String(amount), invoiceUrl },
  });
}

/**
 * Send user invitation email.
 */
export async function sendInvitationEmail(
  email: string,
  name: string,
  role: string,
  clinicName: string,
  setupUrl: string
): Promise<void> {
  await emailService.send({
    to: email,
    subject: `You're invited to join ${clinicName} on Veltra`,
    text: `Hi ${name}, you've been invited to join ${clinicName} as ${role}. Set up your account: ${setupUrl}`,
    template: "invitation",
    templateData: { name, role, clinicName, setupUrl },
  });
}

/**
 * Send password reset email.
 */
export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string
): Promise<void> {
  await emailService.send({
    to: email,
    subject: "Reset your Veltra password",
    text: `Click here to reset your password: ${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, ignore this email.`,
    template: "password_reset",
    templateData: { resetUrl },
  });
}
