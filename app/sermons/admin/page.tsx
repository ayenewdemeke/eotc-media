import { prisma } from "@/lib/prisma"

type RawPoint = { date: Date; value: bigint }

function sample(rows: { date: string; value: number }[], maxPoints = 300) {
  if (rows.length <= maxPoints) return rows
  const step = Math.ceil(rows.length / maxPoints)
  return rows.filter((_, i) => i === 0 || i === rows.length - 1 || i % step === 0)
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-900">{typeof value === "number" ? value.toLocaleString() : value}</p>
    </div>
  )
}

export default async function SermonAdminDashboard() {
  const [
    totalUploaded,
    totalAccepted,
    totalUsers,
    clicksResult,
  ] = await Promise.all([
    prisma.smSermon.count(),
    prisma.smSermon.count({ where: { approvalStatus: { name: "Approved" } } }),
    prisma.user.count(),
    prisma.smSermon.aggregate({ _sum: { clicksCount: true } }),
  ])

  const totalClicks = Number((clicksResult as { _sum: { clicksCount: bigint | null } })._sum.clicksCount ?? 0)

  const [uploadedRaw, acceptedRaw, declinedRaw] = await Promise.all([
    prisma.$queryRaw<RawPoint[]>`
      WITH daily AS (
        SELECT DATE_TRUNC('day', created_at) AS date, COUNT(*) AS cnt
        FROM sm_sermons GROUP BY date
      )
      SELECT date, SUM(cnt) OVER (ORDER BY date) AS value
      FROM daily ORDER BY date ASC
    `,
    prisma.$queryRaw<RawPoint[]>`
      WITH daily AS (
        SELECT DATE_TRUNC('day', created_at) AS date, COUNT(*) AS cnt
        FROM sm_sermons
        WHERE approval_status_id IN (SELECT id FROM sm_approval_statuses WHERE name = 'Approved')
        GROUP BY date
      )
      SELECT date, SUM(cnt) OVER (ORDER BY date) AS value
      FROM daily ORDER BY date ASC
    `,
    prisma.$queryRaw<RawPoint[]>`
      WITH daily AS (
        SELECT DATE_TRUNC('day', created_at) AS date, COUNT(*) AS cnt
        FROM sm_sermons
        WHERE approval_status_id IN (SELECT id FROM sm_approval_statuses WHERE name = 'Rejected')
        GROUP BY date
      )
      SELECT date, SUM(cnt) OVER (ORDER BY date) AS value
      FROM daily ORDER BY date ASC
    `,
  ])

  const toPoints = (rows: RawPoint[]) =>
    rows.map(r => ({ date: new Date(r.date).toISOString().slice(0, 10), value: Number(r.value) }))

  const uploadedPts = sample(toPoints(uploadedRaw))
  const acceptedPts = sample(toPoints(acceptedRaw))
  const declinedPts = sample(toPoints(declinedRaw))

  const pendingCount = totalUploaded - totalAccepted

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-slate-900 mb-6">Sermon Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Uploaded" value={totalUploaded} />
        <StatCard label="Total Accepted" value={totalAccepted} />
        <StatCard label="Pending Review" value={pendingCount} />
        <StatCard label="Total Clicks" value={totalClicks} />
        <StatCard label="Total Users" value={totalUsers} />
      </div>

      {uploadedPts.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-4">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Cumulative Sermons</h2>
          <div className="overflow-x-auto">
            <table className="text-xs text-slate-600 w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-1 pr-4">Date</th>
                  <th className="text-right py-1 pr-4">Uploaded</th>
                  <th className="text-right py-1 pr-4">Accepted</th>
                  <th className="text-right py-1">Declined</th>
                </tr>
              </thead>
              <tbody>
                {uploadedPts.slice(-10).map((pt, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    <td className="py-1 pr-4">{pt.date}</td>
                    <td className="text-right py-1 pr-4">{pt.value}</td>
                    <td className="text-right py-1 pr-4">{acceptedPts[i]?.value ?? "—"}</td>
                    <td className="text-right py-1">{declinedPts[i]?.value ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
