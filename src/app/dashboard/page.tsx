import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Plus, FolderOpen, TrendingUp, MessageSquare } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const user = await getCurrentUser()

  // Get user's series count
  const seriesCount = user
    ? await prisma.series.count({
        where: { userId: user.id },
      })
    : 0

  // Get recent series
  const recentSeries = user
    ? await prisma.series.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: "desc" },
        take: 5,
        include: {
          _count: {
            select: { sessions: true, themes: true },
          },
        },
      })
    : []

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.name || "User"}!
          </h2>
          <p className="text-muted-foreground">
            Here's what's happening with your research.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link href="/series/new">
              <Plus className="mr-2 h-4 w-4" />
              New Series
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Interview Series</h3>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{seriesCount}</div>
          <p className="text-xs text-muted-foreground">Active research projects</p>
        </div>

        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Total Sessions</h3>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">
            {recentSeries.reduce((acc, s) => acc + s._count.sessions, 0)}
          </div>
          <p className="text-xs text-muted-foreground">Completed interviews</p>
        </div>

        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Themes Discovered</h3>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">
            {recentSeries.reduce((acc, s) => acc + s._count.themes, 0)}
          </div>
          <p className="text-xs text-muted-foreground">Cross-session patterns</p>
        </div>
      </div>

      {/* Recent Series */}
      <div className="rounded-lg border bg-card">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Recent Series</h3>
            <Button variant="ghost" asChild>
              <Link href="/series">View all</Link>
            </Button>
          </div>
        </div>
        <div className="border-t">
          {recentSeries.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <FolderOpen className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-medium">No series yet</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Create your first interview series to get started.
              </p>
              <Button asChild>
                <Link href="/series/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Series
                </Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {recentSeries.map((series) => (
                <Link
                  key={series.id}
                  href={`/series/${series.id}`}
                  className="block p-4 hover:bg-accent"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium leading-none">{series.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {series._count.sessions} sessions · {series._count.themes} themes
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(series.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
