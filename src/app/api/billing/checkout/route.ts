import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSchema } from "@/lib/validations";

// Stripe price IDs — Veltra Platform only (Enterprise is custom).
// Founding Partner pricing is applied via a separate coupon/promotion code in Stripe.
const STRIPE_PRICES = {
  platform: {
    monthly: process.env.STRIPE_PRICE_PLATFORM_MONTHLY || "price_platform_monthly",
    annual: process.env.STRIPE_PRICE_PLATFORM_ANNUAL || "price_platform_annual",
    "3year": process.env.STRIPE_PRICE_PLATFORM_3YEAR || "price_platform_3year",
  },
  enterprise: {
    // Enterprise is custom — not self-serve
    monthly: null,
    annual: null,
    "3year": null,
  },
} as const;

/**
 * POST /api/billing/checkout
 * Create a Stripe Checkout session for subscription signup.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createCheckoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } },
        { status: 400 }
      );
    }

    const { tier, billing, successUrl, cancelUrl } = parsed.data;

    // Enterprise requires custom contract — redirect to contact
    if (tier === "enterprise") {
      return NextResponse.json({
        data: {
          redirectUrl: "mailto:hello@veltrahealth.co?subject=Enterprise inquiry",
        },
      });
    }

    const priceId = STRIPE_PRICES[tier][billing as "monthly" | "annual" | "3year"];
    if (!priceId) {
      return NextResponse.json(
        { error: { code: "INVALID_TIER", message: "Price not configured" } },
        { status: 400 }
      );
    }

    // TODO: Create Stripe Checkout session
    // const session = await stripe.checkout.sessions.create({
    //   mode: "subscription",
    //   payment_method_types: ["card"],
    //   line_items: [{ price: priceId, quantity: 1 }],
    //   success_url: successUrl,
    //   cancel_url: cancelUrl,
    //   customer_email: userEmail,
    //   metadata: { tier, tenantId },
    // })

    return NextResponse.json({
      data: {
        // url: session.url,
        url: successUrl, // Demo: redirect directly
        tier,
        billing,
        priceId,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Checkout failed" } },
      { status: 500 }
    );
  }
}
