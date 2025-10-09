import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import { SessionStatus } from "@prisma/client";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/session/summarize
 * Generate AI summary for a completed session
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    // Get the session with turns
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        turns: {
          orderBy: { turnIndex: "asc" },
        },
        series: {
          select: {
            title: true,
            researchFocus: true,
            researchGoals: true,
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.status !== SessionStatus.COMPLETED) {
      return NextResponse.json(
        { error: "Session must be completed before summarization" },
        { status: 400 }
      );
    }

    if (session.turns.length === 0) {
      return NextResponse.json(
        { error: "Session has no conversation turns" },
        { status: 400 }
      );
    }

    console.log(`🤖 Starting summarization for session ${sessionId}...`);
    console.log(`  - Series: ${session.series.title}`);
    console.log(`  - Turns: ${session.turns.length}`);
    console.log(
      `  - Duration: ${Math.floor((session.durationMs || 0) / 1000)}s`
    );

    // Build conversation transcript
    const transcript = session.turns
      .map((turn) => {
        const speaker =
          turn.speaker === "PARTICIPANT" ? "Participant" : "Interviewer";
        return `${speaker}: ${turn.text}`;
      })
      .join("\n\n");

    // Create summarization prompt
    const prompt = `You are a qualitative research analyst. Analyze the following user research interview and provide a structured summary.

RESEARCH CONTEXT:
Series: ${session.series.title}
Research Focus: ${session.series.researchFocus}
Research Goals: ${JSON.stringify(session.series.researchGoals)}

INTERVIEW TRANSCRIPT:
${transcript}

Please provide a comprehensive analysis in the following JSON format:
{
  "problems": [
    { "description": "Clear problem statement", "severity": "high|medium|low", "quote": "Supporting quote from transcript" }
  ],
  "goals": [
    { "description": "User goal or need", "priority": "high|medium|low", "quote": "Supporting quote from transcript" }
  ],
  "friction": [
    { "description": "Pain point or friction", "impact": "high|medium|low", "quote": "Supporting quote from transcript" }
  ],
  "opportunities": [
    { "description": "Opportunity for improvement", "potential": "high|medium|low", "quote": "Supporting quote from transcript" }
  ],
  "highlights": [
    { "quote": "Most impactful quote from interview", "context": "Why this is significant", "timestamp": "approximate time in conversation" }
  ],
  "sentiment": "POSITIVE|NEUTRAL|NEGATIVE",
  "suggestedActions": [
    { "action": "Specific recommended action", "priority": "high|medium|low", "rationale": "Why this action is recommended" }
  ],
  "keyInsights": [
    "Brief insight statement 1",
    "Brief insight statement 2",
    "Brief insight statement 3"
  ]
}

Focus on extracting actionable insights that align with the research goals. Ensure all items include supporting quotes from the transcript.`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an expert qualitative research analyst. Always respond with valid JSON only, no markdown formatting.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error("No content returned from OpenAI");
    }

    // Parse the response
    const summary = JSON.parse(content);

    // Extract sentiment and suggested actions
    const sentiment = summary.sentiment || "NEUTRAL";
    const suggestedActions = summary.suggestedActions || [];

    // Update the session
    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data: {
        summary,
        sentiment,
        suggestedActions,
        summarized: true,
      },
    });

    console.log(`✅ Summary generated for session ${sessionId}`);
    console.log(`  - Problems: ${summary.problems?.length || 0}`);
    console.log(`  - Goals: ${summary.goals?.length || 0}`);
    console.log(`  - Friction: ${summary.friction?.length || 0}`);
    console.log(`  - Opportunities: ${summary.opportunities?.length || 0}`);
    console.log(`  - Highlights: ${summary.highlights?.length || 0}`);
    console.log(`  - Sentiment: ${sentiment}`);
    console.log(`  - Actions: ${suggestedActions.length}`);

    return NextResponse.json(
      {
        success: true,
        session: updatedSession,
        summary,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error summarizing session:", error);
    return NextResponse.json(
      { error: "Failed to summarize session" },
      { status: 500 }
    );
  }
}
