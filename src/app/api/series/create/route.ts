import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      title,
      researchFocus,
      context,
      researchGoals,
      questions,
      preInterviewQuestions,
    } = await req.json();

    console.log("📝 Creating series with data:");
    console.log("  - Title:", title);
    console.log("  - Research Goals:", researchGoals?.length);
    console.log("  - Questions:", questions?.length);
    console.log("  - Pre-Interview Questions:", preInterviewQuestions?.length);
    console.log("  - Questions preview:", questions?.slice(0, 2));

    if (!title || !researchFocus || !researchGoals || !questions) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate a unique invite link code
    const inviteCode = crypto.randomBytes(8).toString("hex");

    // Create the series with goals and questions
    const series = await prisma.series.create({
      data: {
        userId: user.id,
        title,
        researchFocus,
        context: context || {},
        researchGoals: researchGoals || [],
        questions: questions || [],
        preInterviewQuestions: preInterviewQuestions || [],
        inviteLink: inviteCode,
        status: "DRAFT",
        language: "en",
        retentionDays: 90, // Default 90 days
        consentText: "Default consent text", // TODO: Make this configurable
        consentVersion: 1,
      },
    });

    return NextResponse.json({ series });
  } catch (error) {
    console.error("Error creating series:", error);
    return NextResponse.json(
      { error: "Failed to create series" },
      { status: 500 }
    );
  }
}
