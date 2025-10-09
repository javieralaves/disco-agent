import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SessionStatus } from "@prisma/client";

/**
 * Creates an ephemeral token for the OpenAI Realtime API
 * This endpoint is called by the client when starting an interview
 */
export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    // Verify session exists and is in SCHEDULED status
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        series: {
          select: {
            title: true,
            researchFocus: true,
            researchGoals: true,
            questions: true,
            preInterviewQuestions: true,
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.status !== SessionStatus.SCHEDULED) {
      return NextResponse.json(
        {
          error: `Session cannot be started. Current status: ${session.status}`,
        },
        { status: 400 }
      );
    }

    // Generate ephemeral token from OpenAI
    const openaiResponse = await fetch(
      "https://api.openai.com/v1/realtime/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-realtime-preview-2024-12-17",
          voice: "verse",
          // Instructions for the AI interviewer
          instructions: buildInterviewInstructions(session.series, session),
          // Turn detection configuration
          turn_detection: {
            type: "server_vad",
            threshold: 0.5,
            prefix_padding_ms: 300,
            silence_duration_ms: 500,
          },
          // Input audio transcription
          input_audio_transcription: {
            model: "whisper-1",
          },
        }),
      }
    );

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      console.error("OpenAI Realtime API error:", error);
      throw new Error("Failed to create ephemeral token");
    }

    const data = await openaiResponse.json();

    // Debug: Log the full response to see the structure
    console.log("OpenAI Realtime API response:", JSON.stringify(data, null, 2));

    // Update session status to IN_PROGRESS
    await prisma.session.update({
      where: { id: sessionId },
      data: {
        status: SessionStatus.IN_PROGRESS,
        startedAt: new Date(),
      },
    });

    console.log("✅ Realtime session created for:", sessionId);
    console.log(
      "  - Client secret:",
      data.client_secret?.value ? "present" : "MISSING"
    );

    return NextResponse.json({
      client_secret: data.client_secret?.value,
      session_id: data.id,
      expires_at: data.expires_at,
    });
  } catch (error) {
    console.error("Error creating realtime session:", error);
    return NextResponse.json(
      { error: "Failed to create realtime session" },
      { status: 500 }
    );
  }
}

/**
 * Builds interviewer instructions from series data and participant context
 */
function buildInterviewInstructions(
  series: {
    title: string;
    researchFocus: string;
    researchGoals: any;
    questions: any;
    preInterviewQuestions: any;
  },
  session: {
    participantName?: string | null;
    participantContext?: any;
  }
): string {
  const goals = Array.isArray(series.researchGoals)
    ? series.researchGoals.join("\n- ")
    : "";

  const questionsFormatted = Array.isArray(series.questions)
    ? series.questions
        .map((q: any, i: number) => `${i + 1}. ${q.text}`)
        .join("\n")
    : "";

  // Build participant context summary
  let participantContextSection = "";
  if (
    session.participantContext &&
    typeof session.participantContext === "object"
  ) {
    const preInterviewQuestions = Array.isArray(series.preInterviewQuestions)
      ? series.preInterviewQuestions
      : [];

    const contextDetails: string[] = [];

    // Add participant name if available
    if (session.participantName) {
      contextDetails.push(`Name: ${session.participantName}`);
    }

    // Add answers to pre-interview questions
    preInterviewQuestions.forEach((q: any) => {
      const answer = session.participantContext[q.id];
      if (answer && answer.trim()) {
        contextDetails.push(`${q.question}: ${answer}`);
      }
    });

    if (contextDetails.length > 0) {
      participantContextSection = `

## Participant Context
The participant shared the following information before the interview:
${contextDetails.map((detail) => `- ${detail}`).join("\n")}

**Important Instructions for Using This Context:**
1. Start your first message with a warm acknowledgment of their details (max 1 sentence). For example: "Thanks for sharing that you're a [role] - that's really helpful context!"
2. Use their context to ask CONCRETE, SITUATED questions. Instead of "What do you think about X?", ask "Tell me about the last time you [did something related to their context]..."
3. Build on what they shared. If they mentioned a specific role or experience, dive into that with follow-up questions.
4. Avoid generic prompts. Every question should feel tailored to their specific situation.
`;
    }
  }

  return `You are an empathetic and skilled qualitative research interviewer conducting a user research interview titled "${series.title}".${participantContextSection}

## Research Focus
${series.researchFocus}

## Research Goals
Your interview should uncover insights related to these goals:
- ${goals}

## Interview Questions
Use these questions as a guide, but follow the natural flow of conversation. You can adapt, rephrase, or skip questions as needed. Always prioritize understanding the participant's story and experiences:

${questionsFormatted}

## Interview Guidelines
1. **Be conversational and natural**: Speak as a human researcher, not a robot. Use natural language and show genuine interest.

2. **Practice active listening**: Acknowledge what participants say, use follow-up questions like "Can you tell me more about that?" or "What happened next?"

3. **Use open-ended questions**: Encourage storytelling with questions like "Tell me about a time when..." or "Walk me through your experience with..."

4. **Avoid leading questions**: Don't suggest answers or show bias. Stay neutral and curious.

5. **Dig deeper**: When you hear something interesting, probe further. Ask "Why?" and "How did that make you feel?"

6. **Be patient**: Give participants time to think. Silence is okay.

7. **Stay focused**: Gently guide the conversation back if it goes off-track, but allow for organic detours that reveal interesting insights.

8. **Build rapport**: Start with easier questions, then progress to more complex or sensitive topics.

9. **No PII**: If a participant shares personally identifiable information (full names, addresses, phone numbers, etc.), politely acknowledge it but don't repeat it back or dwell on it.

10. **Time management**: Aim to cover all research goals within the estimated time, but prioritize depth over breadth.

## Interview Structure
1. **Opening** (1-2 min): Introduce yourself warmly, confirm they're comfortable, and ease into the first question.
2. **Main Discussion** (bulk of time): Work through the questions naturally, following interesting threads.
3. **Closing** (1-2 min): Ask if there's anything else they'd like to share, thank them sincerely.

Remember: Your goal is to understand the participant's experiences, needs, and perspectives. Every participant has a unique story—help them tell it.`;
}
