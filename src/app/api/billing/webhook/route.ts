import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/billing/webhook
 * Stripe webhook handler — processes subscription events.
 *
 * In production:
 * 1. Verify webhook signature
 * 2. Handle events: checkout.session.completed, customer.subscription.updated, etc.
 * 3. Update Subscription record in database
 * 4. Update Tenant tier
 * 5. Send welcome email
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: { code: "MISSING_SIGNATURE" } },
        { status: 400 }
      );
    }

    // TODO: Verify and construct event
    // const event = stripe.webhooks.constructEvent(
    //   body,
    //   signature,
    //   process.env.STRIPE_WEBHOOK_SECRET
    // )

    // TODO: Handle event types
    // switch (event.type) {
    //   case "checkout.session.completed":
    //     await activateSubscription(event.data.object)
    //     break
    //   case "customer.subscription.updated":
    //     await updateSubscription(event.data.object)
    //     break
    //   case "customer.subscription.deleted":
    //     await cancelSubscription(event.data.object)
    //     break
    // }

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json(
      { error: { code: "WEBHOOK_ERROR", message: "Webhook handler failed" } },
      { status: 500 }
    );
  }
}
