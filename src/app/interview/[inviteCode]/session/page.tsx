import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SessionStatus } from "@prisma/client";
import { InterviewClient } from "./interview-client";

interface PageProps {
  params: Promise<{ inviteCode: string }>;
}

export default async function InterviewSessionPage({ params }: PageProps) {
  const { inviteCode } = await params;

  // Get session ID from query params or localStorage (handled by client)
  // For now, we'll rely on the client component to get it from localStorage

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <InterviewClient inviteCode={inviteCode} />
    </div>
  );
}
