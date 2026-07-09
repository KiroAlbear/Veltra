/**
 * VELTRA — Event Bus
 *
 * Decouples modules via events. Instead of a screen calling another screen,
 * it emits an event. Any module can subscribe.
 *
 * This is the foundation for:
 *   - Audit logging (every event → audit log)
 *   - Notifications (PatientCreated → send welcome email)
 *   - Analytics (every event → metrics)
 *   - Automation (LabResultReceived → trigger AI analysis)
 *   - Webhooks (forward events to external systems)
 *
 * Architecture:
 *   ┌──────────┐  emit   ┌───────────┐  dispatch   ┌──────────────┐
 *   │  Module  │ ──────→ │ Event Bus │ ──────────→ │  Subscribers │
 *   └──────────┘         └───────────┘             └──────────────┘
 *                              │                         │
 *                              ↓                         ↓
 *                         Audit Log              Notification
 *                              │                         │
 *                              ↓                         ↓
 *                          Analytics              AI Engine
 *
 * Usage:
 *   import { eventBus, Events } from "@/lib/event-bus";
 *
 *   // Emit
 *   eventBus.emit(Events.PatientCreated, { patientId, name, tenantId });
 *
 *   // Subscribe
 *   eventBus.on(Events.PatientCreated, (data) => {
 *     sendWelcomeEmail(data.patientId);
 *   });
 */

export type EventType =
  // Patient events
  | "patient.created"
  | "patient.updated"
  | "patient.deleted"
  | "patient.flagged"
  // Appointment events
  | "appointment.booked"
  | "appointment.confirmed"
  | "appointment.checked_in"
  | "appointment.completed"
  | "appointment.cancelled"
  | "appointment.no_show"
  // Clinical events
  | "prescription.created"
  | "prescription.dispensed"
  | "lab.ordered"
  | "lab.result_received"
  | "lab.critical_result"
  | "vital.recorded"
  | "visit.started"
  | "visit.completed"
  | "note.added"
  // Billing events
  | "invoice.generated"
  | "invoice.paid"
  | "invoice.overdue"
  | "claim.submitted"
  | "claim.approved"
  | "claim.rejected"
  // Inventory events
  | "inventory.adjusted"
  | "inventory.low_stock"
  | "inventory.critical_stock"
  // Auth events
  | "auth.login"
  | "auth.logout"
  | "auth.failed_login"
  | "auth.mfa_enabled"
  | "auth.password_reset"
  | "auth.suspended"
  // Import events
  | "import.started"
  | "import.completed"
  | "import.failed"
  // AI events
  | "ai.alert_generated"
  | "ai.suggestion_accepted"
  | "ai.suggestion_rejected"
  // Communication events
  | "message.sent"
  | "message.received"
  | "reminder.sent"
  | "backup.started"
  | "backup.completed"
  | "backup.restored";

export interface BaseEvent {
  type: EventType;
  tenantId: string;
  userId?: string;
  userName?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

type EventHandler<T extends BaseEvent = BaseEvent> = (event: T) => void | Promise<void>;

class EventBus {
  private handlers: Map<EventType, EventHandler[]> = new Map();
  private history: BaseEvent[] = [];
  private maxHistory = 1000;

  /**
   * Subscribe to an event type.
   * Returns an unsubscribe function.
   */
  on<T extends BaseEvent>(type: EventType, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, []);
    }
    this.handlers.get(type)!.push(handler as EventHandler);

    return () => {
      const handlers = this.handlers.get(type);
      if (handlers) {
        const idx = handlers.indexOf(handler as EventHandler);
        if (idx > -1) handlers.splice(idx, 1);
      }
    };
  }

  /**
   * Emit an event to all subscribers.
   * Handlers are called asynchronously (non-blocking).
   */
  async emit(event: BaseEvent): Promise<void> {
    // Store in history (for debugging + replay)
    this.history.push(event);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

    // Dispatch to all subscribers
    const handlers = this.handlers.get(event.type) || [];
    await Promise.allSettled(
      handlers.map(async (handler) => {
        try {
          await handler(event);
        } catch (error) {
          console.error(`[EventBus] Handler error for ${event.type}:`, error);
        }
      })
    );
  }

  /**
   * Get recent events (for debugging / observability dashboard).
   */
  getHistory(limit = 50): BaseEvent[] {
    return this.history.slice(-limit).reverse();
  }

  /**
   * Clear all handlers (for testing).
   */
  clear(): void {
    this.handlers.clear();
    this.history = [];
  }
}

export const eventBus = new EventBus();

/**
 * Helper to create a typed event.
 */
export function createEvent(
  type: EventType,
  tenantId: string,
  metadata: Record<string, unknown> = {},
  user?: { id: string; name: string }
): BaseEvent {
  return {
    type,
    tenantId,
    userId: user?.id,
    userName: user?.name,
    timestamp: new Date().toISOString(),
    metadata,
  };
}

/**
 * Built-in subscribers — registered on module load.
 * These wire the event bus to: audit log, notifications, analytics.
 */

// Audit log subscriber — every event becomes an audit log entry
eventBus.on("patient.created" as EventType, async (e) => {
  console.log(`[Audit] Patient created: ${e.metadata?.name} by ${e.userName}`);
  // TODO: await dataAccess.auditLog.create({ ... })
});

eventBus.on("auth.login" as EventType, async (e) => {
  console.log(`[Audit] Login: ${e.userName} from ${e.metadata?.ip}`);
});

eventBus.on("auth.failed_login" as EventType, async (e) => {
  console.log(`[Security] Failed login: ${e.metadata?.email} from ${e.metadata?.ip}`);
  // TODO: trigger rate limiting / IP block after N failures
});

eventBus.on("lab.critical_result" as EventType, async (e) => {
  console.log(`[Alert] Critical lab result for patient ${e.metadata?.patientName}: ${e.metadata?.testType} = ${e.metadata?.value}`);
  // TODO: create urgent notification + alert doctor
});

eventBus.on("inventory.critical_stock" as EventType, async (e) => {
  console.log(`[Alert] Critical stock: ${e.metadata?.medication} (${e.metadata?.stock} ${e.metadata?.unit} left)`);
  // TODO: create notification + suggest reorder
});

eventBus.on("invoice.overdue" as EventType, async (e) => {
  console.log(`[Billing] Invoice overdue: ${e.metadata?.patientName} - $${e.metadata?.amount}`);
  // TODO: send reminder email/SMS
});

// Analytics subscriber — every event increments metrics
eventBus.on("appointment.booked" as EventType, async (e) => {
  console.log(`[Analytics] Appointment booked for ${e.metadata?.patientName}`);
  // TODO: increment metric "appointments.booked.count"
});
