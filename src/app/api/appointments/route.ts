import { NextRequest, NextResponse } from "next/server";
import { createAppointmentSchema } from "@/lib/validations";

/**
 * GET /api/appointments
 * List appointments (filterable by date, doctor, status).
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const doctorId = searchParams.get("doctorId");

  // TODO: Fetch from database, tenant-scoped
  return NextResponse.json({
    data: [],
    meta: { date, doctorId },
  });
}

/**
 * POST /api/appointments
 * Book a new appointment.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createAppointmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } },
        { status: 400 }
      );
    }

    // TODO: Create appointment + send email reminder + log audit
    // const appointment = await prisma.appointment.create({...})
    // await sendEmailReminder(appointment)
    // await logAudit("BOOKED_APPOINTMENT", appointment.id)

    return NextResponse.json({
      data: { id: "demo-appt-id", ...parsed.data, status: "scheduled" },
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to book appointment" } },
      { status: 500 }
    );
  }
}
