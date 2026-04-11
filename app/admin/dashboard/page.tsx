import { prisma } from "@/lib/prisma"
import { Users, Music, MessageSquare, BookOpen, MousePointerClick, MessageCircle } from "lucide-react"

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
    prisma.cbBook.count({ where: { approvalStatus: { name: "Approved" } } }),
    prisma.hmHymn.aggregate({ _sum: { clicksCount: true } }),
    prisma.smSermon.aggregate({ _sum: { clicksCount: true } }),
    prisma.contactUs.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { id: true, name: true, email: true, createdAt: true } }),
  ])

  const totalClicks =
    Number((hymnClicks as { _sum: { clicksCount: bigint | null } })._sum.clicksCount ?? 0) +
    Number((sermonClicks as { _sum: { clicksCount: bigint | null } })._sum.clicksCount ?? 0)

  const stats = [
    { label: "Registered Users", value: totalUsers.toLocaleString(), icon: Users, color: "bg-blue-50 text-blue-600" },
    { label: "Published Hymns", value: totalHymns.toLocaleString(), icon: Music, color: "bg-amber-50 text-amber-600" },
    { label: "Published Sermons", value: totalSermons.toLocaleString(), icon: MessageSquare, color: "bg-rose-50 text-rose-600" },
    { label: "Published Books", value: totalBooks.toLocaleString(), icon: BookOpen, color: "bg-green-50 text-green-600" },
    { label: "Total Clicks", value: totalClicks.toLocaleString(), icon: MousePointerClick, color: "bg-purple-50 text-purple-600" },
    { label: "Feedbacks", value: recentFeedbacks.length >= 5 ? "5+" : String(recentFeedbacks.length), icon: MessageCircle, color: "bg-neutral-50 text-neutral-600" },
  ]

  return (
    <div className="p-6 max-w-5xl">
      <h1 className="text-xl font-bold text-neutral-900 mb-6">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
        {stats.map(s => (
          <div key={s.label} className="bg-white border border-neutral-100 rounded-xl p-5 flex items-center gap-4 shadow-xs">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">{s.value}</p>
              <p className="text-xs text-neutral-500 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent users */}
        <div className="bg-white border border-neutral-100 rounded-xl overflow-hidden shadow-xs">
          <div className="px-5 py-3.5 border-b border-neutral-100">
            <h2 className="text-sm font-semibold text-neutral-800">Recent Users</h2>
          </div>
          <div className="divide-y divide-neutral-50">
            {recentUsers.map(u => (
              <div key={u.id} className="px-5 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-semibold text-neutral-600 flex-shrink-0">
                  {(u.name || u.email || "?").charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-800 truncate">{u.name || "—"}</p>
                  <p className="text-xs text-neutral-400 truncate">{u.email}</p>
                </div>
                <span className="ml-auto text-xs text-neutral-400 flex-shrink-0">
                  {new Date(u.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent feedbacks */}
        <div className="bg-white border border-neutral-100 rounded-xl overflow-hidden shadow-xs">
          <div className="px-5 py-3.5 border-b border-neutral-100">
            <h2 className="text-sm font-semibold text-neutral-800">Recent Feedbacks</h2>
          </div>
          <div className="divide-y divide-neutral-50">
            {recentFeedbacks.length === 0 && (
              <p className="px-5 py-4 text-sm text-neutral-400">No feedbacks yet.</p>
            )}
            {recentFeedbacks.map(f => (
              <div key={f.id} className="px-5 py-3">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-medium text-neutral-700">{f.name || f.email || "Anonymous"}</span>
                  <span className="text-xs text-neutral-400">{new Date(f.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-neutral-600 line-clamp-2">{f.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
