import { NextRequest, NextResponse } from "next/server";
import { voiceNoteSchema } from "@/lib/validations";

/**
 * POST /api/voice-notes
 * Submit a voice note (24/7 patient communication — Dr. Balu's feature).
 * Patient can record at 2 AM, system transcribes and adds to timeline.
 *
 * In production:
 * 1. Receive audio file (multipart/form-data)
 * 2. Upload to S3/MinIO
 * 3. Send to Whisper API for transcription
 * 4. Save VoiceNote record
 * 5. Add TimelineEvent
 * 6. Notify doctor if flagged urgent
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = voiceNoteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } },
        { status: 400 }
      );
    }

    const { patientId, durationSec, transcript, audioUrl } = parsed.data;

    // TODO: In production
    // 1. Upload audio to S3
    // const audioUrl = await uploadToS3(audioFile)
    // 2. Transcribe with Whisper
    // const transcript = await transcribeWithWhisper(audioFile)
    // 3. Save to database
    // const voiceNote = await prisma.voiceNote.create({...})
    // 4. Add to timeline
    // await prisma.timelineEvent.create({ type: "note", title: "Voice note received", ... })
    // 5. Check for urgency (keywords: "emergency", "urgent", "pain")
    // if (isUrgent(transcript)) await notifyDoctor(patientId)

    return NextResponse.json({
      data: {
        id: "demo-voice-note-id",
        patientId,
        durationSec,
        transcript,
        audioUrl,
        createdAt: new Date().toISOString(),
      },
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Voice note upload failed" } },
      { status: 500 }
    );
  }
}
