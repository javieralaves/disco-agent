import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Clock, User, CheckCircle2, AlertCircle } from "lucide-react";

export default async function SessionsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  // Get all sessions for the user's series
  const sessions = await prisma.session.findMany({
    where: {
      series: {
        user: {
          email: session.user.email,
        },
      },
      status: "COMPLETED",
    },
    include: {
      series: {
        select: {
          id: true,
          title: true,
        },
      },
      _count: {
        select: {
          turns: true,
        },
      },
    },
    orderBy: {
      completedAt: "desc",
    },
  });

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sessions</h1>
        <p className="text-gray-500">
          View and analyze completed interview sessions
        </p>
      </div>

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold">No sessions yet</h3>
            <p className="text-center text-sm text-gray-500">
              Completed interview sessions will appear here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sessions.map((s) => (
            <Link key={s.id} href={`/sessions/${s.id}`}>
              <Card className="cursor-pointer transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">
                        {s.series.title}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>
                            {s.participantName ||
                              s.participantId ||
                              "Anonymous"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>
                            {s.durationMs
                              ? `${Math.floor(
                                  s.durationMs / 1000 / 60
                                )}m ${Math.floor((s.durationMs / 1000) % 60)}s`
                              : "N/A"}
                          </span>
                        </div>
                        <span>{s._count.turns} turns</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {s.summarized ? (
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Summarized
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-yellow-50 text-yellow-700 border-yellow-200"
                        >
                          Pending Analysis
                        </Badge>
                      )}
                      <span className="text-xs text-gray-400">
                        {s.completedAt
                          ? formatDistanceToNow(s.completedAt, {
                              addSuffix: true,
                            })
                          : "Unknown"}
                      </span>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
