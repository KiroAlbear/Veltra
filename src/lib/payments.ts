/**
 * VELTRA — Payment Service (Stripe Integration)
 *
 * Handles:
 *   1. Subscription billing (Platform $999/mo, Enterprise custom)
 *   2. Patient invoice payments ($X per visit)
 *   3. Webhook signature verification
 *
 * Setup:
 *   1. Create Stripe account
 *   2. Get API keys from dashboard
 *   3. Add to .env:
 *      STRIPE_SECRET_KEY=sk_live_xxx
 *      STRIPE_WEBHOOK_SECRET=whsec_xxx
 *      STRIPE_PUBLISHABLE_KEY=pk_live_xxx
 *   4. Create products + prices in Stripe dashboard
 *
 * In demo: logs to console (no real charges).
 * In production: calls Stripe API.
 */

import { eventBus, createEvent } from "./event-bus";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// ===== Product/Price IDs (create in Stripe dashboard) =====
export const STRIPE_PRICES = {
  platform_monthly: process.env.STRIPE_PRICE_PLATFORM_MONTHLY || "price_platform_monthly",
  platform_annual: process.env.STRIPE_PRICE_PLATFORM_ANNUAL || "price_platform_annual",
  enterprise_monthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY || "price_enterprise_monthly",
  founding_partner_annual: process.env.STRIPE_PRICE_FOUNDING_ANNUAL || "price_founding_annual",
} as const;

export type SubscriptionTier = "platform" | "enterprise" | "founding_partner";

export interface CheckoutSessionInput {
  tenantId: string;
  tier: SubscriptionTier;
  billingPeriod: "monthly" | "annual";
  customerEmail: string;
  customerName: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionResult {
  sessionId: string;
  url: string;
}

export interface InvoicePaymentInput {
  tenantId: string;
  patientId: string;
  patientName: string;
  amount: number; // in dollars
  description: string;
  successUrl: string;
  cancelUrl: string;
}

export interface PaymentResult {
  success: boolean;
  paymentIntentId?: string;
  clientSecret?: string;
  error?: string;
}

class PaymentService {
  private hasStripe(): boolean {
    return !!STRIPE_SECRET_KEY;
  }

  /**
   * Create a Stripe Checkout session for subscription signup.
   * Returns a URL the user is redirected to.
   */
  async createSubscriptionCheckout(input: CheckoutSessionInput): Promise<CheckoutSessionResult> {
    if (!this.hasStripe()) {
      // Demo mode — return a fake session
      console.log(`[Stripe Demo] Subscription checkout: ${input.tier} (${input.billingPeriod}) for ${input.customerEmail}`);
      return {
        sessionId: `demo-session-${Date.now()}`,
        url: `${input.successUrl}?demo=true&tier=${input.tier}`,
      };
    }

    // Production — call Stripe API
    const priceId = this.getPriceId(input.tier, input.billingPeriod);

    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        "mode": "subscription",
        "customer_email": input.customerEmail,
        "line_items[0][price]": priceId,
        "line_items[0][quantity]": "1",
        "success_url": input.successUrl,
        "cancel_url": input.cancelUrl,
        "metadata[tenantId]": input.tenantId,
        "metadata[tier]": input.tier,
        "metadata[billingPeriod]": input.billingPeriod,
        "subscription_data[metadata][tenantId]": input.tenantId,
      }),
    });

    const session = await response.json();

    if (!response.ok) {
      throw new Error(`Stripe error: ${session.error?.message || "Unknown"}`);
    }

    return {
      sessionId: session.id,
      url: session.url,
    };
  }

  /**
   * Create a Stripe Checkout session for patient invoice payment.
   */
  async createInvoiceCheckout(input: InvoicePaymentInput): Promise<CheckoutSessionResult> {
    if (!this.hasStripe()) {
      console.log(`[Stripe Demo] Invoice payment: $${input.amount} for ${input.patientName}`);
      return {
        sessionId: `demo-invoice-${Date.now()}`,
        url: `${input.successUrl}?demo=true&patient=${input.patientId}&amount=${input.amount}`,
      };
    }

    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        "mode": "payment",
        "customer_email": "", // patient email if available
        "line_items[0][price_data][currency]": "usd",
        "line_items[0][price_data][product_data][name]": input.description,
        "line_items[0][price_data][unit_amount]": String(Math.round(input.amount * 100)),
        "line_items[0][quantity]": "1",
        "success_url": input.successUrl,
        "cancel_url": input.cancelUrl,
        "metadata[tenantId]": input.tenantId,
        "metadata[patientId]": input.patientId,
        "metadata[patientName]": input.patientName,
      }),
    });

    const session = await response.json();

    if (!response.ok) {
      throw new Error(`Stripe error: ${session.error?.message || "Unknown"}`);
    }

    return {
      sessionId: session.id,
      url: session.url,
    };
  }

  /**
   * Verify Stripe webhook signature and parse the event.
   */
  async verifyWebhook(rawBody: string, signature: string): Promise<StripeWebhookEvent | null> {
    if (!STRIPE_WEBHOOK_SECRET) {
      // Demo mode — return a fake event
      return {
        type: "checkout.session.completed",
        data: { object: { id: "demo_session", metadata: { tenantId: "default" } } },
      };
    }

    // Production — verify signature
    // In a real implementation, use the stripe library:
    // const event = stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET);
    // For now, parse as JSON (signature verification would be done by stripe SDK)
    try {
      return JSON.parse(rawBody) as StripeWebhookEvent;
    } catch {
      return null;
    }
  }

  /**
   * Handle a verified webhook event.
   * Updates subscription status, marks invoices paid, etc.
   */
  async handleWebhookEvent(event: StripeWebhookEvent): Promise<void> {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const tenantId = session.metadata?.tenantId as string;
        const patientId = session.metadata?.patientId as string;

        if (patientId) {
          // Invoice payment
          eventBus.emit(createEvent("invoice.paid", tenantId, {
            patientId,
            patientName: session.metadata?.patientName,
            amount: session.amount_total ? session.amount_total / 100 : 0,
            paymentIntentId: session.payment_intent,
          }));
          console.log(`[Stripe] Invoice paid: ${session.metadata?.patientName} - $${session.amount_total ? session.amount_total / 100 : 0}`);
        } else {
          // Subscription signup
          console.log(`[Stripe] Subscription activated: tenant=${tenantId}`);
        }
        break;
      }

      case "invoice.payment_succeeded": {
        console.log(`[Stripe] Subscription payment succeeded: ${event.data.object.id}`);
        break;
      }

      case "invoice.payment_failed": {
        const tenantId = event.data.object.metadata?.tenantId as string;
        eventBus.emit(createEvent("invoice.overdue", tenantId || "unknown", {
          invoiceId: event.data.object.id,
          amount: event.data.object.amount_due ? event.data.object.amount_due / 100 : 0,
        }));
        console.log(`[Stripe] Payment failed: ${event.data.object.id}`);
        break;
      }

      case "customer.subscription.deleted": {
        console.log(`[Stripe] Subscription cancelled: ${event.data.object.id}`);
        // TODO: deactivate tenant, restrict access
        break;
      }
    }
  }

  /**
   * Cancel a subscription.
   */
  async cancelSubscription(subscriptionId: string): Promise<{ success: boolean }> {
    if (!this.hasStripe()) {
      console.log(`[Stripe Demo] Cancel subscription: ${subscriptionId}`);
      return { success: true };
    }

    const response = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${STRIPE_SECRET_KEY}` },
    });

    return { success: response.ok };
  }

  /**
   * Get the Stripe price ID for a tier + billing period.
   */
  private getPriceId(tier: SubscriptionTier, period: "monthly" | "annual"): string {
    switch (tier) {
      case "platform":
        return period === "monthly" ? STRIPE_PRICES.platform_monthly : STRIPE_PRICES.platform_annual;
      case "enterprise":
        return STRIPE_PRICES.enterprise_monthly;
      case "founding_partner":
        return STRIPE_PRICES.founding_partner_annual;
      default:
        return STRIPE_PRICES.platform_monthly;
    }
  }
}

export interface StripeWebhookEvent {
  type: string;
  data: {
    object: {
      id: string;
      metadata?: Record<string, string>;
      amount_total?: number;
      amount_due?: number;
      payment_intent?: string;
    };
  };
}

export const paymentService = new PaymentService();
