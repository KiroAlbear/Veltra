import { NextRequest, NextResponse } from "next/server";
import { intakeSchema } from "@/lib/validations";

/**
 * POST /api/intake
 * Submit patient intake form (Dr. Balu's feature).
 * Creates patient + generates pre-visit brief + adds to timeline.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = intakeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Generate pre-visit brief (the deal-breaker for Dr. Balu)
    const brief = generatePreVisitBrief(data);

    // TODO: Save to database
    // const patient = await prisma.patient.create({...})
    // const intake = await prisma.intake.create({...})
    // await prisma.timelineEvent.create({ type: "note", title: "Intake completed", ... })

    return NextResponse.json({
      data: {
        patientId: "demo-patient-id",
        intakeId: "demo-intake-id",
        preVisitBrief: brief,
      },
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Intake submission failed" } },
      { status: 500 }
    );
  }
}

/**
 * Generate a pre-visit brief from intake data.
 * This is what Dr. Balu sees in 15 seconds before the consultation.
 */
function generatePreVisitBrief(data: any): string {
  const flags: string[] = [];

  if (data.severity && data.severity >= 7) flags.push("high severity");
  if (data.stressLevel && data.stressLevel >= 7) flags.push("elevated stress");
  if (data.sleepHours && Number(data.sleepHours) < 6) flags.push("sleep deprived");
  if (data.allergies && data.allergies.length > 0) flags.push(`${data.allergies.length} allergies on file`);
  if (data.voiceTranscript) flags.push("voice note recorded");

  const parts = [
    `Patient: ${data.name}, ${data.age || "?"} ${data.gender || ""}`,
    data.chiefComplaint ? `Chief concern: ${data.chiefComplaint}` : null,
    data.duration ? `Duration: ${data.duration}` : null,
    data.severity ? `Severity: ${data.severity}/10` : null,
    data.conditions && data.conditions.length > 0 ? `Conditions: ${data.conditions.join(", ")}` : null,
    data.medications && data.medications.length > 0 ? `Medications: ${data.medications.join(", ")}` : null,
    data.sleepHours ? `Sleep: ${data.sleepHours}h/night` : null,
    data.stressLevel ? `Stress: ${data.stressLevel}/10` : null,
    flags.length > 0 ? `\n⚠ Flags: ${flags.join(", ")}` : null,
    data.voiceTranscript ? `\nVoice note: "${data.voiceTranscript.substring(0, 200)}..."` : null,
  ].filter(Boolean);

  return parts.join("\n");
}
