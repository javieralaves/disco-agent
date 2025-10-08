import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SessionStatus } from "@prisma/client";

/**
 * POST /api/interview/complete
 * Complete an interview session
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing sessionId" },
        { status: 400 }
      );
    }

    // Get the session
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Calculate session duration
    const startTime = session.startedAt || session.createdAt;
    const endTime = new Date();
    const durationMs = endTime.getTime() - startTime.getTime();

    // Update the session
    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data: {
        status: SessionStatus.COMPLETED,
        completedAt: endTime,
        durationMs,
      },
    });

    console.log(`✅ Session completed: ${sessionId}`);
    console.log(`  - Duration: ${Math.floor(durationMs / 1000)}s`);
    console.log(`  - Started: ${startTime.toISOString()}`);
    console.log(`  - Completed: ${endTime.toISOString()}`);

    return NextResponse.json(
      { success: true, session: updatedSession },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error completing session:", error);
    return NextResponse.json(
      { error: "Failed to complete session" },
      { status: 500 }
    );
  }
}

