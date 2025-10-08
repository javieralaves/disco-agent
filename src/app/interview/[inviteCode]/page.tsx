import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SeriesStatus } from "@prisma/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Gift, Users, Sparkles } from "lucide-react";
import { ConsentForm } from "./consent-form";
import { MicCheck } from "./mic-check";

interface PageProps {
  params: Promise<{ inviteCode: string }>;
}

export default async function InterviewLandingPage({ params }: PageProps) {
  const { inviteCode } = await params;

  // Find the series by invite link
  const series = await prisma.series.findFirst({
    where: { inviteLink: inviteCode },
    include: {
      _count: {
        select: {
          sessions: true,
        },
      },
    },
  });

  if (!series) {
    notFound();
  }

  // Check if series is active
  if (series.status !== SeriesStatus.ACTIVE) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Interview Series Not Available</CardTitle>
            <CardDescription>
              This interview series is currently{" "}
              {series.status === SeriesStatus.DRAFT
                ? "in draft mode"
                : "closed"}{" "}
              and not accepting participants.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-indigo-600" />
            <span className="text-xl font-bold">Disco</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container flex-1 py-12">
        <div className="mx-auto max-w-3xl space-y-8">
          {/* Series Info Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{series.title}</CardTitle>
                  <CardDescription className="mt-2 text-base">
                    {series.researchFocus}
                  </CardDescription>
                </div>
                <Badge variant="secondary">
                  {series._count.sessions} participants
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Estimated Time */}
                {series.estimatedMinutes && (
                  <div className="flex items-center gap-3 rounded-lg border bg-gray-50 p-4">
                    <Clock className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="text-sm font-medium">Estimated Time</p>
                      <p className="text-sm text-muted-foreground">
                        {series.estimatedMinutes} minutes
                      </p>
                    </div>
                  </div>
                )}

                {/* Incentive */}
                {series.incentive && (
                  <div className="flex items-center gap-3 rounded-lg border bg-gray-50 p-4">
                    <Gift className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="text-sm font-medium">Incentive</p>
                      <p className="text-sm text-muted-foreground">
                        {series.incentive}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* What to Expect */}
          <Card>
            <CardHeader>
              <CardTitle>What to Expect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Users className="mt-0.5 h-5 w-5 text-indigo-600" />
                <div>
                  <p className="font-medium">AI-Moderated Interview</p>
                  <p className="text-sm text-muted-foreground">
                    You'll have a natural conversation with an AI interviewer
                    about your experiences and perspectives.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-5 w-5 text-indigo-600" />
                <div>
                  <p className="font-medium">Your Voice Matters</p>
                  <p className="text-sm text-muted-foreground">
                    Your insights will help improve products and services. All
                    responses are confidential.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Consent Form */}
          <ConsentForm
            seriesId={series.id}
            inviteCode={inviteCode}
            consentText={series.consentText}
            consentVersion={series.consentVersion}
          />

          {/* Mic Check */}
          <MicCheck />
        </div>
      </main>
    </div>
  );
}
