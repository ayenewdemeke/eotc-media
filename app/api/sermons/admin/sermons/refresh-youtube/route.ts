import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { hasSermonAdminAccess } from '@/lib/auth-helpers'
import { planYoutubeRefresh, applyUpdatesChunked } from '@/lib/youtube-refresh'

export const maxDuration = 60

export async function POST() {
  const session = await auth()
  if (!hasSermonAdminAccess(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const sermons = await prisma.smSermon.findMany({
    select: {
      id: true, videoId: true, title: true, publishedAt: true,
      thumbnailDefault: true, thumbnailMedium: true, thumbnailHigh: true,
      thumbnailStandard: true, thumbnailMaxres: true,
    },
  })

  let plan
  try {
    plan = await planYoutubeRefresh(sermons)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: `YouTube refresh failed: ${msg}` }, { status: 502 })
  }

  await applyUpdatesChunked(plan.updates, (id, data) =>
    prisma.smSermon.update({ where: { id }, data })
  )

  return NextResponse.json({
    total: sermons.length,
    updated: plan.updates.length,
    unavailable: plan.unavailable,
  })
}
