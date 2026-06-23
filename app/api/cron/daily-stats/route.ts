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

  // Today and yesterday (UTC dates, time stripped)
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setUTCDate(yesterday.getUTCDate() - 1)

  // 1. Compute current cumulative totals
  const [hymnAgg, sermonAgg, yesterdayStat] = await Promise.all([
    prisma.hmHymn.aggregate({ _sum: { clicksCount: true } }),
    prisma.smSermon.aggregate({ _sum: { clicksCount: true } }),
    prisma.dailyStat.findUnique({ where: { date: yesterday } }),
  ])

  const hymnTotalClicks   = Number((hymnAgg   as { _sum: { clicksCount: bigint | null } })._sum.clicksCount   ?? 0)
  const sermonTotalClicks = Number((sermonAgg  as { _sum: { clicksCount: bigint | null } })._sum.clicksCount  ?? 0)

  // 2. Daily delta = today's total minus yesterday's total (0 on first run)
  const hymnDailyClicks   = hymnTotalClicks   - (yesterdayStat?.hymnTotalClicks   ?? 0)
  const sermonDailyClicks = sermonTotalClicks - (yesterdayStat?.sermonTotalClicks ?? 0)

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
