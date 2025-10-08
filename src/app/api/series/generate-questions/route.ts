import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { researchFocus, researchGoals, context } = await req.json();

    if (!researchFocus || !researchGoals || researchGoals.length === 0) {
      return NextResponse.json(
        { error: "Research focus and goals are required" },
        { status: 400 }
      );
    }

    // Build the prompt for GPT-4
    let prompt = `You are a UX research expert helping to create interview questions. Based on the following research focus and goals, generate 2-3 open-ended interview questions for EACH goal.

Research Focus: ${researchFocus}

Research Goals:
${researchGoals
  .map((goal: string, i: number) => `${i + 1}. ${goal}`)
  .join("\n")}`;

    if (context) {
      if (context.company) {
        prompt += `\n\nCompany/Product: ${context.company}`;
      }
      if (context.product) {
        prompt += `\n\nProduct Context: ${context.product}`;
      }
    }

    prompt += `\n\nGenerate interview questions that are:
1. Open-ended (not yes/no questions)
2. Encourage storytelling and detailed responses
3. Use phrases like "Tell me about...", "Walk me through...", "Describe a time when..."
4. Focused on understanding user behavior, motivations, and pain points
5. Specific to each research goal

Return ONLY a JSON array of objects with this structure:
[
  {"goal": "Goal 1 text here", "text": "Question text here"},
  {"goal": "Goal 1 text here", "text": "Another question for goal 1"},
  {"goal": "Goal 2 text here", "text": "Question for goal 2"},
  ...
]

Important: Use the EXACT goal text from the list above.`;

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
      max_tokens: 2000,
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
    const questions = JSON.parse(cleanedContent);

    if (!Array.isArray(questions)) {
      throw new Error("Invalid response format from OpenAI");
    }

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Error generating questions:", error);
    return NextResponse.json(
      { error: "Failed to generate questions" },
      { status: 500 }
    );
  }
}
