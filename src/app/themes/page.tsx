import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { AlertCircle, TrendingUp, Users, FileText } from "lucide-react";

export default async function ThemesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  // Get all themes for the user's series
  const themes = await prisma.theme.findMany({
    where: {
      series: {
        user: {
          email: session.user.email,
        },
      },
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
          evidence: true,
        },
      },
    },
    orderBy: {
      confidence: "desc",
    },
  });

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Themes</h1>
        <p className="text-gray-500">
          Discover patterns and insights across your research interviews
        </p>
      </div>

      {themes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold">No themes yet</h3>
            <p className="text-center text-sm text-gray-500">
              Generate themes from your series to discover patterns across
              interviews
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {themes.map((theme) => {
            const confidencePercent = Math.round(theme.confidence * 100);
            const confidenceColor =
              confidencePercent >= 75
                ? "text-green-700 bg-green-50 border-green-200"
                : confidencePercent >= 50
                ? "text-blue-700 bg-blue-50 border-blue-200"
                : "text-yellow-700 bg-yellow-50 border-yellow-200";

            return (
              <Link key={theme.id} href={`/themes/${theme.id}`}>
                <Card className="cursor-pointer transition-shadow hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-indigo-500" />
                          <CardTitle className="text-lg">
                            {theme.title}
                          </CardTitle>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {theme.rationale}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            <span>{theme.series.title}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{theme.sessionCount} sessions</span>
                          </div>
                          <span>{theme._count.evidence} evidence points</span>
                        </div>
                      </div>
                      <div className="ml-4 flex flex-col items-end gap-2">
                        <Badge variant="outline" className={confidenceColor}>
                          {confidencePercent}% confidence
                        </Badge>
                        <div className="text-xs text-gray-400">
                          {theme.updatedAt.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
