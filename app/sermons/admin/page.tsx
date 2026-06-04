import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/admin/shared/PageHeader"
import { StatsCard } from "@/components/admin/shared/StatsCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Upload, CheckCircle2, Clock, MousePointerClick, Users } from "lucide-react"

type RawPoint = { date: Date; value: bigint }

function sample(rows: { date: string; value: number }[], maxPoints = 300) {
  if (rows.length <= maxPoints) return rows
  const step = Math.ceil(rows.length / maxPoints)
  return rows.filter((_, i) => i === 0 || i === rows.length - 1 || i % step === 0)
}

export default async function SermonAdminDashboard() {
  const [
    totalUploaded,
    totalAccepted,
    totalUsers,
    clicksResult,
  ] = await Promise.all([
    prisma.smSermon.count(),
    prisma.smSermon.count({ where: { approvalStatus: { name: "Accepted" } } }),
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
        WHERE approval_status_id IN (SELECT id FROM sm_approval_statuses WHERE name = 'Accepted')
        GROUP BY date
      )
      SELECT date, SUM(cnt) OVER (ORDER BY date) AS value
      FROM daily ORDER BY date ASC
    `,
    prisma.$queryRaw<RawPoint[]>`
      WITH daily AS (
        SELECT DATE_TRUNC('day', created_at) AS date, COUNT(*) AS cnt
        FROM sm_sermons
        WHERE approval_status_id IN (SELECT id FROM sm_approval_statuses WHERE name = 'Declined')
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
    <div className="space-y-6 p-4 lg:p-6">
      <PageHeader
        title="Sermon dashboard"
        description="Overview of sermon submissions and engagement."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatsCard title="Total uploaded" value={totalUploaded} icon={Upload} />
        <StatsCard title="Total accepted" value={totalAccepted} icon={CheckCircle2} />
        <StatsCard title="Pending review" value={pendingCount} icon={Clock} />
        <StatsCard title="Total clicks" value={totalClicks} icon={MousePointerClick} />
        <StatsCard title="Total users" value={totalUsers} icon={Users} />
      </div>

      {uploadedPts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cumulative sermons</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4">Date</TableHead>
                  <TableHead className="px-4 text-right">Uploaded</TableHead>
                  <TableHead className="px-4 text-right">Accepted</TableHead>
                  <TableHead className="px-4 text-right">Declined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uploadedPts.slice(-10).map((pt, i) => (
                  <TableRow key={i}>
                    <TableCell className="px-4 font-medium">{pt.date}</TableCell>
                    <TableCell className="px-4 text-right tabular-nums">{pt.value}</TableCell>
                    <TableCell className="px-4 text-right tabular-nums">{acceptedPts[i]?.value ?? "—"}</TableCell>
                    <TableCell className="px-4 text-right tabular-nums">{declinedPts[i]?.value ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
