import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate pre-interview questions based on research focus
 * These questions help gather participant context before the interview
 */
export async function POST(req: Request) {
  try {
    const { researchFocus, context } = await req.json();

    if (!researchFocus) {
      return NextResponse.json(
        { error: "Missing research focus" },
        { status: 400 }
      );
    }

    const prompt = buildPreInterviewQuestionsPrompt(researchFocus, context);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an expert qualitative researcher who designs thoughtful, non-discriminatory pre-interview questions.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(
      completion.choices[0].message.content || '{"questions": []}'
    );

    console.log("✅ Generated pre-interview questions:", result.questions);

    return NextResponse.json({
      questions: result.questions || [],
    });
  } catch (error) {
    console.error("Error generating pre-interview questions:", error);
    return NextResponse.json(
      { error: "Failed to generate questions" },
      { status: 500 }
    );
  }
}

function buildPreInterviewQuestionsPrompt(
  researchFocus: string,
  context?: any
): string {
  const contextInfo = context
    ? `
Additional Context:
- Company: ${context.company || "N/A"}
- Product: ${context.product || "N/A"}
- Assumptions: ${context.assumptions || "N/A"}
- Hypotheses: ${context.hypotheses || "N/A"}
`
    : "";

  return `Generate 2-3 pre-interview questions that will help the interviewer understand the participant's background and context BEFORE the interview begins.

Research Focus:
${researchFocus}
${contextInfo}

Requirements:
1. Questions should be OPEN-ENDED and encourage elaboration
2. Questions must be NON-DISCRIMINATORY (avoid age, race, gender, religion, sexual orientation, disability, etc.)
3. Questions should help understand the participant's relevant experience or perspective
4. Questions should be OPTIONAL for participants to answer
5. Keep questions concise but meaningful

For each question, provide:
- A unique ID (use format: "q1", "q2", "q3")
- The question text
- A helpful placeholder text for the input field

Example output format:
{
  "questions": [
    {
      "id": "q1",
      "question": "What is your current role or occupation?",
      "placeholder": "e.g., Product Manager, Student, etc."
    },
    {
      "id": "q2", 
      "question": "How often do you use [relevant product/service]?",
      "placeholder": "e.g., Daily, weekly, never used it before"
    }
  ]
}

Generate 2-3 questions that are most relevant to this specific research focus.
Return ONLY valid JSON matching the format above.`;
}
