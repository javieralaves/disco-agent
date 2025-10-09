import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  AlertCircle,
  TrendingUp,
  Users,
  FileText,
  Quote,
  BarChart3,
  CheckCircle2,
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ThemeDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  // Get the theme with all related data
  const theme = await prisma.theme.findUnique({
    where: { id },
    include: {
      series: {
        select: {
          id: true,
          title: true,
          researchFocus: true,
          userId: true,
          user: {
            select: {
              email: true,
            },
          },
        },
      },
      evidence: {
        include: {
          session: {
            select: {
              id: true,
              participantName: true,
              participantId: true,
              completedAt: true,
              sentiment: true,
            },
          },
          turn: {
            select: {
              id: true,
              text: true,
              speaker: true,
              turnIndex: true,
            },
          },
        },
      },
    },
  });

  if (!theme) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="mb-4 h-12 w-12 text-gray-400" />
        <h1 className="text-2xl font-bold">Theme not found</h1>
      </div>
    );
  }

  // Check if user owns this theme
  if (theme.series.user.email !== session.user.email) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="mb-4 h-12 w-12 text-red-400" />
        <h1 className="text-2xl font-bold">Access denied</h1>
      </div>
    );
  }

  const confidencePercent = Math.round(theme.confidence * 100);
  const factors = (theme.factors as string[]) || [];

  // Group evidence by session
  const evidenceBySession = theme.evidence.reduce((acc, ev) => {
    const sessionId = ev.sessionId;
    if (!acc[sessionId]) {
      acc[sessionId] = {
        session: ev.session,
        evidence: [],
      };
    }
    acc[sessionId].evidence.push(ev);
    return acc;
  }, {} as Record<string, { session: any; evidence: any[] }>);

  const sessions = Object.values(evidenceBySession);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
          <Link
            href={`/series/${theme.series.id}`}
            className="hover:text-gray-700"
          >
            {theme.series.title}
          </Link>
          <span>/</span>
          <span>Theme</span>
        </div>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-indigo-500" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {theme.title}
              </h1>
              <p className="text-gray-500">Cross-session Pattern Analysis</p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={
              confidencePercent >= 75
                ? "text-green-700 bg-green-50 border-green-200"
                : confidencePercent >= 50
                ? "text-blue-700 bg-blue-50 border-blue-200"
                : "text-yellow-700 bg-yellow-50 border-yellow-200"
            }
          >
            {confidencePercent}% confidence
          </Badge>
        </div>
      </div>

      {/* Rationale */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pattern Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">{theme.rationale}</p>
        </CardContent>
      </Card>

      {/* Confidence Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5 text-indigo-500" />
            Confidence Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium text-gray-600">Volume</p>
              <p className="text-2xl font-bold">
                {Math.round((theme.volumeScore || 0) * 100)}%
              </p>
              <p className="text-xs text-gray-500">
                {theme.evidenceCount} evidence points
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium text-gray-600">Diversity</p>
              <p className="text-2xl font-bold">
                {Math.round((theme.diversityScore || 0) * 100)}%
              </p>
              <p className="text-xs text-gray-500">
                {theme.sessionCount} sessions
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium text-gray-600">Consistency</p>
              <p className="text-2xl font-bold">
                {Math.round((theme.consistencyScore || 0) * 100)}%
              </p>
              <p className="text-xs text-gray-500">Pattern strength</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contributing Factors */}
      {factors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Contributing Factors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {factors.map((factor, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-700">
                  <span className="text-indigo-500">•</span>
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Evidence by Session */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Quote className="h-5 w-5 text-purple-500" />
            Supporting Evidence ({theme.evidenceCount} from {theme.sessionCount}{" "}
            sessions)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {sessions.map(({ session, evidence }) => (
            <div
              key={session.id}
              className="border-l-4 border-indigo-500 bg-indigo-50 p-4"
            >
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <Link
                    href={`/sessions/${session.id}`}
                    className="font-semibold text-indigo-900 hover:text-indigo-700"
                  >
                    Session:{" "}
                    {session.participantName ||
                      session.participantId ||
                      "Anonymous"}
                  </Link>
                  <p className="text-sm text-gray-600">
                    {session.completedAt
                      ? new Date(session.completedAt).toLocaleDateString()
                      : "Unknown date"}
                  </p>
                </div>
                {session.sentiment && (
                  <Badge variant="outline">{session.sentiment}</Badge>
                )}
              </div>
              <div className="space-y-2">
                {evidence.map((ev) => (
                  <div key={ev.id} className="rounded bg-white p-3">
                    {ev.turn ? (
                      <>
                        <p className="text-sm text-gray-500">
                          {ev.turn.speaker === "PARTICIPANT"
                            ? "Participant"
                            : "AI Interviewer"}
                        </p>
                        <p className="mt-1 text-gray-900">"{ev.turn.text}"</p>
                      </>
                    ) : (
                      <p className="text-sm text-gray-600">
                        Evidence from this session
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Linked Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-blue-500" />
            Linked Sessions ({sessions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sessions.map(({ session, evidence }) => (
              <Link
                key={session.id}
                href={`/sessions/${session.id}`}
                className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">
                    {session.participantName ||
                      session.participantId ||
                      "Anonymous"}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {evidence.length} evidence
                  </Badge>
                </div>
                <span className="text-sm text-gray-500">
                  {session.completedAt
                    ? new Date(session.completedAt).toLocaleDateString()
                    : "Unknown"}
                </span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
