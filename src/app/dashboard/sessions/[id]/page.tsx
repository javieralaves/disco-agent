import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatDistanceToNow, format } from "date-fns";
import {
  Clock,
  User,
  Calendar,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Target,
  AlertTriangle,
  Lightbulb,
  Zap,
} from "lucide-react";
import { SummarizeButton } from "./summarize-button";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SessionDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  // Get the session with all related data
  const interviewSession = await prisma.session.findUnique({
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
      turns: {
        orderBy: { turnIndex: "asc" },
      },
    },
  });

  if (!interviewSession) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="mb-4 h-12 w-12 text-gray-400" />
        <h1 className="text-2xl font-bold">Session not found</h1>
      </div>
    );
  }

  // Check if user owns this session
  if (interviewSession.series.user.email !== session.user.email) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="mb-4 h-12 w-12 text-red-400" />
        <h1 className="text-2xl font-bold">Access denied</h1>
      </div>
    );
  }

  const summary = interviewSession.summary as any;
  const suggestedActions = interviewSession.suggestedActions as any[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {interviewSession.series.title}
          </h1>
          <p className="text-gray-500">Interview Session Details</p>
        </div>
        {!interviewSession.summarized && <SummarizeButton sessionId={id} />}
      </div>

      {/* Session Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Session Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-sm font-medium">Participant</p>
              <p className="text-sm text-gray-600">
                {interviewSession.participantName ||
                  interviewSession.participantId ||
                  "Anonymous"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-sm font-medium">Duration</p>
              <p className="text-sm text-gray-600">
                {interviewSession.durationMs
                  ? `${Math.floor(
                      interviewSession.durationMs / 1000 / 60
                    )}m ${Math.floor(
                      (interviewSession.durationMs / 1000) % 60
                    )}s`
                  : "N/A"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-sm font-medium">Completed</p>
              <p className="text-sm text-gray-600">
                {interviewSession.completedAt
                  ? formatDistanceToNow(interviewSession.completedAt, {
                      addSuffix: true,
                    })
                  : "N/A"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-sm font-medium">Conversation</p>
              <p className="text-sm text-gray-600">
                {interviewSession.turns.length} turns
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Section */}
      {interviewSession.summarized && summary ? (
        <div className="space-y-4">
          {/* Sentiment & Key Insights */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  Overall Sentiment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge
                  variant={
                    interviewSession.sentiment === "POSITIVE"
                      ? "default"
                      : interviewSession.sentiment === "NEGATIVE"
                      ? "destructive"
                      : "secondary"
                  }
                  className="text-lg"
                >
                  {interviewSession.sentiment || "NEUTRAL"}
                </Badge>
              </CardContent>
            </Card>

            {summary.keyInsights && summary.keyInsights.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    Key Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {summary.keyInsights
                      .slice(0, 3)
                      .map((insight: string, i: number) => (
                        <li key={i} className="text-sm text-gray-700">
                          • {insight}
                        </li>
                      ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Problems */}
          {summary.problems && summary.problems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  Problems Identified ({summary.problems.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {summary.problems.map((problem: any, i: number) => (
                  <div
                    key={i}
                    className="border-l-4 border-red-500 bg-red-50 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <p className="font-medium text-gray-900">
                        {problem.description}
                      </p>
                      <Badge variant="outline" className="ml-2">
                        {problem.severity}
                      </Badge>
                    </div>
                    {problem.quote && (
                      <p className="mt-2 text-sm italic text-gray-600">
                        "{problem.quote}"
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Goals */}
          {summary.goals && summary.goals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  User Goals ({summary.goals.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {summary.goals.map((goal: any, i: number) => (
                  <div
                    key={i}
                    className="border-l-4 border-blue-500 bg-blue-50 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <p className="font-medium text-gray-900">
                        {goal.description}
                      </p>
                      <Badge variant="outline" className="ml-2">
                        {goal.priority}
                      </Badge>
                    </div>
                    {goal.quote && (
                      <p className="mt-2 text-sm italic text-gray-600">
                        "{goal.quote}"
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Friction */}
          {summary.friction && summary.friction.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Friction Points ({summary.friction.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {summary.friction.map((f: any, i: number) => (
                  <div
                    key={i}
                    className="border-l-4 border-orange-500 bg-orange-50 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <p className="font-medium text-gray-900">
                        {f.description}
                      </p>
                      <Badge variant="outline" className="ml-2">
                        {f.impact}
                      </Badge>
                    </div>
                    {f.quote && (
                      <p className="mt-2 text-sm italic text-gray-600">
                        "{f.quote}"
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Opportunities */}
          {summary.opportunities && summary.opportunities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-green-500" />
                  Opportunities ({summary.opportunities.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {summary.opportunities.map((opp: any, i: number) => (
                  <div
                    key={i}
                    className="border-l-4 border-green-500 bg-green-50 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <p className="font-medium text-gray-900">
                        {opp.description}
                      </p>
                      <Badge variant="outline" className="ml-2">
                        {opp.potential}
                      </Badge>
                    </div>
                    {opp.quote && (
                      <p className="mt-2 text-sm italic text-gray-600">
                        "{opp.quote}"
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Suggested Actions */}
          {suggestedActions && suggestedActions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-indigo-500" />
                  Suggested Actions ({suggestedActions.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {suggestedActions.map((action: any, i: number) => (
                  <div key={i} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between">
                      <p className="font-medium text-gray-900">
                        {action.action}
                      </p>
                      <Badge variant="outline">{action.priority}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      {action.rationale}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Alert>
          <Sparkles className="h-4 w-4" />
          <AlertDescription>
            This session hasn't been analyzed yet. Click "Generate Summary" to
            create an AI-powered analysis of this interview.
          </AlertDescription>
        </Alert>
      )}

      {/* Transcript */}
      <Card>
        <CardHeader>
          <CardTitle>Conversation Transcript</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {interviewSession.turns.map((turn) => (
            <div
              key={turn.id}
              className={`rounded-lg p-4 ${
                turn.speaker === "PARTICIPANT" ? "bg-blue-50" : "bg-gray-50"
              }`}
            >
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">
                  {turn.speaker === "PARTICIPANT"
                    ? "Participant"
                    : "AI Interviewer"}
                </p>
                <p className="text-xs text-gray-500">
                  {format(turn.createdAt, "HH:mm:ss")}
                </p>
              </div>
              <p className="text-gray-900">{turn.text}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
