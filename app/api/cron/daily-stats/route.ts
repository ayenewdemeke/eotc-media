import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Supports both GET (curl from cPanel) and POST
export async function GET(req: NextRequest) { return run(req) }
export async function POST(req: NextRequest) { return run(req) }

async function run(req: NextRequest) {
  // Auth: bearer header OR ?token= query param
  const authHeader = req.headers.get("authorization") ?? ""
  const tokenParam = new URL(req.url).searchParams.get("token") ?? ""
  const secret = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : tokenParam

  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Today (UTC date, time stripped)
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  // 1. Compute current cumulative totals + the most recent PRIOR recorded stat.
  //    Using the latest prior row (not strictly "yesterday") means a gap or the
  //    first run can't dump the whole cumulative total onto one day.
  const [hymnAgg, sermonAgg, priorStat] = await Promise.all([
    prisma.hmHymn.aggregate({ _sum: { clicksCount: true } }),
    prisma.smSermon.aggregate({ _sum: { clicksCount: true } }),
    prisma.dailyStat.findFirst({ where: { date: { lt: today } }, orderBy: { date: "desc" } }),
  ])

  const hymnTotalClicks   = Number((hymnAgg   as { _sum: { clicksCount: bigint | null } })._sum.clicksCount   ?? 0)
  const sermonTotalClicks = Number((sermonAgg  as { _sum: { clicksCount: bigint | null } })._sum.clicksCount  ?? 0)

  // 2. Daily delta vs. the last recorded totals (0 when there is no prior row).
  //    The dashboard spreads this across any skipped days when charting.
  const hymnDailyClicks   = priorStat ? Math.max(0, hymnTotalClicks   - priorStat.hymnTotalClicks)   : 0
  const sermonDailyClicks = priorStat ? Math.max(0, sermonTotalClicks - priorStat.sermonTotalClicks) : 0

  // 3. Upsert today's row
  await prisma.dailyStat.upsert({
    where:  { date: today },
    update: { hymnTotalClicks, hymnDailyClicks, sermonTotalClicks, sermonDailyClicks },
    create: { date: today,     hymnTotalClicks, hymnDailyClicks, sermonTotalClicks, sermonDailyClicks },
  })

  return NextResponse.json({
    ok: true,
    date: today.toISOString().split("T")[0],
    hymnTotalClicks,
    hymnDailyClicks,
    sermonTotalClicks,
    sermonDailyClicks,
  })
}
