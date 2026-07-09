import { NextRequest, NextResponse } from "next/server";
import { sendWhatsAppSchema } from "@/lib/validations";
import { WHATSAPP_NUMBER } from "@/lib/whatsapp";

/**
 * POST /api/whatsapp/send
 * Send a WhatsApp message to a patient via WhatsApp Business API.
 *
 * In production:
 * 1. Validate sender has permission
 * 2. Send via Twilio WhatsApp API or WhatsApp Cloud API
 * 3. Save outbound message to database
 * 4. Add to timeline
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = sendWhatsAppSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } },
        { status: 400 }
      );
    }

    const { patientId, message } = parsed.data;

    // TODO: Send via WhatsApp Business API
    // await twilioClient.messages.create({
    //   from: `whatsapp:${WHATSAPP_NUMBER}`,
    //   to: `whatsapp:${patientPhone}`,
    //   body: message,
    // })

    // TODO: Save to database
    // await prisma.whatsAppMessage.create({...})

    return NextResponse.json({
      data: {
        messageId: "demo-msg-id",
        patientId,
        message,
        status: "sent",
        sentAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "WhatsApp send failed" } },
      { status: 500 }
    );
  }
}

/**
 * GET /api/whatsapp/webhook
 * Webhook verification for WhatsApp Business API.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
