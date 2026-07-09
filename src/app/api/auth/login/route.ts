import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/lib/validations";

/**
 * POST /api/auth/login
 * Validates credentials and returns a session token.
 * In production: verify passwordHash, issue JWT, set httpOnly cookie.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    // TODO: Replace with real database lookup
    // const user = await prisma.user.findUnique({ where: { email } });
    // if (!user || !await bcrypt.compare(password, user.passwordHash)) {
    //   return NextResponse.json({ error: { code: "INVALID_CREDENTIALS" } }, { status: 401 });
    // }

    // TODO: Issue JWT token
    // const token = await signJWT({ userId: user.id, tenantId: user.tenantId });

    // Demo response
    return NextResponse.json({
      data: {
        userId: "demo-user-id",
        email,
        requiresTwoFactor: false,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Login failed" } },
      { status: 500 }
    );
  }
}
