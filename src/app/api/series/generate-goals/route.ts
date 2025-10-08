import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Debug logging
console.log(
  "🔑 OpenAI API Key loaded:",
  process.env.OPENAI_API_KEY
    ? `${process.env.OPENAI_API_KEY.substring(
        0,
        10
      )}...${process.env.OPENAI_API_KEY.slice(-4)}`
    : "NOT FOUND"
);

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { researchFocus, context } = await req.json();

    if (!researchFocus) {
      return NextResponse.json(
        { error: "Research focus is required" },
        { status: 400 }
      );
    }

    // Build the prompt for GPT-4
    let prompt = `You are a UX research expert helping to plan user interviews. Based on the following research focus, generate 3-5 specific, actionable research goals that will guide the interview.

Research Focus: ${researchFocus}`;

    if (context) {
      if (context.company) {
        prompt += `\n\nCompany/Product: ${context.company}`;
      }
      if (context.product) {
        prompt += `\n\nProduct Context: ${context.product}`;
      }
      if (context.assumptions) {
        prompt += `\n\nCurrent Assumptions: ${context.assumptions}`;
      }
      if (context.hypotheses) {
        prompt += `\n\nHypotheses/Questions: ${context.hypotheses}`;
      }
    }

    prompt += `\n\nGenerate 3-5 research goals that are:
1. Specific and measurable
2. Focused on understanding user behavior, motivations, or pain points
3. Actionable - they should lead to insights that can inform product decisions
4. Different from each other - cover various aspects of the research focus

Return ONLY a JSON array of strings, with each string being a research goal. Example format:
["Goal 1", "Goal 2", "Goal 3"]`;

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a UX research expert. Return responses as JSON arrays only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    // Strip markdown code blocks if present
    let cleanedContent = content.trim();
    if (cleanedContent.startsWith("```json")) {
      cleanedContent = cleanedContent
        .replace(/^```json\n?/, "")
        .replace(/\n?```$/, "");
    } else if (cleanedContent.startsWith("```")) {
      cleanedContent = cleanedContent
        .replace(/^```\n?/, "")
        .replace(/\n?```$/, "");
    }

    // Parse the JSON response
    const goals = JSON.parse(cleanedContent);

    if (!Array.isArray(goals)) {
      throw new Error("Invalid response format from OpenAI");
    }

    return NextResponse.json({ goals });
  } catch (error) {
    console.error("Error generating goals:", error);
    return NextResponse.json(
      { error: "Failed to generate research goals" },
      { status: 500 }
    );
  }
}
