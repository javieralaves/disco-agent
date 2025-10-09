import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, FolderOpen, Users, TrendingUp } from "lucide-react";

export default async function SeriesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    redirect("/auth/signin");
  }

  // Get all series for the user
  const allSeries = await prisma.series.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: {
        select: {
          sessions: true,
          themes: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Interview Series
          </h1>
          <p className="text-gray-500">
            Manage all your research interview series
          </p>
        </div>
        <Button asChild>
          <Link href="/series/new">
            <Plus className="mr-2 h-4 w-4" />
            New Series
          </Link>
        </Button>
      </div>

      {allSeries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderOpen className="mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold">No series yet</h3>
            <p className="mb-4 text-center text-sm text-gray-500">
              Create your first interview series to get started.
            </p>
            <Button asChild>
              <Link href="/series/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Series
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {allSeries.map((series) => {
            const statusColor =
              series.status === "ACTIVE"
                ? "default"
                : series.status === "COMPLETED"
                ? "outline"
                : "secondary";

            return (
              <Link key={series.id} href={`/series/${series.id}`}>
                <Card className="cursor-pointer transition-shadow hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <FolderOpen className="h-5 w-5 text-indigo-500" />
                          <CardTitle className="text-lg">
                            {series.title}
                          </CardTitle>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-1">
                          {series.researchFocus}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{series._count.sessions} sessions</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            <span>{series._count.themes} themes</span>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 flex flex-col items-end gap-2">
                        <Badge variant={statusColor as any}>
                          {series.status}
                        </Badge>
                        <div className="text-xs text-gray-400">
                          {series.updatedAt.toLocaleDateString()}
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
