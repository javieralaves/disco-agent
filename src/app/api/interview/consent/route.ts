import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SessionStatus } from "@prisma/client";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { seriesId, consentVersion } = await req.json();

    if (!seriesId || consentVersion === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify series exists and is active
    const series = await prisma.series.findUnique({
      where: { id: seriesId },
    });

    if (!series) {
      return NextResponse.json({ error: "Series not found" }, { status: 404 });
    }

    if (series.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Series is not accepting participants" },
        { status: 403 }
      );
    }

    // Generate anonymous participant ID
    const participantId = `participant_${crypto
      .randomBytes(8)
      .toString("hex")}`;

    // Create a new session
    const session = await prisma.session.create({
      data: {
        seriesId,
        participantId,
        consentVersion,
        consentGivenAt: new Date(),
        status: SessionStatus.SCHEDULED, // Will become IN_PROGRESS when interview starts
        language: series.language,
      },
    });

    console.log("✅ Session created:", session.id);
    console.log("  - Participant ID:", participantId);
    console.log("  - Consent version:", consentVersion);

    return NextResponse.json({
      sessionId: session.id,
      participantId,
    });
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}
