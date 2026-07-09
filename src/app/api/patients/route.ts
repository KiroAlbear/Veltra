import { NextRequest, NextResponse } from "next/server";
import { createPatientSchema } from "@/lib/validations";

/**
 * GET /api/patients
 * List patients (cursor-based pagination, tenant-scoped).
 */
export async function GET(req: NextRequest) {
  // TODO: Extract tenantId from auth context
  // TODO: Apply cursor pagination
  return NextResponse.json({
    data: [],
    meta: { cursor: null, total: 0 },
  });
}

/**
 * POST /api/patients
 * Create a new patient.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createPatientSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } },
        { status: 400 }
      );
    }

    // TODO: Create patient in database
    // const patient = await prisma.patient.create({
    //   data: { ...parsed.data, tenantId }
    // });

    return NextResponse.json({
      data: { id: "demo-patient-id", ...parsed.data },
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to create patient" } },
      { status: 500 }
    );
  }
}
