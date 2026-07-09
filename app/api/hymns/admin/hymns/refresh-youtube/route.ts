import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { hasHymnAdminAccess } from '@/lib/auth-helpers'
import { planYoutubeRefresh, applyUpdatesChunked } from '@/lib/youtube-refresh'

export const maxDuration = 60

export async function POST() {
  const session = await auth()
  if (!hasHymnAdminAccess(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const hymns = await prisma.hmHymn.findMany({
    select: {
      id: true, videoId: true, title: true, publishedAt: true,
      thumbnailDefault: true, thumbnailMedium: true, thumbnailHigh: true,
      thumbnailStandard: true, thumbnailMaxres: true,
    },
  })

  let plan
  try {
    plan = await planYoutubeRefresh(hymns)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: `YouTube refresh failed: ${msg}` }, { status: 502 })
  }

  await applyUpdatesChunked(plan.updates, (id, data) =>
    prisma.hmHymn.update({ where: { id }, data })
  )

  return NextResponse.json({
    total: hymns.length,
    updated: plan.updates.length,
    unavailable: plan.unavailable,
  })
}
