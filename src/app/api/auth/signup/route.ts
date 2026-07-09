import { NextRequest, NextResponse } from "next/server";
import { signupSchema } from "@/lib/validations";

/**
 * POST /api/auth/signup
 * Creates a new tenant (clinic) + admin user + starts Stripe checkout.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } },
        { status: 400 }
      );
    }

    const { email, password, name, clinicName, tier } = parsed.data;

    // TODO: Implement real signup
    // 1. Check if email already exists
    // 2. Hash password (bcrypt, 12 rounds)
    // 3. Create Tenant (clinic) with selected tier
    // 4. Create User as ADMIN
    // 5. Create default Location
    // 6. Send welcome email
    // 7. Return checkout URL for Stripe

    return NextResponse.json({
      data: {
        message: "Signup received. In production, this would create your clinic and redirect to checkout.",
        email,
        clinicName,
        tier,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Signup failed" } },
      { status: 500 }
    );
  }
}
