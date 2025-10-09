import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import { SessionStatus } from "@prisma/client";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/series/generate-themes
 * Analyze sessions across a series to identify recurring themes
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { seriesId } = body;

    if (!seriesId) {
      return NextResponse.json({ error: "Missing seriesId" }, { status: 400 });
    }

    // Get the series
    const series = await prisma.series.findUnique({
      where: { id: seriesId },
      select: {
        id: true,
        title: true,
        researchFocus: true,
        researchGoals: true,
      },
    });

    if (!series) {
      return NextResponse.json({ error: "Series not found" }, { status: 404 });
    }

    // Get all completed and summarized sessions for this series
    const sessions = await prisma.session.findMany({
      where: {
        seriesId,
        status: SessionStatus.COMPLETED,
        summarized: true,
      },
      include: {
        turns: {
          orderBy: { turnIndex: "asc" },
          select: {
            id: true,
            text: true,
            speaker: true,
            turnIndex: true,
          },
        },
      },
      orderBy: {
        completedAt: "desc",
      },
    });

    if (sessions.length === 0) {
      return NextResponse.json(
        {
          error:
            "No completed and summarized sessions found for this series. Complete and summarize at least one session first.",
        },
        { status: 400 }
      );
    }

    console.log(`🔍 Analyzing themes for series: ${series.title}`);
    console.log(`  - Sessions: ${sessions.length}`);
    console.log(
      `  - Total turns: ${sessions.reduce((sum, s) => sum + s.turns.length, 0)}`
    );

    // Build a comprehensive prompt with all session data
    const sessionsData = sessions
      .map((session, index) => {
        const summary = session.summary as any;

        // Extract key points from the summary
        const problems =
          summary?.problems?.map((p: any) => p.description).join("\n  - ") ||
          "None";
        const goals =
          summary?.goals?.map((g: any) => g.description).join("\n  - ") ||
          "None";
        const friction =
          summary?.friction?.map((f: any) => f.description).join("\n  - ") ||
          "None";
        const opportunities =
          summary?.opportunities
            ?.map((o: any) => o.description)
            .join("\n  - ") || "None";

        return `
SESSION ${index + 1} (ID: ${session.id}):
Duration: ${
          session.durationMs
            ? Math.floor(session.durationMs / 1000 / 60)
            : "N/A"
        } minutes
Sentiment: ${session.sentiment || "NEUTRAL"}

Problems:
  - ${problems}

Goals:
  - ${goals}

Friction Points:
  - ${friction}

Opportunities:
  - ${opportunities}

Key Quotes:
${session.turns
  .filter((t) => t.speaker === "PARTICIPANT")
  .slice(0, 5)
  .map((t) => `  "${t.text}"`)
  .join("\n")}
`;
      })
      .join("\n---\n");

    const prompt = `You are a qualitative research analyst specializing in theme synthesis across multiple user interviews.

RESEARCH CONTEXT:
Series: ${series.title}
Research Focus: ${series.researchFocus}
Research Goals: ${JSON.stringify(series.researchGoals)}

SESSIONS ANALYZED:
${sessionsData}

Your task is to identify recurring THEMES across all ${
      sessions.length
    } sessions. A theme is a pattern, insight, or finding that appears across multiple sessions.

For each theme, provide:
1. A clear, concise title (5-10 words)
2. A detailed rationale explaining the pattern
3. Supporting evidence from specific sessions (include session IDs and quotes)
4. Contributing factors that make this theme significant

Respond with a JSON object in this exact format:
{
  "themes": [
    {
      "title": "Brief theme title",
      "rationale": "Detailed explanation of why this is a significant pattern across sessions",
      "evidence": [
        {
          "sessionId": "session_id_here",
          "quote": "Specific quote or finding from that session",
          "relevance": "Why this piece of evidence supports the theme"
        }
      ],
      "factors": [
        "Factor 1: Specific contributing element",
        "Factor 2: Another contributing element"
      ],
      "sessionIds": ["session_id_1", "session_id_2"]
    }
  ]
}

Important guidelines:
- Only identify themes that appear in at least 2 different sessions
- Focus on insights that relate to the research goals
- Provide specific evidence with session IDs for traceability
- Aim for 3-7 high-quality themes (avoid over-generating)
- Prioritize themes with strong, recurring evidence

Generate the themes now:`;

    // Call OpenAI API
    console.log("🤖 Calling GPT-4o for theme analysis...");
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

    const result = JSON.parse(content);
    const themesData = result.themes || [];

    console.log(`✨ Generated ${themesData.length} themes`);

    // Delete existing themes for this series (fresh analysis)
    await prisma.theme.deleteMany({
      where: { seriesId },
    });

    // Create themes and evidence in the database
    const createdThemes = [];

    for (const themeData of themesData) {
      const sessionIds = themeData.sessionIds || [];
      const evidenceItems = themeData.evidence || [];

      // Calculate confidence score components
      const sessionCount = sessionIds.length;
      const evidenceCount = evidenceItems.length;

      // Volume: How much evidence (0-1)
      const volumeScore = Math.min(evidenceCount / 10, 1);

      // Diversity: How many different sessions (0-1)
      const diversityScore = Math.min(sessionCount / sessions.length, 1);

      // Recency: Based on session dates (newer = higher score)
      // For now, if sessions are recent, score higher
      const recentSessions = sessions.filter((s) => sessionIds.includes(s.id));
      const avgAge =
        recentSessions.reduce((sum, s) => {
          const age = s.completedAt ? Date.now() - s.completedAt.getTime() : 0;
          return sum + age;
        }, 0) / recentSessions.length;
      const recencyScore = Math.max(0, 1 - avgAge / (1000 * 60 * 60 * 24 * 30)); // Decay over 30 days

      // Consistency: If evidence is found across multiple sessions
      const consistencyScore = sessionCount >= 3 ? 1.0 : sessionCount / 3;

      // Contradiction: Simplified - assume no contradictions for now
      const contradictionScore = 0;

      // Overall confidence: weighted average
      const confidence =
        volumeScore * 0.25 +
        diversityScore * 0.3 +
        recencyScore * 0.15 +
        consistencyScore * 0.3 -
        contradictionScore * 0.1;

      // Create theme
      const theme = await prisma.theme.create({
        data: {
          seriesId,
          title: themeData.title,
          rationale: themeData.rationale,
          factors: themeData.factors || [],
          confidence,
          sessionCount,
          evidenceCount,
          volumeScore,
          diversityScore,
          recencyScore,
          consistencyScore,
          contradictionScore,
        },
      });

      // Create evidence records
      for (const evidence of evidenceItems) {
        const sessionId = evidence.sessionId;
        const session = sessions.find((s) => s.id === sessionId);

        if (!session) continue;

        // Find the turn that best matches the quote (simplified approach)
        const matchingTurn = session.turns.find(
          (t) =>
            evidence.quote &&
            t.text
              .toLowerCase()
              .includes(evidence.quote.toLowerCase().substring(0, 50))
        );

        await prisma.evidence.create({
          data: {
            themeId: theme.id,
            sessionId,
            turnId: matchingTurn?.id,
          },
        });
      }

      createdThemes.push({
        ...theme,
        evidence: evidenceItems,
      });

      console.log(`  ✓ ${theme.title}`);
      console.log(`    - Confidence: ${(confidence * 100).toFixed(1)}%`);
      console.log(
        `    - Sessions: ${sessionCount}, Evidence: ${evidenceCount}`
      );
    }

    console.log(`✅ Theme generation complete for series ${seriesId}`);

    return NextResponse.json(
      {
        success: true,
        themes: createdThemes,
        count: createdThemes.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating themes:", error);
    return NextResponse.json(
      { error: "Failed to generate themes" },
      { status: 500 }
    );
  }
}
