import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/interview/turn
 * Save a conversation turn to the database
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, speaker, text } = body;

    if (!sessionId || !speaker || !text) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the current session to validate it exists and get the last turn index
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Get the last turn to calculate the next turn index
    const lastTurn = await prisma.turn.findFirst({
      where: { sessionId },
      orderBy: { turnIndex: "desc" },
    });

    // Calculate the next turn index
    const nextTurnIndex = lastTurn ? lastTurn.turnIndex + 1 : 0;

    // Calculate timestamp from session start
    const sessionStartTime = session.startedAt || session.createdAt;
    const tStartMs = Math.floor(Date.now() - sessionStartTime.getTime());

    // Simple PII redaction: Replace email addresses and phone numbers
    let redactedText = text;
    
    // Redact email addresses
    redactedText = redactedText.replace(
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      "[EMAIL REDACTED]"
    );
    
    // Redact phone numbers (various formats)
    redactedText = redactedText.replace(
      /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
      "[PHONE REDACTED]"
    );

    // Create the turn
    const turn = await prisma.turn.create({
      data: {
        sessionId,
        turnIndex: nextTurnIndex,
        speaker: speaker === "user" ? "PARTICIPANT" : "AI",
        tStartMs,
        text: redactedText,
      },
    });

    console.log(`✅ Turn ${nextTurnIndex} saved for session ${sessionId}`);
    console.log(`  - Speaker: ${speaker}`);
    console.log(`  - Text length: ${text.length} chars`);
    console.log(`  - PII redacted: ${text !== redactedText}`);

    return NextResponse.json({ success: true, turn }, { status: 201 });
  } catch (error) {
    console.error("Error saving turn:", error);
    return NextResponse.json(
      { error: "Failed to save turn" },
      { status: 500 }
    );
  }
}

