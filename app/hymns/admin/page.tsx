import { prisma } from "@/lib/prisma"
import HymnDashboard from "@/components/admin/hymns/HymnDashboard"

type RawPoint = { date: Date; value: bigint }

function sample(rows: { date: string; value: number }[], maxPoints = 300) {
  if (rows.length <= maxPoints) return rows
  const step = Math.ceil(rows.length / maxPoints)
  return rows.filter((_, i) => i === 0 || i === rows.length - 1 || i % step === 0)
}

export default async function HymnAdminDashboard() {
  const [
    totalUploaded,
    totalAccepted,
    totalUsers,
    clicksResult,
    uploadedRaw,
    acceptedRaw,
    declinedRaw,
    dailyStats,
  ] = await Promise.all([
    prisma.hmHymn.count(),
    prisma.hmHymn.count({ where: { approvalStatus: { name: "Accepted" } } }),
    prisma.user.count(),
    prisma.hmHymn.aggregate({ _sum: { clicksCount: true } }),

    // Cumulative uploaded hymns by day
    prisma.$queryRaw<RawPoint[]>`
      WITH daily AS (
        SELECT DATE_TRUNC('day', created_at) AS date, COUNT(*) AS cnt
        FROM hm_hymns GROUP BY date
      )
      SELECT date, SUM(cnt) OVER (ORDER BY date) AS value
      FROM daily ORDER BY date ASC
    `,

    // Cumulative accepted hymns by day
    prisma.$queryRaw<RawPoint[]>`
      WITH daily AS (
        SELECT DATE_TRUNC('day', created_at) AS date, COUNT(*) AS cnt
        FROM hm_hymns
        WHERE approval_status_id IN (SELECT id FROM hm_approval_statuses WHERE name = 'Accepted')
        GROUP BY date
      )
      SELECT date, SUM(cnt) OVER (ORDER BY date) AS value
      FROM daily ORDER BY date ASC
    `,

    // Cumulative declined hymns by day
    prisma.$queryRaw<RawPoint[]>`
      WITH daily AS (
        SELECT DATE_TRUNC('day', created_at) AS date, COUNT(*) AS cnt
        FROM hm_hymns
        WHERE approval_status_id IN (SELECT id FROM hm_approval_statuses WHERE name = 'Declined')
        GROUP BY date
      )
      SELECT date, SUM(cnt) OVER (ORDER BY date) AS value
      FROM daily ORDER BY date ASC
    `,

    // Clean click data from daily_stats (populated by cron job)
    prisma.dailyStat.findMany({
      orderBy: { date: "asc" },
      select: { date: true, hymnTotalClicks: true },
    }),
  ])

  const totalClicks = Number((clicksResult as { _sum: { clicksCount: bigint | null } })._sum.clicksCount ?? 0)

  const toPoints = (rows: RawPoint[]) =>
    rows.map(r => ({ date: new Date(r.date).toISOString(), value: Number(r.value) }))

  // Build the click series from the cumulative totals (reliable) rather than the
  // stored per-day deltas (which spike to the full total on the first run and on
  // any day the cron missed). Daily clicks are the change in the cumulative
  // total, spread evenly across skipped days; the first recorded day has no prior
  // reference, so its daily value is 0.
  const DAY_MS = 24 * 60 * 60 * 1000
  const clickRows = dailyStats.map(r => ({ date: new Date(r.date), total: r.hymnTotalClicks }))

  const totalClicksData = clickRows.map(r => ({ date: r.date.toISOString(), value: r.total }))

  const dailyClicksData: { date: string; value: number }[] = []
  for (let i = 0; i < clickRows.length; i++) {
    const curr = clickRows[i]
    if (i === 0) {
      dailyClicksData.push({ date: curr.date.toISOString(), value: 0 })
      continue
    }
    const prev = clickRows[i - 1]
    const gapDays = Math.max(1, Math.round((curr.date.getTime() - prev.date.getTime()) / DAY_MS))
    const perDay = Math.round(Math.max(0, curr.total - prev.total) / gapDays)
    for (let d = 1; d <= gapDays; d++) {
      const day = new Date(prev.date.getTime() + d * DAY_MS)
      dailyClicksData.push({ date: day.toISOString(), value: perDay })
    }
  }

  return (
    <HymnDashboard
      totalUploaded={totalUploaded}
      totalAccepted={totalAccepted}
      totalClicks={totalClicks}
      totalUsers={totalUsers}
      uploadedData={sample(toPoints(uploadedRaw))}
      acceptedData={sample(toPoints(acceptedRaw))}
      declinedData={sample(toPoints(declinedRaw))}
      totalClicksData={totalClicksData}
      dailyClicksData={dailyClicksData}
    />
  )
}
