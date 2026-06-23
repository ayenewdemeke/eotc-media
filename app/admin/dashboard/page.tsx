import { prisma } from "@/lib/prisma"
import { Users, Music, MessageSquare, BookOpen, MousePointerClick, MessageCircle } from "lucide-react"
import { PageHeader } from "@/components/admin/shared/PageHeader"
import { StatsCard } from "@/components/admin/shared/StatsCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function AdminDashboardPage() {
  const [
    totalUsers,
    totalHymns,
    totalSermons,
    totalBooks,
    hymnClicks,
    sermonClicks,
    recentFeedbacks,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.hmHymn.count({ where: { approvalStatus: { name: "Accepted" } } }),
    prisma.smSermon.count({ where: { approvalStatus: { name: "Accepted" } } }),
    prisma.cbBook.count({ where: { approvalStatus: { name: "Accepted" } } }),
    prisma.hmHymn.aggregate({ _sum: { clicksCount: true } }),
    prisma.smSermon.aggregate({ _sum: { clicksCount: true } }),
    prisma.contactUs.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { id: true, name: true, email: true, createdAt: true } }),
  ])

  const totalClicks =
    Number((hymnClicks as { _sum: { clicksCount: bigint | null } })._sum.clicksCount ?? 0) +
    Number((sermonClicks as { _sum: { clicksCount: bigint | null } })._sum.clicksCount ?? 0)

  const stats = [
    { label: "Registered users", value: totalUsers, icon: Users },
    { label: "Published hymns", value: totalHymns, icon: Music },
    { label: "Published sermons", value: totalSermons, icon: MessageSquare },
    { label: "Published books", value: totalBooks, icon: BookOpen },
    { label: "Total clicks", value: totalClicks, icon: MousePointerClick },
    { label: "Feedbacks", value: recentFeedbacks.length >= 5 ? "5+" : String(recentFeedbacks.length), icon: MessageCircle },
  ]

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <PageHeader title="Dashboard" description="Platform-wide overview." />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {stats.map(s => (
          <StatsCard key={s.label} title={s.label} value={s.value} icon={s.icon} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent users */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-sm">Recent users</CardTitle>
          </CardHeader>
          <CardContent className="divide-y p-0">
            {recentUsers.map(u => (
              <div key={u.id} className="flex items-center gap-3 px-5 py-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                  {(u.name || u.email || "?").charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{u.name || "—"}</p>
                  <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                </div>
                <span className="ml-auto flex-shrink-0 text-xs text-muted-foreground">
                  {new Date(u.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent feedbacks */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-sm">Recent feedbacks</CardTitle>
          </CardHeader>
          <CardContent className="divide-y p-0">
            {recentFeedbacks.length === 0 && (
              <p className="px-5 py-4 text-sm text-muted-foreground">No feedbacks yet.</p>
            )}
            {recentFeedbacks.map(f => (
              <div key={f.id} className="px-5 py-3">
                <div className="mb-0.5 flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">{f.name || f.email || "Anonymous"}</span>
                  <span className="text-xs text-muted-foreground">{new Date(f.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="line-clamp-2 text-sm text-muted-foreground">{f.message}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
