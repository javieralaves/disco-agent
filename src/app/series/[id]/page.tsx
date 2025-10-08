import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/copy-button";
import { ArrowLeft, ExternalLink, Users, MessageSquare } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SeriesDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  const { id } = await params;

  const series = await prisma.series.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          sessions: true,
          themes: true,
        },
      },
    },
  });

  if (!series) {
    notFound();
  }

  // Check if user owns this series
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (series.userId !== user?.id) {
    notFound();
  }

  const inviteUrl = `${process.env.NEXTAUTH_URL}/invite/${series.inviteLink}`;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container flex h-16 items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{series.title}</h1>
            <p className="text-sm text-muted-foreground">
              Created {new Date(series.createdAt).toLocaleDateString()}
            </p>
          </div>
          <Badge variant={series.status === "active" ? "default" : "secondary"}>
            {series.status}
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Stats & Actions */}
          <div className="space-y-6">
            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Sessions</span>
                  </div>
                  <span className="font-semibold">
                    {series._count.sessions}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Themes</span>
                  </div>
                  <span className="font-semibold">{series._count.themes}</span>
                </div>
              </CardContent>
            </Card>

            {/* Invite Link */}
            <Card>
              <CardHeader>
                <CardTitle>Invite Participants</CardTitle>
                <CardDescription>
                  Share this link to invite users to your interview series
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-md border bg-gray-50 p-3">
                  <code className="text-xs break-all">{inviteUrl}</code>
                </div>
                <div className="flex gap-2">
                  <CopyButton text={inviteUrl} />
                  <Button variant="outline" asChild>
                    <a
                      href={inviteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6 lg:col-span-2">
            {/* Research Focus */}
            <Card>
              <CardHeader>
                <CardTitle>Research Focus</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{series.researchFocus}</p>
              </CardContent>
            </Card>

            {/* Research Goals */}
            <Card>
              <CardHeader>
                <CardTitle>Research Goals</CardTitle>
                <CardDescription>
                  {(series.researchGoals as string[]).length} goal(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3">
                  {(series.researchGoals as string[]).map((goal, index) => (
                    <li key={index} className="flex gap-3">
                      <Badge variant="secondary">{index + 1}</Badge>
                      <span className="flex-1 text-sm">{goal}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            {/* Questions */}
            <Card>
              <CardHeader>
                <CardTitle>Interview Questions</CardTitle>
                <CardDescription>
                  {(series.questions as any[]).length} question(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(series.researchGoals as string[]).map((goal, goalIndex) => {
                    const goalQuestions = (series.questions as any[]).filter(
                      (q) => q.goal === goal
                    );
                    return (
                      <div key={goalIndex} className="space-y-2">
                        <div className="flex items-start gap-2">
                          <Badge className="mt-0.5">Goal {goalIndex + 1}</Badge>
                          <h4 className="flex-1 text-sm font-medium">{goal}</h4>
                        </div>
                        <ul className="ml-6 space-y-2">
                          {goalQuestions.map((question, qIndex) => (
                            <li
                              key={qIndex}
                              className="text-sm text-muted-foreground"
                            >
                              {qIndex + 1}. {question.text}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
